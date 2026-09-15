"""Previa da etapa 5 no formato pedido pelo dono em 14/09 (noite): indicador na linha, os tres
grupos (subiu, meio, caiu) nas colunas, o valor tipico de cada grupo na unidade do indicador e a
diferenca de cada ponta contra o meio.

So LE o projeto (dados/prototipo.json, static/proto_glossario.js, dados/serieb_clube_temporada.csv)
e grava a pagina aqui e na pasta passada como argumento. Nao e a tela do site: e o desenho para o
dono decidir antes de a regra ir para o gerador.

Regras da previa (escolhidas pelo coordenador, a confirmar com o dono):
- valor tipico = MEDIANA crua do grupo nas temporadas 2022-2025 (faixa_*_bruto[1] da etapa 5).
  Com 16 times numa ponta, um so fora da curva puxa a media; a media (m_* do catalogo) vai na dica.
- diferenca contra o MEIO (o time tipico que fica na Serie B): em % do meio; quando o indicador ja
  e porcentagem, em pontos percentuais (% de % confunde: 61% contra 59% nao e "+3%").
- se e firme: os testes que o estudo ja fez no catalogo da etapa 2, na POSICAO dentro do ano
  (p_bruto_SM/q_SM, p_bruto_SC/q_SC). q < 0,05 = firme; p < 0,05 sem q = pode ser sorte.
- diferencas de unidades diferentes nao se ordenam entre si: a ordem e a da firmeza ou a do estudo.
"""
import csv
import json
import os
import sys

RAIZ = "/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz"
AQUI = os.path.dirname(os.path.abspath(__file__))

d = json.load(open(os.path.join(RAIZ, "dados", "prototipo.json"), encoding="utf-8"))
t = open(os.path.join(RAIZ, "static", "proto_glossario.js"), encoding="utf-8").read()
a = t.index("const PT_GLOSSARIO = ") + len("const PT_GLOSSARIO = ")
b = t.index("const PT_GLOSSARIO_COLUNAS")
GLOS = json.loads(t[a:b].rstrip().rstrip(";"))
CAT = {l["indicador"]: l for l in d["etapa_2"]["linhas"]}
E5 = d["etapa_5"]

SETOR = {"zaga": ("Zagueiros", "zagueiros"), "lateral": ("Laterais", "laterais"),
         "meio": ("Meio-campo", "meio-campistas"), "ataque": ("Ataque", "atacantes")}
PP = {"%", "% dos jogos"}

