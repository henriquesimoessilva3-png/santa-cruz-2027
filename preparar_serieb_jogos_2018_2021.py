#!/usr/bin/env python3
"""Estende a Série B para trás: os 80 "Team Stats" de 2018 a 2021 viram jogo a jogo e painel.

O `preparar_serieb_jogos.py` faz isso para 2022-2026 e continua sendo o modelo — daqui saem
importadas a batizada das colunas sem nome (`batizar`), a normalização NFC, o de-para de
clubes e a derivação de adversário/mando/placar (`derivar`). Nada disso foi reescrito: duas
implementações da mesma conta divergem em silêncio, e a comparação 2018-2021 × 2022-2026 é
justamente o que este arquivo existe para permitir.

Pelo mesmo motivo o painel clube-temporada NÃO tem contas próprias. Ele chama as funções do
`analisar_serieb.py` (`do_jogo`, `extras_de_jogo`, `extras_profundos`,
`permutacao_sequencias`) apontando-as para esta base, em vez de copiá-las. O apontamento é
feito trocando o `RAIZ` do módulo por um diretório de trabalho e a `tabelas()` pela
classificação das quatro temporadas antigas — é a única forma de garantir que a média de
posse de 2019 é calculada pela MESMA linha de código que a de 2024.

## Quatro armadilhas deste período, todas já pagas

**1. A temporada não sai do ano da data.** Os 20 clubes de 2020 atravessam o ano civil: a
Série B 2020 foi de 08/08/2020 a 30/01/2021, por causa da covid. `Data.year` racharia a
temporada inteira em dois pedaços e nenhum clube fecharia 38 jogos. A temporada sai do
ARQUIVO — o ano do primeiro jogo de Série B daquele arquivo —, e como cada arquivo é um
clube numa temporada só, os dois arquivos que trazem a mesma partida concordam sempre.

**2. Um arquivo veio vazio: `Team Stats Vila Nova (7).xlsx`.** São duas linhas de rótulo e
nenhuma partida — era o Vila Nova de 2019. Não custa nada: cada jogo aparece no arquivo dos
DOIS clubes, então os 38 jogos do Vila Nova 2019 estão inteiros nos arquivos dos outros 19,
e a união fecha 80 de 80 clube-temporada. O arquivo é contado e nomeado na saída em vez de
ser pulado calado.

**3. Os arquivos trazem estadual, Copa do Brasil, Copa Verde e amistoso junto.** São 6.000
linhas de Série B dentro de 8.136. O filtro é `Competição == "Brazil. Serie B"`, e a base
gravada tem SÓ Série B: fora dela a palavra "temporada" não quer dizer nada (um estadual de
2021 não pertence à Série B de 2021 nem à de 2020), e gravar um `ano` que não significa a
mesma coisa em linhas diferentes é pior do que não gravar a linha.

**4. Falta UMA partida no Wyscout inteiro: Cuiabá × Figueirense de 2019.** Por isso esses
dois clubes têm 37 jogos naquele ano. É buraco da fonte, não do processamento — e está
registrado na coluna `jogos_faltando`, não consertado.

## As 109 colunas de 2018-2021 contra as 119 de 2022-2026

Depois da batizada, os dois períodos têm EXATAMENTE as mesmas 109 colunas de origem — zero
coluna a mais, zero a menos, conferido arquivo por arquivo nos 80. As 10 que faltam para
119 são as derivadas que o próprio `preparar_serieb_jogos.py` cria (`ano`, `casa`,
`visitante`, `golos_casa`, `golos_visitante`, `mando`, `adversario`, `golos_pro`,
`golos_contra`, `resultado`) e que aqui são criadas pela mesma função. Nenhuma das 109 vem
vazia: 0% de nulo em todas, nas 3.038 linhas. O xG do Wyscout existe desde 2018.

Ou seja: no jogo a jogo não há nada que o teste cego possa testar em 2022-2025 e não possa
em 2018-2021.

## O que o painel NÃO tem, e por quê

O painel de 2022-2026 tem 346 colunas. 166 são físicas (`fis_*`) e não entram: **físico não
existe antes de 2022** — confirmado na API do SkillCorner, não no banco local. Das 180
restantes, 139 saem do jogo a jogo e estão aqui; 41 dependem de duas bases que este período
não tem e ficam de FORA, não vazias:

  - 25 vêm do `serieb_tecnico.csv` (Wyscout por jogador): uso de elenco, idade, valor,
    gols por atleta, goleiro. O arquivo por jogador de 2018-2021 existe zipado em
    `bases wyscout - serie B/`, mas não foi processado — é outra tarefa, e enquanto não for
    a coluna não existe.
  - 16 vêm do `serieb_elencos.csv` (Transfermarkt), que só foi coletado de 2022 em diante.

Coluna vazia mente por omissão: quem abrisse o painel dos dois períodos juntos veria
`tm_valor_total` zerado em 2018-2021 e leria "elenco barato", não "não medido".

## A classificação é o teste, e ela fecha nos quatro anos

Ponto, V, E, D, GP, GC e SG saem das próprias partidas e a ordem resultante é comparada,
clube a clube, com `_fonte/prototipo/tabelas_2018_2021.json`. 2018 e 2021 batem na
primeira tentativa, os 20 na ordem. Os outros dois anos divergem em exatamente duas coisas,
e as duas são de fora do Wyscout:

  - **Cruzeiro 2020 perdeu 6 pontos por punição** (dívida reconhecida pela FIFA). Medido nos
    jogos ele tem 55 e terminaria em 10º; com a punição fica com 49 e é 11º, que é onde a
    tabela o coloca. Está em `punicao_pts`, e o `pts` da linha continua sendo o MEDIDO — a
    subtração fica visível em vez de embutida.
  - **Cuiabá 2019 aparece com 49 pontos em 37 jogos** por causa da partida que falta. Só um
    resultado reproduz a ordem oficial: vitória. Com empate ele teria 50 e V=12, e perderia
    o critério de vitórias para o Botafogo-SP, que a tabela põe abaixo dele. Isso é uma
    DEDUÇÃO da ordem oficial, não um dado do Wyscout: o placar segue desconhecido, os gols
    daquele jogo seguem fora de GP e GC dos dois clubes, e nada foi imputado.

Com esses dois fatos, os 80 clube-temporada saem na ordem certa nas quatro temporadas.

Uso:
    python3 preparar_serieb_jogos_2018_2021.py
"""
import glob
import json
import os
import shutil
import sys
import tempfile

