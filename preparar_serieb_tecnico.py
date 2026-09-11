#!/usr/bin/env python3
"""Junta e limpa as dez exportações do Wyscout com os dados técnicos da Série B 2022-2026.

A exportação do Wyscout para de 500 linhas. Como cada temporada tem ~800 jogadores com
minutos, foram precisos DOIS arquivos por ano: um ordenado dos que mais jogaram para
baixo, outro dos que menos jogaram para cima. As duas faixas se sobrepõem no meio — é daí
que vem a repetição, e é também o que garante que não sobrou buraco (confira em
`cobertura()`: se as faixas não se tocassem, gente do meio da tabela teria ficado de fora
sem ninguém perceber).

Os arquivos não dizem de que ano são. O ano é descoberto pelos CLUBES: cada temporada tem
os seus 20, e o script só aceita quando bate 20 de 20 contra as tabelas de `SB_TABELAS`
(static/app.js). Se der 19, ele para — é sinal de que um nome mudou de grafia ou de que a
exportação não é do campeonato que se pensava.

## As três armadilhas deste material

1. **`Idade` é a idade HOJE, não a da temporada.** Todos os dez arquivos foram exportados
   no mesmo dia (11/09/2026), e o Wyscout escreve a idade atual do jogador em todas as
   linhas. Adriano Martins aparece com 29 anos nas linhas de 2023, 2025 e 2026. Usar essa
   coluna como "idade na época" envelhece o elenco de 2022 em quatro anos. Por isso existe
   `idade_na_temporada` = `Idade - (2026 - ano)`, que é a idade do atleta em **setembro
   daquele ano** — os arquivos saíram em 11/09/2026, então subtrair a diferença de anos dá
   a idade na mesma data de cada temporada. Conferido contra 3.181 datas de nascimento do
   Transfermarkt: exato em 90% e um ano de diferença em 9%, e parte desses 9% é homônimo
   casado errado, não idade errada. Serve para faixas etárias de três e quatro anos; não
   serve para conta no nível do atleta.

2. **Zero quer dizer "sem dado" em três colunas.** Altura, Peso e Valor de mercado. Não é
   detalhe: são 1.778 valores de mercado zerados, 46% da base. Uma média de valor de
   mercado calculada sem tratar isso sai pela metade. Aqui viram vazio.

3. **`Emprestado` está quebrada.** Vem 'sim' em 100% das linhas — inclusive para quem
   claramente não está emprestado. A coluna fica na base (não se joga fora dado do outro),
   mas NÃO se pode usar.

## Nomes repetidos são gente diferente, e não podem ser fundidos

A limpeza remove só linha INTEIRA repetida. Parece exagero de rigor e não é: em 24 casos
o mesmo nome aparece duas vezes no mesmo clube e no mesmo ano com idade, altura e posição
diferentes — dois Bruno Silva no Novorizontino de 2022, um de 26 e um de 38 anos; dois
Robinho no Sampaio Corrêa de 2023. Se a chave fosse "ano + jogador + clube", esses 24
virariam um só e alguém sumiria da base sem deixar rastro.

Pelo mesmo motivo, quem trocou de clube no meio da temporada FICA com duas linhas — são
232 jogadores, e as duas passagens são coisas diferentes de se medir.

Uso:
    python3 preparar_serieb_tecnico.py
"""
import glob
import json
import os
import re
import sys
import unicodedata

import pandas as pd

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTE = os.path.join(AQUI, "_fonte", "serie_b_tecnico")
DADOS = os.path.join(AQUI, "dados")
CSV = os.path.join(DADOS, "serieb_tecnico.csv")
XLSX = os.path.join(DADOS, "serieb_tecnico.xlsx")
APP = os.path.join(AQUI, "static", "app.js")

EXPORTADO_EM = 2026        # ano em que as dez planilhas foram geradas (vem do nome delas)

COL_CLUBE = "Equipa dentro de um período de tempo seleccionado"

