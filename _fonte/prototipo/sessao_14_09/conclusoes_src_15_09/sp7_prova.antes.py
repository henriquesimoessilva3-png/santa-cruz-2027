# sp7_prova - prova, lendo os arquivos do disco, que CONCLUSOES.md e conclusoes_spec.json batem id a id
# (selo, título, frase, número, o que não quer dizer, universo, critérios do selo), que o selo de cada conclusão SAI da
# forma de máquina (critério → passou → regra ordenada) e que a ordem de serviço cobre todo campo não gravado, em leitura
# estrita (nome final do campo no caminho, no formato ou no de_onde_sai). Não importa os arquivos de tema nem o sp6_maquina:
# o avaliador aqui é escrito de novo, para a prova não repetir o erro de quem montou.
import json, re, sys, math
sys.dont_write_bytecode = True
from sp6_base import R, S, resolver, FORMATOS

DOC = open(R + "_fonte/prototipo/CONCLUSOES.md", encoding="utf-8").read()
SPEC = json.load(open(R + "_fonte/prototipo/conclusoes_spec.json", encoding="utf-8"))
ORDEM = json.load(open(S + "ordem_gerador_bloco2.json", encoding="utf-8"))
DECL = json.load(open(S + "declaracoes_novas.json", encoding="utf-8"))
MARC = re.compile(r"\{([a-zA-Z0-9_]+)\}")
TAG = {"forte": "FORTE", "moderado": "MODERADO", "fraco": "FRACO", "sem_sinal": "SEM SINAL", "nao_da_para_afirmar": "NÃO DÁ PARA AFIRMAR"}
ORD = ["forte", "moderado", "fraco", "sem_sinal", "nao_da_para_afirmar"]
falhas = []

def F(msg):
    falhas.append(msg)

def render(t, val):
    return MARC.sub(lambda m: val.get(m.group(1), "<<SEM " + m.group(1) + ">>"), t)

# ------------------------------------------------------------ 0. avaliador independente da forma de máquina
def efetivos(k):
    c = k.get("caminho")
    if not c:
        return []
    f, sub = k.get("filtro"), k.get("subcampo")
    subs = sub if isinstance(sub, list) else ([sub] if sub else [None])
    if not f or f.get("tipo") == "condicao":
        bases = [(None, c)]
    elif f["tipo"] == "lista":
        bases = [(v, "%s[%s=%s]" % (c, f["chave"], v)) for v in f["valores"]]
    elif f["tipo"] == "dicionario":
        bases = [(v, "%s.%s" % (c, v)) for v in f["valores"]]
    else:
        F(f"filtro de tipo desconhecido {f}")
        bases = []
    return [((r, s_), b + ("." + s_ if s_ else "")) for r, b in bases for s_ in subs]

def ler(k):
    ef = efetivos(k)
    if ef and all(resolver(p)[0] for _, p in ef):
        if len(ef) == 1:
            return True, resolver(ef[0][1])[1]
        return True, {"|".join(str(x) for x in r if x is not None): resolver(p)[1] for r, p in ef}
    return False, k.get("valor_num_14_09", "<<SEM VALOR>>")

