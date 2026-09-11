#!/usr/bin/env python3
"""Cruza as tres bases da Serie B e responde o que separa quem sobe de quem cai.

As tres bases sao independentes e cada uma sabe de uma coisa:

    dados/serieb_jogos.csv     como o time jogou, partida a partida (Wyscout Team Stats)
    dados/serieb_tecnico.csv   o que cada atleta fez (Wyscout, por jogador)
    dados/serieb_elencos.csv   quem estava no clube e quanto valia (Transfermarkt)

Aqui elas viram UMA tabela de clube-temporada, 100 linhas, e a partir dela saem as
comparacoes. A classificacao final vem de SB_TABELAS (static/app.js), que ja e a fonte de
verdade do estudo.

## Duas escolhas de metodo que mudam o resultado

**Sempre POSTO dentro da temporada, nunca numero bruto.** Uma Serie B com 1,01 gol por
jogo (2022) e outra com 1,11 (2025) nao sao o mesmo campeonato. Comparar "quem fez mais
gols" entre anos mistura o clube com a inflacao de gols do ano. Todo indicador e
convertido no posto de 1 a 20 dentro do proprio ano antes de qualquer correlacao.

**So as quatro temporadas COMPLETAS entram nas conclusoes** (2022-2025, 80 clube-temporada).
2026 esta em andamento e fica de fora das medias — entra so quando a pergunta e sobre o
ano corrente.

## Onde as afirmacoes podem estar erradas

- **16 clubes que subiram e 16 que cairam.** Uma diferenca de 2 ou 3 pontos percentuais
  entre os grupos nao e conclusao, e ruido. Por isso o relatorio so afirma o que tem
  diferenca grande E correlacao consistente.
- **Causa e efeito se confundem.** Um time que usou 46 atletas provavelmente ja estava
  perdendo — trocar muito e sintoma tanto quanto causa. Isso vale para uso de elenco,
  cartoes e faltas.
- **xG e modelo, nao verdade.** Na Serie B o xG do Wyscout supera o gol real em 9% a 14%
  ao ano, ou seja o modelo e calibrado para outro futebol. O que se usa dele aqui e a
  ORDEM (quem cria mais), nao o nivel.

Uso:
    python3 analisar_serieb.py            # imprime o relatorio inteiro
    python3 analisar_serieb.py --csv      # grava tambem dados/serieb_clube_temporada.csv
"""
import datetime as dt
import re, sqlite3, unicodedata
import numpy as np, pandas as pd

import os
RAIZ = os.path.dirname(os.path.abspath(__file__))
nfc = lambda s: unicodedata.normalize("NFC", str(s))

TM = {"AA Ponte Preta":"Ponte Preta","ABC FC":"ABC","Amazonas FC":"Amazonas",
 "América Mineiro":"América-MG","Athletic Club":"Athletic","Athletico Paranaense":"Athletico-PR",
 "Atlético Goianiense":"Atlético-GO","Avaí FC":"Avaí","Botafogo FC":"Botafogo-SP",
 "Brusque FC":"Brusque","CR Vasco da Gama":"Vasco","Ceará SC":"Ceará","Clube do Remo":"Remo",
 "Coritiba FC":"Coritiba","Criciúma EC":"Criciúma","Cruzeiro EC":"Cruzeiro","Cuiabá EC":"Cuiabá",
 "EC Bahia":"Bahia","EC Juventude":"Juventude","EC Vitória":"Vitória","Fortaleza EC":"Fortaleza",
 "Goiás EC":"Goiás","Grêmio FBPA":"Grêmio","Grêmio Novorizontino":"Novorizontino",
 "Guarani FC":"Guarani","Ituano FC":"Ituano","Londrina EC":"Londrina","Mirassol FC":"Mirassol",
 "Operário FEC":"Operário-PR","Paysandu SC":"Paysandu","Sampaio Corrêa FC":"Sampaio Corrêa",
 "Santos FC":"Santos","Sport Recife":"Sport","São Bernardo FC":"São Bernardo",
 "Tombense FC":"Tombense","Vila Nova FC":"Vila Nova","Volta Redonda FC":"Volta Redonda"}
TM = {nfc(k): nfc(v) for k, v in TM.items()}


