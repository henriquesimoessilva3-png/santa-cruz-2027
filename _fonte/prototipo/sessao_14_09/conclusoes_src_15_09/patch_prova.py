# patch_prova - adapta o sp7_prova.py à régua final de 15/09 sem tirar nenhuma conferência que ele já fazia:
# lê os arquivos de uma pasta escolhida (PROVA_DIR), a ordem e as declarações novas; J17 passa a ser moderada pela
# declarada; acrescenta (1) a régua escrita em palavras, reimplementada à parte, conferindo o selo de toda conclusão da
# régua comum; (2) as linhas refeitas a partir dos papéis; (3) a proibição de critério, lacuna ou frase de dinheiro e de
# ano seguinte; (4) a contagem de 15/09 e a tabela antes → depois.
P = open("sp7_prova.py", encoding="utf-8").read()

def troca(a, b):
    global P
    if P.count(a) != 1:
        raise SystemExit(f"prova: esperado 1, achei {P.count(a)}: {a[:80]}")
    P = P.replace(a, b)

troca('import json, re, sys, math\n', 'import json, re, sys, math, os\n')
troca('from sp6_base import R, S, resolver, FORMATOS\n', 'from sp6_base import R, S, SESSAO, resolver, FORMATOS\n\nDIR = os.environ.get("PROVA_DIR") or (R + "_fonte/prototipo/")\n')
troca('DOC = open(R + "_fonte/prototipo/CONCLUSOES.md", encoding="utf-8").read()', 'DOC = open(DIR + "CONCLUSOES.md", encoding="utf-8").read()')
troca('SPEC = json.load(open(R + "_fonte/prototipo/conclusoes_spec.json", encoding="utf-8"))', 'SPEC = json.load(open(DIR + "conclusoes_spec.json", encoding="utf-8"))')
troca('ORDEM = json.load(open(S + "ordem_gerador_bloco2.json", encoding="utf-8"))', 'ORDEM = json.load(open(SESSAO + "ordem_gerador_bloco2.json", encoding="utf-8"))')
troca('DECL = json.load(open(S + "declaracoes_novas.json", encoding="utf-8"))', 'DECL = json.load(open(SESSAO + "declaracoes_novas.json", encoding="utf-8"))')
troca('    xs = list(v.values()) if isinstance(v, dict) else list(v)\n    if ag == "todos":',
      '    xs = list(v.values()) if isinstance(v, dict) else list(v)\n    if ag in ("min", "max") and any(isinstance(x, list) for x in xs):\n        xs = [y for x in xs for y in (x if isinstance(x, list) else [x])]\n    if ag == "todos":')
troca('             r"é o que o (elenco caro|valor)( do elenco)? já prevê", r"é o mesmo dinheiro", r"visto por setor", r"não distinguiu", r"não se distingue", r"mais e mais rápido"]',
      '             r"é o que o (elenco caro|valor)( do elenco)? já prevê", r"é o mesmo dinheiro", r"visto por setor", r"não distinguiu", r"não se distingue", r"mais e mais rápido",\n'
      '             r"descontad[oa]s? o dinheiro", r"desconto do dinheiro", r"(elencos?|times?) de valor( de elenco)? parecido", r"valor e (de )?rodízio parecido", r"mesmo clube repet",\n'
      '             r"dificilmente é sorte", r"descontad[oa]s? o valor", r"descontados valor", r"sobrevive ao dinheiro", r"resiste ao dinheiro", r"some no dinheiro", r"logo abaixo do corte"]\n'
      'PROIBIDAS_ANO_SEGUINTE = [r"ano seguinte", r"de um ano para o outro"]\n'
      'ASSUNTO_REPETICAO = {"FIS-07", "M1", "M6", "M7", "ELE-06"}\n'
      'CAMPO_PROIBIDO = re.compile(r"p_liq|liq2|etapa_6\\.rho\\.|cobertura_do_valor|p_valor_descontada|p_permutacao|razao_verossimilhanca|trocam_no_dinheiro|desconto_dinheiro|residualizado|q_das_sobreviventes|menor_p_liq|p_liquido|p_aproveitamento_descontado_valor")')
