#!/usr/bin/env python3
"""Cruza as tres bases da Serie B e responde o que separa quem sobe de quem cai.

As tres bases sao independentes e cada uma sabe de uma coisa:

    dados/serieb_jogos.csv     como o time jogou, partida a partida (Wyscout Team Stats)
    dados/serieb_tecnico.csv   o que cada atleta fez (Wyscout, por jogador)
    dados/serieb_elencos.csv   quem estava no clube e quanto valia (Transfermarkt)

Aqui elas viram UMA tabela de clube-temporada, 100 linhas, e a partir dela saem as
comparacoes. A classificacao final vem de SB_TABELAS (static/app.js), que ja e a fonte de
verdade do estudo.

## Duas escolhas de metodo que mudam o resultado

**Sempre POSTO dentro da temporada, nunca numero bruto.** Uma Serie B com 1,01 gol por
jogo (2022) e outra com 1,11 (2025) nao sao o mesmo campeonato. Comparar "quem fez mais
gols" entre anos mistura o clube com a inflacao de gols do ano. Todo indicador e
convertido no posto de 1 a 20 dentro do proprio ano antes de qualquer correlacao.

**So as quatro temporadas COMPLETAS entram nas conclusoes** (2022-2025, 80 clube-temporada).
2026 esta em andamento e fica de fora das medias — entra so quando a pergunta e sobre o
ano corrente.

## Onde as afirmacoes podem estar erradas

- **16 clubes que subiram e 16 que cairam.** Uma diferenca de 2 ou 3 pontos percentuais
  entre os grupos nao e conclusao, e ruido. Por isso o relatorio so afirma o que tem
  diferenca grande E correlacao consistente.
- **Causa e efeito se confundem.** Um time que usou 46 atletas provavelmente ja estava
  perdendo — trocar muito e sintoma tanto quanto causa. Isso vale para uso de elenco,
  cartoes e faltas.
- **xG e modelo, nao verdade.** Na Serie B o xG do Wyscout supera o gol real em 9% a 14%
  ao ano, ou seja o modelo e calibrado para outro futebol. O que se usa dele aqui e a
  ORDEM (quem cria mais), nao o nivel.

Uso:
    python3 analisar_serieb.py            # imprime o relatorio inteiro
    python3 analisar_serieb.py --csv      # grava tambem dados/serieb_clube_temporada.csv
"""
import datetime as dt
import functools
import re, sqlite3, unicodedata
import numpy as np, pandas as pd

import os
RAIZ = os.path.dirname(os.path.abspath(__file__))
nfc = lambda s: unicodedata.normalize("NFC", str(s))

TM = {"AA Ponte Preta":"Ponte Preta","ABC FC":"ABC","Amazonas FC":"Amazonas",
 "América Mineiro":"América-MG","Athletic Club":"Athletic","Athletico Paranaense":"Athletico-PR",
 "Atlético Goianiense":"Atlético-GO","Avaí FC":"Avaí","Botafogo FC":"Botafogo-SP",
 "Brusque FC":"Brusque","CR Vasco da Gama":"Vasco","Ceará SC":"Ceará","Clube do Remo":"Remo",
 "Coritiba FC":"Coritiba","Criciúma EC":"Criciúma","Cruzeiro EC":"Cruzeiro","Cuiabá EC":"Cuiabá",
 "EC Bahia":"Bahia","EC Juventude":"Juventude","EC Vitória":"Vitória","Fortaleza EC":"Fortaleza",
 "Goiás EC":"Goiás","Grêmio FBPA":"Grêmio","Grêmio Novorizontino":"Novorizontino",
 "Guarani FC":"Guarani","Ituano FC":"Ituano","Londrina EC":"Londrina","Mirassol FC":"Mirassol",
 "Operário FEC":"Operário-PR","Paysandu SC":"Paysandu","Sampaio Corrêa FC":"Sampaio Corrêa",
 "Santos FC":"Santos","Sport Recife":"Sport","São Bernardo FC":"São Bernardo",
 "Tombense FC":"Tombense","Vila Nova FC":"Vila Nova","Volta Redonda FC":"Volta Redonda"}
TM = {nfc(k): nfc(v) for k, v in TM.items()}


def tabelas():
    t = open(f"{RAIZ}/static/app.js", encoding="utf-8").read()
    # fim do bloco: `SB_COMPLETAS`, que vem logo depois. Era `SB_USO` ate set/26, e quando a
    # SB_USO saiu do app.js os tres scripts que liam a tabela quebraram de uma vez.
    b = t[t.index("const SB_TABELAS"): t.index("const SB_COMPLETAS")]
    linhas = []
    for m in re.finditer(r"(\d{4}):\s*\[(.*?)\],\n(?=\s*\d{4}:|\};)", b, re.S):
        ano = int(m.group(1))
        for pos, c, j, v, e, d, gp, gc in re.findall(
                r"\[(\d+),'([^']+)',(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\]", m.group(2)):
            linhas.append(dict(ano=ano, clube=nfc(c), pos=int(pos), J=int(j), V=int(v),
                               E=int(e), D=int(d), GP=int(gp), GC=int(gc),
                               pts=int(v)*3+int(e), SG=int(gp)-int(gc)))
    return pd.DataFrame(linhas)


def do_jogo():
    J = pd.read_csv(f"{RAIZ}/dados/serieb_jogos.csv")
    s = J[(J["Competição"] == "Brazil. Serie B") & J["resultado"].notna()].copy()
    s["clube"] = s["Equipa"].map(nfc)
    # xG do adversario: o proprio jogo tem a linha dele
    adv = s[["Data", "Jogo", "Equipa", "Golos esperados", "Remates", "Remates à baliza",
             "Posse, %", "PPDA"]].rename(columns={
        "Equipa": "adv_nome", "Golos esperados": "xg_contra", "Remates": "remates_contra",
        "Remates à baliza": "remates_baliza_contra", "Posse, %": "posse_adv", "PPDA": "ppda_adv"})
    s = s.merge(adv, on=["Data", "Jogo"])
    s = s[s["Equipa"] != s["adv_nome"]]

    med = {   # media por jogo
        "posse": "Posse, %", "passes": "Passes", "passes_certos": "Passes certos", "passes_pct": "Passes certos, %",
        "xg": "Golos esperados", "remates": "Remates", "remates_baliza": "Remates à baliza",
        "remates_baliza_pct": "Remates à baliza, %", "dist_remate": "Distância média do remate",
        "ppda": "PPDA", "intensidade": "Intensidade de jogo",
        "passe_longo_pct": "% de passe longo", "compr_passe": "Comprimento médio de passes",
        "duelos_pct": "Duelos ganhos, %", "duelos_aereos_pct": "Duelos aéreos ganhos, %", "duelos_aereos": "Duelos aéreos",
        "cruzamentos": "Cruzamentos", "cruz_certos_pct": "Cruzamentos certos, %",
        "bolas_paradas": "Bolas paradas", "bp_remates": "Bolas paradas com remates",
        "cantos": "Cantos", "cantos_remates": "Cantos com remates",
        "livres": "Pontapés livre", "livres_remates": "Pontapés livre com remates",
        "atq_posicional": "Ataques posicionais", "atq_pos_remates": "Ataques posicionais com remates",
        "contra_ataques": "Contra-ataques", "ca_remates": "Contra-ataques com remates",
        "toques_area": "Toques na área", "entradas_area": "Entradas na grande área",
        "faltas": "Faltas", "amarelos": "Cartões amarelos",
        "recuperacoes": "Recuperações", "perdas": "Perdas",
        "passes_frente_pct": "Passes para a frente certos, %", "passes_frente": "Passes para a frente",
        "passes_terco_final": "Passes para terço final",
        "passes_progressivos": "Passes progressivos",
        "xg_contra": "xg_contra", "remates_contra": "remates_contra",
        # Chute no alvo SOFRIDO. Sai do "Remates à baliza" da linha do ADVERSARIO, e nao da
        # coluna "Remates contra no alvo" da propria linha do clube. As duas medem a mesma
        # coisa e discordam: concordam em 81,8% dos 3.570 jogos, e a da propria linha conta
        # 0,19 chute a mais por jogo. `remates_contra` ja vinha do adversario e bate em
        # 100% — misturar as duas faria a conversao sofrida ter numerador de uma regua e
        # denominador de outra. A outra viaja junto como `remates_contra_alvo` so para a
        # tela poder MOSTRAR o tamanho da divergencia em vez de afirma-la.
        "remates_baliza_contra": "remates_baliza_contra",
        "remates_contra_alvo": "Remates contra no alvo",
    }
    med = {k: v for k, v in med.items() if v in s.columns}
    som = {"penaltis": "Penaltis", "penaltis_conv": "Penaltis convertidos"}
    som = {k: v for k, v in som.items() if v in s.columns}

    # Desvio-padrao JOGO A JOGO das quatro contagens da cadeia do chute. Nao e enfeite: e
    # com ele que o navegador calcula quanto da diferenca entre clubes num numero de
    # temporada e ruido amostral (dp**2 / jogos) e quanto e time. Sem isso, a unica saida
    # para medir confiabilidade seria mandar o jogo a jogo inteiro para o navegador.
    dpv = {"dp_remates": "Remates", "dp_remates_baliza": "Remates à baliza",
           "dp_remates_contra": "remates_contra",
           "dp_remates_baliza_contra": "remates_baliza_contra"}
    dpv = {k: v for k, v in dpv.items() if v in s.columns}

    g = s.groupby(["ano", "clube"])
    f = pd.DataFrame({k: g[v].mean() for k, v in med.items()})
    for k, v in som.items():
        f[k] = g[v].sum()
    for k, v in dpv.items():
        f[k] = g[v].std(ddof=1)
    f["pontos_casa"] = s[s["mando"] == "casa"].groupby(["ano", "clube"])["resultado"].apply(
        lambda x: (x == "V").sum()*3 + (x == "E").sum())
    f["pontos_fora"] = s[s["mando"] == "fora"].groupby(["ano", "clube"])["resultado"].apply(
        lambda x: (x == "V").sum()*3 + (x == "E").sum())
    f["jogos_base"] = g.size()
    return f.reset_index()