# Wyscout escreve o nome do clube de um jeito; as tabelas do estudo, de outro.
CLUBES = {
    "América Mineiro": "América-MG", "Athletic Club": "Athletic",
    "Athletico Paranaense": "Athletico-PR", "Atlético GO": "Atlético-GO",
    "Botafogo SP": "Botafogo-SP", "Grêmio Novorizontino": "Novorizontino",
    "Operário PR": "Operário-PR", "Sport Recife": "Sport",
    "São Bernardo FC": "São Bernardo", "Vasco da Gama": "Vasco",
}

# O Wyscout exporta DUAS colunas com o mesmo nome: os duelos aéreos do jogador de linha e
# os do goleiro. O pandas desempata sozinho pondo '.1' na segunda — o que sobra é um nome
# que ninguém entende seis meses depois. Aqui elas ganham nome de gente.
RENOMEAR = {
    "Duelos aérios/90": "Duelos aéreos/90",
    "Duelos aérios/90.1": "Duelos aéreos GR/90",
}

ZERO_E_VAZIO = ["Altura", "Peso", "Valor de mercado"]


def nfc(s):
    """macOS guarda acento decomposto; o Excel, composto. Sem isso 'Avaí' != 'Avaí'."""
    return unicodedata.normalize("NFC", str(s))


def clubes_por_ano():
    """Os 20 clubes de cada temporada, lidos de SB_TABELAS em static/app.js.

    A fonte é o próprio estudo, de propósito: se um dia uma tabela for corrigida lá, esta
    limpeza passa a conferir contra a versão corrigida, sem uma segunda lista para
    esquecer de atualizar.
    """
    t = open(APP, encoding="utf-8").read()
    # fim do bloco: `SB_COMPLETAS`, que vem logo depois. Era `SB_USO` ate set/26, e quando a
    # SB_USO saiu do app.js os tres scripts que liam a tabela quebraram de uma vez. Ancora
    # boa e a que nao tem motivo para sumir.
    bloco = t[t.index("const SB_TABELAS"): t.index("const SB_COMPLETAS")]
    fora = {}
    for m in re.finditer(r"(\d{4}):\s*\[(.*?)\],\n(?=\s*\d{4}:|\};)", bloco, re.S):
        fora[int(m.group(1))] = {nfc(c) for _, c in re.findall(r"\[(\d+),'([^']+)'", m.group(2))}
    if not fora:
        sys.exit("Não achei SB_TABELAS em static/app.js — a limpeza depende dela para datar os arquivos.")
    return fora


def descobrir_ano(times, tabelas):
    """Qual temporada é esta planilha? Só aceita 20 de 20."""
    notas = sorted(((len(times & cs), ano) for ano, cs in tabelas.items()), reverse=True)
    acertos, ano = notas[0]
    if acertos < len(times):
        faltam = sorted(times - tabelas[ano])
        sys.exit(f"Planilha não bateu com nenhuma temporada: o melhor palpite é {ano} com "
                 f"{acertos}/{len(times)} clubes. Sobraram: {faltam}")
    return ano, notas[1]


def carregar(tabelas):
    arquivos = sorted(glob.glob(os.path.join(FONTE, "*.xlsx")))
    if not arquivos:
        sys.exit(f"Nenhuma planilha em {FONTE}")
    partes = []
    for f in arquivos:
        d = pd.read_excel(f)
        for c in ["Jogador", "Equipa", COL_CLUBE, "Posição", "Naturalidade",
                  "País de nacionalidade", "Pé"]:
            if c in d.columns:
                d[c] = d[c].map(lambda x: nfc(x).strip() if pd.notna(x) else x)
        d[COL_CLUBE] = d[COL_CLUBE].map(lambda x: CLUBES.get(x, x))
        d["Equipa"] = d["Equipa"].map(lambda x: CLUBES.get(x, x))
        ano, segundo = descobrir_ano(set(d[COL_CLUBE]), tabelas)
        print(f"  {os.path.basename(f):<44} -> {ano}  (2º palpite: {segundo[1]} com {segundo[0]}/20)")
        d.insert(0, "ano", ano)
        d["_arquivo"] = os.path.basename(f)
        partes.append(d)
    return pd.concat(partes, ignore_index=True)


