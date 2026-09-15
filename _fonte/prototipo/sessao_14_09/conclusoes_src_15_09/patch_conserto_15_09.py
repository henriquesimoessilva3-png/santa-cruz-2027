# patch_conserto_15_09 - rodada de conserto (a única) sobre a rodada sem dinheiro de 15/09. Troca, nos módulos de tema e no
# montador, os textos que a revisão pegou: "no limite" fora do selo (J1, J7, FIS-10), o motivo antigo no rodapé da J17, o teto
# da M8 (a divisão do título foi escolhida depois de olhar), o p_principal por clube da M5 e da M8 (o bruto, que é o que decide)
# e o critério das conferências por ano da DIN-01 escrito na régua. Cada troca confere quantas vezes o trecho aparece e falha
# alto se não bater: nada é trocado por aproximação. Rodar uma vez só, a partir dos fontes guardados em ../bk_conserto/src.
import sys

def ler(f):
    return open(f, encoding="utf-8").read()

def gravar(f, t):
    open(f, "w", encoding="utf-8").write(t)

def troca(t, a, b, n=1, onde=""):
    if t.count(a) != n:
        raise SystemExit(f"{onde}: esperado {n}, achei {t.count(a)}: {a[:100]}")
    return t.replace(a, b)

# ---------------------------------------------------------------- J1, J7, J17 (jogo)
f = "sp6_c3_jogo.py"; t = ler(f)
t = troca(t, "Em {periodo_antigo} foi para o mesmo lado, mas no limite: o acaso produziria aquilo em {p_antigo_chance}; é essa conferência que falta para o selo forte.",
          "Em {periodo_antigo} foi para o mesmo lado, sem diferença clara (o acaso produziria aquilo em {p_antigo_chance}); é essa conferência que falta para o selo forte.", onde=f)
t = troca(t, "contra o meio da tabela não se viu diferença, e contra o resto a diferença fica no limite do acaso.",
          "contra o meio da tabela não se viu diferença, e contra o resto não há diferença clara (fica na zona cinzenta).", onde=f)
t = troca(t, "(antes FRACO, só pelo desconto do valor, p 0,125)", "(em 14/09 era FRACO, só pelo desconto do valor, p 0,125)", onde=f)
gravar(f, t)

# ---------------------------------------------------------------- FIS-10 (físico): "no limite" vira "na zona cinzenta"
f = "sp6_c2_fisico.py"; t = ler(f)
t = troca(t, "contra o meio não se viu diferença, com uma medida no limite\",", "contra o meio não se viu diferença, com uma medida na zona cinzenta\",", onde=f)
t = troca(t, "Contra o meio da tabela não se viu diferença, com uma medida no limite ({nome_sm_limite}", "Contra o meio da tabela não se viu diferença, com uma medida na zona cinzenta ({nome_sm_limite}", onde=f)
t = troca(t, "\"'no limite' para p < 0,05 (é o nome da zona cinzenta)\", \"'contra o meio não se viu' sem a medida no limite (corridas para a área, 0,053)\"",
          "\"'no limite' fora do selo (vocabulário único: só no selo da zona cinzenta)\", \"'contra o meio não se viu' sem a medida na zona cinzenta (corridas para a área, 0,053)\"", onde=f)
t = troca(t, "(corridas para a área, no limite) a 0,46", "(corridas para a área, na zona cinzenta) a 0,46", onde=f)
gravar(f, t)

# ---------------------------------------------------------------- DIN-01: a conferência sem p fica escrita na regra
f = "sp6_c1_dinheiro.py"; t = ler(f)
t = troca(t, "\"moderado_se\": \"p_sobe_x_meio < 0,05 E alguma das duas conferências falha\",",
          "\"moderado_se\": \"p_sobe_x_meio < 0,05 E alguma das duas conferências falha\",\n"
          "           \"conferencia_sem_p\": \"as duas conferências (cada ano sozinho e deixando um ano de fora) são acerto de pares de quem sobe contra o resto acima de 0,5, sem p; com poucos promovidos por ano, um acerto pouco acima de 0,5 não se distingue do acaso. Pergunta em aberto para o dono: se ele não aceitar isso como conferência, a DIN-01 cai para moderado pela cláusula 'sem conferência testável'; até a decisão, o selo segue o plano aprovado\",", onde=f)
gravar(f, t)