def aval(k, v):
    op, lim, ag = k["operador"], k["limiar"], k["agregacao"]
    if op == "existe":
        return v is not None
    if v is None:
        return op == "==" and lim is None
    def cmp(x):
        if x is None:
            return False
        return {"<": lambda: x < lim, "<=": lambda: x <= lim, ">": lambda: x > lim, ">=": lambda: x >= lim, "==": lambda: x == lim,
                "cruza_zero": lambda: x[0] <= 0 <= x[1], "acima_de_zero": lambda: x[0] > 0}[op]()
    if ag == "contagem_por_ano_todos":
        if isinstance(v, list) and v and isinstance(v[0], dict):
            fl = k["filtro"]; cont = {}
            for e in v:
                cont[e["ano"]] = cont.get(e["ano"], 0) + (1 if e[fl["campo"]] <= fl["ate"] else 0)
            v = [cont[a] for a in sorted(cont)]
        return all(cmp(x) for x in v)
    eh_intervalo = op in ("cruza_zero", "acima_de_zero") and isinstance(v, list) and len(v) == 2 and not isinstance(v[0], (list, dict))
    if ag in ("valor", "fracao") or not isinstance(v, (list, dict)) or eh_intervalo:
        return cmp(v)
    xs = list(v.values()) if isinstance(v, dict) else list(v)
    if ag == "todos":
        return all(cmp(x) for x in xs)
    if ag == "algum":
        return any(cmp(x) for x in xs)
    if ag == "min":
        return cmp(min(xs))
    if ag == "max":
        return cmp(max(xs))
    if ag == "bh":
        ps = sorted(xs)
        return cmp(min(p * len(ps) / (i + 1) for i, p in enumerate(ps)))
    F(f"agregação desconhecida {ag}")
    return None

# ------------------------------------------------------------ 1. o documento, lido sem saber nada do spec
HDR = re.compile(r"^\*\*\[(FORTE|MODERADO|FRACO|SEM SINAL|NÃO DÁ PARA AFIRMAR)\] (\S+) · (.*)\*\*\s*$")
doc_blocos, cur, doc_ids = {}, None, []
for ln in DOC.split("\n"):
    m = HDR.match(ln)
    if m:
        cur = m.group(2); doc_ids.append(cur)
        doc_blocos[cur] = {"tag": m.group(1), "titulo": m.group(3), "linhas": []}
        continue
    if ln.startswith("---") or ln.startswith("## "):
        cur = None; continue
    if cur is not None and ln.strip():
        doc_blocos[cur]["linhas"].append(ln.rstrip())

def campos_doc(b):
    out = {"corpo": b["linhas"][0] if b["linhas"] else None}
    pref = {"ressalva": "*O que isso não quer dizer:* ", "euros": "*Em euros (descrição desta conclusão, mesmo selo):* ", "universo": "*Universo:* ", "criterios": "*Critérios do selo:* ", "tecnico": "<sub>Na tela, em letra pequena: "}
    for ln in b["linhas"][1:]:
        for k, p in pref.items():
            if ln.startswith(p):
                out[k] = ln[len(p):]
                if k == "tecnico":
                    out[k] = out[k][:-len("</sub>")]
    return out

# ------------------------------------------------------------ 2. comparação id a id + selo pela máquina
spec_ids = [c["id"] for c in SPEC["conclusoes"]]
if spec_ids != doc_ids:
    F(f"ids/ordem diferentes: só no spec {sorted(set(spec_ids) - set(doc_ids))}, só no doc {sorted(set(doc_ids) - set(spec_ids))}")
ID_RE = re.compile(r"\b(DIN|ELE|FIS|ORI)-\d\d\b|\b[JAM]\d{1,2}\b")
UNIDADES = re.compile(r"(de|em) cada 100\b|\bem 100\b|intervalo de 95%")
PROIBIDAS = [r"não separa\b", r"orçamento", r"\bG4\b", r"ρ", r"\brho\b", r"sinal mais sólido", r"quase sempre", r"três sinais fortes", r"é o elenco caro que vem junto",
             r"em boa parte", r"período antigo", r"período recente", r"\bgast", r"\bcusta\b", r"leia esses selos como provisórios",
             r"é o que o (elenco caro|valor)( do elenco)? já prevê", r"é o mesmo dinheiro", r"visto por setor", r"não distinguiu", r"não se distingue", r"mais e mais rápido"]
