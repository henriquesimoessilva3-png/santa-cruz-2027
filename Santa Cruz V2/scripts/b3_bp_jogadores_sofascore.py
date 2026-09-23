"""Bola parada POR JOGADOR, pelo Sofascore: quem faz o gol e quem dá a assistência em cada lance de
bola parada da Série B 2022–2026.

Entrada: bases/coletas/bola_parada_jogadores_sofascore.json — coletado no navegador (shotmap +
incidentes de cada jogo terminado da Série B). Cada finalização de bola parada vem com a situação do
Sofascore (corner = escanteio, free-kick = falta direta, set-piece = bola parada ensaiada/indireta,
throw-in-set-piece = lateral, penalty = pênalti), a parte do corpo, o xG e, quando é gol, o autor da
assistência (casado pelo jogador e minuto do incidente).

Saída: bases/coletas/bp_jogador_temporada.csv — uma linha por jogador × temporada × clube, com a
chave do Wyscout (serieb_tecnico.csv) quando o nome casa no mesmo clube e temporada.
"""
import json, os, re, difflib
import pandas as pd
from _comum import BASES, chave, tecnico

ENT = os.path.join(BASES, "coletas", "bola_parada_jogadores_sofascore.json")
SAI = os.path.join(BASES, "coletas", "bp_jogador_temporada.csv")

# nome do time no Sofascore -> clube no Wyscout (só os que não casam pela chave)
TIMES = {"athletic club": "Athletic", "athletico": "Athletico-PR", "athletico paranaense": "Athletico-PR",
         "atletico goianiense": "Atlético-GO", "america mineiro": "América-MG", "operario pr": "Operário-PR",
         "operario ferroviario": "Operário-PR", "botafogo sp": "Botafogo-SP", "gremio novorizontino": "Novorizontino",
         "sao bernardo fc": "São Bernardo", "vila nova fc": "Vila Nova", "ec vitoria": "Vitória",
         "sampaio correa": "Sampaio Corrêa", "volta redonda": "Volta Redonda", "amazonas fc": "Amazonas", "sport recife": "Sport", "vasco da gama": "Vasco"}


