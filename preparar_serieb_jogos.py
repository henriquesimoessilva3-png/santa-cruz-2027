#!/usr/bin/env python3
"""Junta e limpa os 136 "Team Stats" do Wyscout num só jogo-a-jogo da Série B 2022-2026.

Cada arquivo é UM clube num ANO, com todas as competições daquele ano — Série B, estadual,
Copa do Brasil, o que tiver. São os 20 clubes de cada temporada × 5 temporadas = 100
clube-temporada, e os 136 arquivos cobrem isso porque um clube que jogou a Série B em três
anos diferentes veio em três arquivos, e clubes de fora da B de 2026 vieram só nos anos em
que estiveram nela.

## O ano e o clube não estão no nome do arquivo

O nome é `Team Stats <Clube> (N).xlsx`, e o `(N)` é só o contador de download do navegador.
O ano sai da coluna `Data` e o clube da primeira célula da planilha. Depois disso o script
confere contra `SB_TABELAS` (static/app.js) e diz, no fim, se os 100 clube-temporada
fecharam — é a única forma de saber que não falta ninguém.

## Cada jogo da Série B vem DUAS vezes, e não é defeito de exportação

O Cruzeiro × Grêmio está no arquivo do Cruzeiro e no arquivo do Grêmio. Dentro de cada
arquivo o jogo já ocupa duas linhas (uma por equipe). Somando os 136, o mesmo jogo chega a
aparecer quatro vezes. A limpeza guarda **uma linha por (jogo, equipe)** — as quatro
viram duas, que é o que a partida é: dois times, dois conjuntos de números.

Só isso já muda a conta: quem somar os arquivos sem tratar isso dobra a Série B inteira.

## As colunas sem nome

O Wyscout escreve o cabeçalho como `Remates / à baliza` e deixa as duas colunas seguintes
em branco — são o valor do segundo termo e a porcentagem. O pandas batiza de
`Unnamed: 9`, `Unnamed: 10`, e seis meses depois ninguém sabe o que era. Aqui elas ganham
nome de verdade: `Remates`, `Remates à baliza`, `Remates à baliza, %`.

Duas colunas fogem do padrão e estão tratadas à mão: `Perdas / curto/ médio / longo` e
`Recuperações / curto / médio / longo` têm três termos e nenhuma porcentagem, e
`Entradas na grande área (corridas/cruzamentos)` tem o barra dentro do parêntese.

## O que é derivado, e por quê

`Jogo` vem como "Vila Nova - Goiás 2:0" — casa, visitante e placar num texto só. Daí saem
`adversario`, `mando`, `golos_pro`, `golos_contra` e `resultado`, porque perguntar "o time
ganha mais em casa?" não deveria exigir uma fórmula de texto em cada análise.

Uso:
    python3 preparar_serieb_jogos.py
"""
import glob
import os
import re
import sys
import unicodedata

import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTE = os.path.join(AQUI, "_fonte", "serie_b_jogos")
DADOS = os.path.join(AQUI, "dados")
CSV = os.path.join(DADOS, "serieb_jogos.csv")
XLSX = os.path.join(DADOS, "serieb_jogos.xlsx")
APP = os.path.join(AQUI, "static", "app.js")

SERIE_B = "Brazil. Serie B"

# Wyscout escreve o nome do clube de um jeito; as tabelas do estudo, de outro.
CLUBES = {
    "América Mineiro": "América-MG", "Athletic Club": "Athletic",
    "Athletico Paranaense": "Athletico-PR", "Atlético GO": "Atlético-GO",
    "Botafogo SP": "Botafogo-SP", "Grêmio Novorizontino": "Novorizontino",
    "Operário PR": "Operário-PR", "Sport Recife": "Sport",
    "São Bernardo FC": "São Bernardo", "Vasco da Gama": "Vasco",
}

