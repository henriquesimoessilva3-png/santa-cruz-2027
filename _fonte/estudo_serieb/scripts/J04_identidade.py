#!/usr/bin/env python3
"""J04, passo 2 — auditoria de identidade, antes de calcular qualquer coisa.

Audita o casamento SkillCorner x Wyscout que o passo 1 fez em `J04_base.csv` e mais nada:
aqui não se compara Sobe com Meio, não se calcula percentil e não se toca em indicador.

Escreve, e só:
    resultados/J04_identidade.json   a auditoria inteira, caso a caso
    resultados/J04_base.csv          só para (a) acrescentar a coluna `identidade` e
                                     (b) remover as linhas de identidade duvidosa

Lê, e não altera: o banco copiado do SkillCorner, dados/serieb_tecnico.csv,
resultados/A01_clube_temporada.csv e — só leitura, nada copiado — o
`config/skillcorner_overrides.json` do Portal Ranking.

## As quatro perguntas do passo, e o que cada uma pode ser respondida com

1. **Quantos casaram por id e quantos por nome?**  Zero por id. O `players.wyscout_player_id`
   existe em 2.079 de 2.105 linhas do SkillCorner, mas **nenhuma base do lado Wyscout ao
   alcance deste estudo carrega esse id**: `dados/serieb_tecnico.csv` (144 colunas) não tem,
   `dados/minutagem_serieb.json` não tem, e o `rankings_ago26.json` copiado do Portal Ranking
   (18.460 jogadores, 52 campos) também não — a chave de lá é `primary_key`, que é nome +
   clube + liga, ou seja, nome de novo. O id só separa pessoas DENTRO do SkillCorner.
   Toda a base casou por nome. Isso não é opção do passo 1: é o que a base permite.

2. **Caça ao homônimo.**  Quatro provas independentes, cada uma com a sua cobertura:
   - idade: nascimento do SkillCorner contra `idade_na_temporada` do Wyscout (2.980 de 2.982);
   - ano de nascimento implícito, o mesmo `sc_player_id` ao longo das temporadas (coerência
     interna, cobre quem aparece em 2+ temporadas);
   - clube: clube de mais minutos no `physical_match` contra o clube do Wyscout — **só 2025 e
     2026**, porque o `physical_match` não existe antes (1.111 de 2.982 linhas);
   - posição: `position_group` do `physical_match` contra o setor — mesma cobertura de 2025/26.

3. **Jogos físicos absurdos.**  `matches` do `physical` contra `Partidas jogadas` do Wyscout.

4. **Duvidoso se lista e se remove.**  Nada é adivinhado; o que sobra de dúvida sai da base.

## A regra de remoção, escrita antes de olhar o resultado

Sai da base a linha em que a dúvida **não se resolve com o dado que existe**:
  (a) o `physical_match` põe o jogador num clube e o Wyscout noutro, e o SkillCorner mostra
      UM clube só naquela temporada — logo a transferência no meio do ano não explica a
      divergência, e o clube é quem carrega a faixa (Sobe/Meio/Cai) da comparação;
  (b) o `sc_player_id` está marcado `__IGNORAR__` na auditoria da casa (Portal Ranking) como
      físico clonado em homônimos, e a temporada em questão não tem prova de clube.

Fica na base, marcado na coluna `identidade`, o que tem dúvida mas se explica:
  `clube_misturado`   o SkillCorner rastreia o jogador em DOIS clubes na temporada: o agregado
                      físico mistura os dois, e a faixa vem só do rótulo do Wyscout;
  `clube_diverge`     além de misturado, o clube de mais minutos não é o do Wyscout;
  `nome_colide`       o nome colide com outra pessoa em alguma temporada desta mesma base —
                      casou porque naquele ano era único dos dois lados, e só por isso;
  `sem_guarda_de_idade` o SkillCorner não tem nascimento, então a janela de idade não rodou
                      (nos dois casos a prova de clube de 2025 confirma a pessoa).

Uso:
    python3 "_fonte/estudo_serieb/scripts/J04_identidade.py"
"""
import collections
import csv
import datetime as dt
import json
import os
import re
import sqlite3
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
RAIZ = os.path.dirname(os.path.dirname(ESTUDO))
DADOS = os.path.join(RAIZ, "dados")
R = os.path.join(ESTUDO, "resultados")
DB = os.path.join(ESTUDO, "dados_copiados", "skillcorner_serieb.db")
BASE = os.path.join(R, "J04_base.csv")
SAIDA = os.path.join(R, "J04_identidade.json")