PERMITIDO_NULO = {"DIN-06", "J12", "A5", "M1", "M3", "M7"}
comparados = criterios_maquina = 0
for c in SPEC["conclusoes"]:
    i = c["id"]; b = doc_blocos.get(i)
    if not b:
        continue
    val = c["valores_14_09"]; m = c["molde"]
    if TAG[c["forca_esperada_hoje"]] != b["tag"]:
        F(f"{i}: selo doc {b['tag']} ≠ spec {c['forca_esperada_hoje']}")
    t = render(m["titulo"], val); t = t if t[-1] in "?!." else t + "."
    if t != b["titulo"]:
        F(f"{i}: título difere\n  doc : {b['titulo']}\n  spec: {t}")
    d = campos_doc(b)
    corpo = render(m["frase"], val) + ((" " + render(m["numero"], val)) if m["numero"] else "")
    if d["corpo"] != corpo:
        F(f"{i}: frase+número difere")
    ress = render(m["ressalva"], val)
    ress = ress[len("Não quer dizer "):] if ress.startswith("Não quer dizer ") else ress
    if d.get("ressalva") != ress:
        F(f"{i}: 'o que não quer dizer' difere")
    if d.get("universo") != render(c["universo"], val) + ".":
        F(f"{i}: universo difere")
    crit = " · ".join(f"{k['criterio']} — {k['valor_14_09']} — {({True: 'passa', False: 'não passa', None: 'não se aplica'})[k['passou']]}" + ("" if k["decide"] else " (não decide o selo)") for k in c["criterios_do_selo"]) + "."
    if d.get("criterios") != crit:
        F(f"{i}: critérios do selo diferem")
    if m.get("descricao_em_euros") and d.get("euros") != render(m["descricao_em_euros"], val):
        F(f"{i}: descrição em euros difere")
    if (m.get("tecnico") or "") != "" and d.get("tecnico") != render(m["tecnico"], val):
        F(f"{i}: técnico difere")
    comparados += 1
    # moldes
    usados = set()
    for campo, txt in list(m.items()) + [("universo", c["universo"])]:
        for mk in MARC.findall(txt or ""):
            usados.add(mk)
            if mk not in c["lacunas"]:
                F(f"{i}: marcador {mk} sem lacuna ({campo})")
            if mk not in val:
                F(f"{i}: marcador {mk} sem valor ({campo})")
        limpo = UNIDADES.sub("", ID_RE.sub("", MARC.sub("", txt or "")))
        if re.search(r"\d", limpo):
            F(f"{i}: número digitado no molde {campo}: {re.findall(r'.{0,20}[0-9].{0,20}', limpo)}")
        texto_ok = re.sub(r"não é folha nem gasto|não é quanto se gastou|não é custo", "", render(txt or "", val))
        for p in PROIBIDAS:
            if campo != "tecnico" and re.search(p, texto_ok, re.I):
                F(f"{i}: palavra proibida '{p}' em {campo}")
    for n in c["lacunas"]:
        if n not in usados:
            F(f"{i}: lacuna sem uso {n}")
    for n, l in c["lacunas"].items():
        if l.get("ja_gravado_no_json"):
            ok, v = resolver(l["caminho"])
            if not ok:
                F(f"{i}: lacuna gravada {n} não resolve: {l['caminho']}")
            elif FORMATOS[l["formato"]](v) != val.get(n):
                F(f"{i}: lacuna gravada {n}: JSON dá {FORMATOS[l['formato']](v)!r}, documento {val.get(n)!r}")
        elif not (l.get("campo") or l.get("derivado")):
            F(f"{i}: lacuna não gravada {n} sem campo nem derivação")
        if l.get("campo") and ("[]" in l["campo"] or "<" in l["campo"]) and re.fullmatch(r"[A-Za-z0-9_]+", (l.get("como") or "").strip()):
            F(f"{i}: lacuna {n} com notação de lista ({l['campo']}) e identificador simples no 'como'")
    if c["p_principal"]["caminho"] is None and i not in PERMITIDO_NULO:
        F(f"{i}: p_principal nulo sem estar na lista permitida")
    if not c["universo"]:
        F(f"{i}: sem universo")
    # forma de máquina: cada critério, recalculado
    ids = set()
    for n_, k in enumerate(c["criterios_do_selo"]):
        if k.get("id") != f"k{n_}":
            F(f"{i}: critério {n_} sem id k{n_}")
        ids.add(k.get("id"))
        if k["caminho"] is None:
            if "constante" not in k:
                F(f"{i} {k.get('id')}: caminho null sem 'constante'")
            elif k["constante"] != k["passou"]:
                F(f"{i} {k.get('id')}: constante {k['constante']} ≠ passou {k['passou']}")
            continue
        if "<" in k["caminho"] or "[]" in k["caminho"]:
            F(f"{i} {k['id']}: caminho com notação de molde ({k['caminho']}); use filtro/subcampo")
        if k.get("so_descricao"):
            if k["decide"] or k["passou"] is not None:
                F(f"{i} {k['id']}: so_descricao decide ou tem passou")
            continue
        falta = [x for x in ("operador", "limiar", "agregacao", "filtro", "subcampo") if x not in k]
        if falta:
            F(f"{i} {k['id']}: sem {falta}")
            continue
        g, v = ler(k)
        if v == "<<SEM VALOR>>":
            F(f"{i} {k['id']}: caminho não gravado e sem valor_num_14_09")
            continue
        calc = aval(k, v)
        criterios_maquina += 1
        if calc != k["passou"]:
            F(f"{i} {k['id']}: passou {k['passou']} ≠ recalculado {calc} (valor {v!r})")
    rm = c.get("regra_maquina")
    if not rm or not rm.get("ordem"):
        F(f"{i}: sem regra_maquina")
        continue
    lidos = set()
    for linha in rm["ordem"]:
        if linha["selo"] not in ORD:
            F(f"{i}: selo inválido na regra {linha['selo']}")
        for kid in linha["exige"]:
            lidos.add(kid)
            if kid not in ids:
                F(f"{i}: regra exige {kid}, que não existe")
            elif not c["criterios_do_selo"][int(kid[1:])]["decide"]:
                F(f"{i}: regra exige {kid}, marcado 'não decide o selo'")
    for k in c["criterios_do_selo"]:
        if k["decide"] and k["id"] not in lidos:
            F(f"{i}: {k['id']} decide e nenhuma linha da regra o lê")
    passou = {k["id"]: k["passou"] for k in c["criterios_do_selo"]}
    selo = next((l["selo"] for l in rm["ordem"] if all(passou.get(x) == e for x, e in l["exige"].items())), rm["selo_padrao"])
    if selo != c["forca_esperada_hoje"]:
        F(f"{i}: selo recalculado pela regra_maquina {selo} ≠ forca_esperada_hoje {c['forca_esperada_hoje']}")