def valor_tm_por_atleta():
    """Valor do Transfermarkt por (ano, clube, nome normalizado) — a ponte para o onze.

    O `valor_11` somava a coluna "Valor de mercado" do Wyscout, o MESMO SNAPSHOT que a
    Onda 1 aposentou no valor por setor (veja `valor_por_setor`): o retrato do dia da
    exportacao colado em toda temporada. Aqui ele passa a sair do `valor_eur`, que e por
    temporada de verdade.

    A ponte e por NOME, dentro do mesmo clube e do mesmo ano, com a mesma normalizacao do
    `chave_nome` que a ponte do SkillCorner usa. Das 5.080 chaves do Transfermarkt, 18
    aparecem duas vezes no mesmo elenco (homonimo) e ficam DE FORA: casar errado e pior do
    que nao casar. O que sobra: dos 11 mais usados de cada clube-temporada, 9,9 em media
    encontram ficha e 7,3 tem valor publicado (nas 80 temporadas completas; 9,7 e 7,6 nas
    cinco). Quem nao tem entra como ZERO, exatamente como ja acontece no `tm_valor_total` e
    no valor por setor: `valor_11` e PISO, nao retrato.
    """
    E = pd.read_csv(f"{RAIZ}/dados/serieb_elencos.csv")
    E["clube"] = E["clube"].map(lambda x: TM.get(nfc(x), nfc(x)))
    E["k"] = E["jogador"].map(chave_nome)
    g = E.groupby(["ano", "clube", "k"])["valor_eur"]
    quantos, soma = g.size(), g.sum(min_count=1)
    return {k: soma[k] for k in quantos.index if quantos[k] == 1}


def eh_estrangeiro(nac):
    """Estrangeiro e quem NAO tem o Brasil na lista de nacionalidades.

    O Wyscout escreve "Pais de nacionalidade" como LISTA, e a conta era `!= "Brazil"`:
    "Brazil, Italy" nao batia com "Brazil" e o atleta virava estrangeiro. Sao 215 dos 454
    atleta-temporada contados como estrangeiros — 47% —, dos quais 210 com o Brasil na
    lista (118 so de "Brazil, Italy") e 5 sem nacionalidade preenchida. Nem e so questao de
    rotulo: quem tem passaporte brasileiro NAO ocupa vaga de estrangeiro na inscricao, que
    e a regra que a aba de elenco deste mesmo app ja aplica.

    Sem nacionalidade (5 linhas) entra como brasileiro: a base e 88% brasileira, e chutar
    estrangeiro no vazio inventa minuto de estrangeiro onde nao ha dado.
    """
    return ~nac.fillna("Brazil").map(nfc).str.split(",").map(
        lambda L: any(x.strip() == "Brazil" for x in L))


def do_tecnico():
    T = pd.read_csv(f"{RAIZ}/dados/serieb_tecnico.csv")
    T["clube"] = T["Equipa dentro de um período de tempo seleccionado"].map(nfc)
    T["min"] = T["Minutos jogados:"]
    VAL_TM = valor_tm_por_atleta()
    linhas = []
    for (ano, clube), d in T.groupby(["ano", "clube"]):
        d = d.sort_values("min", ascending=False)
        tot = d["min"].sum()
        p = d["min"] / tot
        onze = d.head(11)
        val = d["Valor de mercado"]
        estr = eh_estrangeiro(d["País de nacionalidade"])
        v11 = [VAL_TM[(ano, clube, chave_nome(j))] for j in onze["Jogador"]
               if (ano, clube, chave_nome(j)) in VAL_TM]
        linhas.append(dict(
            ano=ano, clube=clube,
            atletas_usados=len(d),
            nucleo_1000=int((d["min"] >= 1000).sum()),
            nucleo_300=int((d["min"] >= 300).sum()),
            conc_hhi=float((p**2).sum()*1000),
            share_11=float(onze["min"].sum()/tot*100),
            # A MESMA concentracao contada em PARTIDAS, e nao em minutos: media de
            # "Partidas jogadas" dos 11 mais usados. A coluna estava na base desde o comeco
            # e nunca tinha sido usada em lugar nenhum do projeto (0 nulos nas 3.866
            # linhas). O percentual NAO sai daqui: quem divide por `jogos_base` e o
            # navegador, que e onde mora todo numero que vai a tela.
            pj_11=float(onze["Partidas jogadas"].mean()),
            idade_pond=float((d["idade_na_temporada"]*d["min"]).sum()/tot),
            idade_11=float((onze["idade_na_temporada"]*onze["min"]).sum()/onze["min"].sum()),
            valor_total=float(val.sum()),
            valor_mediana=float(val.median()) if val.notna().any() else np.nan,
            valor_11=float(np.nansum(v11)),
            valor_11_casados=len(v11),
            valor_11_com=int(sum(x == x for x in v11)),
            valor_com_dado=int(val.notna().sum()),
            golos_cabeca=float(d["Golos de cabeça"].sum()),
            penaltis_marcados=float(d["Penaltis marcados"].sum()),
            golos_sem_penalti=float(d["Golos sem ser por penálti"].sum()),
            golos_tec=float(d["Golos"].sum()),
            estrangeiros=int(estr.sum()),
            min_estrangeiros=float(d.loc[estr, "min"].sum()/tot*100),
        ))
    return pd.DataFrame(linhas)