# As duas que não seguem o padrão "A / B -> A, B, B%"
FORA_DO_PADRAO = {
    "Entradas na grande área (corridas/cruzamentos)":
        ["Entradas na grande área", "Entradas na grande área por corrida",
         "Entradas na grande área por cruzamento"],
}


def nfc(s):
    """macOS guarda acento decomposto; o Excel, composto. Sem isso 'Avaí' != 'Avaí'."""
    return unicodedata.normalize("NFC", str(s))


def batizar(colunas):
    """Dá nome às colunas que o Wyscout deixou em branco.

    `Remates / à baliza` + 2 vazias -> Remates · Remates à baliza · Remates à baliza, %
    `Perdas / curto/ médio / longo` + 3 vazias -> Perdas · Perdas curto · Perdas médio · Perdas longo
    """
    fora, grupo, extras = [], None, 0

    def fechar():
        if grupo is None:
            return
        if grupo in FORA_DO_PADRAO:
            nomes = FORA_DO_PADRAO[grupo][: extras + 1]
        else:
            partes = [p.strip() for p in grupo.split("/") if p.strip()]
            base = partes[0]
            nomes = [base] + [f"{base} {p}" for p in partes[1:]]
            # quando sobra uma coluna além dos termos, ela é a porcentagem do último termo
            if extras + 1 > len(nomes):
                nomes.append(f"{nomes[-1]}, %")
        while len(nomes) < extras + 1:                 # rede de segurança, não deveria ocorrer
            nomes.append(f"{nomes[0]} ({len(nomes)})")
        fora.extend(nomes[: extras + 1])

    for c in colunas:
        if str(c).startswith("Unnamed"):
            extras += 1
            continue
        fechar()
        grupo, extras = str(c).strip(), 0
    fechar()
    return fora


def tabelas():
    """As classificações finais de SB_TABELAS (static/app.js), com J, V, E, D, GP e GC.

    Serve para duas coisas: saber quem eram os 20 de cada ano e, principalmente, CONFERIR
    o jogo-a-jogo contra o resultado que se sabe verdadeiro. Uma base de partidas que não
    reproduz a tabela final não é uma base de partidas — é um monte de linhas.
    """
    t = open(APP, encoding="utf-8").read()
    # fim do bloco: `SB_COMPLETAS`, que vem logo depois. Era `SB_USO` ate set/26, e quando a
    # SB_USO saiu do app.js os tres scripts que liam a tabela quebraram de uma vez. Ancora
    # boa e a que nao tem motivo para sumir.
    bloco = t[t.index("const SB_TABELAS"): t.index("const SB_COMPLETAS")]
    fora = {}
    for m in re.finditer(r"(\d{4}):\s*\[(.*?)\],\n(?=\s*\d{4}:|\};)", bloco, re.S):
        ano = int(m.group(1))
        fora[ano] = {}
        for _, c, j, v, e, dd, gp, gc in re.findall(
                r"\[(\d+),'([^']+)',(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\]", m.group(2)):
            fora[ano][nfc(c)] = dict(j=int(j), v=int(v), e=int(e), d=int(dd),
                                     gp=int(gp), gc=int(gc))
    if not fora:
        sys.exit("Não achei SB_TABELAS em static/app.js.")
    return fora