def tabelas():
    t = open(f"{RAIZ}/static/app.js", encoding="utf-8").read()
    # fim do bloco: `SB_COMPLETAS`, que vem logo depois. Era `SB_USO` ate set/26, e quando a
    # SB_USO saiu do app.js os tres scripts que liam a tabela quebraram de uma vez.
    b = t[t.index("const SB_TABELAS"): t.index("const SB_COMPLETAS")]
    linhas = []
    for m in re.finditer(r"(\d{4}):\s*\[(.*?)\],\n(?=\s*\d{4}:|\};)", b, re.S):
        ano = int(m.group(1))
        for pos, c, j, v, e, d, gp, gc in re.findall(
                r"\[(\d+),'([^']+)',(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\]", m.group(2)):
            linhas.append(dict(ano=ano, clube=nfc(c), pos=int(pos), J=int(j), V=int(v),
                               E=int(e), D=int(d), GP=int(gp), GC=int(gc),
                               pts=int(v)*3+int(e), SG=int(gp)-int(gc)))
    return pd.DataFrame(linhas)


def do_jogo():
    J = pd.read_csv(f"{RAIZ}/dados/serieb_jogos.csv")
    s = J[(J["Competição"] == "Brazil. Serie B") & J["resultado"].notna()].copy()
    s["clube"] = s["Equipa"].map(nfc)
    # xG do adversario: o proprio jogo tem a linha dele
    adv = s[["Data", "Jogo", "Equipa", "Golos esperados", "Remates", "Remates à baliza",
             "Posse, %", "PPDA"]].rename(columns={
        "Equipa": "adv_nome", "Golos esperados": "xg_contra", "Remates": "remates_contra",
        "Remates à baliza": "remates_baliza_contra", "Posse, %": "posse_adv", "PPDA": "ppda_adv"})
    s = s.merge(adv, on=["Data", "Jogo"])
    s = s[s["Equipa"] != s["adv_nome"]]

    med = {   # media por jogo
        "posse": "Posse, %", "passes": "Passes", "passes_certos": "Passes certos", "passes_pct": "Passes certos, %",
        "xg": "Golos esperados", "remates": "Remates", "remates_baliza": "Remates à baliza",
        "remates_baliza_pct": "Remates à baliza, %", "dist_remate": "Distância média do remate",
        "ppda": "PPDA", "intensidade": "Intensidade de jogo",
        "passe_longo_pct": "% de passe longo", "compr_passe": "Comprimento médio de passes",
        "duelos_pct": "Duelos ganhos, %", "duelos_aereos_pct": "Duelos aéreos ganhos, %", "duelos_aereos": "Duelos aéreos",
        "cruzamentos": "Cruzamentos", "cruz_certos_pct": "Cruzamentos certos, %",
        "bolas_paradas": "Bolas paradas", "bp_remates": "Bolas paradas com remates",
        "cantos": "Cantos", "cantos_remates": "Cantos com remates",
        "livres": "Pontapés livre", "livres_remates": "Pontapés livre com remates",
        "atq_posicional": "Ataques posicionais", "atq_pos_remates": "Ataques posicionais com remates",
        "contra_ataques": "Contra-ataques", "ca_remates": "Contra-ataques com remates",
        "toques_area": "Toques na área", "entradas_area": "Entradas na grande área",
        "faltas": "Faltas", "amarelos": "Cartões amarelos",
        "recuperacoes": "Recuperações", "perdas": "Perdas",
        "passes_frente_pct": "Passes para a frente certos, %", "passes_frente": "Passes para a frente",
        "passes_terco_final": "Passes para terço final",
        "passes_progressivos": "Passes progressivos",
        "xg_contra": "xg_contra", "remates_contra": "remates_contra",
    }
    med = {k: v for k, v in med.items() if v in s.columns}
    som = {"penaltis": "Penaltis", "penaltis_conv": "Penaltis convertidos"}
    som = {k: v for k, v in som.items() if v in s.columns}

    g = s.groupby(["ano", "clube"])
    f = pd.DataFrame({k: g[v].mean() for k, v in med.items()})
    for k, v in som.items():
        f[k] = g[v].sum()
    f["pontos_casa"] = s[s["mando"] == "casa"].groupby(["ano", "clube"])["resultado"].apply(
        lambda x: (x == "V").sum()*3 + (x == "E").sum())
    f["pontos_fora"] = s[s["mando"] == "fora"].groupby(["ano", "clube"])["resultado"].apply(
        lambda x: (x == "V").sum()*3 + (x == "E").sum())
    f["jogos_base"] = g.size()
    return f.reset_index()


