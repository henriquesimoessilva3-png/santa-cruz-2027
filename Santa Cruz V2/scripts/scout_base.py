"""Consolida os relatórios de partida do scout (xlsx no molde TransferRoom) em scout/avaliacoes.csv
e cruza com as notas do estudo (listas/listas_2027.xlsx, aba base_serie_B_2026).
Uso: python3 scripts/scout_base.py   (lê tudo em scout/relatorios/*.xlsx)
"""
import os, glob, re
import pandas as pd
from _comum import RAIZ, chave

def ler(f):
    d = pd.read_excel(f, "Relatório", header=None)
    meta = {}
    for _, r in d.iterrows():
        v = [str(x).strip() for x in r if pd.notna(x)]
        if len(v) >= 2 and v[0] in ("Rodada", "Data do jogo", "Mandante", "Visitante", "Scout", "Placar"): meta[v[0]] = v[1]
    hdr = [i for i in d.index if "#" in [str(x).strip() for x in d.loc[i]] and "Time" in [str(x).strip() for x in d.loc[i]]]
    if not hdr: return pd.DataFrame()
    t = d.iloc[hdr[0] + 1:].copy(); t.columns = [str(x).strip() for x in d.iloc[hdr[0]]]
    t = t[t["Time"].notna()].copy()
    t["jogador_raw"] = t["Jogador (elenco)"].fillna(t["Jogador (digitar se não achar)"]).astype(str)
    t["jogador"] = t.jogador_raw.str.replace(r"\s*\(.*\)$", "", regex=True).str.strip()
    t["idade_scout"] = t.jogador_raw.str.extract(r"(\d+)a\)").astype(float)
    t["rodada"] = meta.get("Rodada"); t["data"] = meta.get("Data do jogo", "")[:10]; t["jogo"] = f"{meta.get('Mandante')} x {meta.get('Visitante')}"; t["scout"] = meta.get("Scout")
    return t[["rodada", "data", "jogo", "scout", "Time", "jogador", "idade_scout", "Position (posição no jogo)", "Overall Rating (veredito)", "Match Rating (3-10)", "Points (A-D)", "Potential (A-E)", "Notas (relatório curto)", "Minutos vistos"]].rename(columns={
        "Time": "clube", "Position (posição no jogo)": "posicao_no_jogo", "Overall Rating (veredito)": "veredito", "Match Rating (3-10)": "nota_jogo", "Points (A-D)": "points", "Potential (A-E)": "potential", "Notas (relatório curto)": "notas", "Minutos vistos": "minutos_vistos"})

def main():
    fs = sorted(glob.glob(os.path.join(RAIZ, "scout", "relatorios", "*.xlsx")))
    a = pd.concat([ler(f) for f in fs], ignore_index=True)
    a["chave"] = a.jogador.map(chave)
    a.to_csv(os.path.join(RAIZ, "scout", "avaliacoes.csv"), index=False)
    b = pd.read_excel(os.path.join(RAIZ, "listas", "listas_2027.xlsx"), "base_serie_B_2026"); b["chave"] = b.jogador.map(chave)
    b = b[~b.duplicated("chave", keep=False)]
    m = a.merge(b[["chave", "pos11", "clube", "idade", "minutos", "contrato", "aderencia", "nivel_overall", "nota", "psv_ok", "rodou_2025", "livre_2027"]].rename(columns={"clube": "clube_base"}), on="chave", how="left")
    res = m.groupby(["jogador", "chave"]).agg(jogos_vistos=("jogo", "size"), nota_jogo_media=("nota_jogo", lambda s: pd.to_numeric(s, errors="coerce").mean()), veredito=("veredito", lambda s: " / ".join(sorted(set(map(str, s))))),
                                              potential=("potential", lambda s: "".join(sorted(set(map(str, s))))), pos11=("pos11", "first"), clube=("clube_base", "first"), idade=("idade", "first"), minutos_2026=("minutos", "first"),
                                              contrato=("contrato", "first"), aderencia=("aderencia", "first"), nivel=("nivel_overall", "first"), nota_estudo=("nota", "first"), psv_ok=("psv_ok", "first"), livre_2027=("livre_2027", "first"), notas=("notas", lambda s: " || ".join(map(str, s)))).reset_index()
    res = res.sort_values(["nota_estudo", "nota_jogo_media"], ascending=False)
    res.to_csv(os.path.join(RAIZ, "scout", "cruzamento.csv"), index=False)
    with pd.ExcelWriter(os.path.join(RAIZ, "scout", "scout_x_estudo.xlsx")) as w:
        res.round(1).to_excel(w, "cruzamento", index=False); a.to_excel(w, "avaliacoes", index=False)
    pd.set_option("display.width", 250)
    print(len(fs), "relatórios |", len(a), "avaliações |", a.jogador.nunique(), "jogadores | com nota no estudo:", res.nota_estudo.notna().sum())
    print(res[["jogador", "pos11", "clube", "idade", "jogos_vistos", "nota_jogo_media", "veredito", "potential", "aderencia", "nivel", "nota_estudo", "psv_ok", "livre_2027"]].to_string(index=False))
    # quem da lista principal já foi visto
    l = pd.read_csv(os.path.join(RAIZ, "listas", "1_serie_B.csv")); l["chave"] = l.jogador.map(chave)
    vistos = l[l.chave.isin(a.chave)]; print("\nda lista da Série B, já vistos pelo scout:", len(vistos), "de", len(l)); print(vistos[["pos11", "jogador", "clube", "nota"]].to_string(index=False))

if __name__ == "__main__":
    main()