# J17: o título tem de ser a comparação declarada (conserto final)
j17 = next(c for c in SPEC["conclusoes"] if c["id"] == "J17")
if not j17["comparacao_declarada_antes"] or j17["forca_esperada_hoje"] != "fraco" or "quem sobe" not in j17["molde"]["titulo"]:
    F("J17: o título tem de ser a comparação declarada (quem sobe contra quem cai), com selo fraco")

# ------------------------------------------------------------ 3. contagem e cinco
cont = {s: sum(1 for c in SPEC["conclusoes"] if c["forca_esperada_hoje"] == s) for s in ORD}
tot = len(SPEC["conclusoes"])
ref = SPEC["contagem_de_selos_referencia_14_09"]
if any(ref[s] != cont[s] for s in ORD) or ref["total"] != tot:
    F(f"contagem do spec {ref} ≠ contada {cont}")
m = re.search(r"\*\*Contagem de selos \((\d+) conclusões\):\*\* (\d+) FORTES? · (\d+) MODERADAS? · (\d+) FRACAS? · (\d+) SEM SINAL · (\d+) NÃO DÁ PARA AFIRMAR", DOC)
if not m or [int(x) for x in m.groups()] != [tot] + [cont[s] for s in ORD]:
    F(f"contagem do documento difere: {m.groups() if m else None} x {[tot] + [cont[s] for s in ORD]}")