def do_elenco():
    E = pd.read_csv(f"{RAIZ}/dados/serieb_elencos.csv")
    E["clube"] = E["clube"].map(lambda x: TM.get(nfc(x), nfc(x)))
    g = E.groupby(["ano", "clube"])
    f = pd.DataFrame({
        "plantel": g.size(),
        "tm_valor_total": g["valor_eur"].sum(),
        "tm_valor_mediana": g["valor_eur"].median(),
        "tm_idade": g["idade"].mean(),
        "tm_altura": g["altura_m"].mean(),
        "tm_com_valor": g["valor_eur"].count(),
    }).reset_index()
    return f


def montar():
    t = tabelas()
    for parte in (do_jogo(), do_tecnico(), do_elenco()):
        t = t.merge(parte, on=["ano", "clube"], how="left")
    t["xg_saldo"] = t["xg"] - t["xg_contra"]
    t["finalizacao"] = t["GP"]/t["J"] - t["xg"]              # gols acima do esperado, por jogo
    t["defesa_vs_xg"] = t["xg_contra"] - t["GC"]/t["J"]      # gols sofridos abaixo do esperado
    t["gp_jogo"], t["gc_jogo"] = t["GP"]/t["J"], t["GC"]/t["J"]
    t["subiu"] = t["pos"] <= 4
    t["caiu"] = t["pos"] >= 17
    t["faixa"] = np.where(t.pos <= 4, "sobe", np.where(t.pos >= 17, "cai", "meio"))
    return t



# ======================= extras que vem do jogo a jogo =======================

def extras_de_jogo():
    """Clean sheets, jogos sem marcar e goleadas — coisas que so a partida sabe."""
    J = pd.read_csv(f"{RAIZ}/dados/serieb_jogos.csv")
    s = J[(J["Competição"] == "Brazil. Serie B") & J["resultado"].notna()]
    g = s.groupby(["ano", "Equipa"])
    f = pd.DataFrame({
        "clean_sheets": g["golos_contra"].apply(lambda x: int((x == 0).sum())),
        "brancos": g["golos_pro"].apply(lambda x: int((x == 0).sum())),
        "goleadas_pro": g.apply(lambda d: int(((d.golos_pro - d.golos_contra) >= 3).sum()),
                                include_groups=False),
        "goleadas_con": g.apply(lambda d: int(((d.golos_contra - d.golos_pro) >= 3).sum()),
                                include_groups=False),
    }).reset_index().rename(columns={"Equipa": "clube"})
    return f


# Os quatro setores pela posicao principal do Wyscout (`posicao_1`). O valor por setor NAO
# usa mais isto: quem usa e o fisico e o uso de elenco do gerar_sb_clubes.py, que dependem
# de MINUTO — e minuto nao e snapshot.
SETORES = {"GK": "goleiro",
           **{p: "defesa" for p in ("LCB", "RCB", "CB", "LB", "RB", "LWB", "RWB")},
           **{p: "meio" for p in ("DMF", "LDMF", "RDMF", "LCMF", "RCMF", "AMF")}}

# O mesmo agrupamento sobre o texto de `posicao` do Transfermarkt. As 16 grafias que a base
# tem estao cobertas: as cinco que faltam aqui (Ponta Esquerda, Ponta Direita, Centroavante,
# Atacante, Seg. Atacante) caem no default "ataque".
SETORES_TM = {"Goleiro": "goleiro",
              **{p: "defesa" for p in ("Zagueiro", "Lateral Dir.", "Lateral Esq.", "Defensores")},
              **{p: "meio" for p in ("Volante", "Meia Central", "Meia Ofensivo",
                                     "Meia Direita", "Meia Esquerda", "Meio-Campo")}}


def valor_por_setor():
    """Quanto de valor cada clube tinha em cada setor — do Transfermarkt, POR TEMPORADA.

    ISTO JA SAIU DO serieb_tecnico.csv, E ESTAVA ERRADO. A coluna "Valor de mercado" do
    Wyscout e um SNAPSHOT do dia da exportacao (11/09/2026): dos 558 atletas que aparecem em
    duas temporadas ou mais, 489 carregam la o MESMO valor em todas. Somar aquilo por setor
    era aplicar o retrato de 2026 ao elenco de 2022, e o efeito nao era pequeno — a fatia do
    valor no ataque separava quem cai (43,8%) de quem sobe (30,8%) por 13 pontos, e com o
    valor certo a distancia cai para 2.

    O `valor_eur` do Transfermarkt e por temporada de verdade: dos 709 atletas com valor em
    duas temporadas ou mais, 591 (83%) mudam de valor entre elas. Anselmo Ramon vale
    450 mil em 2022 e 25 mil em 2026; o Wyscout diz 150 mil nas duas pontas.

    Duas consequencias para quem le a aba. O Transfermarkt so publica valor para 54% dos
    atletas do plantel nas quatro temporadas completas — o resto e "-" e entra como zero,
    nos quatro setores por igual, exatamente como ja acontecia no `tm_valor_total`. E a soma
    dos quatro setores agora FECHA com o `tm_valor_total`: sao a mesma base, e nao mais duas
    contas diferentes do mesmo elenco.
    """
    E = pd.read_csv(f"{RAIZ}/dados/serieb_elencos.csv")
    E["clube"] = E["clube"].map(lambda x: TM.get(nfc(x), nfc(x)))
    E["setor"] = E["posicao"].map(lambda p: SETORES_TM.get(str(p), "ataque"))
    v = E.pivot_table(index=["ano", "clube"], columns="setor",
                      values="valor_eur", aggfunc="sum").fillna(0)
    v.columns = ["val_" + c for c in v.columns]
    return v.reset_index()



# ======================= a segunda camada de perguntas =======================

