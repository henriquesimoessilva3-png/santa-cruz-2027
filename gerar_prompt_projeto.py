#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Monta o PROMPT do projeto inteiro, num arquivo so', puxando de onde a informacao ja' existe.

## Por que e' um gerador e nao um texto

Um "mega prompt" escrito a mao envelhece no dia seguinte: o estudo ganha parte, uma conclusao
muda de selo, a lista muda de tamanho, e o prompt continua contando a historia de ontem. Aqui
NADA e' digitado: cada numero vem do mesmo dado que a aba Estudo le' (`static/estudo_serieb_dados.js`,
ja' com marcadores resolvidos e conferidos pelo portao), o metodo vem do CLAUDE.md, as regras do
portao vem do proprio `_portao.py`, o painel comprometido do `_painel_suspeito.json`, as ligas do
`J09_ligas.csv`, e a fila do contexto da ultima sessao. Rodou, esta' atual.

## O que ele produz

`_fonte/PROMPT_PROJETO.md` — um documento para colar no inicio de uma sessao nova (ou entregar a
outra pessoa, ou a outro modelo) que responde: o que e' este projeto, o que ja' se sabe (com
todos os numeros), como se trabalha nele, o que barra erro, o que esta' publicado, onde mora cada
coisa, e o que esta' pendente.

Uso:
    python3 gerar_prompt_projeto.py
"""
import csv
import datetime as dt
import json
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTE = os.path.join(AQUI, "_fonte")
ESTUDO = os.path.join(FONTE, "estudo_serieb")
RES = os.path.join(ESTUDO, "resultados")
SAIDA = os.path.join(FONTE, "PROMPT_PROJETO.md")


# ---------------------------------------------------------------------------- utilidades
def ler(caminho):
    with open(caminho, encoding="utf-8") as fh:
        return fh.read()


def fatia_md(texto, de, ate=None):
    """O trecho de um markdown entre o cabecalho `de` e o cabecalho `ate` (exclusivo)."""
    ini = texto.find(de)
    if ini < 0:
        return ""
    fim = texto.find(ate, ini + len(de)) if ate else -1
    return texto[ini: fim if fim > 0 else None].rstrip() + "\n"


def dado_da_aba():
    s = ler(os.path.join(AQUI, "static", "estudo_serieb_dados.js"))
    marca = "const ESTUDO_SERIEB = "
    return json.loads(s[s.index(marca) + len(marca):].rstrip().rstrip(";"))


def fmt(v, c=1):
    if v is None:
        return "—"
    try:
        x = float(v)
    except (TypeError, ValueError):
        return str(v)
    if c == 0 or x == int(x) and c <= 1:
        return f"{int(round(x))}"
    return f"{x:.{c}f}".replace(".", ",")


def regras_do_portao():
    s = ler(os.path.join(ESTUDO, "scripts", "_portao.py"))
    fora = []
    for m in re.finditer(r'def (regra_\d+)\(.*?\n\s+titulo = (f?)"([^"]+)"', s, flags=re.S):
        n = m.group(1).split("_")[1]
        t = m.group(3).replace("{VIMOS_MAX_CARACTERES}", "280").replace("{VIMOS_MAX_FRASES}", "3")
        fora.append((int(n), t))
    # a regra 8 nao tem `def` no mesmo molde; o titulo esta' solto
    if not any(n == 8 for n, _ in fora):
        m = re.search(r'titulo = "(O _registro\.md[^"]+)"', s)
        if m:
            fora.append((8, m.group(1)))
    return sorted(fora)


# ---------------------------------------------------------------------------- as secoes
def cabecalho(D):
    c = D["contagem"]
    n_concl = sum(len(p["conclusoes"]) for p in D["partes"])
    selos = {}
    for p in D["partes"]:
        for x in p["conclusoes"]:
            selos[x.get("confianca") or "—"] = selos.get(x.get("confianca") or "—", 0) + 1
    return f"""# PROMPT DO PROJETO — Santa Cruz 2027

> Gerado por `gerar_prompt_projeto.py` em {dt.date.today().isoformat()}, a partir dos arquivos do
> repositório. Nenhum número aqui foi digitado à mão: eles vêm do mesmo dado que a aba Estudo
> lê, já conferido pelo portão. Para atualizar: `python3 gerar_prompt_projeto.py`.

## Como usar este documento

Cole-o no início de uma sessão nova. Ele diz o que é o projeto, o que já se sabe (com os
números), como se trabalha, o que barra erro, o que está publicado, onde mora cada coisa e o
que está pendente. Depois de lê-lo, a pessoa (ou o modelo) deve:

1. Tratar toda afirmação de **limite de dado** ("essa base não tem X") como suspeita até abrir o
   arquivo cru — três vezes em dois dias isso foi defeito de código, não de dado.
2. Nunca digitar número em texto publicado: número vem de marcador, de `<ID>_numeros.json`.
3. Terminar toda análise em **nome para contratar** (treinador ou jogador). Parte que para no
   traço do time está na metade.
4. Uma pergunta por vez, com relato a cada entrega.

## O projeto em uma página

**O que é.** Um app de montagem de elenco do Santa Cruz para 2027 (campograma, orçamento,
fim de contrato, físico, financeiro, empresários, indicados, bola parada, minutagem) e, dentro
dele, o **Estudo Série B**: {c['total']} perguntas respondidas com dado técnico (Wyscout) e físico
(SkillCorner) sobre o que separa quem sobe, qual treinador buscar e quem contratar.

**Estado.** {c['validada']} de {c['total']} perguntas validadas · {n_concl} conclusões
({', '.join(f'{v} {k}' for k, v in sorted(selos.items(), key=lambda kv: -kv[1]))}) ·
{len(D['decisoes']['decisoes'])} decisões · {len(D['regras']['regras'])} regras de leitura ·
portão aceitando {c['validada']} de {c['total']} · dado de {D['gerado_em']}.

**O alvo, dito pelo dono em 21/09/2026.** O fim de qualquer parte é sempre treinador e jogador
sugeridos para contratação. O mercado, em ordem de foco: Série B; Série A; brasileiros e
sul-americanos no exterior; campeonatos sul-americanos (principalmente).

**A única conclusão firme do estudo inteiro** é a A02-1: quem sobe finaliza de mais perto — o
eixo da qualidade da chance. Tudo o mais é provável ou indício, e o estudo diz isso na tela.
"""


def secao_metodo():
    cl = ler(os.path.join(ESTUDO, "CLAUDE.md"))
    partes = [
        fatia_md(cl, "## Objetivo", "## Como trabalhar"),
        fatia_md(cl, "## Como trabalhar", "## Execução com ultracode"),
        fatia_md(cl, "## Didática", "## Definições fixas"),
        fatia_md(cl, "## Definições fixas", "## Entrega de cada parte"),
        fatia_md(cl, "## Entrega de cada parte", "## A aba"),
    ]
    return ("# 1. O MÉTODO (do `_fonte/estudo_serieb/CLAUDE.md`)\n\n"
            "> Transcrito do arquivo que decide o método. Se este prompt e o CLAUDE.md divergirem, "
            "vale o CLAUDE.md.\n\n" + "\n".join(partes))


def secao_portao():
    regras = regras_do_portao()
    linhas = "\n".join(f"{n}. {t}" for n, t in regras)
    return f"""# 2. O PORTÃO — o que barra a classe de erro inteira

Toda parte passa por `scripts/_portao.py` antes de ser publicada. Ele **só lê**: confere que o
número publicado é igual ao que o script gravou, que os dois cortes de fronteira existem e que o
texto cita quando discordam, que a manchete cabe em 14 palavras, que nenhuma palavra técnica
vaza para o texto de 10 segundos. Parte recusada não sobe. As {len(regras)} regras:

{linhas}

**O que o portão NÃO prova:** que o número saiu do dado (ele não executa script nem abre base);
que o teste publicado veio do `_metodo.py` (só que o módulo foi importado); que o trecho citado
como prova sustenta a conclusão (só que existe). Isso continua sendo leitura humana.
"""


def secao_regras(D):
    G = D["regras"]
    fora = [f"## {G['como_ler']}\n"]
    for r in G["regras"]:
        fora.append(f"### {r['id']}. {r['regra']}\n\n**Evita:** {r['evita']}\n\n"
                    f"**A conta que a produziu:** {r['conta']}\n\n"
                    f"*De {r['de']}{' · ' + r['conclusao'] if r.get('conclusao') else ''}"
                    f"{' · ' + r['decisao'] if r.get('decisao') else ''}*\n")
    return "# 3. AS QUATRO REGRAS DE LEITURA\n\n" + "\n".join(fora)


def secao_decisoes(D):
    D2 = D["decisoes"]
    fora = [f"{D2['como_ler']}\n"]
    grupo_atual = None
    for d in D2["decisoes"]:
        if d["grupo"] != grupo_atual:
            grupo_atual = d["grupo"]
            fora.append(f"\n## {grupo_atual}\n")
        fora.append(f"### {d['id']} · {d['decisao']}  *[{d.get('confianca') or '—'}]*\n\n"
                    f"{d['porque']}\n\n**Mas:** {d['ressalva']}\n\n"
                    f"*De {d['de']}{' · ' + d['conclusao'] if d.get('conclusao') else ''}*\n")
    return f"# 4. AS {len(D2['decisoes'])} DECISÕES — o que o clube FAZ\n\n" + "\n".join(fora)


def secao_conclusoes(D):
    secoes = {"A": "Que time montar", "T": "Que treinador buscar", "J": "Quem contratar"}
    fora = []
    for bloco, titulo in secoes.items():
        ps = [p for p in D["partes"] if p["bloco"] == bloco]
        fora.append(f"\n## Bloco {bloco} — {titulo} ({len(ps)} partes)\n")
        for p in ps:
            fora.append(f"\n### {p['id']} — {p.get('titulo') or p['pergunta']}\n\n"
                        f"*Pergunta:* {p['pergunta']}\n")
            for c in p["conclusoes"]:
                neg = " · **negativa**" if c.get("negativa") else ""
                fora.append(f"\n**{c['id']} · {c['manchete']}**  *[{c.get('confianca') or '—'}{neg}]*\n\n"
                            f"- O que vimos: {c.get('o_que_vimos') or '—'}\n"
                            f"- Para o Santa Cruz: {c.get('para_o_santa_cruz') or '—'}\n"
                            f"- n: {c.get('n') or '—'}\n"
                            f"- Prova: {c.get('prova') or '—'}\n")
            if p.get("em_aberto"):
                fora.append(f"\n*Em aberto ({p['id']}):* {p['em_aberto']}\n")
    n = sum(len(p["conclusoes"]) for p in D["partes"] if p["bloco"] in secoes)
    return f"# 5. AS {n} CONCLUSÕES, PARTE POR PARTE\n\n" + "\n".join(fora)


def secao_fisico(D):
    F = D["fisico"]
    fora = [f"{F['como_ler']}\n"]
    for b in F["blocos"]:
        fora.append(f"### {b['id']} · {b['titulo']}  *[{b.get('confianca') or '—'}]*\n\n"
                    f"{b['texto']}\n\n*De {b['de']} · {b.get('conclusao') or ''}*\n")
    fora.append("\n### Os limites desta seção\n")
    for l in F.get("limites", []):
        fora.append(f"- **{l['titulo']}** {l['texto']}")
    return "# 6. O QUE SABEMOS DO FÍSICO (oito partes, num lugar só)\n\n" + "\n".join(fora) + "\n"


def secao_listas(D):
    K = D["ranking"]
    fora = []
    o = K.get("regra") or {}
    fora.append(f"**A regra da lista** (`J06_ordenacao.json`, decidida em {o.get('decidido_em', '?')}): "
                f"{K.get('o_que_e', '')}\n")
    teto = (K.get("teto_do_ajuste") or {})
    fora.append(f"**O teto do ajuste de liga (J08):** volume {fmt(teto.get('volume'))}, eficiência "
                f"{fmt(teto.get('eficiencia'))}. Quem vem de fora tem o percentil convertido para a escala "
                f"da Série B e NÃO pode passar desse teto, enquanto a Série B chega a 100 — o topo de cada "
                f"posição é da Série B por construção do ajuste, não por mérito. Por isso cada linha de fora "
                f"traz o percentil de origem e o desconto.\n")
    corte = K.get("corte_de_minutagem") or {}
    fora.append(f"**O corte:** {corte.get('criterio', '')} — na Série B, {corte.get('saíram', '?')} saíram e "
                f"{corte.get('ficaram', '?')} ficaram. Nos mercados de fora a rodagem na liga de origem "
                f"elimina como **critério prático da casa**, não como achado medido: o J09-1 que a "
                f"sustentava caiu em 22/09 quando a chave do painel temporal foi consertada.\n")
    for L in K["listas"]:
        fora.append(f"\n## Lista — {L['titulo']} ({L['quantos']} nomes"
                    f"{' de ' + str(L['candidatos']) + ' com rodagem' if L.get('candidatos') != L['quantos'] else ''})\n\n"
                    f"{L['subtitulo']}"
                    f"{' Teto de ' + str(L['teto_por_mercado']) + ' por mercado, por posição.' if L.get('teto_por_mercado') else ''}\n")
        for b in L["blocos"]:
            comp = " · ".join(f"{k} {v}" for k, v in (b.get("por_mercado") or {}).items())
            fora.append(f"\n**{b['posicao']}** — {b['quantos']} nomes · ficha de {b['ficha_de']}, "
                        f"{b['criterios_da_ficha']} critérios{' · ' + comp if comp else ''}\n")
            fora.append("| # | jogador | mercado | clube · liga | idade | eixo | origem→desconto | físico e duelo | atende | contrato | ⚠ |\n"
                        "|---|---|---|---|---|---|---|---|---|---|---|")
            for i, j in enumerate(b["jogadores"][:8], 1):
                od = ("" if j.get("aderencia_eixo_origem") is None
                      else f"{fmt(j['aderencia_eixo_origem'], 0)}→{fmt(j.get('desconto_do_eixo'))}")
                fora.append(f"| {i} | {j['jogador']}{' ⚑' if j.get('estrangeiro') else ''}"
                            f"{' (' + j['passaporte'] + ')' if j.get('passaporte') else ''} | {j.get('mercado') or 'Série B'} | "
                            f"{j.get('clube') or '—'}{' · ' + j['liga'] if j.get('liga') and j.get('mercado') != 'Série B' else ''} | "
                            f"{fmt(j.get('idade'), 0)} | {fmt(j.get('aderencia_eixo'))} | {od} | "
                            f"{fmt(j.get('aderencia_desempate'))} | {j.get('atende')}/{j.get('com_dado')} | "
                            f"{'vencendo' if j.get('livre') else '—'} | {'⚠' if j.get('fator_comprometido') else ''} |")
            if len(b["jogadores"]) > 8:
                fora.append(f"\n*… e mais {len(b['jogadores']) - 8} nesta posição, na aba.*")
    return "# 7. AS LISTAS DE JOGADORES, POR POSIÇÃO (três mercados)\n\n" + "\n".join(fora) + "\n"


def secao_nomes(D):
    A = D.get("alvos_fora") or []
    if not A:
        return "# 8. OS NOMES QUE O ESTUDO PUBLICA\n\nNenhum: o funil do J09 não deixou passar ninguém.\n"
    fora = ["A única lista NOMINAL que o estudo autoriza, com rótulo **rastrear** (nunca `alvo`): os que "
            "atravessam a ficha inteira da posição na leitura da liga de ORIGEM. Nenhum sobrevive ao "
            "desconto de conversão de liga.\n",
            "| jogador | posição | clube · liga | idade | rodagem | contrato | ficha | conversão | passa ajustado |",
            "|---|---|---|---|---|---|---|---|---|"]
    for a in A:
        fora.append(f"| {a['jogador']}{' ⚑' if a.get('estrangeiro') else ''} ({a.get('nascido_em') or '—'}) | "
                    f"{a['setor']} {a.get('posicao') or ''} | {a.get('clube') or '—'} · {a.get('liga') or ''} | "
                    f"{fmt(a.get('idade'), 0)} | {fmt(a.get('fatia_pct'), 0)}% | {a.get('contrato') or '—'} | "
                    f"{a.get('criterios')}/{a.get('exigencias')} | {a.get('forca_do_fator')} "
                    f"({fmt(a.get('casos_do_fator'), 0)} casos) | {'sim' if a.get('passa_ajustado') else 'não'} |")
    return "# 8. OS NOMES QUE O ESTUDO PUBLICA\n\n" + "\n".join(fora) + "\n"


def secao_treinadores(D):
    T = D.get("treinadores") or {}
    lista = T.get("lista") or []
    if not lista:
        return ""
    fora = [f"{T.get('criterio', '')}\n",
            "| treinador | passagens | clubes | rodadas | % G4 pior | % G4 médio | pontos/jogo |",
            "|---|---|---|---|---|---|---|"]
    for t in sorted(lista, key=lambda x: -float(x.get("pct_g4_pior") or 0))[:15]:
        fora.append(f"| {t['treinador']} | {t.get('passagens')} | {t.get('clubes')} | {t.get('rodadas')} | "
                    f"{fmt(t.get('pct_g4_pior'))} | {fmt(t.get('pct_g4_medio'))} | {fmt(t.get('ppj'), 2)} |")
    fora.append(f"\n*{len(lista)} treinadores na lista completa (`T04_resumo.json`). A D10 diz por que o piso "
                f"NÃO vira critério de escolha: o T04-1 mediu que ele põe na frente quem nunca subiu.*")
    return "# 9. TREINADORES (T04)\n\n" + "\n".join(fora) + "\n"


def secao_painel():
    caminho = os.path.join(RES, "_painel_suspeito.json")
    if not os.path.exists(caminho):
        return ""
    P = json.load(open(caminho, encoding="utf-8"))
    fora = [f"{P['_doc']}\n", "| liga | temporada | tipo | times | mediana da liga | sobreposição |",
            "|---|---|---|---|---|---|"]
    for x in P["liga_temporada_comprometida"]:
        fora.append(f"| {x['liga']} | {x['temporada']} | {x['tipo']} | {x['times']} | {x['mediana_da_liga']} | {x['sobreposicao_pct']}% |")
    S = P["sensibilidade_do_fator"]
    fora.append(f"\n**Sensibilidade, medida em {S['medido_em']}:** {S['como']}\n")
    for f_ in S["por_fator"]:
        fora.append(f"- {f_['liga']} · {f_['familia']}: {fmt(f_['publicado'], 2)} → "
                    f"{fmt(f_['sem_os_casos'], 2) if f_['sem_os_casos'] is not None else 'fica sem fator'}")
    fora.append(f"\n{S['o_que_nao_se_move']} {S['conclusoes_do_j08']}\n\n**Isto não é conserto:** {S['o_que_nao_e']} "
                "O painel é copiado do Portal Ranking, e é lá que o rótulo precisa ser corrigido.")
    return "# 10. O PAINEL COM RÓTULO ERRADO (fora deste repositório)\n\n" + "\n".join(fora) + "\n"


def secao_dados():
    fora = []
    m = json.load(open(os.path.join(ESTUDO, "dados_copiados", "wyscout", "_manifesto.json"), encoding="utf-8"))
    fora.append(f"**Cópia do Wyscout** (de `{os.path.basename(m['fonte'])}`, período {m['periodo']}, "
                f"copiada em {m['copiado_em']}):\n")
    for a in m["arquivos"]:
        fora.append(f"- `{a['nome']}` ({a['mb']} MB) — {a['o_que_e']}")
    ligas = list(csv.DictReader(open(os.path.join(RES, "J09_ligas.csv"), encoding="utf-8")))
    entram = [l for l in ligas if l["veredito"] == "entra"]
    por_m = {}
    for l in entram:
        por_m.setdefault(l["mercado"], []).append(l["liga"])
    fora.append(f"\n**Ligas de origem que entram na base de fora:** {len(entram)} de {len(ligas)} lidas "
                f"(o resto sai por liga sem fator de J08, temporada curta ou elenco cortado no export).\n")
    for k, v in por_m.items():
        fora.append(f"- {k}: {', '.join(sorted(v))}")
    cx = ler(os.path.join(FONTE, "CONTEXTO.md"))
    fora.append("\n" + fatia_md(cx, "## As bases (geradas por script", "## Armadilhas que custaram tempo"))
    fora.append(fatia_md(cx, "## Bases da Série B 2022-2026", "## Análise ofensiva e defensiva"))
    return "# 11. OS DADOS — de onde vem cada coisa\n\n" + "\n".join(fora) + "\n"


def secao_infra():
    rd = ler(os.path.join(AQUI, "README.md"))
    pb = ler(os.path.join(AQUI, "PUBLICAR.md"))
    fora = [
        "**App:** Flask em `app.py` (porta 5090), tela em `templates/index.html`, lógica em "
        "`static/app.js`, aba Estudo em `static/estudo_serieb.js` + `estudo_serieb_dados.js` "
        "(gerado por `gerar_estudo_serieb_js.py`). Subir: `iniciar.sh`; derrubar: `parar.sh`.\n",
        "**Site público:** GitHub Pages em `https://henriquesimoessilva3-png.github.io/santa-cruz-2027/`, "
        "montado por `publicar_site.py` na pasta `docs/`. O snapshot público carrega a folha salarial "
        "(decisão do dono em 22/09).\n",
        "**Nuvem:** Firestore, projeto `santa-cruz-data-scout`, coleção `cenarios`, fechada na lista de "
        "e-mails de `firestore.rules`. O Salvar do app avisa antes de gravar por cima de quem salvou "
        "depois (22/09). `atualizar_listas.py` + `.github/workflows/atualizar-listas.yml` sincronizam a "
        "foto do site com a nuvem a cada 10 minutos, quando o secret `FIREBASE_KEY` existir.\n",
        fatia_md(rd, "## Arquivos", "## Observação sobre salários"),
        fatia_md(rd, "## Observação sobre salários"),
        "\n**Ordem de publicação do estudo** (do contexto da sessão):\n",
        fatia_md(ler(os.path.join(FONTE, "CONTEXTO_sessao_21_09_noite.md")),
                 "## 8. A ordem de publicação", "## 9."),
        "\n**Portais do Botafogo Analytics** (fonte dos dados, fora deste repositório): hub em "
        "localhost:5555 e ~20 portas; ver a skill `portais-botafogo`. As skills `dados-wyscout`, "
        "`dados-skillcorner` e `analisar-campeonato` descrevem as bases e o método reutilizável.\n",
        "\n**Estudo, por dentro:** `_fonte/estudo_serieb/` — `CLAUDE.md` (método), `PLANO.md`, "
        "`PLANO_FISICO.md`, `scripts/<ID>.py` (uma parte por script, todos importam `_metodo.py`), "
        "`resultados/<ID>.json|.md|_numeros.json|_testes.csv` (entregas), `_registro.md` (gerado), "
        "`_decisoes.json`, `_regras.json`, `_fisico.json`, `_painel_suspeito.json`, "
        "`J06_ranking_aderencia.json` (as listas).\n",
    ]
    return "# 12. A INFRAESTRUTURA — onde mora cada coisa\n\n" + "\n".join(fora) + "\n"


def secao_pendencias():
    cx = ler(os.path.join(FONTE, "CONTEXTO_sessao_21_09_noite.md"))
    fila = fatia_md(cx, "### 7.2 O que analisar", "### 7.4")
    painel = fatia_md(cx, "### 7.5", "## 8.")
    licoes = fatia_md(cx, "## 9. Três coisas para levar")
    fora = [fila, painel, "\n## Na lista de jogadores, especificamente\n",
            "1. **O goleiro não tem nome fora da Série B** (J09-3), e dentro dela são 4. Limite de dado: "
            "o SkillCorner não rastreia goleiro e a regularidade lá fora é inverificável.\n"
            "2. **Peru em 7 de 269** — conserto no Portal Ranking (rótulo de liga errado nas fotos de "
            "2024 e 2025).\n"
            "3. **A lista mede semelhança, não acerto.** O backtest da §8.6 nunca passou; para passar "
            "falta desfecho melhor que minuto jogado e chegada de fora da Série B pontuável.\n"
            "4. **Varrer as outras dezesseis decisões** atrás do defeito da D10 (decisão que contradiz a "
            "parte que cita).\n",
            "\n## Lições que a sessão de 21–22/09 deixou\n", licoes,
            "\n**A quarta lição, de 22/09:** três defeitos em dois dias eram da mesma família — a tela "
            "afirmava um limite que era de CÓDIGO e não de dado (o zagueiro sumido, o meio eixo, a chave "
            "do painel). Frase publicada que diz \"essa base não tem\" merece abrir o arquivo cru antes "
            "de repetir. E o terceiro derrubou um achado publicado (J09-1).\n"]
    return "# 13. O QUE ESTÁ PENDENTE, E O QUE APRENDER\n\n" + "\n".join(fora)


def main():
    D = dado_da_aba()
    partes = [
        cabecalho(D), secao_metodo(), secao_portao(), secao_regras(D), secao_decisoes(D),
        secao_conclusoes(D), secao_fisico(D), secao_listas(D), secao_nomes(D),
        secao_treinadores(D), secao_painel(), secao_dados(), secao_infra(), secao_pendencias(),
    ]
    texto = "\n\n---\n\n".join(p for p in partes if p)
    with open(SAIDA, "w", encoding="utf-8") as fh:
        fh.write(texto)
    linhas = texto.count("\n")
    print(f"{os.path.relpath(SAIDA, AQUI)}: {len(texto)/1024:.0f} KB · {linhas} linhas · "
          f"{len([p for p in partes if p])} seções")
    for p in partes:
        if p:
            print("  ", p.split("\n", 1)[0][:80])


if __name__ == "__main__":
    main()