def do_tecnico():
    T = pd.read_csv(f"{RAIZ}/dados/serieb_tecnico.csv")
    T["clube"] = T["Equipa dentro de um período de tempo seleccionado"].map(nfc)
    T["min"] = T["Minutos jogados:"]
    linhas = []
    for (ano, clube), d in T.groupby(["ano", "clube"]):
        d = d.sort_values("min", ascending=False)
        tot = d["min"].sum()
        p = d["min"] / tot
        onze = d.head(11)
        val = d["Valor de mercado"]
        linhas.append(dict(
            ano=ano, clube=clube,
            atletas_usados=len(d),
            nucleo_1000=int((d["min"] >= 1000).sum()),
            nucleo_300=int((d["min"] >= 300).sum()),
            conc_hhi=float((p**2).sum()*1000),
            share_11=float(onze["min"].sum()/tot*100),
            idade_pond=float((d["idade_na_temporada"]*d["min"]).sum()/tot),
            idade_11=float((onze["idade_na_temporada"]*onze["min"]).sum()/onze["min"].sum()),
            valor_total=float(val.sum()),
            valor_mediana=float(val.median()) if val.notna().any() else np.nan,
            valor_11=float(onze["Valor de mercado"].sum()),
            valor_com_dado=int(val.notna().sum()),
            golos_cabeca=float(d["Golos de cabeça"].sum()),
            penaltis_marcados=float(d["Penaltis marcados"].sum()),
            golos_sem_penalti=float(d["Golos sem ser por penálti"].sum()),
            golos_tec=float(d["Golos"].sum()),
            estrangeiros=int((d["País de nacionalidade"].map(nfc) != "Brazil").sum()),
            min_estrangeiros=float(d.loc[d["País de nacionalidade"].map(nfc) != "Brazil", "min"].sum()/tot*100),
        ))
    return pd.DataFrame(linhas)


def do_elenco():
    E = pd.read_csv(f"{RAIZ}/dados/serieb_elencos.csv")
    E["clube"] = E["clube"].map(lambda x: TM.get(nfc(x), nfc(x)))
    g = E.groupby(["ano", "clube"])
    f = pd.DataFrame({
        "plantel": g.size(),
        "tm_valor_total": g["valor_eur"].sum(),
        "tm_valor_mediana": g["valor_eur"].median(),
        "tm_idade": g["idade"].mean(),
        "tm_altura": g["altura_m"].mean(),
        "tm_com_valor": g["valor_eur"].count(),
    }).reset_index()
    return f


def montar():
    t = tabelas()
    for parte in (do_jogo(), do_tecnico(), do_elenco()):
        t = t.merge(parte, on=["ano", "clube"], how="left")
    t["xg_saldo"] = t["xg"] - t["xg_contra"]
    t["finalizacao"] = t["GP"]/t["J"] - t["xg"]              # gols acima do esperado, por jogo
    t["defesa_vs_xg"] = t["xg_contra"] - t["GC"]/t["J"]      # gols sofridos abaixo do esperado
    t["gp_jogo"], t["gc_jogo"] = t["GP"]/t["J"], t["GC"]/t["J"]
    t["subiu"] = t["pos"] <= 4
    t["caiu"] = t["pos"] >= 17
    t["faixa"] = np.where(t.pos <= 4, "sobe", np.where(t.pos >= 17, "cai", "meio"))
    return t



# ======================= extras que vem do jogo a jogo =======================

def extras_de_jogo():
    """Clean sheets, jogos sem marcar e goleadas — coisas que so a partida sabe."""
    J = pd.read_csv(f"{RAIZ}/dados/serieb_jogos.csv")
    s = J[(J["Competição"] == "Brazil. Serie B") & J["resultado"].notna()]
    g = s.groupby(["ano", "Equipa"])
    f = pd.DataFrame({
        "clean_sheets": g["golos_contra"].apply(lambda x: int((x == 0).sum())),
        "brancos": g["golos_pro"].apply(lambda x: int((x == 0).sum())),
        "goleadas_pro": g.apply(lambda d: int(((d.golos_pro - d.golos_contra) >= 3).sum()),
                                include_groups=False),
        "goleadas_con": g.apply(lambda d: int(((d.golos_contra - d.golos_pro) >= 3).sum()),
                                include_groups=False),
    }).reset_index().rename(columns={"Equipa": "clube"})
    return f


SETORES = {"GK": "goleiro",
           **{p: "defesa" for p in ("LCB", "RCB", "CB", "LB", "RB", "LWB", "RWB")},
           **{p: "meio" for p in ("DMF", "LDMF", "RDMF", "LCMF", "RCMF", "AMF")}}