import numpy as np
import pandas as pd

import analisar_serieb as A
import preparar_serieb_jogos as P

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTE = os.path.join(AQUI, "_fonte", "serie_b_jogos_2018_2021")
DADOS = os.path.join(AQUI, "dados")
TABELAS = os.path.join(AQUI, "_fonte", "prototipo", "tabelas_2018_2021.json")
CSV_JOGOS = os.path.join(DADOS, "serieb_jogos_2018_2021.csv")
CSV_PAINEL = os.path.join(DADOS, "serieb_clube_temporada_2018_2021.csv")
PAINEL_NOVO = os.path.join(DADOS, "serieb_clube_temporada.csv")

SERIE_B = P.SERIE_B

# O único clube que o de-para de 2022-2026 não cobria: em 2019 o Wyscout escreve
# "Red Bull Bragantino" e a tabela do estudo, "Bragantino". A entrada é posta no dicionário
# IMPORTADO, em tempo de execução, e não copiada para um dicionário daqui: o `derivar()`
# usa o `CLUBES` do outro módulo para ler o texto do jogo, e dois de-para paralelos um dia
# discordariam. Não vai para dentro do `preparar_serieb_jogos.py` porque lá ela mudaria o
# nome do adversário nas linhas de Copa do Brasil de 2022-2026, que não é assunto daqui.
P.CLUBES.setdefault("Red Bull Bragantino", "Bragantino")

# Pontos tirados pela CBF, que o jogo a jogo não tem como saber. Sem isto a tabela medida
# contradiz a tabela oficial e não há como dizer qual das duas está errada.
PUNICOES = {(2020, "Cruzeiro"): (6, "dívida reconhecida pela FIFA, -6 pontos")}