def extras_profundos():
    """O que as bases dizem alem da media: contra quem se pontua, quando se pontua, quem
    faz o gol, quem defende, e quanto do elenco sobrou do ano passado.

    Tudo aqui e por clube-temporada, e tudo sai das mesmas tres bases. Nenhuma destas
    perguntas precisa de dado novo — precisava so de alguem olhar.
    """
    J = pd.read_csv(f"{RAIZ}/dados/serieb_jogos.csv")
    s = J[(J["Competição"] == "Brazil. Serie B") & J["resultado"].notna()].copy()
    s["clube"] = s["Equipa"].map(nfc)
    s["pts"] = s["resultado"].map({"V": 3, "E": 1, "D": 0})
    s["form"] = s["Sistema"].astype(str).str.replace(r"\s*\(.*", "", regex=True).str.strip()

    # SALDO DE xG DA PARTIDA, sem merge e sem perder linha. O arquivo traz as DUAS equipes
    # de cada jogo, entao o xG do adversario e (soma do par) menos o proprio, e o saldo vale
    # 2*xG - soma. E de proposito que isto NAO e o merge do `do_jogo()`: aqui `s` ainda vai
    # ser usado por todas as outras colunas deste bloco (sequencias, turnos, formacoes) e um
    # merge que devolvesse outro numero de linhas mudaria todas elas de uma vez.
    # A guarda do tamanho do par existe para o dia em que uma metade faltar: sem ela o saldo
    # viraria o xG inteiro do clube, calado. Hoje os 3.570 pares estao completos.
    _par = s.groupby(["Data", "Jogo"])["Golos esperados"]
    s["xgd"] = np.where(_par.transform("size") == 2,
                        2 * s["Golos esperados"] - _par.transform("sum"), np.nan)

    tab = tabelas()
    pos = dict(zip(zip(tab.ano, tab.clube), tab.pos))
    s["posAdv"] = [pos.get((a, nfc(c))) for a, c in zip(s.ano, s.adversario)]
    s = s[s.posAdv.notna()]
    s = s.sort_values(["ano", "clube", "Data"])
    s["rod"] = s.groupby(["ano", "clube"]).cumcount() + 1

    linhas = []
    for (ano, clube), d in s.groupby(["ano", "clube"]):
        v, p, rod = d.resultado.tolist(), d.pts.tolist(), d.rod.tolist()
        # aproveitamento contra cada terco da tabela — o adversario, nao o proprio clube
        def aprov(f):
            x = d[f]
            return x.pts.sum() / (len(x) * 3) * 100 if len(x) else np.nan
        # sequencias: a mais longa sem vencer e a mais longa vencendo
        semV = maxSemV = seqV = maxV = 0
        for r in v:
            if r == "V":
                seqV += 1; maxV = max(maxV, seqV); semV = 0
            else:
                semV += 1; maxSemV = max(maxSemV, semV); seqV = 0
        apos = [p[i + 1] for i in range(len(v) - 1) if v[i] == "D"]
        aposV = [p[i + 1] for i in range(len(v) - 1) if v[i] == "V"]
        # NINGUEM JOGA CONTRA SI MESMO. Cortar a tabela em 1-6 / 7-14 / 15-20 dava 10 jogos
        # contra o G6 a quem terminou no G4 (que so enfrenta os outros cinco) e 12 a quem
        # caiu — dois grupos comparados como se fossem o mesmo, e a diferenca que sobrava
        # era em parte a do calendario. As tres faixas abaixo sao os seis melhores, os sete
        # do meio e os seis piores ADVERSARIOS de cada clube: 12, 14 e 12 jogos para todo
        # mundo numa temporada completa.
        ordem = sorted(d.posAdv.unique())
        top6, mio7, bot6 = set(ordem[:6]), set(ordem[6:-6]), set(ordem[-6:])
        # O corte por adversario acima iguala a CONTAGEM e nao iguala o NIVEL. Os seis
        # melhores adversarios de quem terminou no G4 valem 63,3 pontos e os de quem caiu,
        # 64,3: quem sobe se tira do topo da lista e ganha um adversario mais fraco no lugar
        # da propria vaga. Sobra 1 ponto de calendario dentro da faixa que deveria ser limpa.
        #
        # O recorte que zera isso e o jogo contra o 5o e o 6o COLOCADOS. Eles nao estao em
        # nenhuma das duas faixas do estudo (top 4 e 17o ou pior), entao todo clube que subiu
        # e todo clube que caiu enfrentou os MESMOS dois adversarios duas vezes: 4 jogos de
        # cada lado, adversario de 61,25 pontos para os dois, diferenca de calendario zero.
        # `jG6` viaja junto porque e a contagem que revela a armadilha (10 contra 12, exato
        # nas quatro temporadas) — e uma afirmacao da tela, entao tem de ser medida, nao
        # deduzida do formato da competicao.
        # O `notna().all()` do xgd56 e a segunda metade da guarda de cima: se um jogo do
        # recorte ficar sem xG, o .mean() do pandas PULA o NaN e devolveria a media de 3
        # jogos enquanto jogos56 continua dizendo 4. Melhor null, que o navegador descarta.
        q56 = d[d.posAdv.isin([5, 6])]
        forms = d.form.value_counts()
        linhas.append(dict(
            ano=ano, clube=clube,
            aprovG6=aprov(d.posAdv <= 6), aprovMeio=aprov((d.posAdv > 6) & (d.posAdv < 15)),
            aprovZ6=aprov(d.posAdv >= 15),
            aprovTop6=aprov(d.posAdv.isin(top6)), aprovMio7=aprov(d.posAdv.isin(mio7)),
            aprovBot6=aprov(d.posAdv.isin(bot6)),
            jG6=int((d.posAdv <= 6).sum()),
            jogos56=int(len(q56)), pts56=int(q56.pts.sum()),
            xgd56=float(q56.xgd.mean()) if len(q56) and q56.xgd.notna().all() else np.nan,
            pts1t=int(d[d.rod <= 19].pts.sum()), pts2t=int(d[d.rod > 19].pts.sum()),
            pts10ini=int(d[d.rod <= 10].pts.sum()), pts10fim=int(d[d.rod > max(rod) - 10].pts.sum()),
            maxSemVencer=maxSemV, maxVitorias=maxV,
            ptsAposDerrota=float(np.mean(apos)) if apos else np.nan,
            # o controle da reacao: se o excedente depois de VENCER for negativo na mesma
            # medida em que o depois de perder e positivo, o que se mede e reversao a media
            ptsAposVitoria=float(np.mean(aposV)) if aposV else np.nan,
            formacoes=int(d.form.nunique()),
            formPrincipal=forms.index[0] if len(forms) else "",
            formPrincipalPct=float(forms.iloc[0] / len(d) * 100) if len(forms) else np.nan,
        ))
    fora = pd.DataFrame(linhas)

    # --- quem faz o gol, e quem defende ---
    T = pd.read_csv(f"{RAIZ}/dados/serieb_tecnico.csv")
    T["clube"] = T["Equipa dentro de um período de tempo seleccionado"].map(nfc)
    gol = []
    for (ano, clube), d in T.groupby(["ano", "clube"]):
        g = d["Golos"].fillna(0)
        tot = g.sum()
        if tot <= 0:
            gol.append(dict(ano=ano, clube=clube, pctArtilheiro=np.nan, marcadores=0, pctTop3=np.nan))
            continue
        gol.append(dict(ano=ano, clube=clube, pctArtilheiro=float(g.max() / tot * 100),
                        marcadores=int((g > 0).sum()),
                        pctTop3=float(g.sort_values(ascending=False).head(3).sum() / tot * 100)))
    fora = fora.merge(pd.DataFrame(gol), on=["ano", "clube"], how="left")

    # O goleiro do clube e o que mais jogou. Abaixo de 900 minutos nao ha titular claro e a
    # media de defesas vira ruido, entao esses ficam vazios em vez de entrar errados.
    gk = T[T.posicao_1 == "GK"].sort_values("Minutos jogados:", ascending=False)
    gk = gk.groupby(["ano", "clube"]).head(1)
    gk = gk[gk["Minutos jogados:"] >= 900]
    gk = gk[["ano", "clube", "Defesas, %", "Golos expectáveis defendidos por 90´"]].rename(
        columns={"Defesas, %": "gkDefesas", "Golos expectáveis defendidos por 90´": "gkEvitados"})
    fora = fora.merge(gk, on=["ano", "clube"], how="left")

    # --- quanto do elenco sobrou do ano anterior ---
    E = pd.read_csv(f"{RAIZ}/dados/serieb_elencos.csv")
    E["clube"] = E["clube"].map(lambda x: TM.get(nfc(x), nfc(x)))
    elenco = {k: set(d.id_jogador.dropna().astype(int))
              for k, d in E.groupby(["ano", "clube"])}
    cont = []
    for (ano, clube), atual in elenco.items():
        ant = elenco.get((ano - 1, clube))
        cont.append(dict(ano=ano, clube=clube,
                         pctFicou=len(atual & ant) / len(ant) * 100 if ant else np.nan,
                         novos=len(atual - ant) if ant else np.nan))
    return fora.merge(pd.DataFrame(cont), on=["ano", "clube"], how="left")



# ======================= o fisico, do SkillCorner =======================

SKILLCORNER = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/"
               "Analytics/Portal Skillcorner/dados/skillcorner.db")