# ---------------------------------------------------------------- M8 (teto moderado) e p_principal por clube de M5 e M8
f = "sp6_c5_mercado.py"; t = ler(f)
ini = t.index('    id="M8", tema="mercado_e_contratacao"'); fim = t.index('    id="M5", tema="mercado_e_contratacao"')
m8 = t[ini:fim]
m8 = troca(m8, 'selo="moderado", declarada=True,', 'selo="moderado", declarada=False,', onde="M8")
m8 = troca(m8, "e {sobra_ataque} continuam descontado só o rodízio. É um sinal {selo}: não houve como conferir por outro caminho, porque não há físico por rodada nem antes de {ano_ini}.",
           "e {sobra_ataque} continuam descontado só o rodízio. É um sinal {selo}, e não passa disso: o ataque foi separado da zaga e da lateral depois de olhar os números, e aí o teto é moderado, que a lista do ataque alcança; também não houve como conferir por outro caminho, porque não há físico por rodada nem antes de {ano_ini}.", onde="M8")
# a divisão do título foi escolhida depois de olhar: a régua dá teto moderado (a lista DELA acima da sorte) e nunca forte.
# Com a constante "declarada" em false, firmeza e conferência deixam de decidir — viram descrição — e a máquina não promove
# a M8 a forte se um dia aparecer uma conferência testável, sem ninguém decidir.
m8 = troca(m8, 'CONST("1. família (medidas da nota por setor, clube como caso) e comparação quem sobe contra quem cai declaradas antes; a divisão do título foi feita depois de olhar", True, papel="declarada", txt="sim"),',
           'CONST("1. comparação do título escrita antes de olhar (a família das medidas da nota por setor, com o clube como caso, e a comparação quem sobe contra quem cai foram declaradas antes; a divisão do título, o ataque separado da M4, foi feita depois de olhar)", False, papel="declarada", txt="não: divisão do título escolhida depois de olhar, teto moderado"),', onde="M8")
m8 = troca(m8, '"sobecai_corrigido_por_clube.ataque.bh5_clube", papel="q", op=">", lim=0),', '"sobecai_corrigido_por_clube.ataque.bh5_clube", papel="q", op=">", lim=0, decide=False),', onde="M8")
m8 = troca(m8, 'papel="q_folga", op="<", lim=0.025, ag="min", sub="q_clube"),', 'papel="q_folga", op="<", lim=0.025, ag="min", sub="q_clube", decide=False),', onde="M8")
m8 = troca(m8, 'False, papel="ha_conf", txt="não: sem físico por rodada nem antes de 2022"),', 'False, papel="ha_conf", txt="não: sem físico por rodada nem antes de 2022", decide=False),', onde="M8")
m8 = troca(m8, 'False, papel="uma_conf", txt="não: não há nenhuma"),', 'False, papel="uma_conf", txt="não: não há nenhuma", decide=False),', onde="M8")
m8 = troca(m8, '"moderado_se": "firme por clube (algum q_clube < 0,05) E alguma continua só com o rodízio E nenhuma conferência testável",',
           '"moderado_se": "alguma medida com p bruto < 0,05 por clube E alguma continua só com o rodízio E a lista do ataque acima da sorte (p do excesso < 0,05)",\n'
           '           "teto": "moderado: a divisão do título (o ataque separado da M4) foi escolhida depois de olhar; firmeza por clube e conferência ficam descritas e não decidem, então a máquina nunca promove a M8 a forte sem decisão (conserto de 15/09)",', onde="M8")
m8 = troca(m8, 'p=P("sobecai_corrigido_por_clube.ataque.menor_p_rod", 0.00072),',
           '# o p que decide o selo por clube é o bruto (p5_clube conta as medidas com p_clube < 0,05); o p só com o rodízio é outro papel\n'
           '    p=P("sobecai_corrigido_por_clube.ataque.itens", min(x["p_clube"] for x in resolver("sobecai_corrigido_por_clube.ataque.itens")[1] if x.get("p_clube") is not None), agregacao="min", subcampo="p_clube"),', onde="M8")
m8 = troca(m8, "Na M4 de 14/09 o ataque aparecia com 'nada sobra', pelo desconto do valor\",",
           "Na M4 de 14/09 o ataque aparecia com 'nada sobra', pelo desconto do valor. Conserto de 15/09: teto moderado na máquina (a divisão do título foi escolhida depois de olhar), e o p_principal passa a ser o menor p bruto por clube\",", onde="M8")
t = t[:ini] + m8 + t[fim:]
t = troca(t, 'p=P("sobecai_corrigido_por_clube.meio.menor_p_rod", 0.00035),',
          '# o p que decide o selo por clube é o bruto (p5_clube conta as medidas com p_clube < 0,05); o p só com o rodízio é outro papel\n'
          '    p=P("sobecai_corrigido_por_clube.meio.itens", min(x["p_clube"] for x in resolver("sobecai_corrigido_por_clube.meio.itens")[1] if x.get("p_clube") is not None), agregacao="min", subcampo="p_clube"),', onde=f)
gravar(f, t)