# As colunas do painel de 2022-2026 que dependem de bases que 2018-2021 não tem. Ficam
# fora do arquivo; o motivo viaja junto para poder ser impresso.
SEM_FONTE = {
    "serieb_tecnico.csv (Wyscout por jogador) não processado para 2018-2021": [
        "atletas_usados", "nucleo_1000", "nucleo_300", "conc_hhi", "share_11", "pj_11",
        "idade_pond", "idade_11", "valor_total", "valor_mediana", "valor_11",
        "valor_11_casados", "valor_11_com", "valor_com_dado", "golos_cabeca",
        "penaltis_marcados", "golos_sem_penalti", "golos_tec", "estrangeiros",
        "min_estrangeiros", "pctArtilheiro", "marcadores", "pctTop3", "gkDefesas",
        "gkEvitados"],
    "serieb_elencos.csv (Transfermarkt) só coletado de 2022 em diante": [
        "plantel", "tm_valor_total", "tm_valor_mediana", "tm_idade", "tm_altura",
        "tm_com_valor", "val_ataque", "val_defesa", "val_goleiro", "val_meio",
        "sh_ataque", "sh_defesa", "sh_goleiro", "sh_meio", "pctFicou", "novos"],
    "SkillCorner não cobre a Série B antes de 2022 (confirmado na API)": ["fis_*"],
}


# ======================= o jogo a jogo =======================

def ler(caminho):
    """Uma planilha, já com as colunas batizadas e só as linhas que são partida.

    A batizada é a do `preparar_serieb_jogos.py` e resolve o mesmo problema de lá: o
    Wyscout escreve `Remates / à baliza` e deixa as duas colunas seguintes em branco.
    """
    d = pd.read_excel(caminho, sheet_name="TeamStats", header=0)
    d.columns = P.batizar(d.columns)
    d = d[d["Data"].astype(str).str.match(r"\d{4}-\d{2}-\d{2}", na=False)].copy()
    if d.empty:
        return d
    for c in ["Jogo", "Competição", "Equipa", "Sistema"]:
        d[c] = d[c].map(lambda x: P.nfc(x).strip() if pd.notna(x) else x)
    d["Equipa"] = d["Equipa"].map(lambda x: P.CLUBES.get(x, x))
    d["Data"] = pd.to_datetime(d["Data"])
    d["_arquivo"] = os.path.basename(caminho)
    return d


def jogo_a_jogo():
    """Os 80 arquivos viram uma linha por (temporada, partida, equipe) da Série B."""
    arquivos = sorted(glob.glob(os.path.join(FONTE, "*.xlsx")))
    if not arquivos:
        sys.exit(f"Nenhuma planilha em {FONTE}")
    print(f"Lendo {len(arquivos)} arquivos de Team Stats de 2018-2021...")
    partes, vazios, colunas = [], [], None
    for f in arquivos:
        d = ler(f)
        if d.empty:
            vazios.append(os.path.basename(f))
            continue
        # a base inteira depende de as 109 colunas serem as mesmas em todo arquivo; se um
        # deles vier com outro layout, melhor parar aqui do que concatenar torto
        if colunas is None:
            colunas = list(d.columns)
        elif list(d.columns) != colunas:
            sys.exit(f"{os.path.basename(f)} tem colunas diferentes das dos outros")
        partes.append(d)
    for v in vazios:
        print(f"  {v}: nenhuma partida — o clube-temporada se reconstrói pelos adversários")

    bruto = pd.concat(partes, ignore_index=True)
    print(f"  {len(bruto):,} linhas brutas, {len(colunas) - 1} colunas de origem")

    sb = bruto[bruto["Competição"] == SERIE_B].copy()
    fora = bruto[bruto["Competição"] != SERIE_B]
    print(f"  {len(sb):,} de Série B · {len(fora):,} de outras competições, descartadas "
          f"({fora['Competição'].nunique()} competições)")

    # A TEMPORADA SAI DO ARQUIVO. Ver a armadilha 1 no cabeçalho: em 2020 o ano da data
    # rachava os 20 clubes em dois pedaços.
    primeiro = sb.groupby("_arquivo")["Data"].min().dt.year
    sb["ano"] = sb["_arquivo"].map(primeiro)

    d = sb.sort_values("_arquivo").drop_duplicates(
        subset=["ano", "Data", "Jogo", "Equipa"]).copy()
    print(f"  {len(d):,} depois de tirar a mesma partida vinda dos dois clubes")

    d = P.derivar(d)
    cols = ["ano"] + [c for c in d.columns if c not in ("ano", "_arquivo")]
    d = d[cols].sort_values(["ano", "Data", "Jogo", "Equipa"]).reset_index(drop=True)
    return d


