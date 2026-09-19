"""Copia os periodos historicos do Wyscout que o J08 precisou ler.

O J08 leu 112 pares (periodo, liga) do Portal Ranking em modo somente-leitura para montar o ANTES
de cada transferencia. Sem esta copia, J08_base.py so roda nesta maquina. Regra do CLAUDE.md:
"o que for usado entra aqui como base copiada, com a data da copia registrada no _registro.md".

jun26 leva tambem _pre_filtro/, que e o export CRU: o arquivo do periodo esta filtrado por minutos
(Brasil A de jun26 tem 292 linhas no arquivo e 500 no _pre_filtro), e o J08 precisa do cru.
abr26 e mai26 NAO sao necessarios: o painel temporal usa jun26 como temporada 2026.
"""
import os, shutil, datetime, json

P = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/"
     "Analytics/Portal Ranking/dados")
DEST = os.path.join(os.path.dirname(__file__), "..", "dados_copiados", "wyscout", "historico")
PERIODOS = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "jun26"]

def main():
    os.makedirs(DEST, exist_ok=True)
    manifesto = {"copiado_em": datetime.date.today().isoformat(), "fonte": P,
                 "por_que": "o ANTES de cada transferencia do J08", "periodos": {}}
    total = tot_n = 0
    for per in PERIODOS:
        src = os.path.join(P, per)
        if not os.path.isdir(src):
            print(f"  {per}: nao existe na fonte")
            continue
        dst = os.path.join(DEST, per)
        if os.path.exists(dst):
            shutil.rmtree(dst)
        # _pre_filtro so importa no jun26; nos outros nao existe
        shutil.copytree(src, dst)
        n = sum(1 for _, _, fs in os.walk(dst) for f in fs if f.endswith(".xlsx"))
        mb = sum(os.path.getsize(os.path.join(r, f))
                 for r, _, fs in os.walk(dst) for f in fs) / 1e6
        pre = os.path.isdir(os.path.join(dst, "_pre_filtro"))
        total += mb
        tot_n += n
        print(f"  {per:8} {n:3} xlsx  {mb:6.1f} MB" + ("  (+ _pre_filtro)" if pre else ""))
        manifesto["periodos"][per] = {"xlsx": n, "mb": round(mb, 1), "pre_filtro": pre}

    manifesto["total_mb"] = round(total, 1)
    manifesto["total_xlsx"] = tot_n
    with open(os.path.join(DEST, "_manifesto.json"), "w", encoding="utf-8") as f:
        json.dump(manifesto, f, ensure_ascii=False, indent=1)
    print(f"\ntotal: {tot_n} Excels, {total:.1f} MB em {os.path.relpath(DEST)}")
    print(f"data da copia: {manifesto['copiado_em']}")

if __name__ == "__main__":
    main()