# quantas temporadas em cada grupo, contadas do painel (nunca digitadas)
grupos = {"sobe": 0, "meio": 0, "cai": 0}
with open(os.path.join(RAIZ, "dados", "serieb_clube_temporada.csv"), encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
        if 2022 <= int(row["ano"]) <= 2025:
            pos = int(float(row["pos"]))
            grupos["sobe" if pos <= 4 else "cai" if pos >= 17 else "meio"] += 1

vazios = {v["setor"]: v for v in E5.get("vazios_por_setor", [])}


def titulo(k, primeiro):
    g = GLOS.get(primeiro, {})
    fonte = "; ".join(x for x in (g.get("fonte"), g.get("fonte_detalhe")) if x and x != "nao_achei_fonte")
    if k == "tecnico_col":
        return "Jogo do time", fonte
    if k == "elenco":
        return "Elenco e uso dos jogadores", fonte
    if k == "fisico_col_elenco":
        return "Físico do time inteiro", fonte
    s = k.rsplit("_", 1)[1]
    if k.startswith("tecnico_ind_"):
        return f"{SETOR[s][0]}: técnico", fonte
    return f"{SETOR[s][0]}: físico", fonte


def firmeza(p, q):
    if p is None:
        return None
    if q is not None and q < 0.05:
        return "firme"
    return "sorte" if p < 0.05 else "nada"


def r(x, n=4):
    return None if x is None else round(float(x), n)


paineis = []
for k, p in E5["paineis"].items():
    difere = set(p.get("ordem_das_medianas_difere_no_cru_ids") or [])
    so_empate = set(p.get("ordem_das_medianas_difere_no_cru_so_por_empate") or [])
    ordem = p.get("ordem_por_diferenca") or list(range(len(p["indicadores"])))
    linhas = []
    for j, ind in enumerate(p["indicadores"]):
        gid = ind["id"]
        g = GLOS.get(gid, {})
        c = CAT.get(gid, {})
        fs, fm, fc = (p["faixa_sobe_bruto"][j], p["faixa_meio_bruto"][j], p["faixa_cai_bruto"][j])
        un = g.get("unidade")
        pp = un in PP

        def dif(x):
            if not x or not fm or x[1] is None or fm[1] in (None, 0):
                return None
            return r(x[1] - fm[1], 3) if pp else r((x[1] - fm[1]) / abs(fm[1]) * 100, 1)

        linhas.append(dict(
            id=gid, nome=g.get("nome_simples") or ind["nome"],
            unidade=None if un in (None, "nao_achei_fonte") else un,
            mede=g.get("mede") if g.get("mede") != "nao_achei_fonte" else None,
            lado=ind.get("sinal", 0), lado_txt=g.get("lado"),
            q=[fs, fm, fc], media=[r(c.get("m_sobe")), r(c.get("m_meio")), r(c.get("m_cai"))],
            posto=[p["faixa_sobe"][j][1], p["faixa_meio"][j][1], p["faixa_cai"][j][1]],
            tipo="pp" if pp else "rel", d_sobe=dif(fs), d_cai=dif(fc),
            p_sm=c.get("p_bruto_SM"), q_sm=c.get("q_SM"), p_sc=c.get("p_bruto_SC"), q_sc=c.get("q_SC"),
            f_sm=firmeza(c.get("p_bruto_SM"), c.get("q_SM")), f_sc=firmeza(c.get("p_bruto_SC"), c.get("q_SC")),
            difere=gid in difere and gid not in so_empate,
            ordem_estudo=ordem.index(j) if j in ordem else len(ordem) + j,
        ))
    tit, sub = titulo(k, p["indicadores"][0]["id"])
    setor = k.rsplit("_", 1)[1] if k.startswith("tecnico_ind_") else None
    aviso = None
    if setor and setor in vazios:
        v = vazios[setor]
        aviso = dict(poucos=v.get("marca_baixa_confianca_3_a_4"), menos_de_3=v.get("clube_temporada_sem_3_atletas"),
                     plural=SETOR[setor][1])
    paineis.append(dict(chave=k, titulo=tit, fonte=sub, linhas=linhas, aviso=aviso))

dados = dict(paineis=paineis, grupos=grupos, exemplo="ti_zaga_duelos_aereos_ganhos",
             gerado="14/09/2026", fonte="dados/prototipo.json (etapa_5 e catálogo da etapa_2)")
modelo = open(os.path.join(AQUI, "previa_modelo.html"), encoding="utf-8").read()
assert modelo.count("__DADOS__") == 1
html = modelo.replace("__DADOS__", json.dumps(dados, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/"))
for destino in [AQUI] + sys.argv[1:]:
    with open(os.path.join(destino, "previa_etapa5.html"), "w", encoding="utf-8") as f:
        f.write(html)

cont = {"firme": 0, "sorte": 0, "nada": 0}
for pn in paineis:
    for l in pn["linhas"]:
        for fx in (l["f_sm"], l["f_sc"]):
            if fx:
                cont[fx] += 1
print("grupos:", grupos, "| paineis:", len(paineis), "| linhas:", sum(len(pn["linhas"]) for pn in paineis))
print("testes (subiu x meio e subiu x caiu):", cont)
ex = next(l for pn in paineis for l in pn["linhas"] if l["id"] == dados["exemplo"])
print("exemplo:", ex["nome"], ex["q"], ex["posto"], ex["d_sobe"], ex["d_cai"], ex["f_sm"], ex["f_sc"])
print("html:", round(len(html.encode()) / 1024), "KB")