def conferir(sb, tab):
    """Recalcula a tabela a partir das partidas e compara com a classificação conhecida.

    Divergência aqui quase sempre quer dizer JOGO FALTANDO na fonte — e o jeito de saber é
    que a diferença sai coerente dos dois lados: se um clube está com uma vitória a menos e
    +3 gols, o adversário está com uma derrota a menos e +3 sofridos.
    """
    g = sb.groupby(["ano", "Equipa"]).agg(
        j=("resultado", "size"),
        v=("resultado", lambda s: int((s == "V").sum())),
        e=("resultado", lambda s: int((s == "E").sum())),
        d=("resultado", lambda s: int((s == "D").sum())),
        gp=("golos_pro", "sum"), gc=("golos_contra", "sum"))
    divergem = []
    for (ano, clube), r in g.iterrows():
        alvo = tab.get(ano, {}).get(nfc(clube))
        if alvo is None:
            divergem.append((ano, clube, "não está na tabela daquele ano"))
            continue
        dif = {k: (int(r[k]), alvo[k]) for k in ("j", "v", "e", "d", "gp", "gc")
               if int(r[k]) != alvo[k]}
        if dif:
            divergem.append((ano, clube, dif))
    print(f"\nConferência contra a classificação final: {len(g) - len(divergem)} de {len(g)} "
          f"clube-temporada fecham em J, V, E, D, GP e GC")
    for ano, clube, dif in divergem:
        print(f"  {ano} {clube}: {dif}")
    return divergem


def ler(caminho):
    d = pd.read_excel(caminho, sheet_name="TeamStats", header=0)
    d.columns = batizar(d.columns)
    d = d[d["Data"].astype(str).str.match(r"\d{4}-\d{2}-\d{2}", na=False)].copy()
    if d.empty:
        return d
    for c in ["Jogo", "Competição", "Equipa", "Sistema"]:
        d[c] = d[c].map(lambda x: nfc(x).strip() if pd.notna(x) else x)
    d["Equipa"] = d["Equipa"].map(lambda x: CLUBES.get(x, x))
    d["Data"] = pd.to_datetime(d["Data"])
    d.insert(0, "ano", d["Data"].dt.year)
    d["_arquivo"] = os.path.basename(caminho)
    return d


def derivar(d):
    """Tira do texto do jogo o adversário, o mando, o placar e o resultado.

    O formato é "Casa - Visitante 2:0". O nome do clube no texto é o do Wyscout, então a
    comparação é feita depois de passar os dois lados pelo mesmo dicionário `CLUBES`.

    O marcador de mata-mata entra em DOIS lugares diferentes — "Azuriz - Bahia 1:1 (P)" e
    "Cruzeiro - Remo (P) 1:0" — e vem em duas letras, `(P)` de pênaltis e `(E)` de prorro-
    gação. É por isso que ele aparece duas vezes na expressão. Sem isso, 174 jogos de copa
    saíam sem adversário nem resultado; nenhum era de Série B, mas o buraco estava lá.

    Sobram 8 linhas sem casar, todas fora da Série B, e por um motivo que não tem conserto
    aqui: o Wyscout usa nomes diferentes para o mesmo clube dentro e fora do texto do jogo
    (`Tolima` × `Deportes Tolima`, `Galo Maringá` × `Aruko Sports`, `Club Libertad` ×
    `Libertad`). Ficam marcadas como vazias em vez de casadas errado.
    """
    casa, fora, gc, gf = [], [], [], []
    for jogo in d["Jogo"]:
        m = re.match(r"^(.*?)\s+-\s+(.*?)(?:\s+\([PE]\))?\s+(\d+):(\d+)(?:\s+\([PE]\))?$", str(jogo))
        if not m:
            casa.append(None); fora.append(None); gc.append(None); gf.append(None)
            continue
        a, b = nfc(m.group(1)).strip(), nfc(m.group(2)).strip()
        casa.append(CLUBES.get(a, a)); fora.append(CLUBES.get(b, b))
        gc.append(int(m.group(3))); gf.append(int(m.group(4)))
    d["casa"], d["visitante"] = casa, fora
    d["golos_casa"], d["golos_visitante"] = gc, gf

    em_casa = d["Equipa"] == d["casa"]
    d["mando"] = em_casa.map({True: "casa", False: "fora"})
    d["adversario"] = d["visitante"].where(em_casa, d["casa"])
    d["golos_pro"] = pd.Series(gc).values * em_casa + pd.Series(gf).values * (~em_casa)
    d["golos_contra"] = pd.Series(gf).values * em_casa + pd.Series(gc).values * (~em_casa)
    d["resultado"] = ["V" if a > b else ("E" if a == b else "D")
                      for a, b in zip(d["golos_pro"], d["golos_contra"])]
    # quem não é nenhum dos dois lados do texto não deveria existir; marca em vez de esconder
    orfao = (~em_casa) & (d["Equipa"] != d["visitante"])
    if orfao.any():
        print(f"  ATENÇÃO: {int(orfao.sum())} linhas em que a equipe não aparece no texto do jogo")
        d.loc[orfao, ["mando", "adversario", "golos_pro", "golos_contra", "resultado"]] = None
    return d