# ======================= a classificação, que é o teste =======================

def classificar(s):
    """Ponto, V, E, D, GP, GC e SG de cada clube-temporada, tirados das próprias partidas."""
    g = s.groupby(["ano", "Equipa"]).agg(
        J=("resultado", "size"),
        V=("resultado", lambda x: int((x == "V").sum())),
        E=("resultado", lambda x: int((x == "E").sum())),
        D=("resultado", lambda x: int((x == "D").sum())),
        GP=("golos_pro", "sum"), GC=("golos_contra", "sum")).reset_index()
    g = g.rename(columns={"Equipa": "clube"})
    g["pts"] = g.V * 3 + g.E
    g["SG"] = g.GP - g.GC
    g["punicao_pts"] = [PUNICOES.get((a, c), (0, ""))[0] for a, c in zip(g.ano, g.clube)]
    g["jogos_faltando"] = 38 - g.J
    return g


def conferir(g, oficial):
    """Ordena o medido e compara com a tabela conhecida, ano a ano.

    O critério é o da CBF na ordem em que ele desempata: pontos, vitórias, saldo, gols
    marcados. Os pontos usados aqui são os medidos MENOS a punição — é a única forma de a
    ordem poder bater, e é por isso que a punição precisa estar declarada.
    """
    divergem = []
    for ano in sorted(oficial):
        meu, alvo = ordem(g, ano), oficial[ano]
        if meu == alvo:
            print(f"  {ano}: os 20 clubes na ordem da tabela")
            continue
        for i, (a, b) in enumerate(zip(meu, alvo), 1):
            if a != b:
                divergem.append(f"{ano} {i}º: medido {a}, tabela {b}")
        print(f"  {ano}: {sum(1 for a, b in zip(meu, alvo) if a != b)} posições fora do lugar")
    return divergem


def ordem(g, ano):
    """A ordem da temporada pelo critério da CBF: pontos (já descontada a punição),
    vitórias, saldo, gols marcados."""
    d = g[g.ano == ano].copy()
    d["_pts"] = d.pts - d.punicao_pts
    return list(d.sort_values(["_pts", "V", "SG", "GP"], ascending=False).clube)


def testar_o_buraco(g, oficial):
    """Devolve qual resultado da partida que falta reproduz a tabela — se algum reproduz.

    A afirmação "a divergência de 2019 é o buraco da fonte, não o processamento" só vale se
    for MEDIDA. O teste: dar à partida ausente cada um dos três resultados possíveis, refazer
    a ordem e ver qual bate com a oficial. Se nenhum bater, o problema não é o buraco e há
    algo errado aqui. Se mais de um bater, o buraco explica mas não identifica o resultado.

    O placar é arbitrário — a partida some inteira, os gols dela também —, então cada
    resultado é testado com margem de 1 e de 3 gols. Se os dois derem a mesma resposta, o
    veredito não depende do placar escolhido; se derem respostas diferentes, o teste diz
    isso em vez de esconder.
    """
    fora = []
    for ano in sorted(set(g.loc[g.jogos_faltando > 0, "ano"])):
        falta = g[(g.ano == ano) & (g.jogos_faltando > 0)]
        if len(falta) != 2 or set(falta.jogos_faltando) != {1}:
            fora.append((ano, None, "mais de uma partida ausente — teste não se aplica"))
            continue
        a, b = falta.clube.tolist()
        ok = set()
        for rot, pa, pb, va, vb in [("vitória do " + a, 3, 0, 1, 0),
                                    ("empate", 1, 1, 0, 0),
                                    ("vitória do " + b, 0, 3, 0, 1)]:
            for margem in (1, 3):
                h = g.copy()
                ia, ib = (h.ano == ano) & (h.clube == a), (h.ano == ano) & (h.clube == b)
                gpa, gpb = (margem, 0) if pa == 3 else ((0, margem) if pb == 3 else (0, 0))
                for i, p, v, gp, gc in [(ia, pa, va, gpa, gpb), (ib, pb, vb, gpb, gpa)]:
                    h.loc[i, "pts"] += p
                    h.loc[i, "V"] += v
                    h.loc[i, "GP"] += gp
                    h.loc[i, "GC"] += gc
                    h.loc[i, "SG"] += gp - gc
                if ordem(h, ano) == oficial[ano]:
                    ok.add((rot, margem))
        rotulos = sorted({r for r, _ in ok})
        margens = {r: sorted(m for rr, m in ok if rr == r) for r in rotulos}
        fora.append((ano, rotulos, margens))
    return fora


