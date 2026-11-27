#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""27/11/2026 — físico da base no recorte de novembro, SÓ para quem tem jogo novo (decisão do Henrique na varredura: "se você identificar
alguém que tenha jogo novo e ainda tá com a letra velha, a gente pode mexer, senão não").

Fonte: skillcorner_<periodo>.json do Portal Ranking (só leitura), o mesmo arquivo que o preparar_base.py lê, casado pela chave do app.
Troca o físico de um jogador quando:
  - ele já tinha físico e o recorte novo tem MAIS jogos (mesma temporada que andou; ou físico de Série B antiga e agora há temporada nova); ou
  - ele não tinha físico e o recorte novo tem 5 jogos ou mais.
Não troca quando o recorte novo tem os mesmos jogos ou menos (Europa: a 26/27 ainda tem poucos jogos — fica a 25/26), nem quando a data de
nascimento do SkillCorner difere mais de 1,5 ano da idade do cadastro (suspeita de homônimo). Físico colado à mão não é tocado: fica na nuvem
e continua valendo por cima. Marca fis_rec = recorte e apaga o rótulo fis_src de temporada antiga.
Uso: python3 atualizar_fisico_nov26.py <skillcorner_nov26.json> [nov26]"""
import datetime, json, os, sys
AQUI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, AQUI)
from completar_base_300min import FIS, num   # noqa: E402  (mesma tabela campo do app -> métrica do SkillCorner)


def main(arq_sc, periodo="nov26"):
    p = os.path.join(AQUI, "dados", "jogadores.json"); base = json.load(open(p, encoding="utf-8")); J = base["jogadores"]
    SC = json.load(open(arq_sc, encoding="utf-8")); hoje = datetime.date(2026, 11, 23)
    c = {"mais jogos": 0, "não tinha físico": 0, "de temporada antiga": 0, "homônimo suspeito (não troca)": 0, "sem jogo novo": 0}; mud = []
    for j in J:
        pk = f"{j['n']} - {j.get('t', '')} - {j.get('l', '')}"; s = SC.get(pk)
        if not s: continue
        met = s.get("metrics") or {}; n = num(s.get("n_perf_passed"), 0) or 0
        if num(met.get("psv99"), 2) is None: continue
        tinha = isinstance(j.get("psv"), (int, float)); antes = j.get("sc_n") or 0
        if (tinha and n <= antes) or (not tinha and n < 5): c["sem jogo novo"] += 1; continue
        try:
            a, m_, d = map(int, str(s.get("birthdate"))[:10].split("-")); idade = (hoje - datetime.date(a, m_, d)).days / 365.25
            if j.get("id_") is not None and abs(idade - j["id_"]) > 1.5: c["homônimo suspeito (não troca)"] += 1; continue
        except Exception: pass
        velho = "Série B 20" in str(j.get("fis_src") or "") and "2026" not in str(j.get("fis_src"))
        for k, campo in FIS:
            v = num(met.get(campo), 2)
            if v is not None: j[k] = v
            elif k in j and not k.startswith("obr"): del j[k]          # não mistura métrica de temporadas diferentes
        if s.get("minutes") is not None: j["sc_min"] = num(s["minutes"], 0)
        j["sc_n"] = int(n); j["fis_rec"] = periodo
        if j.get("fis_src"): j["fis_src_antes"] = j.pop("fis_src")
        c["de temporada antiga" if velho else "mais jogos" if tinha else "não tinha físico"] += 1; mud.append(pk)
    json.dump(base, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(c, "| total trocado:", len(mud))


if __name__ == "__main__":
    main(*sys.argv[1:3])