def valor_por_setor():
    """Quanto de valor cada clube tinha em cada setor, pela posicao principal do Wyscout.

    O setor sai de `posicao_1` (a primeira da lista do Wyscout). Quem nao e goleiro, zaga,
    lateral nem meio cai em 'ataque' — pontas e centroavantes. E uma simplificacao, e ela
    basta para a pergunta que se faz aqui: o dinheiro rende mais atras ou na frente?
    """
    T = pd.read_csv(f"{RAIZ}/dados/serieb_tecnico.csv")
    T["clube"] = T["Equipa dentro de um período de tempo seleccionado"].map(nfc)
    T["setor"] = T["posicao_1"].map(lambda p: SETORES.get(str(p), "ataque"))
    v = T.pivot_table(index=["ano", "clube"], columns="setor",
                      values="Valor de mercado", aggfunc="sum").fillna(0)
    v.columns = ["val_" + c for c in v.columns]
    return v.reset_index()



# ======================= a segunda camada de perguntas =======================

def extras_profundos():
    """O que as bases dizem alem da media: contra quem se pontua, quando se pontua, quem
    faz o gol, quem defende, e quanto do elenco sobrou do ano passado.

    Tudo aqui e por clube-temporada, e tudo sai das mesmas tres bases. Nenhuma destas
    perguntas precisa de dado novo — precisava so de alguem olhar.
    """
    J = pd.read_csv(f"{RAIZ}/dados/serieb_jogos.csv")
    s = J[(J["Competição"] == "Brazil. Serie B") & J["resultado"].notna()].copy()
    s["clube"] = s["Equipa"].map(nfc)
    s["pts"] = s["resultado"].map({"V": 3, "E": 1, "D": 0})
    s["form"] = s["Sistema"].astype(str).str.replace(r"\s*\(.*", "", regex=True).str.strip()

    tab = tabelas()
    pos = dict(zip(zip(tab.ano, tab.clube), tab.pos))
    s["posAdv"] = [pos.get((a, nfc(c))) for a, c in zip(s.ano, s.adversario)]
    s = s[s.posAdv.notna()]
    s = s.sort_values(["ano", "clube", "Data"])
    s["rod"] = s.groupby(["ano", "clube"]).cumcount() + 1

    linhas = []
    for (ano, clube), d in s.groupby(["ano", "clube"]):
        v, p, rod = d.resultado.tolist(), d.pts.tolist(), d.rod.tolist()
        # aproveitamento contra cada terco da tabela — o adversario, nao o proprio clube
        def aprov(f):
            x = d[f]
            return x.pts.sum() / (len(x) * 3) * 100 if len(x) else np.nan
        # sequencias: a mais longa sem vencer e a mais longa vencendo
        semV = maxSemV = seqV = maxV = 0
        for r in v:
            if r == "V":
                seqV += 1; maxV = max(maxV, seqV); semV = 0
            else:
                semV += 1; maxSemV = max(maxSemV, semV); seqV = 0
        apos = [p[i + 1] for i in range(len(v) - 1) if v[i] == "D"]
        forms = d.form.value_counts()
        linhas.append(dict(
            ano=ano, clube=clube,
            aprovG6=aprov(d.posAdv <= 6), aprovMeio=aprov((d.posAdv > 6) & (d.posAdv < 15)),
            aprovZ6=aprov(d.posAdv >= 15),
            pts1t=int(d[d.rod <= 19].pts.sum()), pts2t=int(d[d.rod > 19].pts.sum()),
            pts10ini=int(d[d.rod <= 10].pts.sum()), pts10fim=int(d[d.rod > max(rod) - 10].pts.sum()),
            maxSemVencer=maxSemV, maxVitorias=maxV,
            ptsAposDerrota=float(np.mean(apos)) if apos else np.nan,
            formacoes=int(d.form.nunique()),
            formPrincipal=forms.index[0] if len(forms) else "",
            formPrincipalPct=float(forms.iloc[0] / len(d) * 100) if len(forms) else np.nan,
        ))
    fora = pd.DataFrame(linhas)

    # --- quem faz o gol, e quem defende ---
    T = pd.read_csv(f"{RAIZ}/dados/serieb_tecnico.csv")
    T["clube"] = T["Equipa dentro de um período de tempo seleccionado"].map(nfc)
    gol = []
    for (ano, clube), d in T.groupby(["ano", "clube"]):
        g = d["Golos"].fillna(0)
        tot = g.sum()
        if tot <= 0:
            gol.append(dict(ano=ano, clube=clube, pctArtilheiro=np.nan, marcadores=0, pctTop3=np.nan))
            continue
        gol.append(dict(ano=ano, clube=clube, pctArtilheiro=float(g.max() / tot * 100),
                        marcadores=int((g > 0).sum()),
                        pctTop3=float(g.sort_values(ascending=False).head(3).sum() / tot * 100)))
    fora = fora.merge(pd.DataFrame(gol), on=["ano", "clube"], how="left")

    # O goleiro do clube e o que mais jogou. Abaixo de 900 minutos nao ha titular claro e a
    # media de defesas vira ruido, entao esses ficam vazios em vez de entrar errados.
    gk = T[T.posicao_1 == "GK"].sort_values("Minutos jogados:", ascending=False)
    gk = gk.groupby(["ano", "clube"]).head(1)
    gk = gk[gk["Minutos jogados:"] >= 900]
    gk = gk[["ano", "clube", "Defesas, %", "Golos expectáveis defendidos por 90´"]].rename(
        columns={"Defesas, %": "gkDefesas", "Golos expectáveis defendidos por 90´": "gkEvitados"})
    fora = fora.merge(gk, on=["ano", "clube"], how="left")

    # --- quanto do elenco sobrou do ano anterior ---
    E = pd.read_csv(f"{RAIZ}/dados/serieb_elencos.csv")
    E["clube"] = E["clube"].map(lambda x: TM.get(nfc(x), nfc(x)))
    elenco = {k: set(d.id_jogador.dropna().astype(int))
              for k, d in E.groupby(["ano", "clube"])}
    cont = []
    for (ano, clube), atual in elenco.items():
        ant = elenco.get((ano - 1, clube))
        cont.append(dict(ano=ano, clube=clube,
                         pctFicou=len(atual & ant) / len(ant) * 100 if ant else np.nan,
                         novos=len(atual - ant) if ant else np.nan))
    return fora.merge(pd.DataFrame(cont), on=["ano", "clube"], how="left")



