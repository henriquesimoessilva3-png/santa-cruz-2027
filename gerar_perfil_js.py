#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escreve static/perfil_extra.json — altura, pé, valor de mercado e contrato para o cabeçalho da ficha quando o cadastro do
app não tem (18/10/2026, pedido do Henrique: "o pé e o valor de mercado, não consegue puxar do Transfermarkt?").
  - tm:     banco do Portal Transfermarkt (Analytics/Portal Transfermarkt/dados/transfermarkt.db), só quem tem algum dos campos;
            chave = nome normalizado → lista de [clube, idade, altura, pé, valor €, contrato, id TM, foto, nacionalidade]
  - manual: levantamento dos cards manuais (dados/manuais_perfil.csv), chave = primaryKey do card ("Nome - Clube - Manual")
O app busca o arquivo só quando abre uma ficha."""
import json, os, re, shutil, sqlite3, tempfile, unicodedata
import pandas as pd
AQUI = os.path.dirname(os.path.abspath(__file__))
CAND = ["/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/Analytics/Portal Transfermarkt/dados/transfermarkt.db",
        os.path.expanduser("~/mnt/Analytics/Portal Transfermarkt/dados/transfermarkt.db")]

def nz(x):
    x = "".join(c for c in unicodedata.normalize("NFD", str(x).lower()) if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", x)).strip()

def main():
    out = {"tm": {}, "manual": {}}
    db = next((c for c in CAND if os.path.exists(c)), None)
    if db:
        tmp = os.path.join(tempfile.gettempdir(), "tm_perfil.db"); shutil.copy(db, tmp)   # SQLite não abre direto no Drive
        con = sqlite3.connect(tmp)
        for nome, clube, idade, alt, pe, val, ct, tmid, foto, nac, idc in con.execute(
                "select jogador, clube, idade, altura, pe, valor_mercado_eur, contrato_ate, id_jogador, foto, nacionalidade_1, id_clube from jogadores "
                "where altura is not null or pe is not null or foto is not null"):
            a = None
            try: a = int(round(float(str(alt).replace(",", ".").replace("m", "").strip()) * (100 if float(str(alt).replace(",", ".").replace("m", "").strip()) < 3 else 1)))
            except Exception: pass
            f = str(foto).replace("/portrait/small/", "/portrait/header/") if foto and "default" not in str(foto) else None
            out["tm"].setdefault(nz(nome), []).append([clube, idade, a, pe, val, ct, tmid, f, nac, idc])   # 18/10: + id, foto, nacionalidade; 19/10: + id do clube (escudo)
    mp = os.path.join(AQUI, "dados", "manuais_perfil.csv")
    if os.path.exists(mp):
        for r in pd.read_csv(mp, sep=None, engine="python").itertuples():
            v = lambda c: None if pd.isna(getattr(r, c, None)) else getattr(r, c)
            out["manual"][r.primaryKey] = {"alt": v("altura_cm"), "pe": v("pe"), "valor": v("valor_mercado_eur"), "contrato": v("contrato_ate"), "nasc": v("nascimento"), "fonte": v("fonte")}
    json.dump(out, open(os.path.join(AQUI, "static", "perfil_extra.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"), default=lambda o: o.item() if hasattr(o, "item") else str(o))
    print("perfil_extra:", len(out["tm"]), "nomes do Transfermarkt ·", len(out["manual"]), "cards manuais")

if __name__ == "__main__":
    main()