troca('        for p in PROIBIDAS:\n            if campo != "tecnico" and re.search(p, texto_ok, re.I):\n                F(f"{i}: palavra proibida \'{p}\' em {campo}")',
      '        for p in PROIBIDAS:\n            if campo != "tecnico" and re.search(p, texto_ok, re.I):\n                F(f"{i}: palavra proibida \'{p}\' em {campo}")\n'
      '        if i not in ASSUNTO_REPETICAO:\n            for p in PROIBIDAS_ANO_SEGUINTE:\n                if re.search(p, texto_ok, re.I):\n                    F(f"{i}: \'{p}\' fora de conclusão cujo assunto é a repetição ({campo})")')
troca('    for n, l in c["lacunas"].items():\n        if l.get("ja_gravado_no_json"):',
      '    for n, l in c["lacunas"].items():\n        if CAMPO_PROIBIDO.search(json.dumps(l, ensure_ascii=False)):\n            F(f"{i}: lacuna {n} lê campo do dinheiro ou do ano seguinte: {l}")\n        if l.get("ja_gravado_no_json"):')
troca('    # forma de máquina: cada critério, recalculado\n    ids = set()\n    for n_, k in enumerate(c["criterios_do_selo"]):',
      '    # forma de máquina: cada critério, recalculado\n    ids = set()\n    for n_, k in enumerate(c["criterios_do_selo"]):\n        if CAMPO_PROIBIDO.search(str(k.get("caminho")) + " " + str(k.get("subcampo"))):\n            F(f"{i} {k.get(\'id\')}: critério lê campo do dinheiro ou do ano seguinte ({k.get(\'caminho\')})")\n        if re.search(r"dinheiro|valor parecido|ano seguinte|mesmo clube", k["criterio"], re.I):\n            F(f"{i} {k.get(\'id\')}: critério escrito com dinheiro ou ano seguinte: {k[\'criterio\']}")')

old_j17 = '''j17 = next(c for c in SPEC["conclusoes"] if c["id"] == "J17")
if not j17["comparacao_declarada_antes"] or j17["forca_esperada_hoje"] != "fraco" or "quem sobe" not in j17["molde"]["titulo"]:
    F("J17: o título tem de ser a comparação declarada (quem sobe contra quem cai), com selo fraco")'''
troca(old_j17, '''j17 = next(c for c in SPEC["conclusoes"] if c["id"] == "J17")
if not j17["comparacao_declarada_antes"] or j17["forca_esperada_hoje"] != "moderado" or "quem sobe" not in j17["molde"]["titulo"]:
    F("J17: o título tem de ser a comparação declarada (quem sobe contra quem cai), com selo moderado (firme por pouco com uma conferência só, resposta a do dono)")

# ------------------------------------------------------------ 2b. régua final de 15/09, reescrita aqui em palavras (não importa o sp6_maquina)
def linhas_da_regua(pp, decl_const):
    um = lambda n: pp[n][0] if n in pp else None
    d, p = um("declarada"), um("p")
    rows = []
    if "zona" in pp:
        rows += [("sem_sinal", {p: False, um("zona"): False}), ("sem_sinal", {p: False, um("zona"): True, um("outra"): False}), ("fraco", {p: False, um("zona"): True, um("outra"): True})]
    base = {p: True}
    if "rod" in pp:
        rows.append(("fraco", {p: True, um("rod"): False})); base[um("rod")] = True
    lista = um("lista")
    if decl_const is not True:
        rows += [("moderado", {d: False, **base, lista: True}), ("fraco", {d: False, **base, lista: False})] if lista else [("fraco", {d: False, **base})]
    if decl_const is not False:
        dd = {d: True, **base}; q = um("q")
        forte = {**dd, q: True, um("ha_conf"): True, **{x: True for x in pp.get("conf", [])}}
        rows += [("forte", {**forte, um("q_folga"): True}), ("forte", {**forte, um("uma_conf"): False}), ("moderado", {**dd, q: True})]
        rows += [("moderado", {**dd, q: False, lista: True}), ("fraco", {**dd, q: False, lista: False})] if lista else [("fraco", {**dd, q: False})]
    return rows

def selo_em_palavras(pa, pp, decl_const):
    """a régua como está escrita no documento, sem olhar as linhas geradas."""
    v = lambda n: (all(pa[x] for x in pp[n]) if n in pp else None)
    if "zona" in pp and not v("p"):
        if not v("zona"):
            return "sem_sinal"
        return "fraco" if v("outra") else "sem_sinal"
    if not v("p"):
        return None
    if "rod" in pp and not v("rod"):
        return "fraco"
    if decl_const is False:
        return "moderado" if (v("lista") if "lista" in pp else False) else "fraco"
    if v("q"):
        conferencias_ok = all(pa[x] for x in pp.get("conf", []))
        if v("ha_conf") and conferencias_ok and (v("q_folga") or not v("uma_conf")):
            return "forte"
        return "moderado"
    return "moderado" if ("lista" in pp and v("lista")) else "fraco"

regua_comum = 0
for c in SPEC["conclusoes"]:
    er = c.get("entradas_da_regua")
    if c.get("regime") is None:
        F(f"{c['id']}: sem regime")
    if not er or er.get("regime") != "comum":
        continue
    regua_comum += 1
    pa = {k["id"]: k["passou"] for k in c["criterios_do_selo"]}
    papel_crit = {k["id"]: k.get("papel") for k in c["criterios_do_selo"]}
    for papel, kids in er["papeis"].items():
        for kid in kids:
            if papel_crit.get(kid) != papel:
                F(f"{c['id']}: {kid} com papel {papel_crit.get(kid)} no critério e {papel} nas entradas")
    esperado = [{"selo": s, "exige": ex} for s, ex in linhas_da_regua(er["papeis"], er["declarada_constante"])]
    if esperado != c["regra_maquina"]["ordem"]:
        F(f"{c['id']}: linhas da regra_maquina diferentes das refeitas a partir dos papéis")
    s_pal = selo_em_palavras(pa, er["papeis"], er["declarada_constante"])
    if s_pal != c["forca_esperada_hoje"]:
        F(f"{c['id']}: a régua em palavras dá {s_pal}, o spec diz {c['forca_esperada_hoje']}")
    if er["declarada_constante"] is not False:
        confs = er["papeis"].get("conf", [])
        ha = pa[er["papeis"]["ha_conf"][0]]
        if bool(confs) != bool(ha):
            F(f"{c['id']}: constante 'há conferência testável' ({ha}) não bate com os critérios de conferência ({confs})")''')