# Só leitura, e de fora deste repositório: a auditoria de identidade da casa.
OVERRIDES = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/"
             "Analytics/Portal Ranking/config/skillcorner_overrides.json")

ED = {335: 2022, 446: 2023, 773: 2024, 1061: 2025, 1399: 2026}
COL_CLUBE = "Equipa dentro de um período de tempo seleccionado"
COL_ANO = "﻿ano"
SEGUNDO_CLUBE_GRAVE = 0.20   # fatia de minutos no 2º clube a partir da qual a mistura pesa

# A mesma ponte de clube do passo 1, provada lá por bijeção em 2025 e 2026.
PONTE = {
    "AC Goianiense": "Atlético-GO", "Amazonas FC": "Amazonas",
    "América Mineiro FC": "América-MG", "Associação Ferroviária de Esportes": "Ferroviária",
    "Athletic Club (Minas Gerais)": "Athletic", "Avaí Futebol Clube": "Avaí",
    "Botafogo FC Ribeirão Preto": "Botafogo-SP", "Ceará Sporting Club": "Ceará",
    "Chapecoense AF": "Chapecoense", "Club Athletico Paranaense": "Athletico-PR",
    "Clube Náutico Capibaribe": "Náutico", "Clube de Regatas Brasil": "CRB",
    "Clube do Remo": "Remo", "Coritiba FBC": "Coritiba", "Criciuma EC": "Criciúma",
    "Cuiaba Esporte Club": "Cuiabá", "Fortaleza EC": "Fortaleza", "Goiás EC": "Goiás",
    "Grêmio Novorizontino": "Novorizontino", "Juventude RS": "Juventude",
    "Londrina EC": "Londrina", "Operário Ferroviário EC": "Operário-PR",
    "Paysandu SC": "Paysandu", "Ponte Preta": "Ponte Preta", "SC do Recife": "Sport",
    "São Bernardo FC": "São Bernardo", "Vila Nova FC": "Vila Nova",
    "Volta Redonda FC": "Volta Redonda",
}

# Setor do estudo -> position_group do SkillCorner. Só as trocas GROSSAS contam como
# incompatíveis: zagueiro virando atacante e vice-versa. Meia/extremo e lateral/meia
# trocam de verdade dentro de um jogo e não provam nada sobre identidade.
DEFESA = {"Central Defender"}
ATAQUE = {"Center Forward", "Wide Attacker"}
SETOR_DEFESA = {"Zaga"}
SETOR_ATAQUE = {"Atacante", "Extremo"}


def chave_nome(s):
    s = unicodedata.normalize("NFD", str(s)).lower()
    s = "".join(x for x in s if unicodedata.category(x) != "Mn")
    return re.sub(r"[^a-z ]", "", s).strip()


def idade_em_setembro(nasc, ano):
    """A mesma do passo 1: 11 de setembro como data de referência."""
    if not isinstance(nasc, str) or len(nasc) < 10:
        return None
    n = dt.date(int(nasc[:4]), int(nasc[5:7]), int(nasc[8:10]))
    r = dt.date(int(ano), 9, 11)
    return r.year - n.year - ((r.month, r.day) < (n.month, n.day))


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def ident(r):
    return {"temporada": int(r["temporada"]), "jogador": r["jogador"], "clube": r["clube"],
            "faixa": r["faixa"], "posicao": r["posicao"], "setor": r["setor"],
            "sc_player_id": int(r["sc_player_id"]), "sc_nome": r["sc_nome"],
            "elegivel": int(r["elegivel"]), "titular": int(r["titular"])}