def elegivel(c):
    return all(resolver(p)[0] for k in c["criterios_do_selo"] if k["decide"] for _, p in efetivos(k))

pos = {c["id"]: n for n, c in enumerate(SPEC["conclusoes"])}
def cinco(so):
    l = [c for c in SPEC["conclusoes"] if (elegivel(c) or not so)]
    l.sort(key=lambda c: (ORD.index(c["forca_esperada_hoje"]), c["p_principal"]["valor_14_09"] if c["p_principal"]["valor_14_09"] is not None else math.inf, pos[c["id"]]))
    return [c["id"] for c in l[:5]]
hoje = cinco(True)
for c in SPEC["conclusoes"]:
    if c["elegivel_hoje_para_as_cinco"] != elegivel(c):
        F(f"{c['id']}: elegivel_hoje_para_as_cinco do spec não bate com o resolvedor")
if SPEC["cinco_que_precisa_ler"] != hoje:
    F(f"cinco do spec {SPEC['cinco_que_precisa_ler']} ≠ recalculadas {hoje}")
sec = DOC[DOC.index("## AS CINCO QUE VOCÊ PRECISA LER"):]
sec = sec[:sec.index("\n---")]
doc_cinco = re.findall(r"^\d\. \*\*\[[^\]]+\] (\S+) · ", sec, re.M)
if doc_cinco != hoje:
    F(f"cinco do documento {doc_cinco} ≠ recalculadas {hoje}")
for idc in doc_cinco:
    c = SPEC["conclusoes"][pos[idc]]; val = c["valores_14_09"]; mo = c["molde"]
    t = render(mo["titulo"], val); t = t if t[-1] in "?!." else t + "."
    esperado = f"**[{TAG[c['forca_esperada_hoje']]}] {idc} · {t}** {render(mo['frase'], val)}" + ((" " + render(mo["numero"], val)) if mo["numero"] else "")
    if not re.search(r"^\d\. " + re.escape(esperado) + "$", sec, re.M):
        F(f"cinco: a linha da {idc} não é título + frase + número do spec")
depois = cinco(False)

# ------------------------------------------------------------ 4. ordem de serviço cobre todo caminho não gravado (leitura estrita)
def norm(p):
    return re.sub(r"\.<[A-Za-z_]+>", "{}", re.sub(r"\[[^\]]*\]", "[]", p))
def cobre(cp, a):
    x, y = norm(cp["caminho"]), norm(a)
    rx = re.escape(x).replace(r"\[\]", r"(?:\[\]|\.[^.\[\]]+|)").replace(r"\{\}", r"\.[^.\[\]]+")
    mm = re.match(rx + r"(?=$|[.\[])", y)
    if not mm:
        return False
    nomes = re.findall(r"[A-Za-z_][A-Za-z0-9_]*", y[mm.end():].replace("[]", ""))
    texto = " ".join(str(cp.get(z, "")) for z in ("caminho", "formato", "de_onde_sai"))
    return all(re.search(r"(?<![A-Za-z0-9_])" + re.escape(n) + r"(?![A-Za-z0-9_])", texto) for n in nomes)
campos = ORDEM["campos"]
pedidos = 0
for c in SPEC["conclusoes"]:
    alvo = [l["campo"] for l in c["lacunas"].values() if not l.get("ja_gravado_no_json") and l.get("campo")]
    alvo += [p for k in c["criterios_do_selo"] for _, p in efetivos(k) if not resolver(p)[0]]
    if c["p_principal"]["caminho"] and not resolver(c["p_principal"]["caminho"])[0]:
        alvo.append(c["p_principal"]["caminho"])
    for a in alvo:
        pedidos += 1
        if not any(cobre(cp, a) for cp in campos):
            F(f"{c['id']}: caminho não gravado sem campo na ordem de serviço (leitura estrita): {a}")