troca('ref = SPEC["contagem_de_selos_referencia_14_09"]', 'ref = SPEC["contagem_de_selos_referencia_15_09"]')
troca('if "J17" in json.dumps(SPEC["regua"]["comparacao_escolhida_depois_de_olhar"]["efeito_por_conclusao"].get("J17", "")) and "moderado" in SPEC["regua"]["comparacao_escolhida_depois_de_olhar"]["efeito_por_conclusao"]["J17"].split("(")[0]:\n    F("spec: efeito_por_conclusao da J17 ainda diz moderado")',
      'if "firme por pouco" not in SPEC["regua"]["comparacao_escolhida_depois_de_olhar"]["efeito_por_conclusao"].get("J17", ""):\n    F("spec: efeito_por_conclusao da J17 tem de dizer o moderado por firme por pouco com uma conferência só")\n'
      'for chave in ("sem_conferencia_testavel", "firme_por_pouco", "saiu_da_regua_em_15_09", "vocabulario_sorte", "ressalva_sem_desconto", "regime_comum"):\n    if chave not in SPEC["regua"]:\n        F(f"spec: régua sem {chave}")\n'
      'for frase in ("sem conferência testável é MODERADO, nunca FORTE", "firme por pouco (q entre 0,025 e 0,05) com uma conferência só é\\n  MODERADO", "o desconto pelo valor do elenco", "o mesmo clube repete o número no ano seguinte"):\n    if frase not in DOC:\n        F(f"documento: a régua não diz com todas as letras: {frase[:60]}")\n'
      'mud = SPEC.get("mudancas_de_selo_15_09") or []\n'
      'for m_ in mud:\n    if not re.search(r"^\\| " + re.escape(m_["id"]) + r" \\|", DOC, re.M):\n        F(f"documento: tabela antes → depois sem a linha da {m_[\'id\']}")')
troca('print(f"cinco quando a ordem de serviço for gravada: {depois}")', 'print(f"cinco quando a ordem de serviço for gravada: {depois}")\nprint(f"régua comum conferida em palavras e pelas linhas refeitas: {regua_comum} conclusões; mudanças de selo na tabela: {len(mud)}")')

open("sp7_prova.py", "w", encoding="utf-8").write(P)
print("prova ok")
