"""Funções comuns do estudo V2: chaves de nome, setores, leitura das bases."""
import os, re, unicodedata, sqlite3
import pandas as pd
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
BASES = os.path.join(RAIZ, "bases")
RES = os.path.join(RAIZ, "resultados")
EDICOES = {335: 2022, 446: 2023, 773: 2024, 1061: 2025, 1399: 2026}

def chave(s):
    s = unicodedata.normalize("NFKD", str(s or "")).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z ]", " ", s.lower())
    return re.sub(r"\s+", " ", s).strip()

# Setor pela primeira posição do Wyscout
def setor(pos):
    p = str(pos).split(",")[0].strip()
    if p == "GK": return "Goleiro"
    if p in ("LCB", "RCB", "CB"): return "Zaga"
    if p in ("LB", "RB", "LWB", "RWB", "LB5", "RB5"): return "Lateral"
    if p in ("DMF", "LDMF", "RDMF"): return "Volante"
    if p in ("LCMF", "RCMF", "LCMF3", "RCMF3", "AMF"): return "Meia"
    if p in ("LW", "RW", "LAMF", "RAMF", "LWF", "RWF"): return "Extremo"
    if p == "CF": return "Atacante"
    return "Outro"

def ler_csv(nome):
    d = pd.read_csv(os.path.join(BASES, nome), low_memory=False)
    d.columns = [c.lstrip("﻿") for c in d.columns]
    return d

def tecnico():
    t = ler_csv("serieb_tecnico.csv")
    t = t.rename(columns={"Equipa dentro de um período de tempo seleccionado": "clube",
                          "Jogador": "jogador", "Minutos jogados:": "minutos",
                          "Partidas jogadas": "jogos", "Posição": "posicao"})
    t["clube"] = t["clube"].fillna(t["Equipa"])
    t["setor"] = t["posicao"].map(setor)
    t["idade"] = pd.to_numeric(t["idade_na_temporada"], errors="coerce").fillna(t["Idade"])
    t["chave"] = t["jogador"].map(chave)
    # minutos do time = soma dos minutos do elenco / 11 (Wyscout conta acréscimos)
    tm = t.groupby(["ano", "clube"])["minutos"].sum().div(11).rename("min_time")
    t = t.join(tm, on=["ano", "clube"])
    t["fatia"] = t["minutos"] / t["min_time"]
    return t

def jogos_serie_b():
    j = ler_csv("serieb_jogos.csv")
    j = j[j["Competição"] == "Brazil. Serie B"].copy()
    j["Data"] = pd.to_datetime(j["Data"])
    return j

def classificacao():
    """Tabela final por temporada a partir dos jogos (só Série B)."""
    j = jogos_serie_b()
    linhas = []
    for (ano, jogo), g in j.groupby(["ano", "Jogo"]):
        if len(g) != 2: continue
        a, b = g.iloc[0], g.iloc[1]
        ga, gb = a["Golos"], b["Golos"]
        if pd.isna(ga) or pd.isna(gb): continue
        pa = 3 if ga > gb else (1 if ga == gb else 0)
        pb = 3 if gb > ga else (1 if ga == gb else 0)
        linhas.append((ano, a["Equipa"], pa, ga, gb)); linhas.append((ano, b["Equipa"], pb, gb, ga))
    d = pd.DataFrame(linhas, columns=["ano", "clube", "pts", "gp", "gc"])
    c = d.groupby(["ano", "clube"]).agg(jogos=("pts", "size"), pontos=("pts", "sum"),
                                         gp=("gp", "sum"), gc=("gc", "sum")).reset_index()
    c["sg"] = c["gp"] - c["gc"]
    c = c.sort_values(["ano", "pontos", "sg", "gp"], ascending=[True, False, False, False])
    c["pos"] = c.groupby("ano").cumcount() + 1
    p4 = c[c["pos"] == 4].set_index("ano")["pontos"]
    c["dist_g4"] = c["pontos"] - c["ano"].map(p4)
    c["ppj"] = c["pontos"] / c["jogos"]
    c["faixa"] = pd.cut(c["pos"], [0, 4, 16, 20], labels=["Sobe", "Meio", "Cai"])
    return c

def skillcorner():
    return sqlite3.connect(os.path.join(BASES, "skillcorner", "skillcorner_serieb.db"))