def main():
    arquivos = sorted(glob.glob(os.path.join(FONTE, "*.xlsx")))
    if not arquivos:
        sys.exit(f"Nenhuma planilha em {FONTE}")
    print(f"Lendo {len(arquivos)} arquivos de Team Stats...")
    partes, vazios = [], []
    for f in arquivos:
        d = ler(f)
        if d.empty:
            vazios.append(os.path.basename(f))
            continue
        partes.append(d)
    if vazios:
        print(f"  {len(vazios)} arquivo(s) sem nenhum jogo: {', '.join(vazios)}")
    bruto = pd.concat(partes, ignore_index=True)
    print(f"  {len(bruto):,} linhas brutas")

    # uma linha por (jogo, equipe) — o mesmo jogo vem no arquivo dos dois clubes
    chave = ["Data", "Jogo", "Competição", "Equipa"]
    d = bruto.sort_values("_arquivo").drop_duplicates(subset=chave).copy()
    print(f"  {len(d):,} depois de tirar o mesmo jogo vindo de dois arquivos")

    d = derivar(d)
    d = d.drop(columns=["_arquivo"]).sort_values(["ano", "Competição", "Data", "Jogo", "Equipa"])
    d = d.reset_index(drop=True)

    # --- confere a Série B contra as tabelas ---
    tab = tabelas()
    sb = d[d["Competição"] == SERIE_B]
    print("\nSérie B, por temporada:")
    for ano in sorted(tab):
        s = sb[sb["ano"] == ano]
        jogos = s.groupby(["Data", "Jogo"]).ngroups
        tidos = set(s["Equipa"])
        faltam = sorted(set(tab[ano]) - tidos)
        # o ano em curso não tem 380; nos outros, 20 clubes x 38 rodadas / 2
        alvo = 380 if ano != max(tab) else max(x["j"] for x in tab[ano].values()) * 20 // 2
        print(f"  {ano}: {jogos:>3} jogos · {len(tidos)}/20 clubes"
              + (f" · FALTAM {faltam}" if faltam else "")
              + ("" if jogos == alvo else f" · esperado {alvo}"))

    conferir(sb[sb["resultado"].notna()], tab)

    cobertos = {(a, c) for a, c in zip(sb["ano"], sb["Equipa"])}
    alvo = {(a, c) for a, cs in tab.items() for c in cs}
    print(f"\nClube-temporada cobertos: {len(cobertos & alvo)} de {len(alvo)}")
    if alvo - cobertos:
        print("  ainda faltam:", sorted(alvo - cobertos))

    os.makedirs(DADOS, exist_ok=True)
    d.to_csv(CSV, index=False, encoding="utf-8-sig")
    with pd.ExcelWriter(XLSX, engine="openpyxl") as w:
        sb.to_excel(w, sheet_name="Serie B", index=False)
        d[d["Competição"] != SERIE_B].to_excel(w, sheet_name="Outras competicoes", index=False)
    print(f"\n{len(d):,} linhas · {len(d.columns)} colunas")
    print(f"  {os.path.relpath(CSV, AQUI)}  (tudo)")
    print(f"  {os.path.relpath(XLSX, AQUI)} (Série B numa aba, o resto na outra)")
    print("\nCompetições na base:")
    print(d["Competição"].value_counts().head(12).to_string())


if __name__ == "__main__":
    main()