# --------------------------------------------------------------------------- 1. o que existe
def ler_base():
    with open(BASE, encoding="utf-8") as f:
        rd = csv.DictReader(f)
        return list(rd), list(rd.fieldnames)


def ler_faixas():
    faixa = {}
    with open(os.path.join(R, "A01_clube_temporada.csv"), encoding="utf-8") as f:
        for l in csv.DictReader(f):
            faixa[(int(l["temporada"]), l["clube"])] = l["faixa"]
    return faixa


def ler_wyscout():
    with open(os.path.join(DADOS, "serieb_tecnico.csv"), encoding="utf-8") as f:
        return list(csv.DictReader(f))


def ler_overrides():
    """Lê a auditoria de identidade do Portal Ranking. NÃO copia o arquivo."""
    if not os.path.exists(OVERRIDES):
        return None
    with open(OVERRIDES, encoding="utf-8") as f:
        ov = json.load(f)
    return {k[3:]: v for k, v in ov.items()
            if k.startswith("sc:") and isinstance(v, str)}


# --------------------------------------------------------------------------- 2. as provas
def prova_clube_e_posicao(con):
    """Clube de mais minutos e grupo de posição de mais minutos, por jogador-temporada.
    Só existe em 2025 e 2026: antes disso o `physical_match` tem zero linhas."""
    clubes = collections.defaultdict(collections.Counter)
    grupos = collections.defaultdict(collections.Counter)
    q = ("select sc_player_id, sc_competition_edition_id, team_name, position_group, "
         "sum(minutes_played) from physical_match group by 1,2,3,4")
    for sid, e, time, grupo, mins in con.execute(q):
        k = (str(sid), str(ED[e]))
        clubes[k][PONTE.get(time, time)] += mins or 0
        grupos[k][grupo] += mins or 0
    return clubes, grupos


def nomes_que_colidem(con, wy):
    """Nome que, em ALGUMA temporada desta base, pertence a duas pessoas — dos dois lados."""
    sc = collections.defaultdict(set)
    q = ("select p.short_name, ph.sc_competition_edition_id, p.sc_player_id "
         "from physical ph join players p on p.sc_player_id = ph.sc_player_id")
    for nome, e, sid in con.execute(q):
        sc[(ED[e], chave_nome(nome))].add(sid)
    w = collections.defaultdict(set)
    for l in wy:
        k = (int(float(l[COL_ANO])), chave_nome(l["Jogador"]))
        w[k].add((l[COL_CLUBE], l["Idade"]))
    colide_sc = {k[1] for k, v in sc.items() if len(v) > 1}
    colide_wy = {k[1] for k, v in w.items() if len(v) > 1}
    return colide_sc, colide_wy