# As edicoes da Serie B no SkillCorner, uma por ano. Sao ids do proprio SkillCorner.
SC_EDICOES = {335: 2022, 446: 2023, 773: 2024, 1061: 2025, 1399: 2026}
# Todas as metricas com cobertura boa na Serie B das cinco temporadas — conferido coluna a
# coluna: as `_p90` batem 100% em todos os anos e as `_p30tip`/`_p30otip`, 98% a 100%.
#
# FICAM DE FORA `peak_velocity` e `peak_velocity_top3`, que a skill dados-skillcorner marca
# como as melhores para "velocidade maxima do atleta": elas tem 0% de cobertura em 2022,
# 2023 e 2024 (o backfill_peak_velocity.py nunca rodou nesses periodos) e 79-98% em 2025 e
# 2026. Entrar com elas seria comparar tres anos vazios com dois cheios.
# As corridas sem bola (Off Ball Runs) moram em OUTRA TABELA, `off_ball_runs`, e por isso
# tem lista propria e entram por LEFT JOIN. Ate 11/09/2026 nao davam para usar aqui: as
# edicoes de 2022 a 2025 tinham zero linha. Era buraco de sincronizacao, nao limite da
# fonte — a API devolveu 800, 776, 765 e 800 quando foi perguntada, e depois de gravadas a
# cobertura ficou em 97,3% a 99,1% contra o `physical`, no mesmo patamar das `_p30tip`.
#
# Sao medidas COM O TIME EM POSSE (`p30tip`) e isso nao e contradicao com o nome: a corrida
# sem bola e o que o atleta faz quando o TIME tem a bola e ELE nao — ataque da profundidade,
# apoio, sobreposicao. Nao confundir com as `_p30otip`, que sao o time sem a posse.
SC_OBR = [
    "runs_p30tip", "runs_above_hsr_p30tip", "runs_penalty_area_p30tip",
    "runs_dangerous_p30tip", "runs_received_p30tip", "runs_shot_within_10s_p30tip",
]


def media_pond(valores, pesos, minimo=0.6):
    """Media ponderada por minuto rastreado que IGNORA o ausente — e desiste se faltar demais.

    Duas coisas, e a segunda e a que importa. `np.average` devolve NaN se UM valor faltar,
    o que derrubaria o clube inteiro por causa de um atleta; ignorar o ausente resolve isso.
    Mas ignorar sozinho cria o problema oposto: um clube em que so 1 dos 8 atletas tem
    corrida sem bola nao tem "a media do clube", tem o numero de um atleta com cara de
    media. O piso de 60% e o mesmo do `gerar_raio_serieb.py`, pela mesma razao.
    """
    ok = valores.notna()
    if ok.sum() < max(1, len(valores) * minimo):
        return np.nan
    return float(np.average(valores[ok], weights=pesos[ok]))


SC_METRICAS = [
    # velocidade
    "psv99", "psv99_top5",
    # uso da velocidade
    "sprint_distance_p90", "sprint_count_p90", "hsr_distance_p90", "hsr_count_p90",
    "hi_distance_p90", "hi_count_p90",
    # volume
    "distance_p90", "m_per_min", "running_distance_p90",
    # arranque e frenagem
    "high_accel_p90", "high_decel_p90", "medium_accel_p90", "medium_decel_p90",
    "expl_accel_sprint_p90", "expl_accel_hsr_p90", "cod_count_p90",
    # com a bola (TIP) e sem a bola (OTIP) — por 30 minutos de cada fase, NUNCA comparaveis
    # com as `_p90` acima: sao reguas diferentes (30 minutos contra 90).
    "m_per_min_tip", "m_per_min_otip",
    "distance_p30tip", "distance_p30otip",
    "sprint_distance_p30tip", "sprint_distance_p30otip",
    "hsr_distance_p30tip", "hsr_distance_p30otip",
]


def chave_nome(s):
    s = unicodedata.normalize("NFD", str(s)).lower()
    s = "".join(x for x in s if unicodedata.category(x) != "Mn")
    return re.sub(r"[^a-z ]", "", s).strip()


def fisico():
    """Perfil fisico de cada clube-temporada, do SkillCorner, ponderado por minuto rastreado.

    ## O clube vem por PONTE DE NOME + IDADE, e ela foi conferida

    A tabela `physical` do SkillCorner e por atleta x edicao e NAO traz o clube. A tabela
    `physical_match`, que traz, so existe para 2025 e 2026. Entao o clube das cinco
    temporadas vem de casar o `short_name` do SkillCorner com o nome do Wyscout dentro do
    mesmo ano, onde o nome e unico (241 nomes de 3.560 aparecem em mais de um clube no mesmo
    ano e ficam de fora).

    **Nome sozinho nao basta, e isso ja custou caro nesta casa**: no Portal Ranking, o Pedro
    do Flamengo chegou a receber o fisico do Pedro Rodriguez ex-Barcelona, e o Vitinho do
    Botafogo o do Vitinho do Fortaleza. A defesa conhecida e a GUARDA DE IDADE, e e a mesma
    daqui: so casa se a idade do SkillCorner (calculada da data de nascimento, na mesma data
    de referencia do Wyscout) ficar entre 2 anos abaixo e 3 acima da idade do Wyscout. A
    folga e torta de proposito — a idade do Wyscout atrasa para baixo.

    A ponte foi CONFERIDA contra os dois anos em que o SkillCorner diz o clube: dos 1.117
    atletas com clube dos dois lados, **98,2% concordam** (era 98,0% so com o nome, e a
    guarda tirou 14 casamentos duvidosos). Nao e suposicao.

    ## Duas ressalvas que mudam a leitura

    1. **O SkillCorner nao cobre todos os jogos.** A media e de ~15 partidas rastreadas por
       atleta por temporada, nao 38. O perfil e de uma AMOSTRA de jogos, e nao da para somar
       distancia da temporada inteira a partir daqui.
    2. **Entram so atletas com 300+ minutos rastreados.** Abaixo disso a media por 90 vira
       ruido de quem entrou dez minutos.
    """
    sc = _sc_atletas()
    if sc is None:
        return pd.DataFrame(columns=["ano", "clube"])

    linhas = []
    for (ano, clube), d in sc.groupby(["ano", "clube"]):
        linha = {"ano": ano, "clube": clube, "fis_atletas": len(d),
                 "fis_minutos": float(d.min_tot.sum())}
        for m in SC_METRICAS + SC_OBR:
            linha["fis_" + m] = media_pond(d[m], d.min_tot)
        linhas.append(linha)
    return pd.DataFrame(linhas)


# Os quatro grupos de posicao do painel fisico. GOLEIRO NAO ENTRA: o SkillCorner nao
# rastreia goleiro, e os poucos nomes de GK que aparecem no `physical` sao homonimos de
# jogador de linha — conferido, 44 linhas de 3.610 e nenhuma delas confiavel.
#
# Zaga e lateral vao SEPARADOS, ao contrario do `SETORES` e do `SETORES_TM`, que juntam os
# dois em "defesa". Para dinheiro juntar faz sentido; para fisico apaga a maior diferenca
# que existe no campo — o lateral corre muito mais que o zagueiro, e misturar os dois dilui
# justamente o que a tabela quer mostrar.
GRUPOS_FIS = {**{p: "zaga" for p in ("CB", "LCB", "RCB")},
              **{p: "lateral" for p in ("LB", "RB", "LWB", "RWB")},
              **{p: "meio" for p in ("DMF", "LDMF", "RDMF", "LCMF", "RCMF", "AMF")}}
ORDEM_GRUPOS = ["zaga", "lateral", "meio", "ataque"]


def grupo_fis(p):
    """Quem nao e zaga, lateral nem meio entra em 'ataque' — pontas e centroavantes."""
    return GRUPOS_FIS.get(str(p), "ataque")


