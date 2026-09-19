"""Copia para o estudo a base de ligas do Wyscout, do Portal Ranking.

Regra do CLAUDE.md: "e outro projeto e outro repositorio: nada de la e alterado, e o que
for usado entra aqui como base copiada, com a data da copia registrada no _registro.md".

Periodo escolhido: ago26 — o mais completo (18.460 jogadores, 65 ligas). O CLAUDE.md do
estudo aponta abr26 (15.544 / 55 ligas), que e anterior e menor.

NAO copia config.py nem credencial nenhuma. A fonte so e lida.
"""
import json, os, shutil, datetime

P = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/"
     "Analytics/Portal Ranking")
DEST = os.path.join(os.path.dirname(__file__), "..", "dados_copiados", "wyscout")
PERIODO = "ago26"

ARQUIVOS = [
    (f"output/rankings_{PERIODO}.json", f"rankings_{PERIODO}.json",
     "a base por liga: jogador, liga, posicao, indicadores e primary_key"),
    ("output/_temporal_movers.json", "_temporal_movers.json",
     "quem trocou de liga: from_league/to_league, qz dos dois lados e dqz — o insumo do J08"),
    ("output/_temporal_photos.json", "_temporal_photos.json",
     "foto por temporada, 2018 a 2026, com qz normalizado dentro de liga+posicao"),
    ("output/_temporal_aging.json", "_temporal_aging.json",
     "curvas de envelhecimento e a confiabilidade do qz (0,471)"),
]

def main():
    os.makedirs(DEST, exist_ok=True)
    manifesto = {"copiado_em": datetime.date.today().isoformat(),
                 "fonte": P, "periodo": PERIODO, "arquivos": []}
    total = 0
    for rel, nome, desc in ARQUIVOS:
        src = os.path.join(P, rel)
        if not os.path.exists(src):
            print(f"  FALTA na fonte: {rel}")
            continue
        dst = os.path.join(DEST, nome)
        shutil.copy2(src, dst)
        mb = os.path.getsize(dst) / 1e6
        total += mb
        n = ""
        try:
            d = json.load(open(dst))
            n = f"{len(d)} itens"
        except Exception:
            pass
        print(f"  {nome:28} {mb:7.1f} MB  {n}")
        manifesto["arquivos"].append({"nome": nome, "de": rel, "mb": round(mb, 1),
                                      "o_que_e": desc})

    # os Excels crus do periodo, uma liga por arquivo
    exc_src = os.path.join(P, "dados", PERIODO)
    exc_dst = os.path.join(DEST, f"xlsx_{PERIODO}")
    if os.path.isdir(exc_src):
        if os.path.exists(exc_dst):
            shutil.rmtree(exc_dst)
        shutil.copytree(exc_src, exc_dst)
        n = len([f for f in os.listdir(exc_dst) if f.endswith(".xlsx")])
        mb = sum(os.path.getsize(os.path.join(exc_dst, f))
                 for f in os.listdir(exc_dst)) / 1e6
        total += mb
        print(f"  xlsx_{PERIODO}/{'':18} {mb:7.1f} MB  {n} ligas (cru, aba BASE)")
        manifesto["arquivos"].append({"nome": f"xlsx_{PERIODO}/", "de": f"dados/{PERIODO}",
                                      "mb": round(mb, 1),
                                      "o_que_e": f"{n} Excels crus, um por liga"})

    manifesto["total_mb"] = round(total, 1)
    with open(os.path.join(DEST, "_manifesto.json"), "w", encoding="utf-8") as f:
        json.dump(manifesto, f, ensure_ascii=False, indent=1)
    print(f"\ntotal: {total:.1f} MB  em {os.path.relpath(DEST)}")
    print(f"data da copia: {manifesto['copiado_em']}")

if __name__ == "__main__":
    main()