def main():
    D = json.load(open(ENT, encoding="utf-8"))
    cols = ["comp", "ano", "evento", "time", "sid", "nome", "pos", "sit", "corpo", "xg", "gol", "tipo_gol", "aid", "anome"]
    s = pd.DataFrame(D["shots"], columns=cols)
    t = tecnico()
    clubes = {chave(c): c for c in t.clube.unique()}
    def clube_wy(nome):
        k = chave(nome)
        if k in TIMES: return TIMES[k]
        if k in clubes: return clubes[k]
        m = difflib.get_close_matches(k, list(clubes), n=1, cutoff=0.75)
        return clubes[m[0]] if m else None
    s["clube"] = s.time.map(clube_wy)

    def casar(nome, ano, clube, n_fin, irmaos):
        """chave do Wyscout no mesmo clube e temporada. Só nome exato ou muito parecido (≥ 0,85);
        nada de casar só pelo primeiro ou último nome (casava Luiz Otávio com Luiz Henrique).
        Dois registros com o mesmo nome no clube (ARMADILHAS: homônimos): o do Sofascore com mais
        finalizações vai para o do Wyscout com mais minutos, e fica marcado."""
        k = chave(nome)
        c = t[(t.ano == ano) & (t.clube == clube)]
        ex = c[c.chave == k]
        if len(ex) == 1: return k, clube, "exato"
        if len(ex) > 1:
            ordem = sorted(irmaos, key=lambda x: -x)            # finalizações dos homônimos do Sofascore
            pos = ordem.index(n_fin) if n_fin in ordem else 0
            return (k, clube, "homonimo") if pos < len(ex) else (None, None, "homonimo sobrando")
        m = difflib.get_close_matches(k, list(c.chave), n=2, cutoff=0.85)
        if len(m) == 1: return m[0], clube, "parecido"
        # nome do Wyscout contido no do Sofascore, palavra por palavra (Boschilia ⊂ Gabriel
        # Boschilia; "C Ortiz" ⊂ Christian Ortíz, a inicial vale pela primeira letra) — só se for único
        ks = k.split()
        def contido(w):
            ws = w.split()
            return bool(ws) and all(any(x == y or (len(x) == 1 and y.startswith(x)) for y in ks) for x in ws)
        m = [w for w in c.chave.unique() if contido(w)]
        if len(m) == 1: return m[0], clube, "palavras"
        a = t[(t.ano == ano) & (t.chave == k)]
        if len(a) == 1: return k, a.clube.iloc[0], "exato, outro clube na base"
        return None, None, "sem casar"

    # gols e finalizações de quem chuta; assistências de quem cruza/cobra
    # gol contra entra no shotmap com o nome de quem fez contra: não é finalização dele
    s = s[s.tipo_gol != "own"]
    fin = s[~s.sit.str.startswith("sem-shotmap")].copy()
    fin["sp"] = fin.sit != "penalty"
    g = fin.groupby(["ano", "clube", "sid", "nome"]).apply(lambda d: pd.Series({
        "finalizacoes_bp": int(d.sp.sum()),
        "xg_bp": round(d.loc[d.sp, "xg"].sum(), 2),
        "gols_bp": int((d.sp & (d.gol == 1)).sum()),
        "gols_bp_cabeca": int((d.sp & (d.gol == 1) & (d.corpo == "head")).sum()),
        "gols_escanteio": int(((d.sit == "corner") & (d.gol == 1)).sum()),
        "gols_falta_direta": int(((d.sit == "free-kick") & (d.gol == 1)).sum()),
        "gols_penalti": int(((d.sit == "penalty") & (d.gol == 1)).sum()),
        "xg_bp_cabeca": round(d.loc[d.sp & (d.corpo == "head"), "xg"].sum(), 2),
    })).reset_index()
    ast = s[(s.gol == 1) & s.aid.notna() & (s.sit != "penalty") & ~s.sit.str.startswith("sem-shotmap")].copy()
    a = ast.groupby(["ano", "clube", "aid", "anome"]).apply(lambda d: pd.Series({
        "assist_bp": len(d),
        "assist_escanteio": int((d.sit == "corner").sum()),
        "assist_falta": int(d.sit.isin(["set-piece", "free-kick"]).sum()),
        "assist_bp_cabeca": int((d.corpo == "head").sum()),
    })).reset_index().rename(columns={"aid": "sid", "anome": "nome"})
    a["sid"] = a.sid.astype(int)
    r = g.merge(a, on=["ano", "clube", "sid", "nome"], how="outer").fillna(0)
    for c in r.columns:
        if c not in ("ano", "clube", "sid", "nome", "xg_bp", "xg_bp_cabeca"): 
            if c not in ("ano", "clube", "nome"): r[c] = r[c].astype(int)
    r["n_ev"] = r.finalizacoes_bp + r.assist_bp
    irm = r.groupby(["ano", "clube", "nome"]).n_ev.apply(list).to_dict()
    ch = [casar(n, int(an), cl, ne, irm[(an, cl, n)]) for n, an, cl, ne in zip(r.nome, r.ano, r.clube, r.n_ev)]
    r["chave"] = [x[0] for x in ch]; r["clube_wyscout"] = [x[1] for x in ch]; r["casamento"] = [x[2] for x in ch]
    # o Sofascore só tem xG de 2025 em diante na Série B: antes disso fica vazio, não zero
    r.loc[r.ano < 2025, ["xg_bp", "xg_bp_cabeca"]] = float("nan")
    r = r.sort_values(["ano", "clube", "nome"])
    r.to_csv(SAI, index=False)
    sem = r.chave.isna()
    print(f"{len(s)} finalizações de bola parada em {D.get('jogos_n', '?')} jogos · {len(r)} jogador-temporadas · "
          f"{(~sem).sum()} casadas com o Wyscout, {sem.sum()} sem casar")
    print("times sem casar:", sorted(set(s.time[s.clube.isna()])))
    print("gols sem shotmap:", int((s.sit.str.startswith('sem-shotmap')).sum()))
    print(r[sem].sort_values("gols_bp", ascending=False)[["ano", "clube", "nome", "gols_bp", "assist_bp"]].head(12).to_string())

if __name__ == "__main__":
    main()