# ======================= o fisico, do SkillCorner =======================

SKILLCORNER = ("/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/fut/BOTA/"
               "Analytics/Portal Skillcorner/dados/skillcorner.db")
# As edicoes da Serie B no SkillCorner, uma por ano. Sao ids do proprio SkillCorner.
SC_EDICOES = {335: 2022, 446: 2023, 773: 2024, 1061: 2025, 1399: 2026}
SC_METRICAS = ["psv99", "distance_p90", "m_per_min", "running_distance_p90", "hsr_distance_p90",
               "hsr_count_p90", "sprint_distance_p90", "sprint_count_p90", "hi_distance_p90",
               "high_accel_p90", "high_decel_p90", "cod_count_p90"]


def chave_nome(s):
    s = unicodedata.normalize("NFD", str(s)).lower()
    s = "".join(x for x in s if unicodedata.category(x) != "Mn")
    return re.sub(r"[^a-z ]", "", s).strip()


def fisico():
    """Perfil fisico de cada clube-temporada, do SkillCorner, ponderado por minuto rastreado.

    ## O clube vem por PONTE DE NOME + IDADE, e ela foi conferida

    A tabela `physical` do SkillCorner e por atleta x edicao e NAO traz o clube. A tabela
    `physical_match`, que traz, so existe para 2025 e 2026. Entao o clube das cinco
    temporadas vem de casar o `short_name` do SkillCorner com o nome do Wyscout dentro do
    mesmo ano, onde o nome e unico (241 nomes de 3.560 aparecem em mais de um clube no mesmo
    ano e ficam de fora).

    **Nome sozinho nao basta, e isso ja custou caro nesta casa**: no Portal Ranking, o Pedro
    do Flamengo chegou a receber o fisico do Pedro Rodriguez ex-Barcelona, e o Vitinho do
    Botafogo o do Vitinho do Fortaleza. A defesa conhecida e a GUARDA DE IDADE, e e a mesma
    daqui: so casa se a idade do SkillCorner (calculada da data de nascimento, na mesma data
    de referencia do Wyscout) ficar entre 2 anos abaixo e 3 acima da idade do Wyscout. A
    folga e torta de proposito — a idade do Wyscout atrasa para baixo.

    A ponte foi CONFERIDA contra os dois anos em que o SkillCorner diz o clube: dos 1.117
    atletas com clube dos dois lados, **98,2% concordam** (era 98,0% so com o nome, e a
    guarda tirou 14 casamentos duvidosos). Nao e suposicao.

    ## Duas ressalvas que mudam a leitura

    1. **O SkillCorner nao cobre todos os jogos.** A media e de ~15 partidas rastreadas por
       atleta por temporada, nao 38. O perfil e de uma AMOSTRA de jogos, e nao da para somar
       distancia da temporada inteira a partir daqui.
    2. **Entram so atletas com 300+ minutos rastreados.** Abaixo disso a media por 90 vira
       ruido de quem entrou dez minutos.
    """
    if not os.path.exists(SKILLCORNER):
        print("  (skillcorner.db nao encontrado — seguindo sem o fisico)")
        return pd.DataFrame(columns=["ano", "clube"])
    con = sqlite3.connect(SKILLCORNER)
    sc = pd.read_sql(
        "select p.sc_competition_edition_id ed, pl.short_name, pl.birthdate, "
        "p.minutes_played, p.matches, "
        + ", ".join("p." + m for m in SC_METRICAS) +
        " from physical p join players pl on pl.sc_player_id = p.sc_player_id"
        f" where p.sc_competition_edition_id in ({','.join(map(str, SC_EDICOES))})", con)
    sc["ano"] = sc.ed.map(SC_EDICOES)
    sc["min_tot"] = sc.minutes_played * sc.matches

    T = pd.read_csv(f"{RAIZ}/dados/serieb_tecnico.csv")
    T["cl"] = T["Equipa dentro de um período de tempo seleccionado"].map(nfc)
    T["k"] = T.Jogador.map(chave_nome)
    ponte = {}
    for (a, k), g in T.groupby(["ano", "k"]):
        if g.cl.nunique() != 1:
            continue
        idades = g.idade_na_temporada.dropna()
        ponte[(a, k)] = (g.cl.iloc[0], float(idades.iloc[0]) if len(idades) else None)

    def idade_sc(nasc, ano):
        """Idade em 11 de setembro daquele ano — a mesma referencia da idade do Wyscout."""
        if not isinstance(nasc, str) or len(nasc) < 10:
            return None
        n = dt.date(int(nasc[:4]), int(nasc[5:7]), int(nasc[8:10]))
        r = dt.date(ano, 9, 11)
        return r.year - n.year - ((r.month, r.day) < (n.month, n.day))

    clubes = []
    for ano, nome, nasc in zip(sc.ano, sc.short_name, sc.birthdate):
        v = ponte.get((ano, chave_nome(nome)))
        if not v:
            clubes.append(None)
            continue
        clube, iw = v
        i = idade_sc(nasc, ano)
        # guarda de idade: 2 anos abaixo, 3 acima. Fora disso e homonimo, nao a mesma pessoa.
        if i is not None and iw is not None and not (-2 <= i - iw <= 3):
            clubes.append(None)
            continue
        clubes.append(clube)
    sc["clube"] = clubes
    sc = sc[sc.clube.notna() & (sc.min_tot >= 300)]

    linhas = []
    for (ano, clube), d in sc.groupby(["ano", "clube"]):
        linha = {"ano": ano, "clube": clube, "fis_atletas": len(d),
                 "fis_minutos": float(d.min_tot.sum())}
        for m in SC_METRICAS:
            linha["fis_" + m] = float(np.average(d[m], weights=d.min_tot))
        linhas.append(linha)
    return pd.DataFrame(linhas)