def fisico_por_posicao():
    """O mesmo perfil fisico, mas quebrado por grupo de posicao.

    Existe porque a media do clube inteiro esconde de quem vem a diferenca. Rodando a
    correlacao com a posicao final DENTRO de cada grupo, o resultado e desigual de um jeito
    que a media nao deixa ver: no MEIO, 16 dos 26 indicadores separam quem sobe de quem cai;
    na zaga e no lateral, exatamente UM (o teto de velocidade, `psv99_top5`); no ATAQUE,
    nenhum. Ou seja, o fisico que decide esta no meio-campo.

    A regra de amostra e a mesma do `fisico()` (300+ minutos rastreados) e a ponderacao
    tambem (minuto rastreado). Cada grupo cobre os 100 clube-temporada; a mediana e de 4
    atletas por grupo na zaga e no lateral, 6 no meio e 7 no ataque — por isso o painel
    mostra quantos atletas ha atras de cada numero.
    """
    sc = _sc_atletas()
    if sc is None:
        return pd.DataFrame(columns=["ano", "clube"])
    linhas = []
    for (ano, clube), d in sc.groupby(["ano", "clube"]):
        linha = {"ano": ano, "clube": clube}
        for g in ORDEM_GRUPOS:
            dg = d[d.grupo == g]
            linha[f"fis_{g}_atletas"] = len(dg)
            for m in SC_METRICAS + SC_OBR:
                linha[f"fis_{g}_{m}"] = (media_pond(dg[m], dg.min_tot)
                                         if len(dg) else np.nan)
        linhas.append(linha)
    return pd.DataFrame(linhas)


@functools.lru_cache(maxsize=1)
def _sc_atletas():
    """A ponte SkillCorner -> Wyscout, atleta a atleta, com clube E grupo de posicao.

    Fica em cache porque `fisico()` e `fisico_por_posicao()` pedem a mesma coisa e a ponte
    custa uma leitura do banco de 341 MB mais o cruzamento dos 3.866 jogador-temporada.
    """
    if not os.path.exists(SKILLCORNER):
        print("  (skillcorner.db nao encontrado — seguindo sem o fisico)")
        return None
    con = sqlite3.connect(SKILLCORNER)
    sc = pd.read_sql(
        "select p.sc_competition_edition_id ed, pl.short_name, pl.birthdate, "
        "p.minutes_played, p.matches, "
        + ", ".join("p." + m for m in SC_METRICAS)
        + ", " + ", ".join("o." + m for m in SC_OBR) +
        " from physical p join players pl on pl.sc_player_id = p.sc_player_id"
        # LEFT e nao INNER: quem nao tem corrida sem bola continua entrando com o resto do
        # fisico. Um INNER derrubaria a amostra inteira pelo indicador mais fraco.
        " left join off_ball_runs o on o.sc_player_id = p.sc_player_id"
        " and o.sc_competition_edition_id = p.sc_competition_edition_id"
        f" where p.sc_competition_edition_id in ({','.join(map(str, SC_EDICOES))})", con)
    sc["ano"] = sc.ed.map(SC_EDICOES)
    sc["min_tot"] = sc.minutes_played * sc.matches

    T = pd.read_csv(f"{RAIZ}/dados/serieb_tecnico.csv")
    T["cl"] = T["Equipa dentro de um período de tempo seleccionado"].map(nfc)
    T["k"] = T.Jogador.map(chave_nome)
    ponte = {}
    for (a, k), g in T.groupby(["ano", "k"]):
        if g.cl.nunique() != 1:
            continue
        idades = g.idade_na_temporada.dropna()
        ponte[(a, k)] = (g.cl.iloc[0], float(idades.iloc[0]) if len(idades) else None,
                         grupo_fis(g.posicao_1.iloc[0]))

    def idade_sc(nasc, ano):
        """Idade em 11 de setembro daquele ano — a mesma referencia da idade do Wyscout."""
        if not isinstance(nasc, str) or len(nasc) < 10:
            return None
        n = dt.date(int(nasc[:4]), int(nasc[5:7]), int(nasc[8:10]))
        r = dt.date(ano, 9, 11)
        return r.year - n.year - ((r.month, r.day) < (n.month, n.day))

    clubes, grupos = [], []
    for ano, nome, nasc in zip(sc.ano, sc.short_name, sc.birthdate):
        v = ponte.get((ano, chave_nome(nome)))
        if not v:
            clubes.append(None); grupos.append(None)
            continue
        clube, iw, g = v
        i = idade_sc(nasc, ano)
        # guarda de idade: 2 anos abaixo, 3 acima. Fora disso e homonimo, nao a mesma pessoa.
        if i is not None and iw is not None and not (-2 <= i - iw <= 3):
            clubes.append(None); grupos.append(None)
            continue
        clubes.append(clube); grupos.append(g)
    sc["clube"], sc["grupo"] = clubes, grupos
    return sc[sc.clube.notna() & (sc.min_tot >= 300)].copy()


# ======================= o que o ACASO previa =======================

PERM_R = 10000            # replicas por clube-temporada e por nulo
PERM_SEMENTE = 20260912   # semente fixa: numero que vai a tela nao muda a cada geracao


def _maior_seq(B):
    """Maior sequencia de True em cada LINHA de B (replicas x jogos)."""
    cur = np.zeros(B.shape[0], dtype=np.int32)
    mx = np.zeros(B.shape[0], dtype=np.int32)
    for j in range(B.shape[1]):
        cur = np.where(B[:, j], cur + 1, 0)
        np.maximum(mx, cur, out=mx)
    return mx


def _embaralha(n, grupos, R, rng):
    """R permutacoes de 0..n-1, cada uma embaralhando so DENTRO de cada grupo."""
    fora = np.empty((R, n), dtype=np.int64)
    for g in np.unique(grupos):
        idx = np.where(grupos == g)[0]
        if len(idx) == 1:
            fora[:, idx] = idx
        else:
            fora[:, idx] = idx[np.argsort(rng.random((R, len(idx))), axis=1)]
    return fora