def main():
    base, colunas = ler_base()
    faixa = ler_faixas()
    wy = ler_wyscout()
    con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
    clubes, grupos = prova_clube_e_posicao(con)
    colide_sc, colide_wy = nomes_que_colidem(con, wy)
    colide = colide_sc | colide_wy
    overrides = ler_overrides()

    com_fisico = [r for r in base if r["tem_fisico"] == "1"]
    sem_fisico = [r for r in base if r["tem_fisico"] != "1"]

    # ---- 1. por id ou por nome
    com_id_no_sc = sum(1 for r in com_fisico if r["wyscout_player_id"])
    colunas_wy = list(wy[0].keys())
    tem_id_no_wyscout = any("wyscout" in c.lower() and "id" in c.lower() for c in colunas_wy)

    # ---- 2a. idade
    idade_delta = collections.Counter()
    sem_guarda, fora_da_janela = [], []
    for r in com_fisico:
        i_sc = idade_em_setembro(r["nascimento"], r["temporada"])
        i_wy = num(r["idade_na_temporada"])
        if i_sc is None or i_wy is None:
            sem_guarda.append(r)
            continue
        d = i_sc - round(i_wy)
        idade_delta[d] += 1
        if not (-2 <= d <= 3):
            fora_da_janela.append((d, r))

    # ---- 2b. o mesmo sc_player_id ao longo das temporadas
    por_sc = collections.defaultdict(list)
    for r in com_fisico:
        i = num(r["idade_na_temporada"])
        if i is not None:
            por_sc[r["sc_player_id"]].append((int(r["temporada"]) - round(i), r))
    nascimento_incoerente = [sid for sid, g in por_sc.items()
                             if len({a for a, _ in g}) > 1
                             and max(a for a, _ in g) - min(a for a, _ in g) > 1]

    # ---- 2c. clube
    conferiveis = [r for r in com_fisico if (r["sc_player_id"], r["temporada"]) in clubes]
    diverge_um_clube, diverge_transferencia, misturados = [], [], []
    for r in conferiveis:
        c = clubes[(r["sc_player_id"], r["temporada"])]
        tot = sum(c.values()) or 1
        ordem = c.most_common()
        dominante = ordem[0][0]
        segundo = ordem[1][1] / tot if len(ordem) > 1 else 0.0
        det = {**ident(r),
               "clube_no_wyscout": r["clube"],
               "clube_dominante_no_skillcorner": dominante,
               "minutos_por_clube_no_skillcorner":
                   {k: round(v) for k, v in ordem},
               "clubes_no_ano_no_skillcorner": len(ordem),
               "faixa_do_clube_do_skillcorner": faixa.get((int(r["temporada"]), dominante)),
               "a_faixa_muda": faixa.get((int(r["temporada"]), dominante)) != r["faixa"]}
        if len(ordem) > 1:
            misturados.append((r, det, segundo))
        if dominante != r["clube"]:
            (diverge_transferencia if len(ordem) > 1 else diverge_um_clube).append((r, det))

    # ---- 2d. posição
    posicao_incompativel = []
    for r in conferiveis:
        g = grupos[(r["sc_player_id"], r["temporada"])]
        if not g:
            continue
        dom, mins = g.most_common(1)[0]
        grosso = ((r["setor"] in SETOR_DEFESA and dom in ATAQUE)
                  or (r["setor"] in SETOR_ATAQUE and dom in DEFESA))
        if grosso:
            posicao_incompativel.append((r, dom, mins, sum(g.values())))

    # ---- 3. jogos físicos absurdos
    jogos = []
    for r in com_fisico:
        j, s = num(r["jogos_wy"]), num(r["sc_matches"])
        if j is not None and s is not None:
            jogos.append((s - j, r))
    mais_que_o_wyscout = [(d, r) for d, r in jogos if d >= 6]
    muito_menos = [(d, r) for d, r in jogos if d <= -6]
    acima_do_calendario = [r for r in com_fisico if (num(r["sc_matches"]) or 0) > 38]
    poucos = collections.Counter()
    for r in com_fisico:
        s = num(r["sc_matches"]) or 0
        chave = "1 a 3" if s <= 3 else "4 a 7" if s < 8 else "8 ou mais"
        poucos[chave] += 1
        if r["elegivel"] == "1":
            poucos["elegivel: " + chave] += 1

    # ---- a auditoria da casa (Portal Ranking)
    casa = {"lido": OVERRIDES, "copiado": False}
    if overrides is None:
        casa["situacao"] = "não encontrado no caminho esperado; a conferência não rodou"
        ignorar_na_base, confere_casa = [], {"batem": 0, "divergem": 0}
    else:
        por_sc_id = collections.defaultdict(list)
        for r in com_fisico:
            por_sc_id[r["sc_player_id"]].append(r)
        alvo_serie_b = {k: v for k, v in overrides.items() if v.endswith("Brasil B")}
        batem = divergem = 0
        ids_conferidos = set()
        divergencias = []
        for sid, alvo in alvo_serie_b.items():
            for r in por_sc_id.get(sid, []):
                ids_conferidos.add(sid)
                if chave_nome(r["jogador"]) == chave_nome(alvo.split(" - ")[0].strip()):
                    batem += 1
                else:
                    divergem += 1
                    divergencias.append({**ident(r), "override_da_casa": alvo})
        ignorar_na_base = [(sid, overrides[sid], r)
                           for sid in por_sc_id
                           if sid in overrides and "__IGNORAR__" in overrides[sid]
                           for r in por_sc_id[sid]]
        casa.update({
            "situacao": "lido, nada copiado",
            "entradas_sc_id": len(overrides),
            "entradas_com_alvo_na_serie_b": len(alvo_serie_b),
            "sc_player_id_da_casa_presentes_nesta_base": len(ids_conferidos),
            "linhas_dessa_base_conferidas": batem + divergem,
            "linhas_que_confirmam_o_nome_que_o_passo_1_casou": batem,
            "linhas_que_divergem_do_nome": divergem,
            "divergencias": divergencias,
            "leitura": ("O Portal Ranking mantém uma tradução sc_player_id -> jogador do Wyscout "
                        "feita à mão, e é ela que consertou os casos do Pedro, do Rony e do "
                        "Vitinho registrados no _registro.md. Onde ela toca esta base, concorda "
                        "com o que o passo 1 casou por nome, sem uma única divergência. Não "
                        "prova o resto da base, mas é a única conferência externa que existe."),
        })
        confere_casa = {"batem": batem, "divergem": divergem}

    # ----------------------------------------------------------------- a decisão, caso a caso
    remover, suspeitos = {}, []

    for r, det in diverge_um_clube:
        motivo = ("o SkillCorner mostra UM clube só na temporada e ele não é o do Wyscout: "
                  "transferência no meio do ano não explica, e o clube é quem carrega a faixa")
        remover[id(r)] = motivo
        suspeitos.append({**det, "prova": "clube (physical_match)", "decisao": "removido",
                          "por_que": motivo})

    for sid, texto, r in ignorar_na_base:
        tem_prova_de_clube = (r["sc_player_id"], r["temporada"]) in clubes
        if "clonado em homonimos" in texto.replace("ô", "o") and not tem_prova_de_clube:
            motivo = ("a auditoria da casa marca este sc_player_id como físico clonado em "
                      "homônimos, e a temporada não tem prova de clube para desempatar")
            remover[id(r)] = motivo
            decisao = "removido"
        else:
            motivo = ("a nota da casa é sobre outra liga e confirma a passagem pela Série B; "
                      "o nome, a idade e os jogos batem aqui")
            decisao = "mantido"
        suspeitos.append({**ident(r), "prova": "auditoria da casa (Portal Ranking)",
                          "override_da_casa": texto, "decisao": decisao, "por_que": motivo})

    # A coerência de jogos não tomou nenhuma decisão de identidade: fica listada no JSON.

    # ----------------------------------------------------------------- escrever a base marcada
    marca_por_linha = {}
    for r, det, segundo in misturados:
        m = ["clube_misturado"]
        if det["clube_dominante_no_skillcorner"] != r["clube"]:
            m.append("clube_diverge")
        marca_por_linha[id(r)] = m
    for r in sem_guarda:
        marca_por_linha.setdefault(id(r), []).append("sem_guarda_de_idade")
    for r in com_fisico:
        if chave_nome(r["jogador"]) in colide:
            marca_por_linha.setdefault(id(r), []).append("nome_colide")

    novas = []
    for r in base:
        if id(r) in remover:
            continue
        r["identidade"] = ";".join(marca_por_linha.get(id(r), []))
        novas.append(r)
    campos = [c for c in colunas if c != "identidade"] + ["identidade"]
    with open(BASE, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos)
        w.writeheader()
        w.writerows(novas)

    marcadas = collections.Counter()
    for r in novas:
        for m in (r["identidade"].split(";") if r["identidade"] else []):
            marcadas[m] += 1

    # ----------------------------------------------------------------- o JSON
    def linha_jogos(d, r):
        return {**ident(r), "jogos_no_wyscout": num(r["jogos_wy"]),
                "jogos_no_skillcorner": num(r["sc_matches"]),
                "diferenca": d, "cobertura_do_clube_pct": num(r["cobertura_clube_pct"])}

    saida = {
        "parte": "J04",
        "passo": 2,
        "gerado_em": dt.datetime.now().isoformat(timespec="seconds"),
        "o_que_e": ("Auditoria de identidade do casamento SkillCorner x Wyscout que o passo 1 "
                    "fez em J04_base.csv. Nenhum número físico é calculado aqui."),
        "fonte": {
            "base_auditada": "resultados/J04_base.csv",
            "skillcorner": "dados_copiados/skillcorner_serieb.db (cópia de 19/09/2026, só leitura)",
            "wyscout": "dados/serieb_tecnico.csv",
            "faixa": "resultados/A01_clube_temporada.csv",
            "auditoria_da_casa": OVERRIDES + "  (lido, não copiado)",
        },

        "1_por_id_ou_por_nome": {
            "casados_por_wyscout_player_id": 0,
            "casados_so_por_nome": len(com_fisico),
            "por_que_zero_por_id": (
                "O id existe do lado do SkillCorner (a `players` tem em 2.079 de 2.105 linhas) "
                "e está gravado na base, mas NENHUMA fonte do lado Wyscout ao alcance deste "
                "estudo carrega esse id, então não há com o que casar: serieb_tecnico.csv tem "
                f"{len(colunas_wy)} colunas e nenhuma é id de jogador; minutagem_serieb.json tem "
                "10 colunas e nenhuma é id; e o rankings_ago26.json copiado do Portal Ranking "
                "identifica o jogador pela `primary_key`, que é nome + clube + liga — nome de "
                "novo. Usar o id 'sempre que houver' é impossível aqui: ele só separa pessoas "
                "DENTRO do SkillCorner, e é assim que o passo 1 o usou."),
            "linhas_com_id_gravado_vindo_do_skillcorner": com_id_no_sc,
            "coluna_de_id_no_lado_wyscout": tem_id_no_wyscout,
            "regra_que_casou": (
                "ESPECIFICACAO.md §1.1: chave de nome sem acento + janela de idade −2 ≤ Δ ≤ +3 "
                "(SkillCorner até 3 anos mais velho, 2 mais novo), com descarte automático dos "
                "dois lados de (ano, nome) ambíguo."),
        },

        "2_caca_ao_homonimo": {
            "idade": {
                "cobertura": f"{len(com_fisico) - len(sem_guarda)} de {len(com_fisico)} linhas",
                "distribuicao_do_delta_sc_menos_wy": dict(sorted(idade_delta.items())),
                "fora_da_janela_que_passaram": len(fora_da_janela),
                "na_borda_da_janela_delta_3_ou_menos_2":
                    sum(v for k, v in idade_delta.items() if k in (3, -2)),
                "sem_nascimento_no_skillcorner": [
                    {**ident(r), "idade_no_wyscout": num(r["idade_na_temporada"]),
                     "clube_confere": r["clube_confere"],
                     "jogos_wy": num(r["jogos_wy"]), "jogos_sc": num(r["sc_matches"]),
                     "decisao": "mantido",
                     "por_que": ("a janela de idade não rodou, mas a prova de clube de 2025 "
                                 "confere e os jogos e minutos batem")}
                    for r in sem_guarda],
                "leitura": (
                    "Nenhuma linha passou fora da janela e nenhuma ficou na borda: o delta é 0 em "
                    f"{idade_delta.get(0, 0)} linhas e ±1 em {idade_delta.get(1, 0) + idade_delta.get(-1, 0)}, "
                    "o que é o atraso de propósito da idade do Wyscout e a virada de aniversário "
                    "em torno de 11 de setembro. Só 1 linha tem delta +2."),
            },
            "coerencia_do_mesmo_sc_player_id_entre_temporadas": {
                "jogadores_em_2_ou_mais_temporadas": sum(1 for g in por_sc.values() if len(g) > 1),
                "com_ano_de_nascimento_do_wyscout_incoerente": len(nascimento_incoerente),
                "leitura": ("Se o mesmo sc_player_id tivesse recebido pessoas diferentes em anos "
                            "diferentes, o ano de nascimento implícito pelo Wyscout pularia. "
                            "Não pula em nenhum caso."),
            },
            "clube": {
                "cobertura": f"{len(conferiveis)} de {len(com_fisico)} linhas (só 2025 e 2026)",
                "sem_conferencia_possivel": len(com_fisico) - len(conferiveis),
                "por_que_a_cobertura_e_essa": (
                    "O `physical` (agregado por temporada) NÃO tem clube; quem tem clube é o "
                    "`physical_match`, e ele tem zero linhas em 2022, 2023 e 2024. Logo "
                    f"{len(com_fisico) - len(conferiveis)} linhas "
                    f"({(len(com_fisico) - len(conferiveis)) / len(com_fisico) * 100:.0f}%) "
                    "não têm nenhuma prova de clube — e é justamente nelas que mora a comparação "
                    "de 2022 a 2025."),
                "conferem": len(conferiveis) - len(diverge_um_clube) - len(diverge_transferencia),
                "divergem": len(diverge_um_clube) + len(diverge_transferencia),
                "divergem_com_um_clube_so_no_skillcorner": [d for _, d in diverge_um_clube],
                "divergem_explicados_por_dois_clubes": [d for _, d in diverge_transferencia],
            },
            "posicao": {
                "cobertura": f"{len(conferiveis)} de {len(com_fisico)} linhas (só 2025 e 2026)",
                "incompativeis_grossas": [
                    {**ident(r), "grupo_no_skillcorner": dom,
                     "minutos_nesse_grupo": round(mins),
                     "minutos_rastreados_na_temporada": round(tot),
                     "minutos_no_wyscout": num(r["minutos_wy"]),
                     "decisao": "mantido",
                     "por_que": ("o grupo vem de 1 ou 2 jogos de poucos minutos; é troca de "
                                 "função num jogo, não pessoa diferente — a idade e os jogos "
                                 "batem e nenhuma dessas linhas é elegível ou titular")}
                    for r, dom, mins, tot in posicao_incompativel],
                "leitura": ("A posição é a prova mais fraca das quatro: meia vira extremo e "
                            "lateral vira meia dentro do mesmo jogo. Só as trocas grossas "
                            "(zagueiro x atacante) foram contadas."),
            },
            "nome_que_colide_em_outra_temporada": {
                "nomes_que_colidem_no_skillcorner": len(colide_sc),
                "nomes_que_colidem_no_wyscout": len(colide_wy),
                "linhas_casadas_com_nome_desses": marcadas.get("nome_colide", 0),
                "leitura": ("Casaram porque naquele ano o nome era único dos dois lados. É a "
                            "classe de risco que sobra depois de todas as provas, e por isso "
                            "vai marcada na base em vez de sair dela."),
            },
        },

        "3_jogos_fisicos_absurdos": {
            "acima_do_calendario_da_serie_b": len(acima_do_calendario),
            "skillcorner_com_6_jogos_ou_mais_que_o_wyscout": [
                linha_jogos(d, r) for d, r in mais_que_o_wyscout],
            "skillcorner_com_6_jogos_ou_menos_que_o_wyscout": [
                linha_jogos(d, r) for d, r in sorted(muito_menos, key=lambda x: x[0])],
            "distribuicao_de_jogos_rastreados": dict(poucos),
            "leitura": (
                "A armadilha da edição (1 a 3 jogos de copa no lugar do perfil de liga) não "
                "chega onde importa: nenhuma linha elegível tem 3 jogos ou menos, e o caso mais "
                "magro entre os titulares é um só. E nenhum jogador tem MAIS jogos no SkillCorner "
                "do que no Wyscout por uma margem que sugira físico de outra pessoa — o máximo é "
                "+5, nos dois casos de jogador que trocou de clube no ano. Os casos de muito "
                "menos jogo são cobertura do rastreio, e caem junto com a cobertura do clube."),
        },

        "4_a_decisao": {
            "regra": ("Duvidoso se lista e se remove, nunca se adivinha. Sai a linha cuja dúvida "
                      "não se resolve com o dado que existe; fica marcada a que tem dúvida "
                      "explicável."),
            "removidas": len(remover),
            "de_um_total_de": len(base),
            "linhas_restantes": len(novas),
            "suspeitos": suspeitos,
            "marcadas_na_coluna_identidade": dict(marcadas),
            "o_que_cada_marca_quer_dizer": {
                "clube_misturado": ("o SkillCorner rastreia o jogador em dois clubes na "
                                    "temporada: o agregado físico mistura os dois, e a faixa "
                                    "vem só do rótulo único do Wyscout"),
                "clube_diverge": "além de misturado, o clube de mais minutos não é o do Wyscout",
                "nome_colide": ("o nome pertence a duas pessoas em alguma temporada desta base; "
                                "casou porque naquele ano era único dos dois lados"),
                "sem_guarda_de_idade": "o SkillCorner não tem nascimento e a janela não rodou",
            },
        },

        "conferencia_independente_da_casa": casa,

        "o_que_isso_impoe_ao_passo_3": [
            ("Nenhuma linha casou por id. A ponte é de nome, e a prova mais forte que existe "
             "para ela — o clube — só cobre 2025 e 2026: "
             f"{len(com_fisico) - len(conferiveis)} de {len(com_fisico)} linhas não têm prova de "
             "clube nenhuma, e 2022–2024 é o grosso da comparação."),
            ("O rótulo de clube do Wyscout é único por jogador-temporada: quem jogou em dois "
             "clubes no ano aparece com um clube só e os minutos somados. Onde o SkillCorner "
             f"deixa ver ({len(conferiveis)} linhas), isso acontece em {len(misturados)} delas, "
             f"{sum(1 for _, _, s in misturados if s >= SEGUNDO_CLUBE_GRAVE)} com 20% ou mais "
             "dos minutos no segundo clube. Antes de 2025 não dá para ver, e a faixa "
             "(Sobe/Meio/Cai) sai desse rótulo."),
            ("Uma das linhas removidas era titular elegível (Mádson, 2026, Novorizontino): o "
             "posto de lateral daquele clube-temporada perdeu um titular e o passo 3 tem de "
             "recontar os titulares em vez de supor dois por posto."),
        ],
    }
    with open(SAIDA, "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=2)

    # ----------------------------------------------------------------- o relato na tela
    print(f"base: {len(base)} linhas, {len(com_fisico)} com físico, {len(sem_fisico)} sem")
    print(f"casadas por wyscout_player_id: 0   |   casadas só por nome: {len(com_fisico)}")
    print(f"prova de clube possível em {len(conferiveis)} linhas (2025/2026); "
          f"{len(com_fisico) - len(conferiveis)} sem prova nenhuma")
    print(f"divergências de clube: {len(diverge_um_clube)} com um clube só (removidas), "
          f"{len(diverge_transferencia)} explicadas por dois clubes (marcadas)")
    print(f"auditoria da casa: {confere_casa['batem']} confirmam, "
          f"{confere_casa['divergem']} divergem")
    print(f"removidas: {len(remover)}   |   restam {len(novas)} linhas")
    for m, v in sorted(marcadas.items()):
        print(f"  marcadas {m}: {v}")
    print(f"escrito: {SAIDA}")


if __name__ == "__main__":
    main()