# ---------------------------------------------------------------- montador: régua (documento e spec), tabela de mudanças
f = "sp6_montar.py"; t = ler(f)
t = troca(t, '   DIN-02), valem também "cada ano sozinho" e "deixando um ano de fora".\n',
          '   DIN-02), valem também "cada ano sozinho" e "deixando um ano de fora", com o critério escrito aqui: na DIN-01, passar\n'
          '   é o acerto de pares de quem sobe contra o resto ficar acima de 0,5 em todo ano e na conta que deixa um ano de fora; na\n'
          '   DIN-02, é a contagem de promovidos entre os mais caros ficar acima do esperado por acaso em todo ano. Essas conferências\n'
          '   não têm p: com poucos promovidos por ano, um acerto pouco acima de 0,5 num ano não se distingue do acaso. **Pergunta em\n'
          '   aberto para o dono:** se ele não aceitar o acerto acima de 0,5 como conferência, a DIN-01 cai para MODERADO pela cláusula\n'
          '   "sem conferência testável"; até a decisão, o selo segue o plano aprovado.\n', onde=f)
t = troca(t, "a divisão do título foi feita depois de olhar e fica registrada); a A1 usa a",
          "a divisão do título foi feita depois de olhar e fica registrada, com teto MODERADO na máquina, como toda comparação escolhida\ndepois); a A1 usa a", onde=f)
t = troca(t, "a M7 (sem lista) e os zagueiros da J5 (lista no nível da sorte).\n",
          "a M7 (sem lista) e os zagueiros da J5 (lista no nível da sorte). A M8 fica MODERADA pelo teto: a divisão do título\n  foi escolhida depois de olhar, e a lista do ataque tem mais achados do que a sorte.\n", onde=f)
linhas = t.split("\n")
alvo = [n for n, l in enumerate(linhas) if l.lstrip().startswith('"3. Foi conferida por outro caminho?')]
if len(alvo) != 1 or linhas[alvo[0]].count("'deixando um ano de fora'") != 1:
    raise SystemExit(f"{f}: pergunta 3 da régua do spec não encontrada uma vez só")
linhas[alvo[0]] = linhas[alvo[0]].replace("'deixando um ano de fora'", "'deixando um ano de fora' — critério: na DIN-01, acerto de pares de quem sobe contra o resto > 0,5 em todo ano e no deixa-um-de-fora; na DIN-02, contagem de promovidos entre os mais caros acima do esperado por acaso em todo ano; sem p (ver conferencia_por_ano)")
t = "\n".join(linhas)
t = troca(t, '    "conclusoes_partidas_ou_relidas": {\n',
          '    "conferencia_por_ano": {\n'
          '        "DIN-01": "cada ano sozinho: auc_posto_de_valor.por_ano[].auc_sobe_x_resto > 0,5 em todo ano; deixando um ano de fora: loso_sobe_x_resto > 0,5; sem p",\n'
          '        "DIN-02": "contagem de promovidos no top 8 acima do esperado por acaso em todo ano (lista gravada de promovidos); sem p",\n'
          '        "limite": "com poucos promovidos por ano, um acerto pouco acima de 0,5 num ano não se distingue do acaso",\n'
          '        "pergunta_em_aberto_para_o_dono": "se o acerto acima de 0,5 não for aceito como conferência, a DIN-01 cai para moderado pela cláusula sem_conferencia_testavel; até a decisão, o selo segue o plano aprovado",\n'
          '    },\n'
          '    "conclusoes_partidas_ou_relidas": {\n', onde=f)
t = troca(t, "divisão do título depois de olhar (declaracoes_novas.conclusao_ataque_por_clube)\",",
          "divisão do título depois de olhar (declaracoes_novas.conclusao_ataque_por_clube); por isso a M8 tem teto moderado na máquina (declarada_constante false), para nunca subir a forte sem decisão\",", onde=f)
linhas = t.split("\n")
alvo = [n for n, l in enumerate(linhas) if l.lstrip().startswith('"J17": "a comparação do título é a SC declarada')]
if len(alvo) != 1:
    raise SystemExit(f"{f}: efeito_por_conclusao da J17 não encontrado uma vez só")
linhas.insert(alvo[0] + 1, '            "M8": "teto moderado: família e comparação declaradas antes, divisão do título escolhida depois de olhar; a lista do ataque tem mais achados do que a sorte e alcança o moderado",')
t = "\n".join(linhas)
t = troca(t, "e a lista tem 13 contra 1 (p 0,010); sem conferência testável\",",
          "e a lista tem 13 contra 1 (p 0,010); teto moderado, porque a divisão do título foi escolhida depois de olhar\",", onde=f)
gravar(f, t)
print("ok: sp6_c1, sp6_c2, sp6_c3, sp6_c5 e sp6_montar trocados")