def tabela_oficial():
    """A classificação das quatro temporadas — 20 clubes por ano, NA ORDEM."""
    t = json.load(open(TABELAS, encoding="utf-8"))
    return {int(a): [P.nfc(c) for c in cs] for a, cs in t.items()}


# ======================= o painel clube-temporada =======================

def painel(jogos, g, oficial):
    """As mesmas colunas técnicas do painel de 2022-2026, calculadas pelas mesmas funções.

    O `analisar_serieb.py` lê tudo de `{RAIZ}/dados/` e pega a classificação em
    `tabelas()`. Aqui os dois são trocados por um diretório de trabalho com ESTA base e
    pela tabela de 2018-2021 — em vez de copiar as funções para cá. Copiar significaria ter
    a média de posse calculada em dois lugares, e um dia eles discordariam.

    As três bases que o período não tem entram como link para as de 2022-2026 de propósito:
    as funções leem, não acham nenhum ano entre 2018 e 2021 e devolvem coluna vazia — que
    é justamente o que o `SEM_FONTE` manda jogar fora depois. Nenhum número de 2022-2026
    atravessa: o merge é por (ano, clube).
    """
    trab = tempfile.mkdtemp(prefix="sb1821_")
    os.makedirs(os.path.join(trab, "dados"))
    jogos.to_csv(os.path.join(trab, "dados", "serieb_jogos.csv"),
                 index=False, encoding="utf-8-sig")
    for nome in ("serieb_tecnico.csv", "serieb_elencos.csv"):
        os.symlink(os.path.join(DADOS, nome), os.path.join(trab, "dados", nome))

    tab = g[["ano", "clube", "J", "V", "E", "D", "GP", "GC", "pts", "SG"]].copy()
    tab["pos"] = [oficial[a].index(c) + 1 for a, c in zip(tab.ano, tab.clube)]

    raiz_antiga, tabelas_antiga = A.RAIZ, A.tabelas
    A.RAIZ = trab
    A.tabelas = lambda: tab
    try:
        t = tab.merge(g[["ano", "clube", "punicao_pts", "jogos_faltando"]],
                      on=["ano", "clube"])
        print("  do_jogo...")
        t = t.merge(A.do_jogo(), on=["ano", "clube"], how="left")
        print("  extras_de_jogo...")
        t = t.merge(A.extras_de_jogo(), on=["ano", "clube"], how="left")
        print("  extras_profundos...")
        t = t.merge(A.extras_profundos(), on=["ano", "clube"], how="left")
        print(f"  permutacao_sequencias ({A.PERM_R:,} réplicas x 3 nulos)...")
        t = t.merge(A.permutacao_sequencias(), on=["ano", "clube"], how="left")
    finally:
        A.RAIZ, A.tabelas = raiz_antiga, tabelas_antiga
        shutil.rmtree(trab)

    # as mesmas contas derivadas do `montar()` e do `base()`
    t["xg_saldo"] = t["xg"] - t["xg_contra"]
    t["finalizacao"] = t["GP"] / t["J"] - t["xg"]
    t["defesa_vs_xg"] = t["xg_contra"] - t["GC"] / t["J"]
    t["gp_jogo"], t["gc_jogo"] = t["GP"] / t["J"], t["GC"] / t["J"]
    t["subiu"] = t["pos"] <= 4
    t["caiu"] = t["pos"] >= 17
    t["faixa"] = np.where(t.pos <= 4, "sobe", np.where(t.pos >= 17, "cai", "meio"))
    t["xg_por_remate"] = t["xg"] / t["remates"]
    t["xg_por_remate_contra"] = t["xg_contra"] / t["remates_contra"]
    t["bp_conv"] = t["bp_remates"] / t["bolas_paradas"] * 100

    # fora as que dependem do que não existe — e conferindo que saíram mesmo vazias, porque
    # uma delas cheia significaria que um merge pegou dado de outro período
    fora = [c for cs in SEM_FONTE.values() for c in cs if c in t.columns]
    cheias = [c for c in fora if t[c].notna().any()]
    if cheias:
        sys.exit(f"Colunas que deveriam estar vazias vieram com dado: {cheias}")
    t = t.drop(columns=fora)
    return t