def permutacao_sequencias():
    """O que o acaso previa para as sequencias e para a "reacao" de cada clube-temporada.

    A pergunta do bloco de Regularidade da aba: "maior sequencia sem vencer" e "pontos no
    jogo seguinte a uma derrota" dizem alguma coisa alem de quantas vitorias o time teve?
    Comparar quem sobe com quem cai nao responde: um time que vence 20 vezes tem, por
    aritmetica, sequencias sem vencer mais curtas. O teste e embaralhar os RESULTADOS DO
    PROPRIO CLUBE — os mesmos V, E e D, em outra ordem — PERM_R vezes, e ver o que sai.

    TRES NULOS EMPILHADOS, do mais cego ao mais conservador:

        ""    livre        qualquer ordem dos 38 resultados.
        "M"   mando        embaralha so dentro de casa e dentro de fora. Preserva o
                           calendario e a diferenca de mando do clube, que nas quatro
                           temporadas completas e de 1,75 ponto por jogo em casa contra
                           0,96 fora. E o nulo que desmonta a "reacao": o jogo seguinte a
                           uma derrota FORA e quase sempre em casa.
        "MT"  mando x terco  embaralha dentro de mando x terco de forca do adversario
                           (posicao final 1-7, 8-13, 14-20). Preserva tambem CONTRA QUEM
                           cada resultado aconteceu.

    Esta e a unica parte do estudo que nao roda no navegador — sao 100 clube-temporada x
    3 nulos x PERM_R replicas, uns 7 s aqui. O que viaja para o `sb_clubes.js` sao os
    esperados e os p, um numero por clube-temporada; a comparacao continua sendo feita na
    tela, como tudo o mais.

    O p de cada clube e BICAUDAL E DE PERMUTACAO: a fatia das replicas tao ou mais extremas
    que o observado, truncada em 1. O truncamento nao e cosmetico: `2 * min(cauda, cauda)`
    passa de 1 quando a estatistica e discreta e ha muito empate no observado (aqui o
    maximo bruto chega a 1,79), e "p = 1,79" gravado no sb_clubes.js seria invalido.

    Colunas por clube-temporada: `semVencer`, `vitSeguidas`, `ptsAposD`, `ptsAposV`,
    `ptsAposDcasa`, `ptsAposDfora`, `jCasa` e `jFora` (o observado), mais `esp*` e `p*` com
    o sufixo do nulo. `jCasa` e `jFora` saem os dois do MESMO jogo a jogo — quem quiser
    pontos por jogo fora divide por `jFora`, nunca por `J da tabela menos jCasa`, porque
    quatro clube-temporada tem 37 jogos na base contra 38 na tabela.
    `ptsAposDcasa` e nulo em quem nao perdeu nenhuma em casa (o América-MG de 2024), e
    `espAposDcasaM` tambem: no nulo de mando, quem so perdeu fora continua so perdendo fora.
    """
    rng = np.random.default_rng(PERM_SEMENTE)
    J = pd.read_csv(f"{RAIZ}/dados/serieb_jogos.csv")
    s = J[(J["Competição"] == "Brazil. Serie B") & J["resultado"].notna()].copy()
    s["clube"] = s["Equipa"].map(nfc)
    s["pts"] = s["resultado"].map({"V": 3, "E": 1, "D": 0})
    tab = tabelas()
    pos = dict(zip(zip(tab.ano, tab.clube), tab.pos))
    s["posAdv"] = [pos.get((a, nfc(c))) for a, c in zip(s.ano, s.adversario)]
    s = s[s.posAdv.notna()].sort_values(["ano", "clube", "Data"])

    linhas = []
    for (ano, clube), d in s.groupby(["ano", "clube"]):
        res, pts = d.resultado.to_numpy(), d.pts.to_numpy(float)
        casa = (d.mando.to_numpy() == "casa").astype(int)
        terco = np.where(d.posAdv <= 7, 0, np.where(d.posAdv <= 13, 1, 2))
        n = len(res)
        # os recortes do jogo SEGUINTE: depois de derrota, de derrota em casa, de derrota
        # fora, e de vitoria (o controle)
        antes = {"": res[:-1] == "D",
                 "casa": (res[:-1] == "D") & (casa[:-1] == 1),
                 "fora": (res[:-1] == "D") & (casa[:-1] == 0)}
        antesV = res[:-1] == "V"
        obs = dict(semVencer=int(_maior_seq((res != "V")[None, :])[0]),
                   vitSeguidas=int(_maior_seq((res == "V")[None, :])[0]))
        for suf, m in antes.items():
            obs["ptsAposD" + suf] = float(pts[1:][m].mean()) if m.sum() else np.nan
        obs["ptsAposV"] = float(pts[1:][antesV].mean()) if antesV.sum() else np.nan
        reg = dict(ano=ano, clube=clube, jCasa=int(casa.sum()),
                   jFora=int(n - casa.sum()), **obs)
        for nome, g in (("", np.zeros(n, int)), ("M", casa), ("MT", casa * 3 + terco)):
            i = _embaralha(n, g, PERM_R, rng)
            pr, pp = res[i], pts[i][:, 1:]
            e_sem, e_vit = _maior_seq(pr != "V"), _maior_seq(pr == "V")
            reg["espSemVencer" + nome] = float(e_sem.mean())
            reg["espVitSeguidas" + nome] = float(e_vit.mean())
            reg["pSemVencer" + nome] = float(min(1.0, 2 * min(
                (e_sem >= obs["semVencer"]).mean(), (e_sem <= obs["semVencer"]).mean())))
            reg["pVitSeguidas" + nome] = float(min(1.0, 2 * min(
                (e_vit >= obs["vitSeguidas"]).mean(), (e_vit <= obs["vitSeguidas"]).mean())))
            MV = pr[:, :-1] == "V"
            cv = MV.sum(1)
            reg["espAposV" + nome] = float(np.nanmean(
                np.where(cv > 0, (pp * MV).sum(1) / np.maximum(cv, 1), np.nan)))
            MD = pr[:, :-1] == "D"
            for suf, filtro in (("", np.ones(n - 1, bool)), ("casa", casa[:-1] == 1),
                                ("fora", casa[:-1] == 0)):
                M = MD & filtro[None, :]
                c = M.sum(1)
                e = np.where(c > 0, (pp * M).sum(1) / np.maximum(c, 1), np.nan)
                reg["espAposD" + suf + nome] = (float(np.nanmean(e))
                                                if np.isfinite(e).any() else np.nan)
                o = obs["ptsAposD" + suf]
                reg["pAposD" + suf + nome] = (
                    float(min(1.0, 2 * min(np.nanmean(e >= o), np.nanmean(e <= o))))
                    if not np.isnan(o) else np.nan)
        linhas.append(reg)
    return pd.DataFrame(linhas)


def base():
    t = montar()
    for parte in (extras_de_jogo(), valor_por_setor(), extras_profundos(), fisico(),
                  fisico_por_posicao(), permutacao_sequencias()):
        t = t.merge(parte, on=["ano", "clube"], how="left")
    setores = [c for c in t.columns if c.startswith("val_")]
    tot = t[setores].sum(axis=1)
    for c in setores:
        t["sh_" + c[4:]] = t[c] / tot * 100
    t["xg_por_remate"] = t["xg"] / t["remates"]
    t["xg_por_remate_contra"] = t["xg_contra"] / t["remates_contra"]
    t["xg_saldo"] = t["xg"] - t["xg_contra"]
    t["bp_conv"] = t["bp_remates"] / t["bolas_paradas"] * 100
    return t


# ======================= o relatorio =======================

def posto(c, f, asc=False):
    """Posto dentro da temporada. asc=True quando MENOS e melhor (gols sofridos)."""
    return c.groupby("ano")[f].rank(ascending=asc)


def rho(c, f, asc=False):
    return float(np.corrcoef(posto(c, f, asc), c.groupby("ano")["pos"].rank())[0, 1])


INDICADORES = [
    ("pontos em casa", "pontos_casa", False), ("pontos fora", "pontos_fora", False),
    ("gols sofridos", "gc_jogo", True), ("gols marcados", "gp_jogo", False),
    ("jogos sem marcar", "brancos", True), ("clean sheets", "clean_sheets", False),
    ("valor na defesa", "val_defesa", False), ("xG sofrido", "xg_contra", True),
    ("distância do remate", "dist_remate", True),
    ("% dos minutos nos 11 mais usados", "share_11", False),
    ("xG criado", "xg", False), ("atletas usados", "atletas_usados", True),
    ("valor do elenco", "tm_valor_total", False),
    ("bola parada vira remate, %", "bp_conv", False),
    ("gols de cabeça", "golos_cabeca", False), ("toques na área", "toques_area", False),
    ("valor no meio", "val_meio", False),
    ("duelos aéreos ganhos, %", "duelos_aereos_pct", False),
    ("remates à baliza, %", "remates_baliza_pct", False),
    ("PPDA (pressão alta)", "ppda", True), ("valor no ataque", "val_ataque", False),
    ("fatia do valor no ataque", "sh_ataque", False),
    ("fatia do valor na defesa", "sh_defesa", False),
    ("cruzamentos certos, %", "cruz_certos_pct", False), ("posse", "posse", False),
    ("% de minutos com estrangeiros", "min_estrangeiros", False),
    ("passe certo, %", "passes_pct", False), ("idade do time", "idade_pond", True),
]


