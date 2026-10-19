"""Cache compacto das planilhas do Wyscout de uma temporada (para a minutagem, 19/10). Uso: python3 _wy_cache.py <pasta> [n_arquivos]
Le aos poucos (a ponte corta em 3 min): cada chamada acrescenta ate n arquivos ainda nao lidos."""
import json, os, sys, time
sys.argv += []
import preparar_historico as ph
import pandas as pd
pasta = sys.argv[1]; lote = int(sys.argv[2]) if len(sys.argv) > 2 else 15
dst = os.path.join(ph.AQUI, "dados", f"_wy_{pasta}.json")
C = json.load(open(dst, encoding="utf-8")) if os.path.exists(dst) else {}
dirp = os.path.join(ph.BASE_RANKING, "dados", pasta)
arqs = [a for a in sorted(os.listdir(dirp)) if a.endswith(".xlsx") and not a.startswith("~$") and a not in C]
t0 = time.time()
for arq in arqs[:lote]:
    liga = ph.liga_do_arquivo(arq)
    try: df = pd.read_excel(os.path.join(dirp, arq), sheet_name="BASE")
    except Exception as e: C[arq] = {"liga": liga, "erro": str(e), "linhas": []}; continue
    df, _ = ph.normalizar_schema_wyscout(df)
    ct = "Team within selected timeframe" if "Team within selected timeframe" in df.columns else "Team"
    ls = []
    for _, r in df.iterrows():
        nome = r.get("Player")
        if not isinstance(nome, str) or not nome.strip(): continue
        reg = {"n": nome.strip(), "tm": str(r.get(ct) or "").strip(), "idade": ph.num(r.get("Age")), "alt": ph.num(r.get("Height")), "pais": str(r.get("Birth country") or "").strip()}
        for col, k, cs in ph.CAMPOS:
            v = ph.num(r.get(col), cs) if col in df.columns else None
            if v is not None: reg[k] = v
        ls.append(reg)
    C[arq] = {"liga": liga, "linhas": ls}
    json.dump(C, open(dst, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    if time.time() - t0 > 140: break
print(pasta, len(C), "de", len([a for a in os.listdir(dirp) if a.endswith(".xlsx") and not a.startswith("~$")]), f"{time.time()-t0:.0f}s")