def ordenar_como_2022(t):
    """Mesma ordem de colunas do painel de 2022-2026, para os dois poderem ser comparados.

    O que é só daqui (`punicao_pts`, `jogos_faltando`) vai para o fim: são as duas colunas
    que registram por que o medido e a tabela oficial não coincidem em três linhas.
    """
    if not os.path.exists(PAINEL_NOVO):
        return t
    ordem = [c for c in pd.read_csv(PAINEL_NOVO, nrows=0).columns if c in t.columns]
    return t[ordem + [c for c in t.columns if c not in ordem]]


def main():
    d = jogo_a_jogo()
    oficial = tabela_oficial()

    print("\nSérie B, por temporada:")
    for ano in sorted(oficial):
        s = d[d.ano == ano]
        print(f"  {ano}: {s.groupby(['Data', 'Jogo']).ngroups:>3} partidas únicas · "
              f"{s.Equipa.nunique()}/20 clubes · {len(s):,} linhas")

    g = classificar(d)
    print("\nClassificação recalculada contra _fonte/prototipo/tabelas_2018_2021.json:")
    divergem = conferir(g, oficial)
    for x in divergem:
        print(f"    {x}")
    for (ano, clube), (pts, motivo) in PUNICOES.items():
        print(f"  punição declarada: {ano} {clube}, {motivo}")
    for _, r in g[g.jogos_faltando > 0].iterrows():
        print(f"  buraco da fonte: {r.ano} {r.clube} com {r.J} jogos, não 38 "
              f"(Cuiabá x Figueirense de 2019 não existe no Wyscout)")
    for ano, rotulos, margens in testar_o_buraco(g, oficial):
        if not rotulos:
            print(f"  ATENÇÃO: nenhum resultado da partida ausente de {ano} reproduz a "
                  f"tabela — a divergência NÃO é o buraco da fonte")
        elif len(rotulos) == 1:
            print(f"  a ordem de {ano} volta a fechar com um único resultado para a partida "
                  f"ausente: {rotulos[0]} (testado com margem de {' e '.join(str(m) for m in margens[rotulos[0]])} gol)")
        else:
            print(f"  o buraco de {ano} explica a divergência, mas {len(rotulos)} resultados "
                  f"reproduzem a tabela: {', '.join(rotulos)}")

    os.makedirs(DADOS, exist_ok=True)
    d.to_csv(CSV_JOGOS, index=False, encoding="utf-8-sig")
    print(f"\n{os.path.relpath(CSV_JOGOS, AQUI)}: {len(d):,} linhas x {len(d.columns)} colunas")

    print("\nMontando o painel clube-temporada com as funções do analisar_serieb.py:")
    t = ordenar_como_2022(painel(d, g, oficial))
    t.to_csv(CSV_PAINEL, index=False, encoding="utf-8-sig")
    print(f"\n{os.path.relpath(CSV_PAINEL, AQUI)}: {len(t):,} linhas x {len(t.columns)} colunas")

    if os.path.exists(PAINEL_NOVO):
        novo = pd.read_csv(PAINEL_NOVO, nrows=0).columns
        comuns = [c for c in novo if c in t.columns]
        print(f"  {len(comuns)} colunas em comum com o painel de 2022-2026 "
              f"({len(novo)} lá, {len([c for c in novo if c.startswith('fis_')])} delas físicas)")
    print("  o que não entrou, e por quê:")
    for motivo, cs in SEM_FONTE.items():
        print(f"    {len(cs):>2} coluna(s) — {motivo}")
        print(f"       {', '.join(cs)}")


if __name__ == "__main__":
    main()