def cobertura(bruto):
    """As duas faixas de minutos de cada ano se tocam? Se não, faltou gente no meio."""
    print("\nCobertura por temporada (as duas faixas precisam se sobrepor):")
    ok = True
    for ano, sub in bruto.groupby("ano"):
        faixas = [(s["Minutos jogados:"].min(), s["Minutos jogados:"].max())
                  for _, s in sub.groupby("_arquivo")]
        if len(faixas) != 2:
            print(f"  {ano}: {len(faixas)} arquivo(s) — esperado 2")
            ok = False
            continue
        (a0, a1), (b0, b1) = faixas
        toca = min(a1, b1) >= max(a0, b0)
        ok &= toca
        print(f"  {ano}: {a0}–{a1} min e {b0}–{b1} min  ->  "
              f"{'sobrepõem, sem buraco' if toca else 'NÃO SE TOCAM: falta gente no meio'}")
    return ok


def limpar(bruto):
    colunas = [c for c in bruto.columns if c != "_arquivo"]
    antes = len(bruto)
    d = bruto.drop_duplicates(subset=colunas).copy()
    print(f"\nRepetidas: {antes} linhas -> {len(d)} ({antes - len(d)} eram a mesma linha duas vezes)")

    xara = d.groupby(["ano", "Jogador", COL_CLUBE]).size()
    n_xara = int((xara > 1).sum())
    print(f"  homônimos preservados (mesmo nome, mesmo clube, mesmo ano, pessoas diferentes): {n_xara}")
    dois_clubes = d.groupby(["ano", "Jogador"])[COL_CLUBE].nunique()
    print(f"  jogadores com duas passagens no mesmo ano (linhas mantidas de propósito): "
          f"{int((dois_clubes > 1).sum())}")

    d = d.rename(columns=RENOMEAR)

    for c in ZERO_E_VAZIO:
        if c in d.columns:
            n = int((d[c] == 0).sum())
            d[c] = d[c].replace(0, pd.NA)
            print(f"  {c}: {n} zeros viraram vazio")

    # idade da temporada, e não a de hoje — veja o cabeçalho do arquivo
    d.insert(d.columns.get_loc("Idade") + 1, "idade_na_temporada",
             d["Idade"] - (EXPORTADO_EM - d["ano"]))
    # a posição do Wyscout vem como lista ("LAMF, CF, LW"); a primeira é a principal
    d.insert(d.columns.get_loc("Posição") + 1, "posicao_1",
             d["Posição"].astype(str).str.split(",").str[0].str.strip())

    if "Emprestado" in d.columns and d["Emprestado"].nunique(dropna=False) == 1:
        print(f"  ATENÇÃO: 'Emprestado' vem '{d['Emprestado'].iloc[0]}' em 100% das linhas — "
              f"coluna inutilizável, fica na base mas não serve para filtrar")

    d = d.sort_values(["ano", COL_CLUBE, "Minutos jogados:"],
                      ascending=[True, True, False]).reset_index(drop=True)
    return d


def main():
    tabelas = clubes_por_ano()
    print("Lendo as planilhas e datando cada uma pelos clubes:")
    bruto = carregar(tabelas)
    if not cobertura(bruto):
        print("\n  (a cobertura acima não fecha — a base sai assim mesmo, mas leia o aviso)")
    d = limpar(bruto)

    os.makedirs(DADOS, exist_ok=True)
    d.drop(columns=["_arquivo"], errors="ignore").to_csv(CSV, index=False, encoding="utf-8-sig")
    with pd.ExcelWriter(XLSX, engine="openpyxl") as w:
        d.drop(columns=["_arquivo"], errors="ignore").to_excel(w, sheet_name="Serie B 2022-2026",
                                                               index=False)

    print(f"\n{len(d):,} linhas de jogador-temporada · {len(d.columns) - 1} colunas")
    print(f"  {os.path.relpath(CSV, AQUI)}")
    print(f"  {os.path.relpath(XLSX, AQUI)}\n")
    resumo = d.groupby("ano").agg(jogadores=("Jogador", "size"), clubes=(COL_CLUBE, "nunique"),
                                  minutos_min=("Minutos jogados:", "min"),
                                  minutos_max=("Minutos jogados:", "max"))
    print(resumo.to_string())


if __name__ == "__main__":
    main()