CLUBE_TM = {'AA Ponte Preta':'Ponte Preta','ABC FC':'ABC','Amazonas FC':'Amazonas','América Mineiro':'América-MG',
 'Athletic Club':'Athletic','Athletico Paranaense':'Athletico-PR','Atlético Goianiense':'Atlético-GO','Avaí FC':'Avaí',
 'Botafogo FC':'Botafogo-SP','Brusque FC':'Brusque','CR Vasco da Gama':'Vasco','CRB':'CRB','CSA':'CSA','Ceará SC':'Ceará',
 'Chapecoense':'Chapecoense','Clube do Remo':'Remo','Coritiba FC':'Coritiba','Criciúma EC':'Criciúma','Cruzeiro EC':'Cruzeiro',
 'Cuiabá EC':'Cuiabá','EC Bahia':'Bahia','EC Juventude':'Juventude','EC Vitória':'Vitória','Ferroviária':'Ferroviária',
 'Fortaleza EC':'Fortaleza','Goiás EC':'Goiás','Grêmio FBPA':'Grêmio','Grêmio Novorizontino':'Novorizontino','Guarani FC':'Guarani',
 'Ituano FC':'Ituano','Londrina EC':'Londrina','Mirassol FC':'Mirassol','Náutico':'Náutico','Operário FEC':'Operário-PR',
 'Paysandu SC':'Paysandu','Sampaio Corrêa FC':'Sampaio Corrêa','Santos FC':'Santos','Sport Recife':'Sport','São Bernardo FC':'São Bernardo',
 'Tombense FC':'Tombense','Vila Nova FC':'Vila Nova','Volta Redonda FC':'Volta Redonda'}

def valor_elenco():
    e = ler_csv("serieb_elencos.csv")
    e["clube"] = e["clube"].map(CLUBE_TM)
    v = e.groupby(["ano", "clube"])["valor_eur"].sum().rename("valor_eur").reset_index()
    v["log_valor"] = np.log(v["valor_eur"])
    v["posto_valor"] = v.groupby("ano")["valor_eur"].rank(ascending=False)
    return v

def clube_temporada():
    """Classificação + valor de elenco, com rendimento acima do esperado pelo dinheiro."""
    c = classificacao().merge(valor_elenco(), on=["ano", "clube"], how="left")
    fech = c[c.ano <= 2025].dropna(subset=["log_valor"])
    b = np.polyfit(fech["log_valor"], fech["ppj"], 1)
    c["ppj_esperado"] = b[0] * c["log_valor"] + b[1]
    c["rendimento"] = c["ppj"] - c["ppj_esperado"]   # pontos por jogo acima do que o elenco pagava
    return c


def excluidos():
    """Nomes que o clube tirou das recomendações (listas/EXCLUIDOS.csv): nome + clube (vazio =
    qualquer clube). Devolve uma função que diz se (jogador, clube) está fora."""
    f = os.path.join(RAIZ, "listas", "EXCLUIDOS.csv")
    if not os.path.exists(f):
        return lambda j, c: False
    e = pd.read_csv(f).fillna("")
    regras = [(chave(r.jogador), chave(r.clube)) for r in e.itertuples()]
    def fora(j, c):
        kj, kc = chave(j), chave(c)
        # jogador "*" = o clube inteiro fora
        return any((kj == rj or rj == "") and (not rc or rc in kc or kc in rc) and (rj or rc) for rj, rc in regras)
    return fora


TETO_VALOR = 2_000_000   # € — acima disso o jogador é inalcançável para a Série B (decisão do clube, 23/09)


def valor_tm():
    """Valor de mercado do Transfermarkt pela base do app (../dados/jogadores.json, campo mv),
    por nome|clube. Serve para completar o valor que o Wyscout deixa em 0 (sem dado)."""
    import json
    f = os.path.join(os.path.dirname(RAIZ), "dados", "jogadores.json")
    if not os.path.exists(f):
        return {}
    L = json.load(open(f, encoding="utf-8"))
    L = L if isinstance(L, list) else (L.get("jogadores") or [])
    return {chave(j.get("n")) + "|" + chave(j.get("t")): j.get("mv") for j in L if j.get("mv")}


def caro(df, col_jog="jogador", col_clube="clube", col_valor="valor"):
    """True para quem vale mais que TETO_VALOR (valor do Wyscout; se vier 0/vazio, o do Transfermarkt)."""
    tm = valor_tm()
    v = pd.to_numeric(df[col_valor], errors="coerce").fillna(0)
    alt = [tm.get(chave(j) + "|" + chave(c)) or 0 for j, c in zip(df[col_jog], df[col_clube])]
    v = v.where(v > 0, pd.Series(alt, index=df.index))
    return v > TETO_VALOR