def relatorio(t):
    c = t[t.ano <= 2025]
    faixa = lambda f, r=2: c.groupby("faixa")[f].mean().reindex(["sobe", "meio", "cai"]).round(r)
    linha = lambda rot, f, r=2: print(f"  {rot:<34}" + "".join(f"{v:>10.{r}f}" for v in faixa(f, r)))

    print("=" * 78)
    print(f"SERIE B 2022-2025 · {len(c)} clube-temporada · sobe = 1o ao 4o · cai = 17o ao 20o")
    print("=" * 78)

    print("\n-- o xG do Wyscout na Serie B (ele supera o gol real; use a ORDEM, nao o nivel)")
    for ano, d in c.groupby("ano"):
        print(f"   {ano}: gols/jogo {d.gp_jogo.mean():.2f} · xG/jogo {d.xg.mean():.2f} "
              f"· razao {d.gp_jogo.mean()/d.xg.mean():.3f}")

    print("\n" + "-" * 78)
    print(f"{'':34}{'SOBE':>10}{'MEIO':>10}{'CAI':>10}")
    print("-" * 78)
    print("\n ATAQUE")
    for rot, f, r in [("gols por jogo", "gp_jogo", 2), ("xG por jogo", "xg", 2),
                      ("remates por jogo", "remates", 2), ("xG por remate", "xg_por_remate", 3),
                      ("remates a baliza, %", "remates_baliza_pct", 1),
                      ("distancia media do remate (m)", "dist_remate", 1),
                      ("toques na area", "toques_area", 1),
                      ("jogos sem marcar (em 38)", "brancos", 1),
                      ("vitorias por 3+ de diferenca", "goleadas_pro", 1)]:
        linha(rot, f, r)
    print("\n DEFESA")
    for rot, f, r in [("gols sofridos por jogo", "gc_jogo", 2),
                      ("xG sofrido por jogo", "xg_contra", 2),
                      ("remates sofridos", "remates_contra", 2),
                      ("xG por remate sofrido", "xg_por_remate_contra", 3),
                      ("clean sheets (em 38)", "clean_sheets", 1),
                      ("derrotas por 3+ de diferenca", "goleadas_con", 1),
                      ("PPDA (menor = pressiona mais alto)", "ppda", 1)]:
        linha(rot, f, r)
    print("\n BOLA PARADA")
    for rot, f, r in [("bolas paradas por jogo", "bolas_paradas", 1),
                      ("viram remate, %", "bp_conv", 1), ("cantos por jogo", "cantos", 1),
                      ("gols de cabeca na temporada", "golos_cabeca", 1),
                      ("penaltis convertidos", "penaltis_conv", 1)]:
        linha(rot, f, r)
    print("\n ELENCO")
    for rot, f, r in [("valor total (EUR mi)", "tm_valor_total", 0),
                      ("valor na defesa (EUR mi)", "val_defesa", 0),
                      ("valor no ataque (EUR mi)", "val_ataque", 0),
                      ("fatia do valor na defesa, %", "sh_defesa", 1),
                      ("fatia do valor no ataque, %", "sh_ataque", 1),
                      ("atletas usados", "atletas_usados", 1),
                      ("% dos minutos nos 11 mais usados", "share_11", 1),
                      ("idade media ponderada por minuto", "idade_pond", 1),
                      ("% de minutos com estrangeiros", "min_estrangeiros", 1)]:
        if f.startswith(("tm_valor", "val_")):
            v = faixa(f, 0) / 1e6
            print(f"  {rot:<34}" + "".join(f"{x:>10.1f}" for x in v))
        else:
            linha(rot, f, r)
    print("\n MANDO")
    for rot, f in [("pontos em casa (19 jogos)", "pontos_casa"), ("pontos fora (19 jogos)", "pontos_fora")]:
        linha(rot, f, 1)

    print("\n" + "-" * 78)
    print(" DE ONDE VEM A VANTAGEM (quem sobe x quem cai, decomposto)")
    print("-" * 78)
    s, k = c[c.faixa == "sobe"].mean(numeric_only=True), c[c.faixa == "cai"].mean(numeric_only=True)
    pc = lambda a, b: (a / b - 1) * 100
    print(f"  ataque:  remates {pc(s.remates, k.remates):+.1f}%  ->  xG por remate "
          f"{pc(s.xg_por_remate, k.xg_por_remate):+.1f}%  ->  xG {pc(s.xg, k.xg):+.1f}%  "
          f"->  GOLS {pc(s.gp_jogo, k.gp_jogo):+.1f}%")
    print(f"  defesa:  remates sofridos {pc(s.remates_contra, k.remates_contra):+.1f}%  ->  "
          f"xG por remate {pc(s.xg_por_remate_contra, k.xg_por_remate_contra):+.1f}%  ->  "
          f"xG sofrido {pc(s.xg_contra, k.xg_contra):+.1f}%  ->  GOLS SOFRIDOS "
          f"{pc(s.gc_jogo, k.gc_jogo):+.1f}%")
    print("  (a distancia entre o xG e o gol e a finalizacao — e ela e a maior parte do vao)")

    print("\n" + "-" * 78)
    print(" A FINALIZACAO SE REPETE NO ANO SEGUINTE? (mesmo clube, temporadas seguidas)")
    print("-" * 78)
    c = c.copy()
    c["fin"] = (c.gp_jogo - c.xg) * c.J
    c["defx"] = (c.xg_contra - c.gc_jogo) * c.J
    pares = []
    for clube, d in c.groupby("clube"):
        d = d.sort_values("ano")
        for i in range(len(d) - 1):
            if d.iloc[i + 1].ano == d.iloc[i].ano + 1:
                pares.append((d.iloc[i].fin, d.iloc[i + 1].fin, d.iloc[i].defx,
                              d.iloc[i + 1].defx, d.iloc[i].xg_saldo, d.iloc[i + 1].xg_saldo))
    P = pd.DataFrame(pares, columns=["f0", "f1", "d0", "d1", "x0", "x1"])
    print(f"  {len(P)} pares de temporadas consecutivas")
    for a, b, rot in [("f0", "f1", "finalizacao (gols - xG)"),
                      ("d0", "d1", "defesa alem do xG (xG sofrido - gols sofridos)"),
                      ("x0", "x1", "saldo de xG (criar - conceder)")]:
        print(f"    {rot:<46} r = {np.corrcoef(P[a], P[b])[0, 1]:+.2f}")

    print("\n" + "-" * 78)
    print(" O QUE MAIS ANDA JUNTO COM A POSICAO FINAL (posto x posto, 1 = perfeito)")
    print("-" * 78)
    for rot, f, asc in sorted(INDICADORES, key=lambda x: -abs(rho(c, x[1], x[2]))):
        v = rho(c, f, asc)
        print(f"  {rot:<34} {v:+.2f}  {'#' * int(abs(v) * 28)}")

    print("\n" + "-" * 78)
    print(" TOP-4 DE CADA METRICA x QUEM SUBIU DE FATO (16 acessos possiveis)")
    print("-" * 78)
    for rot, f, asc in [("saldo de gols", "SG", False), ("gols marcados", "GP", False),
                        ("valor do elenco", "tm_valor_total", False),
                        ("gols sofridos", "GC", True), ("clean sheets", "clean_sheets", False),
                        ("saldo de xG", "xg_saldo", False),
                        ("concentracao de minutos", "share_11", False)]:
        n = sum(len(set(g.nsmallest(4, f).clube if asc else g.nlargest(4, f).clube)
                    & set(g.nsmallest(4, "pos").clube)) for _, g in c.groupby("ano"))
        print(f"  top-4 de {rot:<24} -> {n:>2} dos 16")


if __name__ == "__main__":
    import sys
    t = base()
    if "--csv" in sys.argv:
        t.to_csv(f"{RAIZ}/dados/serieb_clube_temporada.csv", index=False, encoding="utf-8-sig")
        print(f"gravado dados/serieb_clube_temporada.csv ({len(t)} linhas, {len(t.columns)} colunas)\n")
    relatorio(t)