for cp in campos:
    if cp["declaracao"] is not None and cp["declaracao"] != "bloco_conclusoes" and cp["declaracao"] not in DECL:
        F(f"ordem: campo {cp['caminho']} aponta declaração inexistente {cp['declaracao']}")
    if cp.get("analise_nova_declarada") and cp["declaracao"] is None:
        F(f"ordem: campo {cp['caminho']} é análise nova sem declaração")
    for chave in ("caminho", "formato", "de_onde_sai", "conclusoes_que_usam", "analise_nova_declarada", "declaracao"):
        if chave not in cp:
            F(f"ordem: campo {cp.get('caminho')} sem '{chave}'")
    if "[]" in cp["caminho"].replace("linhas[]", "").replace("metricas[]", "").replace("setores[]", "").replace("quartis[]", "").replace("itens[]", "").replace("por_ano[]", "") :
        F(f"ordem: campo {cp['caminho']} usa '[]' para dicionário; escreva .<nome> com valores_permitidos")
    for ph in re.findall(r"<[A-Za-z_]+>", cp["caminho"]):
        if ph not in (cp.get("valores_permitidos") or {}):
            F(f"ordem: campo {cp['caminho']} sem valores_permitidos para {ph}")
if ORDEM.get("sem_cobertura"):
    F(f"ordem: sem_cobertura não vazio: {ORDEM['sem_cobertura']}")

# ------------------------------------------------------------ 5. sementes, métricas e textos de régua
if "SEMENTE, 17, i" not in DECL["nota_por_setor_por_clube"]["excesso"]["semente"]:
    F("declaração: a semente do excesso por clube tem de ser [SEMENTE, 17, i]")
if "SEMENTE, 17, i" not in SPEC["regua"]["regra_do_excesso"]["semente"]:
    F("spec: regua.regra_do_excesso.semente sem [SEMENTE, 17, i]")
regua_doc = DOC[DOC.index("**A regra do \"olhar a lista inteira\", por extenso"):DOC.index("**Regras de frase**")]
if "SEMENTE, 17, i" not in regua_doc or "SEMENTE, 13" in regua_doc.split("<sub>")[0]:
    F("documento: o item 3 da régua tem de dizer a semente por clube [SEMENTE, 17, i]")
mf = DECL["etapa_11_mesma_regua"].get("metricas_fisicas") or []
if len(mf) != 10:
    F(f"declaração: etapa_11_mesma_regua.metricas_fisicas com {len(mf)} nomes (precisa das 10)")
if "J17" in json.dumps(SPEC["regua"]["comparacao_escolhida_depois_de_olhar"]["efeito_por_conclusao"].get("J17", "")) and "moderado" in SPEC["regua"]["comparacao_escolhida_depois_de_olhar"]["efeito_por_conclusao"]["J17"].split("(")[0]:
    F("spec: efeito_por_conclusao da J17 ainda diz moderado")

# ------------------------------------------------------------ resultado
print(f"conclusões no spec {len(spec_ids)}, no documento {len(doc_ids)}, comparadas campo a campo {comparados}")
print(f"critérios com forma de máquina recalculados: {criterios_maquina}; selos recalculados pela regra_maquina: {comparados}")
print(f"contagem {tot}: " + " / ".join(f"{cont[s]} {s}" for s in ORD))
print(f"cinco hoje (recalculadas pela regra, lendo o prototipo.json): {hoje}")
print(f"cinco quando a ordem de serviço for gravada: {depois}")
print(f"caminhos não gravados pedidos pelo spec: {pedidos}; campos na ordem de serviço: {len(campos)}")
if falhas:
    print(f"\nFALHAS ({len(falhas)}):")
    for f_ in falhas:
        print(" -", f_)
    sys.exit(1)
print("\nPROVA OK: documento e spec batem id a id; passou e selo de cada conclusão saem da forma de máquina; nenhuma lacuna gravada diverge do prototipo.json; toda lacuna não gravada tem campo na ordem de serviço (leitura estrita).")