def base():
    t = montar()
    for parte in (extras_de_jogo(), valor_por_setor(), extras_profundos(), fisico()):
        t = t.merge(parte, on=["ano", "clube"], how="left")
    setores = [c for c in t.columns if c.startswith("val_")]
    tot = t[setores].sum(axis=1)
    for c in setores:
        t["sh_" + c[4:]] = t[c] / tot * 100
    t["xg_por_remate"] = t["xg"] / t["remates"]
    t["xg_por_remate_contra"] = t["xg_contra"] / t["remates_contra"]
    t["xg_saldo"] = t["xg"] - t["xg_contra"]
    t["bp_conv"] = t["bp_remates"] / t["bolas_paradas"] * 100
    return t


# ======================= o relatorio =======================

def posto(c, f, asc=False):
    """Posto dentro da temporada. asc=True quando MENOS e melhor (gols sofridos)."""
    return c.groupby("ano")[f].rank(ascending=asc)


def rho(c, f, asc=False):
    return float(np.corrcoef(posto(c, f, asc), c.groupby("ano")["pos"].rank())[0, 1])


INDICADORES = [
    ("pontos em casa", "pontos_casa", False), ("pontos fora", "pontos_fora", False),
    ("gols sofridos", "gc_jogo", True), ("gols marcados", "gp_jogo", False),
    ("jogos sem marcar", "brancos", True), ("clean sheets", "clean_sheets", False),
    ("valor na defesa", "val_defesa", False), ("xG sofrido", "xg_contra", True),
    ("distância do remate", "dist_remate", True),
    ("% dos minutos nos 11 mais usados", "share_11", False),
    ("xG criado", "xg", False), ("atletas usados", "atletas_usados", True),
    ("valor do elenco", "tm_valor_total", False),
    ("bola parada vira remate, %", "bp_conv", False),
    ("gols de cabeça", "golos_cabeca", False), ("toques na área", "toques_area", False),
    ("valor no meio", "val_meio", False),
    ("duelos aéreos ganhos, %", "duelos_aereos_pct", False),
    ("remates à baliza, %", "remates_baliza_pct", False),
    ("PPDA (pressão alta)", "ppda", True), ("valor no ataque", "val_ataque", False),
    ("fatia do valor no ataque", "sh_ataque", False),
    ("fatia do valor na defesa", "sh_defesa", False),
    ("cruzamentos certos, %", "cruz_certos_pct", False), ("posse", "posse", False),
    ("% de minutos com estrangeiros", "min_estrangeiros", False),
    ("passe certo, %", "passes_pct", False), ("idade do time", "idade_pond", True),
]


def relatorio(t):
    c = t[t.ano <= 2025]
    faixa = lambda f, r=2: c.groupby("faixa")[f].mean().reindex(["sobe", "meio", "cai"]).round(r)
    linha = lambda rot, f, r=2: print(f"  {rot:<34}" + "".join(f"{v:>10.{r}f}" for v in faixa(f, r)))

    print("=" * 78)
    print(f"SERIE B 2022-2025 · {len(c)} clube-temporada · sobe = 1o ao 4o · cai = 17o ao 20o")
    print("=" * 78)

    print("\n-- o xG do Wyscout na Serie B (ele supera o gol real; use a ORDEM, nao o nivel)")
    for ano, d in c.groupby("ano"):
        print(f"   {ano}: gols/jogo {d.gp_jogo.mean():.2f} · xG/jogo {d.xg.mean():.2f} "
              f"· razao {d.gp_jogo.mean()/d.xg.mean():.3f}")

    print("\n" + "-" * 78)
    print(f"{'':34}{'SOBE':>10}{'MEIO':>10}{'CAI':>10}")
    print("-" * 78)
    print("\n ATAQUE")
    for rot, f, r in [("gols por jogo", "gp_jogo", 2), ("xG por jogo", "xg", 2),
                      ("remates por jogo", "remates", 2), ("xG por remate", "xg_por_remate", 3),
                      ("remates a baliza, %", "remates_baliza_pct", 1),
                      ("distancia media do remate (m)", "dist_remate", 1),
                      ("toques na area", "toques_area", 1),
                      ("jogos sem marcar (em 38)", "brancos", 1),
                      ("vitorias por 3+ de diferenca", "goleadas_pro", 1)]:
        linha(rot, f, r)
    print("\n DEFESA")
    for rot, f, r in [("gols sofridos por jogo", "gc_jogo", 2),
                      ("xG sofrido por jogo", "xg_contra", 2),
                      ("remates sofridos", "remates_contra", 2),
                      ("xG por remate sofrido", "xg_por_remate_contra", 3),
                      ("clean sheets (em 38)", "clean_sheets", 1),
                      ("derrotas por 3+ de diferenca", "goleadas_con", 1),
                      ("PPDA (menor = pressiona mais alto)", "ppda", 1)]:
        linha(rot, f, r)
    print("\n BOLA PARADA")
    for rot, f, r in [("bolas paradas por jogo", "bolas_paradas", 1),
                      ("viram remate, %", "bp_conv", 1), ("cantos por jogo", "cantos", 1),
                      ("gols de cabeca na temporada", "golos_cabeca", 1),
                      ("penaltis convertidos", "penaltis_conv", 1)]:
        linha(rot, f, r)
    print("\n ELENCO")
    for rot, f, r in [("valor total (EUR mi)", "tm_valor_total", 0),
                      ("valor na defesa (EUR mi)", "val_defesa", 0),
                      ("valor no ataque (EUR mi)", "val_ataque", 0),
                      ("fatia do valor na defesa, %", "sh_defesa", 1),
                      ("fatia do valor no ataque, %", "sh_ataque", 1),
                      ("atletas usados", "atletas_usados", 1),
                      ("% dos minutos nos 11 mais usados", "share_11", 1),
                      ("idade media ponderada por minuto", "idade_pond", 1),
                      ("% de minutos com estrangeiros", "min_estrangeiros", 1)]:
        if f.startswith(("tm_valor", "val_")):
            v = faixa(f, 0) / 1e6
            print(f"  {rot:<34}" + "".join(f"{x:>10.1f}" for x in v))
        else:
            linha(rot, f, r)
    print("\n MANDO")
    for rot, f in [("pontos em casa (19 jogos)", "pontos_casa"), ("pontos fora (19 jogos)", "pontos_fora")]:
        linha(rot, f, 1)

    print("\n" + "-" * 78)
    print(" DE ONDE VEM A VANTAGEM (quem sobe x quem cai, decomposto)")
    print("-" * 78)
    s, k = c[c.faixa == "sobe"].mean(numeric_only=True), c[c.faixa == "cai"].mean(numeric_only=True)
    pc = lambda a, b: (a / b - 1) * 100
    print(f"  ataque:  remates {pc(s.remates, k.remates):+.1f}%  ->  xG por remate "
          f"{pc(s.xg_por_remate, k.xg_por_remate):+.1f}%  ->  xG {pc(s.xg, k.xg):+.1f}%  "
          f"->  GOLS {pc(s.gp_jogo, k.gp_jogo):+.1f}%")
    print(f"  defesa:  remates sofridos {pc(s.remates_contra, k.remates_contra):+.1f}%  ->  "
          f"xG por remate {pc(s.xg_por_remate_contra, k.xg_por_remate_contra):+.1f}%  ->  "
          f"xG sofrido {pc(s.xg_contra, k.xg_contra):+.1f}%  ->  GOLS SOFRIDOS "
          f"{pc(s.gc_jogo, k.gc_jogo):+.1f}%")
    print("  (a distancia entre o xG e o gol e a finalizacao — e ela e a maior parte do vao)")

    print("\n" + "-" * 78)
    print(" A FINALIZACAO SE REPETE NO ANO SEGUINTE? (mesmo clube, temporadas seguidas)")
    print("-" * 78)
    c = c.copy()
    c["fin"] = (c.gp_jogo - c.xg) * c.J
    c["defx"] = (c.xg_contra - c.gc_jogo) * c.J
    pares = []
    for clube, d in c.groupby("clube"):
        d = d.sort_values("ano")
        for i in range(len(d) - 1):
            if d.iloc[i + 1].ano == d.iloc[i].ano + 1:
                pares.append((d.iloc[i].fin, d.iloc[i + 1].fin, d.iloc[i].defx,
                              d.iloc[i + 1].defx, d.iloc[i].xg_saldo, d.iloc[i + 1].xg_saldo))
    P = pd.DataFrame(pares, columns=["f0", "f1", "d0", "d1", "x0", "x1"])
    print(f"  {len(P)} pares de temporadas consecutivas")
    for a, b, rot in [("f0", "f1", "finalizacao (gols - xG)"),
                      ("d0", "d1", "defesa alem do xG (xG sofrido - gols sofridos)"),
                      ("x0", "x1", "saldo de xG (criar - conceder)")]:
        print(f"    {rot:<46} r = {np.corrcoef(P[a], P[b])[0, 1]:+.2f}")

    print("\n" + "-" * 78)
    print(" O QUE MAIS ANDA JUNTO COM A POSICAO FINAL (posto x posto, 1 = perfeito)")
    print("-" * 78)
    for rot, f, asc in sorted(INDICADORES, key=lambda x: -abs(rho(c, x[1], x[2]))):
        v = rho(c, f, asc)
        print(f"  {rot:<34} {v:+.2f}  {'#' * int(abs(v) * 28)}")

    print("\n" + "-" * 78)
    print(" TOP-4 DE CADA METRICA x QUEM SUBIU DE FATO (16 acessos possiveis)")
    print("-" * 78)
    for rot, f, asc in [("saldo de gols", "SG", False), ("gols marcados", "GP", False),
                        ("valor do elenco", "tm_valor_total", False),
                        ("gols sofridos", "GC", True), ("clean sheets", "clean_sheets", False),
                        ("saldo de xG", "xg_saldo", False),
                        ("concentracao de minutos", "share_11", False)]:
        n = sum(len(set(g.nsmallest(4, f).clube if asc else g.nlargest(4, f).clube)
                    & set(g.nsmallest(4, "pos").clube)) for _, g in c.groupby("ano"))
        print(f"  top-4 de {rot:<24} -> {n:>2} dos 16")


if __name__ == "__main__":
    import sys
    t = base()
    if "--csv" in sys.argv:
        t.to_csv(f"{RAIZ}/dados/serieb_clube_temporada.csv", index=False, encoding="utf-8-sig")
        print(f"gravado dados/serieb_clube_temporada.csv ({len(t)} linhas, {len(t.columns)} colunas)\n")
    relatorio(t)
