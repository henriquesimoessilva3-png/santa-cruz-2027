# sp6_montar - escreve conclusoes_spec.json e CONCLUSOES.md a partir da MESMA fonte (sp6_c*.py).
# Lê o documento de antes da reconferência (bk_reconf/) só para trazer rodapés e linhas de faixa de pontos.
import json, re, importlib, math
from sp6_base import *
import sp6_maquina as MQ
import sp8_limpeza as LZ

MODS = ["sp6_c1_dinheiro", "sp6_c2_fisico", "sp6_c3_jogo", "sp6_c4_antigos", "sp6_c5_mercado"]
TEMAS_ORDEM = ["dinheiro_e_elenco", "fisico", "jogo_e_padroes", "anos_antigos", "mercado_e_contratacao"]
TEMAS_NOME = {"dinheiro_e_elenco": "Dinheiro e elenco", "fisico": "Físico", "jogo_e_padroes": "Jogo e padrões", "anos_antigos": "Os anos antigos (2018-2021)", "mercado_e_contratacao": "Mercado e contratação"}
SELO_TAG = {"forte": "FORTE", "moderado": "MODERADO", "fraco": "FRACO", "sem_sinal": "SEM SINAL", "nao_da_para_afirmar": "NÃO DÁ PARA AFIRMAR"}
SELO_ORD = ["forte", "moderado", "fraco", "sem_sinal", "nao_da_para_afirmar"]
OUT_DOC = S + "saida/CONCLUSOES.md"
OUT_SPEC = S + "saida/conclusoes_spec.json"
BK_DOC = S + "bk_reconf/CONCLUSOES_antes_reconf.md"
BK_SPEC = S + "bk_reconf/conclusoes_spec_antes_reconf.json"
# o spec e o documento como estavam antes desta rodada (conserto final de 14/09): base da tabela antes → depois
ANTES_SPEC = S + "antes/conclusoes_spec.json"
ORDEM = json.load(open(SESSAO + "ordem_gerador_bloco2.json", encoding="utf-8"))

# ----------------------------------------------------------------- texto de cada conclusão
def moldes(c):
    m = {"titulo": c["titulo"], "frase": c["frase"], "numero": c["numero"], "ressalva": c["ressalva"], "tecnico": c.get("tecnico", "")}
    m.update(c.get("extra", {}))
    return m

def preencher(c):
    txts = dict(moldes(c)); txts["universo"] = c["universo"]
    usados = []
    for v in txts.values():
        for mk in marcadores(v):
            if mk not in usados:
                usados.append(mk)
    lac = {}
    for mk in usados:
        if mk in c["lac"]:
            lac[mk] = c["lac"][mk]
        elif mk in COMUNS:
            lac[mk] = COMUNS[mk]
        else:
            raise SystemExit(f"{c['id']}: marcador sem lacuna {mk}")
    for n in c["lac"]:
        if n not in usados:
            raise SystemExit(f"{c['id']}: lacuna sem uso {n}")
    val = {}
    for n, l in lac.items():
        manual = c["val"].get(n, VALORES_COMUNS.get(n))
        if n == "selo" and manual is None:
            manual = FORMATOS["selo_minusculo"](c["selo"])
        auto = None
        if l.get("ja_gravado_no_json"):
            ok, v = resolver(l["caminho"])
            if not ok:
                raise SystemExit(f"{c['id']}: caminho gravado não resolve {l['caminho']}")
            auto = formatar(l["formato"], v)
        if manual is not None and auto is not None and manual != auto:
            raise SystemExit(f"{c['id']}: manual {manual!r} ≠ gravado {auto!r} em {n}")
        val[n] = manual if manual is not None else auto
        if val[n] is None:
            raise SystemExit(f"{c['id']}: sem valor {n}")
    return lac, val

def render(t, val):
    return MARC.sub(lambda m: val[m.group(1)], t)

def titulo_md(t):
    return t if t[-1] in "?!." else t + "."

def ressalva_doc(r):
    """no documento o rótulo já diz 'O que isso não quer dizer:'; o molde da tela começa com 'Não quer dizer ' e isso sai."""
    return r[len("Não quer dizer "):] if r.startswith("Não quer dizer ") else r

def crit_md(k):
    st = {True: "passa", False: "não passa", None: "não se aplica"}[k["passou"]]
    s = f"{k['criterio']} — {k['valor_14_09']} — {st}"
    if not k["decide"]:
        s += " (não decide o selo)"
    return s

# ----------------------------------------------------------------- o que vem do documento antigo
def parse_bk():
    linhas = open(BK_DOC, encoding="utf-8").read().split("\n")
    hdr = re.compile(r"^\*\*\[[^\]]+\] ([A-Z]+-\d+|[JAM]\d+) · ")
    blocos, cur = {}, None
    for ln in linhas:
        m = hdr.match(ln)
        if m:
            cur = m.group(1); blocos[cur] = []; continue
        if ln.startswith("---") or ln.startswith("## "):
            cur = None; continue
        if cur:
            blocos[cur].append(ln)
    out = {}
    for k, ls in blocos.items():
        rod, fx = None, None
        for s_ in ls:
            if not s_.startswith("<sub>"):
                continue
            if s_.startswith("<sub>**Vale também"):
                fx = s_
            elif rod is None:
                rod = s_[len("<sub>"):-len("</sub>")] if s_.endswith("</sub>") else s_[len("<sub>"):]
        out[k] = (rod, fx)
    return out

def aplicar_ops(texto, ops, cid):
    for op in ops:
        if op[0] == "append":
            texto = texto + op[1]
        elif op[0] == "replace":
            if op[1] not in texto:
                raise SystemExit(f"{cid}: trecho do rodapé não encontrado: {op[1][:80]}")
            texto = texto.replace(op[1], op[2])
    return texto

# ----------------------------------------------------------------- cinco
def gravado(caminho):
    return resolver(caminho)[0]

def faltando(c):
    return MQ.faltando(c)

def cinco(lista, so_gravadas):
    cand = [c for c in lista if (not so_gravadas or not faltando(c))]
    ordem = {c["id"]: i for i, c in enumerate(lista)}
    cand.sort(key=lambda c: (SELO_ORD.index(c["selo"]), c["p"]["valor_14_09"] if c["p"]["valor_14_09"] is not None else math.inf, ordem[c["id"]]))
    return cand[:5]

def p_txt(p):
    if p is None:
        return "sem p"
    if p < 0.0001:
        e = int(math.floor(math.log10(p))); m = p / 10 ** e
        return f"{dec(m, 1)} × 10⁻{str(-e).translate(str.maketrans('0123456789', '⁰¹²³⁴⁵⁶⁷⁸⁹'))}"
    return dec(p, 4) if p < 0.001 else dec(p, 3 if p < 0.01 else 2)

# ----------------------------------------------------------------- textos fixos do documento
CABECALHO = """# O que o estudo da Série B conclui — e quanto dá para confiar em cada coisa

> 80 temporadas completas de 2022 a 2025 (16 subiram, 48 ficaram no meio, 16 caíram) e, só no
> técnico do time, mais 80 de 2018 a 2021. A origem dos clubes (veio da A, da C ou já estava na B)
> cobre 2019 a 2025. 2026 tem 27 rodadas e não entra em conta nenhuma: aparece só como descrição.
> Consolidado em 13/09/2026, revisto e reconferido em 14/09/2026 (sessão `3b480dcb`) e **refeito em 15/09/2026 na
> rodada sem dinheiro** (sessão `1abbf5c7`): a régua é a final do plano aprovado ("contra a sorte"), com as quatro
> respostas do dono da noite de 14/09 e as decisões do coordenador, e os selos foram conferidos contra o dado novo do
> gerador (`scratchpad/dinheiro2/prototipo_novo.json`), que ainda não foi gravado em `dados/prototipo.json`.
> **Este documento e `conclusoes_spec.json` saem da mesma fonte** (`sp6_c*.py`, montados por `sp6_montar.py`, em
> `scratchpad/dinheiro2/conc/src/`): o título, a frase, o número, "o que não quer dizer", o universo e os critérios do selo de
> cada conclusão são o molde do spec com os valores desta rodada; a prova, id a id, é `sp7_prova.py`.
"""

HISTORICO_SUB = ("<sub>Em 13/09 eram 41: 4 / 16 / 7 / 9 / 5. Na primeira revisão de 14/09, 52: 3 / 14 / 18 / 11 / 6. Na rodada de conserto de 14/09, 54: 3 / 10 / 24 / 12 / 5. "
                 "Na reconferência de 14/09, 56: 3 / 12 / 23 / 13 / 5 — entraram a J19 (pressão alta de quem sobe contra quem cai, FRACA; era número sem selo no rodapé da J14) e a M7 (quem ficou no clube repete mais o físico que o técnico, FRACA; era sinal sem selo dentro da M1); "
                 "mudaram de selo DIN-03 moderado → fraco, J5 fraco → moderado (decisão 1 do dono sobre comparação escolhida depois de olhar), FIS-10 fraco → moderado (a regra do excesso aplicada como na FIS-06, FIS-08 e FIS-11) "
                 "e ELE-06 fraco → sem sinal (o aproveitamento some no dinheiro e a posição, conta do título, fica no limite); a FIS-07 seguiu forte, apoiada no teste de cada par de anos (decisão 3); as cinco passaram a ser as mais firmes de qualquer tema (decisão 2). "
                 "**No conserto final de 14/09, 56:** a J17 voltou a FRACA. Na reconferência o título dela tinha sido trocado da comparação declarada (quem sobe contra quem cai) para quem cai contra o meio, a única das duas que passa no dinheiro, e o selo subia pela troca; "
                 "a decisão 1 vale para a comparação que a conclusão já tinha no título. Nenhum outro selo mudou; mudaram frases que ainda afirmavam ausência ou equivalência (DIN-03, DIN-05, ORI-01, FIS-10, A6, ELE-06) e os critérios do selo ganharam forma de máquina. "
                 "**Na rodada sem dinheiro de 15/09, 57:** {contagem_15} — saem dos critérios o desconto pelo valor do elenco e o mesmo clube no ano seguinte; mudam de selo {mudaram_15}; a M4 fica com zaga e lateral e o ataque vira a M8. A tabela antes → depois está logo abaixo da régua.</sub>")

REGUA = """## A régua — leia o selo antes da frase

São cinco selos, e só estes cinco. Nada ganha um sexto rótulo ("descritivo", "não se aplica", "provisório"):
uma contagem sem teste próprio vira descrição da conclusão de onde herda o selo.

**Régua final, de 15/09/2026** (plano aprovado "contra a sorte", com as quatro respostas do dono da noite de 14/09). Toda
conclusão de diferença entre grupos responde às mesmas perguntas, nesta ordem:
1. **A comparação foi escrita antes de olhar?**
2. **É firme?** Firme é passar na conta de todos os testes parecidos: q de Benjamini-Hochberg < 0,05 na família declarada
   (num teste único declarado, q = p).
3. **Foi conferida por outro caminho?** Conferências que valem: o 1º turno prevendo o 2º (p parcial < 0,05, no lado
   declarado; não pelo q dos 28 números) e 2018-2021 (p < 0,05 e o mesmo lado). Quando o próprio teste é por ano (DIN-01,
   DIN-02), valem também "cada ano sozinho" e "deixando um ano de fora", com o critério escrito aqui: na DIN-01, passar
   é o acerto de pares de quem sobe contra o resto ficar acima de 0,5 em todo ano e na conta que deixa um ano de fora; na
   DIN-02, é a contagem de promovidos entre os mais caros ficar acima do esperado por acaso em todo ano. Essas conferências
   não têm p: com poucos promovidos por ano, um acerto pouco acima de 0,5 num ano não se distingue do acaso. **Pergunta em
   aberto para o dono:** se ele não aceitar o acerto acima de 0,5 como conferência, a DIN-01 cai para MODERADO pela cláusula
   "sem conferência testável"; até a decisão, o selo segue o plano aprovado.
4. **A lista de onde ela saiu tem mais achados do que a sorte produz?** (p do excesso < 0,05, contagem bruta)
5. **Só no físico: continua entre times que rodaram o elenco parecido?** (p < 0,05 descontado SÓ o posto de atletas
   rastreados, do elenco ou do setor)

**O que saiu da régua em 15/09, com todas as letras** (decisões do dono de 14/09):
- **o desconto pelo valor do elenco** — "descontado o dinheiro", "continua entre times (ou elencos) de valor parecido" — de
  todo selo, porta, marca e frase de critério. O valor do elenco continua DESCRITO: etapa 1, régua do valor, DIN-*, cenários
  da etapa 14;
- **"o mesmo clube repete o número no ano seguinte"** — das conferências e do desempate. As conclusões cujo assunto é a
  repetição ficam, com o selo: FIS-07, M1, M6, M7 e ELE-06;
- os níveis "líquido" e "líquido 2" do excesso (o segundo virou "só com o rodízio"), o controle da cobertura do valor na
  DIN-01 e a constante "o desconto do dinheiro não se aplica".

**Os selos, na ordem em que a máquina testa:**
- **SEM SINAL** — p ≥ 0,10; ou zona cinzenta (0,05 ≤ p < 0,10) quando a mesma linha não tem p < 0,05 em nenhuma outra
  comparação, e aí vai com "no limite". Isso também é conclusão. A frase diz sempre, em palavras, o que o estudo conseguiria
  ver: com 16 times contra 48, só uma diferença grande apareceria; com 16 contra 16, só uma muito grande (o tamanho em número
  fica no rodapé). Escreve-se "não se viu", nunca "não separa", "não é" nem "não existe". (A ressalva "o estudo não separa as duas
  coisas" é outra coisa: diz que o estudo não distingue duas explicações, e é a forma escrita pelo dono.)
- **FRACO** — zona cinzenta com p < 0,05 em outra comparação da mesma linha; no físico, quando não continua descontado só o
  rodízio; comparação declarada que não é firme e cuja lista está no nível da sorte; comparação escolhida depois de olhar sem
  lista, ou com a lista dela no nível da sorte.
- **MODERADO** — comparação escolhida depois de olhar com a lista DELA acima da sorte (nunca forte); declarada e não firme com
  a lista da família acima da sorte; declarada e firme quando alguma conferência testável falhou (quando discordam, vale a
  mais fraca). E mais duas cláusulas escritas com todas as letras:
  **sem conferência testável é MODERADO, nunca FORTE**; **firme por pouco (q entre 0,025 e 0,05) com uma conferência só é
  MODERADO**, mesmo que ela passe — regra geral para todas as conclusões (resposta a do dono; hoje atinge a J17).
- **FORTE** — declarada, firme, com PELO MENOS UMA conferência testável e todas as testáveis passando, fora da cláusula do
  firme por pouco com uma conferência só; no físico, também continua só com o rodízio.
- **NÃO DÁ PARA AFIRMAR** — para três casos, e só estes: (a) a pergunta é "qual dos dois é maior" (duas medidas, dois
  períodos, dois grupos de atletas, este nome contra o vizinho) e o intervalo da diferença cruza zero; (b) a pergunta nunca foi
  medida porque o dado não existe (a troca de técnico); (c) duas contas feitas sobre a mesma pergunta apontam para lados
  opostos. Diferença entre grupos com p ≥ 0,10 é SEM SINAL.
- **Regras próprias que continuam**: repetição do atleta (FIS-07, M1, M6, M7); contas da mesma pergunta — no mesmo lado, uma
  passando do corte e a outra não, segue a conta declarada antes (J10, FIS-09); se nenhuma foi declarada antes, vale o selo
  mais fraco (ELE-06, J8, J9); a lista inteira (FIS-04).

**Um vocabulário só de sorte**, gravado pelo gerador como chave (a tela só traduz): **firme** (q < 0,05; num teste único,
q = p), **pode ser sorte** (p < 0,05 e q ≥ 0,05), **sem diferença clara** (p ≥ 0,05). "Por pouco" só atrás de firme; "no
limite" só no selo, para a zona cinzenta. Para uma lista inteira: "a lista tem (ou não tem) mais achados do que a sorte
produz". Saem "dificilmente é sorte" e "no limite" como rótulo de sorte. "Acima da linha da sorte" continua como nome próprio
do ranking_gaps.

**Ressalva sem desconto** (resposta b do dono): as conclusões que sobem por causa desta régua (ELE-03, FIS-04, J17, J19, A2 e
a nova M8), e as outras em que o número anda com o valor do elenco, levam "elenco valioso tende a ter isso; o estudo não
separa as duas coisas". A ressalva descreve; nunca vira teto de selo nem desconto.

**Conclusões partidas ou relidas nesta rodada**: a M4 fica com zaga e lateral e o ataque vira a M8 (resposta d do dono; a
família e a comparação foram declaradas antes, a divisão do título foi feita depois de olhar e fica registrada, com teto MODERADO na máquina, como toda comparação escolhida
depois); a A1 usa a
família dos 2 eixos da tipologia, escolhida depois de olhar (decisão do coordenador); a DIN-04 e a DIN-05 são lidas por
jogador, com a fatia em euros descrita (decisão do coordenador). A porta A do catálogo é só leitura, com o nome "firme e
reaparece por outro caminho" (resposta c do dono; ESPECIFICACAO 6.5), e a nota da etapa 13 não muda.

- **Comparação escolhida depois de olhar** (decisão 1 do dono, 14/09, sem o desconto desde 15/09): comparação, índice ou lista
  montada depois de ver os resultados (inclusive a partir de uma pergunta do dono) não entra na conta dos muitos testes. **Ela
  só pode ser MODERADA se a lista dela tiver mais achados que a sorte (p do excesso < 0,05, na família declarada e na comparação
  escolhida); senão, o teto é FRACO.** Nunca FORTE. Sem lista de onde a comparação saia (um índice só, uma linha de corte, um
  teste único), o teto é FRACO. O selo é o da comparação do título, e o título é o que a conclusão já tinha: a comparação
  declarada antes ou a da pergunta do dono. Não se troca o título para a comparação que passa depois de ver os números; a outra
  comparação da mesma medida fica descrita ao lado, com o seu próprio resultado. Uma régua escolhida depois que só deixa a conta
  mais dura (o posto por setor da FIS-07) não rebaixa, desde que a régua declarada antes dê o mesmo selo.
  **Efeito, conclusão por conclusão:** J5 MODERADO de 2022 a 2025 (lista do técnico do time, quem cai contra o resto, 13 contra
  1); seguem FRACAS a DIN-03 (sem lista), a A4 (sem lista), a FIS-01 (índice sem lista, e não continua só com o rodízio), a J16
  (linha escolhida depois, sem lista), a ELE-07 (duas medidas não formam lista), a ORI-01 (sem lista), a A1 (família escolhida
  depois, sem lista), a M6 (1 achado em 10 métricas), a M7 (sem lista) e os zagueiros da J5 (lista no nível da sorte). A M8 fica MODERADA pelo teto: a divisão do título
  foi escolhida depois de olhar, e a lista do ataque tem mais achados do que a sorte.
- **Conclusões de repetição do atleta** (FIS-07, M1, M6, M7) — decisão 3 do dono, 14/09: FORTE quando o teste de cada par de
  anos (Spearman de cada uma das 10 métricas declaradas) dá p < 0,05 em todas, na régua do setor e também na régua declarada
  antes (o posto no ano). A mediana, o intervalo e o corte de 0,5 só descrevem o tamanho ("a ordem se mantém mais do que se
  perde"), porque o corte foi escrito depois de ver a FIS-07. Diferença entre dois grupos de atletas (quem mudou contra quem
  ficou) ou entre duas bases (físico contra técnico) é pergunta de "qual é maior": NÃO DÁ PARA AFIRMAR se o intervalo cruza zero;
  se não cruza, segue a régua comum e a regra da comparação escolhida depois (M7).
- **Como o gerador calcula o selo**: cada critério traz caminho, operador, limiar, agregação, filtro e subcampo, e `passou` sai
  do valor gravado; critério sem caminho é constante declarada no spec, não campo ausente. Na régua comum cada critério traz
  também o seu **papel** (declarada, p, firme, firme com folga, conferência, há conferência, uma conferência só, lista, rodízio,
  zona cinzenta, outra comparação), e as linhas {selo, exige} saem de uma função só a partir dos papéis — não há linha escrita à
  mão conclusão por conclusão; as regras próprias trazem as suas linhas. Vence a primeira linha cujas exigências batem todas; se
  nenhuma bate, a regra escrita não cobre os valores e a conclusão sai da tela, sem selo inventado. A prova (`sp7_prova.py`)
  recalcula `passou`, refaz as linhas a partir dos papéis e confere o selo pela régua escrita em palavras.
- **Selo do documento e tela**: o selo aqui sai da medida conferida desta rodada, com o script nomeado no rodapé. A tela só mostra
  uma conclusão quando o gerador gravar todo campo que decide o selo; até lá ela fica fora da tela e fora das cinco, sem selo
  provisório e sem rótulo de espera.

**A regra do "olhar a lista inteira", por extenso (como o gerador calcula):**
1. A lista é a família DECLARADA antes de medir em `dados/prototipo_indicadores.json`
   (técnico do time 31, elenco 10, físico do elenco 32, físico por setor 128, técnico individual 92),
   ou a família declarada da própria análise (as medidas da nota por setor, contadas por clube).
2. Conta-se quantas medidas da família dão p bruto < 0,05 na comparação da conclusão (quem sobe contra o meio,
   quem sobe contra quem cai, ou, para as escolhidas depois, quem cai contra o resto, quem sobe contra o resto,
   quem cai contra o meio).
3. Sorteiam-se os rótulos (sobe / meio / cai) **dentro de cada ano**, 10.000 vezes, com semente fixa
   (`default_rng([SEMENTE, 3, i])`, i = 5 × família + comparação; por clube, na M4, na M5 e na M8, `default_rng([SEMENTE, 17, i])`,
   i = índice do setor, com teste bruto na média do clube, sem posto no ano); cada clube-temporada leva todas as suas
   colunas junto, então a correlação entre as medidas fica. Em cada sorteio conta-se de novo, nos dois níveis (bruto e, só nas
   famílias físicas e por clube, descontado só o rodízio), com os mesmos rótulos sorteados; o resíduo do rodízio é calculado uma
   vez nos dados reais.
4. p do excesso = (1 + sorteios com contagem ≥ a observada) / 10.001. **Corte estrito: < 0,05.**
5. Vale a contagem BRUTA. O gerador grava `excesso[comparação][nível] = {observado, nulo_mediana, nulo_p95,
   p_excesso, erro_monte_carlo, sorteios, semente, lista}` — um formato só, em `etapa_3.por_familia` e em
   `sobecai_corrigido_por_clube.<setor>`.
"""

MEDIDO_SUB = ("<sub>Medido no dado novo de 15/09 (`scratchpad/dinheiro2/prototipo_novo.json`; sementes declaradas `[7, 3, i]` por família e `[7, 17, i]` por clube, 10.000 sorteios), contagem bruta (e, nas físicas e por clube, só com o rodízio): "
              "**quem sobe contra o meio** — técnico do time 7 contra 1 (p do excesso 0,037) · elenco 3 contra 0, p 0,0502, **na fronteira**: não se afirma excesso, e nenhuma conclusão depende disso "
              "· físico do elenco 0 contra 1, p 1,0 · físico por setor 9 contra 6, p 0,33 (só rodízio 9, 0,33) · técnico individual 10 contra 5, p 0,082. "
              "**Quem sobe contra quem cai** — técnico do time 17 contra 1 (0,0002) · elenco 6 contra 0 (0,0013) · físico do elenco 14 contra 1 (0,0099; só rodízio 7, 0,077) · físico por setor 27 contra 6 (0,0104; só rodízio 27, 0,0108; decide a FIS-04 e a FIS-10) · técnico individual 12 contra 5 (0,028). "
              "**Escolhidas depois de olhar (decisão 1)** — quem cai contra o resto: técnico do time 13 contra 1 (0,0024; decide a J5), técnico individual 8 contra 5 (0,19; zagueiros da J5), físico por setor 22 contra 6 (0,034); "
              "quem cai contra o meio: elenco 5 contra 0 (0,0067; descrição da J17 e da ELE-01), técnico do time 9 contra 1 (0,014), físico do elenco 4 contra 1 (0,17), técnico individual 8 contra 5 (0,20); "
              "quem sobe contra o resto: técnico do time 12 contra 1 (0,0029), técnico individual 10 contra 5 (0,085; J7). "
              "Por clube, medidas da nota: meio-campo 11 contra 1 (0,028; só rodízio 6, 0,095; M5), ataque 13 contra 1 (0,010; só rodízio 13, 0,0089; M8), zaga 4 contra 1 (0,127; só rodízio 3, 0,23; M4), lateral 4 contra 1 (0,151; só rodízio 2, 0,38; M4). "
              "2018-2021, técnico do time (medido em 14/09, `r4_saida.json`): quem sobe contra o meio 13 contra 1 (0,001), quem cai contra o resto 6 contra 1 (0,053). "
              "Lista dos 28 números do 1º turno (J8, `r10_j8_excesso.py`, [2026, 7, 1]): sem olhar o lado 4 contra 1, p 0,12; só de lado certo 4 contra 0, p 0,044 — as contas discordam, vale a mais fraca. "
              "Em 14/09 as mesmas listas saíram das sementes [2026, 916-919] (`r4_saida.json`, `r5_saida.json`), com os níveis do dinheiro que saíram; as diferenças no bruto ficam dentro do erro de Monte Carlo.</sub>")

REGRAS_FRASE = """**Regras de frase**: nada aqui é experimento — "quem sobe tem X" pode, "ter X faz subir" não, e
associação nunca vira receita · "nunca" e "nenhum" só com zero exceção, dizendo o universo · valor
de mercado (Transfermarkt, em euros) não é folha nem gasto, e "orçamento" não se escreve · só p bilateral chega ao
leitor · 2026 nunca entra em média nem conta como repetição · cada número diz de que anos e de quantos times saiu ·
mecanismo não medido entra como possibilidade ("pode"), nunca como fato · correlação e tamanho detectável em número
só no rodapé; na frase, em palavras.

**"Vale também pela faixa de pontos?"** Cada conclusão diz, quando foi medido, se a leitura se
mantém trocando sobe / meio / cai pelas faixas de aproveitamento (alta ≥ ritmo do 6º, 53,5%; baixa <
ritmo do 15º, 38,4%; 24 / 35 / 21 times em 2022-2025). **Tudo o que vem nessa linha é PROVISÓRIO até a
base de pontos fechar** (`dados/pontos.json` estava em conferência) e nunca promove o selo: a divisão
por pontos foi decidida depois de os resultados estarem à vista, e trocar de divisão até o sinal
passar é garimpo.

**Como ler cada conclusão**: o título e a primeira linha (frase e número) são o que a tela mostra; "o que isso não
quer dizer" é a ressalva da tela; o universo diz de onde saiu cada número; os critérios do selo dizem o que passou e o
que não passou, com o valor desta rodada, e marcam o que não decide o selo; o rodapé em letra pequena é a conta
técnica, com o script; a última linha pequena é a faixa de pontos, provisória."""

INTROS = {
    "dinheiro_e_elenco": "*Valor de mercado só existe de 2022 a 2025; nada foi inventado antes. A origem (veio da A / da C) cobre\n2019-2025 e vem de `dados/serieb_origem_2018_2026.csv`, base gravada e conferida em 14/09.*",
    "fisico": "*SkillCorner, 2022-2025. Só entram atletas com 300+ minutos rastreados, e cada atleta tem em média uns 15\njogos rastreados, não 38. Antes de 2022 não há físico. Desde 15/09 o físico é descontado só do número de\njogadores rastreados (o rodízio), e não mais do dinheiro; esse desconto é a 5ª pergunta da régua, mas o rodízio pode ser\nconsequência de estar caindo, então nas comparações com quem cai ele pode levar junto uma parte real da diferença.*",
    "jogo_e_padroes": "*Técnico do time e dos jogadores (Wyscout), 2022-2025, conferido em 2018-2021 onde a coluna existe. Passaram\npor cético de números todas, menos a J12 (dado inexistente) e a nova J19; J2, J4, J6, J9, J17 e J18 foram\nreconferidas em 14/09.*",
    "anos_antigos": "*80 temporadas com técnico do time. Sem valor de mercado, sem físico, sem técnico individual: todo resultado\ndeste bloco é CRU. Os dois eixos e os dois cortes da tipologia foram congelados antes do teste cego e\naplicados sem reajuste. A fonte destes números é `_fonte/prototipo/teste_cego_2018_2021.json`, congelado: o\ngerador o lê (com caminho e hash em `bases.teste_cego`) e grava as contas novas no `prototipo.json` (A3 em\n`etapa_8.teste_cego`, A4 em `etapa_0.mando`), nunca no arquivo congelado. Sem cético de números: A1, A2, A5 e A6.*",
    "mercado_e_contratacao": "*Estas conclusões são sobre as ferramentas da aba (a nota de encaixe e as listas) e sobre o que o jogador leva\nquando muda de clube, não sobre o que faz subir. A lista de nomes das etapas 13 e 14 não é conclusão do estudo.\n**Regra para qualquer frase que dependa dos nomes da etapa 14** (decisão do dono de 14/09): os nomes são contados\npor POSIÇÃO, não por vaga, em 2.000 réplicas, com sorteio próprio por proposta; um nome só é \"recomendado\" quando o\nlimite de baixo do intervalo de 95% da sua frequência passa de 50%, e é \"empate técnico\" quando o intervalo contém\n50%. Nenhum número da versão velha (contagem por vaga, 200 réplicas, sorteio global) vai para a tela: a frase\nsai do gerador novo ou não sai. Sem cético de números: M2, M3 e a nova M7.*",
}

RECUSADAS_TROCAS = [
    ('*"O físico, no conjunto, separa quem sobe do meio."* e *"o físico, sozinho, não explica a subida."* — As duas contas divergem.',
     '*"O físico, no conjunto, separa quem sobe do meio."* e *"o físico, sozinho, não explica a subida."* — As duas contas vão para o mesmo lado, e o selo segue a declarada: SEM SINAL (FIS-09).'),
    ('*"Manter a base resiste ao dinheiro (p 0,045)."* (ELE-07) — Recalculado: 0,050 a 0,089.',
     '*"Manter a base resiste ao dinheiro (p 0,045)."* (ELE-07) — Depende da conta: 0,045 pela conta da casa (posto do ano descontado o percentil de valor), 0,050 e 0,089 por outras duas; e as duas medidas foram montadas depois de olhar, sem lista acima da sorte: FRACO.'),
    ('*"213 dos 586 candidatos empatam na margem."* (M3) — Número do gerador velho; a tela lê a contagem do gerador novo.',
     '*"213 dos 586 candidatos empatam na margem."* (M3) digitado na frase — O número não é velho: o gerador de hoje dá o mesmo 213 de 586 pela definição escrita. Só não pode ser digitado: a tela lê `etapa_13.empates_na_margem`.'),
    ("— Descontado o dinheiro, subiram 6 contra 7 esperadas e caíram 0 contra menos de 1: FRACO.",
     "— Descontado o dinheiro, subiram 6 contra 7 a 8 esperadas e caíram 0 contra menos de 2 em qualquer das contas (0,6 a 1,75): FRACO."),
    ('*"J5 moderada."* — A comparação foi escolhida depois da pergunta; na declarada, some no dinheiro: FRACO.',
     '*"J5 fraca só porque a comparação foi escolhida depois da pergunta."* — Pela decisão 1 do dono, comparação escolhida depois chega a moderado quando a lista dela tem mais achados que a sorte e ela sobrevive ao dinheiro: 13 contra 1 (p 0,002) e descontado 0,019. MODERADO de 2022 a 2025; em 2018-2021 não se repetiu.'),
    ('*"O valor do elenco é o sinal mais sólido do estudo."* (DIN-01) — Ordem nunca testada; há três fortes.',
     '*"O valor do elenco é o sinal mais sólido do estudo."* (DIN-01) — Ordem nunca testada; há três fortes, e duas (DIN-01 e DIN-02) são o mesmo sinal visto por dois cortes.'),
]

RECUSADAS_NOVAS = """**Cortadas ou mudadas na reconferência de 14/09**

- *"As cinco: uma por tema na primeira passada (DIN-02, J1, FIS-10, A2, M2)."* — Decisão 2 do dono: as cinco são as mais firmes, de qualquer tema. Com o que está gravado hoje: DIN-02, J1, J2, ELE-01 e J6.
- *"Do lado de baixo, o valor do elenco pesa: MODERADO."* (DIN-03) — Quem cai contra o meio é comparação escolhida depois de olhar, sem lista de onde saia: pela decisão 1 do dono, FRACO.
- *"O ataque intenso separa quem sobe de quem cai, mas não do meio: FRACO."* (FIS-10) — A regra do excesso não tinha sido aplicada: as corridas em alta velocidade do ataque passam nos dois descontos e a lista do físico por setor, quem sobe contra quem cai, tem 27 achados contra 6: MODERADO. E "não do meio" era ausência afirmada.
- *"A colocação de um ano diz pouco sobre a do seguinte: FRACO, pelo sinal no aproveitamento."* (ELE-06) — Descontado o dinheiro, o aproveitamento some (p 0,16 nos 36 pares); a posição, conta do título, fica no limite; nenhuma das duas foi declarada antes: SEM SINAL.
- *"As medidas de formação não têm a conta dos muitos testes."* (J17) — Estão na família do elenco (q 0,045 na comparação declarada, quem sobe contra quem cai).
- *"O setor não diz nada que o valor total já não diga."* (DIN-05) — Contradizia a DIN-06: não dá para ordenar os dois.
- *"Contra quem cai o goleiro de quem sobe vale mais, mas isso é só o elenco mais caro no geral."* (ELE-04) — Ausência afirmada: descontado o valor do elenco, não se viu diferença (p 0,64).
- *"O perfil que a nota persegue nesses setores é, em boa parte, o que o elenco caro já traz."* (M4) — Quantidade não medida e ausência afirmada; o documento e o spec diziam coisas diferentes.
- *"Trocar de técnico no meio do ano muda a formação"* (J17) e *"quem muda de clube muda de posição, de papel e de liga"* (M6) — Mecanismos não medidos; viraram possibilidade ("pode").
- *"Em 2018-2021 não se viu diferença entre quem caiu e o meio no gol esperado cedido."* (J13) — O número (0,68) é de quem cai contra o resto.
- *"O melhor número de jogo fica em 0,34"* (J8, a lacuna lia a correlação parcial) e *"com força que nenhum número de jogo passa"* — O 0,44 é a correlação bruta, a que se compara com a tabela; e com o intervalo de −0,20 a +0,32 não dá para ordenar os dois.
- *"Não há um jeito só de subir."* (J9) — Afirmação categórica para um selo fraco.
- *"O ano sem torcida não apagou o mando."* (A5) — SEM SINAL escreve "não se viu".
- *"Fica acima de 0,6 em todo par de anos: FORTE."* (FIS-07) — Pela decisão 3 do dono, o forte sai do teste de cada par de anos: maior p 9,5 × 10⁻²⁶ na régua declarada antes (o posto no ano) e 1,5 × 10⁻¹² no setor (a conta mais dura, escolhida depois, que não rebaixa); o corte de 0,5 só descreve o tamanho.
- *"Em 2018-2021 o sinal apareceu fraco demais para confirmar."* (J2) — Com p 0,25 contra o meio, "não se viu"; contra quem caiu, quem subiu ficou acima (p 0,0009).
- *"Subiram 6 vezes contra umas 7 esperadas pelo valor."* (ORI-01) — Tirando os próprios clubes da A da taxa, dá 8,2: "7 a 8".
- *"O estudo enxergaria uma subida de 40% contra 15%."* (ORI-02) — Apareceria em 7 de cada 10 amostras, não sempre.
- *"Nenhuma medida física sozinha separa quem sobe do meio com segurança."* (FIS-09) — Ausência afirmada: "não se viu".
- *A PPDA de quem sobe contra quem cai só no rodapé da J14.* — Sinal sem selo próprio: virou a J19 (FRACO: some no dinheiro).
- *"Entre os 128 que ficaram no clube, o físico se repete mais que o técnico"*, dentro da M1 e sem selo — Virou a M7 (FRACO: comparação montada depois de olhar, sem lista).
- *"J2, J4, J6 e J9: leia esses selos como provisórios."* — Não existe selo provisório; e os quatro passaram pelo cético de números nesta reconferência.
- *"Os 12 números de jogo que existem nos dois períodos foram para o mesmo lado."* (A2 nas cinco) — Faltava "com selo": o técnico do time tem 31 números em 2018-2021.
- *"Um dos três sinais fortes do estudo"* e *"o G4 de hoje"* (DIN-01) — DIN-01 e DIN-02 são o mesmo sinal; e é "o grupo de acesso de hoje".
- *"A sorte produziria tão poucos em menos de 1 e em 5 de cada 100 tentativas."* (DIN-03) — Lia como "menos de 1 tentativa": é "menos de 1 de cada 100 e 5 de cada 100". E o Guarani 2024 em 7º não desmente "top 5 nunca cai"; quem desmente é o Amazonas 2025, 5º pelo Wyscout.
- *"Comparando times de orçamento parecido"* (moldes da FIS-06, FIS-08, FIS-11 e A1) e *"período antigo / recente"* sem os anos — Valor de mercado não é orçamento; o período diz os anos.
"""

RECUSADAS_FINAL = """**Cortadas ou mudadas no conserto final de 14/09**

- *"J17 MODERADA: quem cai usou mais formações que o meio da tabela."* — Na reconferência o título tinha sido trocado da comparação declarada (quem sobe contra quem cai) para quem cai contra o meio, a única das duas que passa no dinheiro (0,009 contra 0,125), e o selo subia pela troca. A decisão 1 do dono vale para a comparação que a conclusão já tinha no título: o título volta à declarada, FRACO, e quem cai contra o meio fica descrita ao lado.
- *"Defesa, meio-campo e ataque de quem sobe valem mais — mas é o mesmo dinheiro"* e *"é o valor do elenco inteiro visto por setor"* (DIN-05) — Afirmavam, no título e na frase, a equivalência que a DIN-06 não deixa afirmar: "não se viu o setor dizer algo além do valor do elenco inteiro".
- *"O ataque de quem sobe corre mais e mais rápido que o de quem cai."* (FIS-10) — A velocidade de pico some nos descontos (0,12 e 0,175); o que continua de pé é a contagem de corridas em alta velocidade. E "no limite" para 0,049, que passa do corte, misturava o nome da zona cinzenta: "logo abaixo do corte".
- *"Contra o meio, não se viu diferença"*, com rodapé "p 0,14 a 0,46" (FIS-10) — A de corridas para a área dá 0,053, na zona cinzenta: "com uma medida no limite", de 0,053 a 0,46.
- *A FIS-10 sem dizer que, depois dos dois descontos, a lista inteira do físico por setor fica no nível da sorte (2 contra 6).* — Entrou na ressalva. O selo segue a régua escrita (a contagem bruta decide o excesso); fazer o excesso depois dos descontos pesar no selo seria mudança de régua e cabe ao dono.
- *"De 2022 a 2025, é o que o elenco caro já prevê."* (ORI-01, título e ressalva) — A forma que esta própria tabela tinha cortado: "descontado o valor do elenco, não se viu a origem acrescentar nada".
- *"Em 2022 o valor não distinguiu rebaixado de meio de tabela."* (DIN-03) — "Não se viu".
- *"Mas isso não se distingue do acaso."* (A6) — SEM SINAL escreve "não se viu isso fora do acaso".
- *"O valor do elenco se repete"* no título da ELE-06 — Sinal sem selo próprio no título de uma conclusão SEM SINAL; ficou no número, como descrição do dinheiro.
- *A J1 nas cinco só com a frase.* — A frase dava como motivo do moderado o 1º turno, que não decide o selo, e escondia 2018-2021 (p 0,079), que decide; as cinco passaram a mostrar frase e número.
- *"O forte da FIS-07 sai do teste de cada par de anos (maior p 1,5 × 10⁻¹² no setor)."* — O número principal passa a ser o da régua declarada antes, o posto no ano (9,5 × 10⁻²⁶); o setor fica como a conta mais dura que não rebaixa.
- *"A regra do selo, em texto, é aplicada pelo gerador."* — Não era algoritmo: critérios sem operador nem limiar, 42 formas de regra e caminhos nulos que tirariam conclusões da tela. Cada critério ganhou caminho, operador, limiar, agregação, filtro e subcampo (sem caminho, é constante), e cada conclusão, uma regra ordenada que a prova recalcula.
- *"Excesso por clube com `default_rng([SEMENTE, 13, i])`."* (M4, M5) — Colidia com o gerador de cada atleta da etapa 13 (ids 0 a 3): virou `[SEMENTE, 17, i]`, e o p do excesso muda dentro do erro de Monte Carlo.
"""

FONTES_EXTRA = (" Rodada sem dinheiro de 15/09: dado novo `scratchpad/dinheiro2/prototipo_novo.json`, declarações e ordem de serviço em `_fonte/prototipo/sessao_14_09/` (versão 2026-09-14-noite-sem-dinheiro), régua comum em `sp6_maquina.py` (`ordem_comum`, critérios com papel), limpeza dos rodapés e da lista do que foi recusado em `sp8_limpeza.py`, prova em `sp7_prova.py` (tudo em `scratchpad/dinheiro2/conc/src/`). Conserto final de 14/09: `sp6_maquina.py` (forma de máquina dos critérios do selo e regra ordenada, conferida contra o selo de cada conclusão). Reconferência de 14/09: `cf_num/v_ele06.py`, `cf_num/v_ori.py`, `cf_num/v_j17.py`, `cf_num/v_fam.py` (scripts do cético de números, rodados de novo), `r12_fis07_pares.py` (teste de cada par de anos da FIS-07, `r12_saida.json`), "
                "`r13_varios.py` (J19, FIS-01, ELE-07, A3, M3, J11, M6), `sp6_c1_dinheiro.py` a `sp6_c5_mercado.py` (a fonte única das conclusões), `sp6_ordem.py` (ordem de serviço do gerador, `ordem_gerador_bloco2.json`, e `declaracoes_novas.json`), "
                "`sp6_montar.py` (escreve este documento e o spec) e `sp7_prova.py` (prova id a id).")

# ----------------------------------------------------------------- regua do spec
REGUA_SPEC = {
    "ordem_de_leitura": "selo antes da frase",
    "versao": "régua final de 15/09/2026 (rodada sem dinheiro): proposta 'contra a sorte' do plano aprovado (sessao_14_09/dinheiro_parte1_resultado.json, chave plano.regua_final), com as quatro respostas do dono da noite de 14/09 e as decisões do coordenador; declarada em sessao_14_09/declaracoes_novas.json, chave regua_final",
    "perguntas": [
        "1. A comparação foi escrita antes de olhar?",
        "2. É firme? q de Benjamini-Hochberg < 0,05 na família declarada; num teste único declarado, q = p",
        "3. Foi conferida por outro caminho? Conferências testáveis: o 1º turno prevendo o 2º (p parcial < 0,05 E no lado declarado; não pelo q dos 28) e 2018-2021 (p < 0,05 E mesmo sinal); quando o teste é por ano (DIN-01, DIN-02), também 'cada ano sozinho' e 'deixando um ano de fora' — critério: na DIN-01, acerto de pares de quem sobe contra o resto > 0,5 em todo ano e no deixa-um-de-fora; na DIN-02, contagem de promovidos entre os mais caros acima do esperado por acaso em todo ano; sem p (ver conferencia_por_ano)",
        "4. A lista de onde ela saiu tem mais achados do que a sorte produz? (p do excesso < 0,05, contagem bruta)",
        "5. Só no físico: continua entre times que rodaram o elenco parecido? (p < 0,05 descontado SÓ o posto de atletas rastreados, fis_atletas ou fis_<setor>_atletas)",
    ],
    "saiu_da_regua_em_15_09": {
        "dinheiro": "o desconto pelo valor do elenco ('descontado o dinheiro', 'continua entre times/elencos de valor parecido') sai de todo selo, porta, marca, gate e frase de critério; o valor do elenco continua DESCRITO (etapa 1, régua H_dinheiro, DIN-*, cenários da etapa 14)",
        "ano_seguinte": "'o mesmo clube repete o número no ano seguinte' (rho_persist, esmaecido da etapa 9, rho < 0,15 da etapa 10) sai das conferências e do desempate; etapa_6.rho continua como DADO; as conclusões cujo assunto é a repetição (FIS-07, M1, M6, M7, ELE-06) ficam, com o selo",
        "tambem": ["os níveis liq e liq2 do excesso (liq2 vira rod)", "o controle da cobertura do valor na DIN-01", "a constante 'o desconto do dinheiro não se aplica'", "'dificilmente é sorte' e 'no limite' como rótulo de sorte"],
    },
    "selos": {
        "sem_sinal": "p >= 0,10; ou zona cinzenta (0,05 <= p < 0,10) sem p < 0,05 em outra comparação da mesma linha, com a palavra 'no limite'; a frase diz em palavras o que o estudo veria (16 x 48: 'só uma diferença grande apareceria'; 16 x 16: 'só uma muito grande'), com o tamanho em número só no rodapé (etapa_0.poder), e escreve 'não se viu'",
        "fraco": "zona cinzenta com p < 0,05 em outra comparação da mesma linha; OU, no físico, p_rod >= 0,05; OU declarada, não firme (q >= 0,05) e com a lista da família no nível da sorte; OU comparação escolhida depois de olhar sem lista ou com a lista dela no nível da sorte",
        "moderado": "comparação escolhida depois de olhar com a lista DELA acima da sorte (nunca forte); OU declarada e não firme com a lista da família acima da sorte; OU declarada e firme com alguma conferência testável que falhou (conferências que discordam: vale a mais fraca); OU declarada e firme SEM NENHUMA conferência testável (sem conferência testável = moderado, nunca forte); OU firme por pouco (0,025 <= q < 0,05) com UMA conferência testável só, mesmo que ela passe (regra geral, resposta a do dono); no físico, sempre com p_rod < 0,05",
        "forte": "declarada E firme (q < 0,05) E PELO MENOS UMA conferência testável E todas as testáveis passando E fora da cláusula firme por pouco com uma conferência só; no físico, também p_rod < 0,05; nunca por comparação escolhida depois de olhar. Repetição do atleta: regua.repeticao_do_atleta",
        "nao_da_para_afirmar": "só três casos: (a) pergunta de 'qual dos dois é maior' (duas medidas, dois períodos, dois grupos de atletas, duas bases, um nome contra o vizinho) com intervalo da diferença cruzando zero; (b) pergunta nunca medida porque o dado não existe; (c) duas contas sobre a mesma pergunta com lados opostos. Diferença entre grupos com p >= 0,10 é sem_sinal. Campo não gravado NÃO produz selo: tira a conclusão da tela (selo_documento_e_tela)",
    },
    "sem_conferencia_testavel": "nenhuma conferência testável = MODERADO, nunca FORTE (cláusula escrita com todas as letras; sem ela, ELE-01, ELE-02, ELE-03, FIS-04, J6, A2, M5 e M8 virariam fortes por não ter nada para conferir)",
    "firme_por_pouco": {"regra": "0,025 <= q < 0,05 (no q sem arredondar) com exatamente UMA conferência testável = MODERADO, mesmo que ela passe", "decisao": "resposta a do dono, 14/09 (noite), regra geral", "hoje_atinge": "J17"},
    "contas_da_mesma_pergunta": "no mesmo lado, uma passando do corte e a outra não: segue a conta declarada antes (J10, FIS-09); se nenhuma foi declarada antes, vale o selo mais fraco (ELE-06, J8, J9)",
    "zona_cinzenta": "0,05 <= p < 0,10: fraco se há p < 0,05 em outra comparação da mesma linha; senão sem_sinal com a palavra 'no limite' (o único lugar em que 'no limite' aparece)",
    "desempate": "quando conferências discordam, duas contas sobre a mesma medida discordam, ou dois céticos discordam, vale o selo mais fraco; o mesmo clube no ano seguinte não entra mais no desempate",
    "vocabulario_sorte": {
        "chaves": {"firme": "q < 0,05 (teste único: q = p)", "pode_ser_sorte": "p < 0,05 e q >= 0,05", "sem_diferenca": "p >= 0,05 ('sem diferença clara'; ρ: 'sem relação clara'; grupos: 'sem separação clara')"},
        "por_pouco": "só atrás de 'firme', quando 0,025 <= q < 0,05; não é quarta chave",
        "no_limite": "só no selo, para a zona cinzenta",
        "lista": "'a lista tem (não tem) mais achados do que a sorte produz' (p do excesso < 0,05)",
        "nome_proprio": "'acima da linha da sorte' (ranking_gaps) não disputa a palavra",
        "declaracao": "sessao_14_09/declaracoes_novas.json, chave vocabulario_sorte",
    },
    "ressalva_sem_desconto": {
        "decisao": "resposta b do dono, 14/09 (noite): a aba fica mais afirmativa",
        "texto": "elenco valioso tende a ter isso; o estudo não separa as duas coisas",
        "onde": "nas conclusões que sobem por esta régua (ELE-03, FIS-04, J17, J19, A2, M8) e nas outras em que o número anda com o valor do elenco (ORI-01, J15, A1)",
        "nunca": "virar teto de selo nem desconto (voltaria o dinheiro por outra porta)",
        "medida": "etapa_2.andam_com_o_valor (declaracoes_novas.andam_com_o_valor); ainda não gravada: onde não há medida, a frase sai sem número",
    },
    "regime_comum": {
        "o_que_e": "as conclusões de diferença entre grupos têm critérios com PAPEL e as linhas {selo, exige} saem de uma função só (sp6_maquina.ordem_comum), sem remendo conclusão por conclusão",
        "papeis": {"declarada": "1. comparação escrita antes de olhar (constante ou campo)", "p": "p bruto < 0,05 na comparação do título", "zona": "p < 0,10", "outra": "p < 0,05 noutra comparação da mesma linha",
                   "q": "2. firme", "q_folga": "firme com folga (q < 0,025)", "conf": "3. conferência testável (cada critério; todas têm de passar)", "ha_conf": "constante: há conferência testável",
                   "uma_conf": "constante: há uma conferência testável só", "lista": "4. lista acima da sorte", "rod": "5. físico: p_rod < 0,05"},
        "linhas": "zona: sem_sinal {p:F, zona:F}, sem_sinal {p:F, zona:T, outra:F}, fraco {p:F, zona:T, outra:T} · físico: fraco {p:T, rod:F} · escolhida depois: moderado {declarada:F, p:T, lista:T}, fraco {declarada:F, p:T, lista:F} (sem lista: fraco {declarada:F, p:T}) · declarada: forte {…, q:T, ha_conf:T, toda conf:T, q_folga:T}, forte {…, q:T, ha_conf:T, toda conf:T, uma_conf:F}, moderado {…, q:T}, moderado {…, q:F, lista:T}, fraco {…, q:F, lista:F} (sem lista: fraco {…, q:F}); '…' = declarada:T, p:T e, no físico, rod:T",
        "regimes_proprios": "repetição do atleta (FIS-07, M6, M7), contas da mesma pergunta (ELE-06, J8, J9), não dá para afirmar (DIN-06, J12, A3, M1, M3), sem sinal de uma ou várias medidas (ORI-02, DIN-04, DIN-05, ELE-04, ELE-05, FIS-05, FIS-09, J10, J11, J14, J18, A5, A6, M2), lista inteira (FIS-04), contagem com corte declarado (DIN-02): campo 'regime' de cada conclusão",
    },
    "conferencia_por_ano": {
        "DIN-01": "cada ano sozinho: auc_posto_de_valor.por_ano[].auc_sobe_x_resto > 0,5 em todo ano; deixando um ano de fora: loso_sobe_x_resto > 0,5; sem p",
        "DIN-02": "contagem de promovidos no top 8 acima do esperado por acaso em todo ano (lista gravada de promovidos); sem p",
        "limite": "com poucos promovidos por ano, um acerto pouco acima de 0,5 num ano não se distingue do acaso",
        "pergunta_em_aberto_para_o_dono": "se o acerto acima de 0,5 não for aceito como conferência, a DIN-01 cai para moderado pela cláusula sem_conferencia_testavel; até a decisão, o selo segue o plano aprovado",
    },
    "conclusoes_partidas_ou_relidas": {
        "M4_M8": "resposta d do dono: M4 = zaga e lateral (fraco); o ataque vira a M8 (moderado); família e comparação declaradas antes, divisão do título depois de olhar (declaracoes_novas.conclusao_ataque_por_clube); por isso a M8 tem teto moderado na máquina (declarada_constante false), para nunca subir a forte sem decisão",
        "A1": "decisão do coordenador: família dos 2 eixos da tipologia, escolhida depois de olhar (declaracoes_novas.familia_A1): fraco",
        "DIN04_DIN05": "decisão do coordenador: lidas por jogador (ponderado_por_jogador.particao), sem sinal, com a fatia em euros descrita (declaracoes_novas.din04_din05_por_jogador)",
        "porta_A": "resposta c do dono: só leitura, nome 'firme e reaparece por outro caminho'; a nota da etapa 13 não muda (ESPECIFICACAO 6.5)",
    },
    "regras_de_frase": [
        "associação não é causa: nada de 'faz subir', 'evita cair', 'contrate X para'",
        "'nunca' e 'sempre' só com zero exceção verificada no dado; uma exceção vira 'quase nunca' com o nome",
        "o que a conferência derrubou não volta (PSV-99 do top-5, 'ROTA não replica', 'TERRITÓRIO ficou mais forte', 'a tipologia caiu no teste cego')",
        "valor de mercado nunca é 'gasto', 'gastar', 'custa' nem 'orçamento'",
        "'descontado o dinheiro', 'entre elencos (ou times) de valor parecido' e 'não se viu o mesmo clube repetir o número' não entram como critério nem como motivo de selo (15/09); a relação com o valor do elenco só como ressalva sem desconto",
        "vocabulário único de sorte: firme / pode ser sorte / sem diferença clara; 'por pouco' só atrás de firme; 'no limite' só no selo; nunca 'dificilmente é sorte'",
        "sem_sinal escreve 'não se viu', nunca 'não separa' ou 'não existe' (a ressalva 'o estudo não separa as duas coisas' é a forma do dono para dizer que o estudo não distingue duas explicações, e não conta como ausência)",
        "q de BH não se traduz como 'chance de acaso'; traduzir como 'contando os N testes, é firme' ou 'contando os N testes, já não dá para descartar a sorte'",
        "só p bilateral chega ao leitor",
        "2026 nunca conta como repetição nem entra em média",
        "associação nunca vira receita",
        "mecanismo não medido só como possibilidade ('pode')",
        "ordem nunca testada não entra ('o mais firme', 'o único que passa em tudo', 'o que mais separa', 'um dos três sinais fortes' quando dois são o mesmo sinal)",
        "frase que junta universos diferentes diz cada universo",
        "frase que depende dos nomes da etapa 14 sai do gerador novo ou não sai",
        "tamanho detectável e correlação em número só no rodapé; na frase, em palavras",
        "ausência só com 'não se viu' quando p >= 0,05",
        "período sempre com os anos ({periodo_antigo}, {periodo_recente}), nunca 'período antigo' sozinho",
        "molde sem número digitado: todo número vem de uma lacuna (as únicas exceções são as unidades 'de cada 100', 'em 100' e 'intervalo de 95%')",
    ],
    "rotulos_permitidos": SELO_ORD,
    "sem_sexto_rotulo": "contagem sem teste próprio vira descrição da conclusão de onde herda o selo (ex.: euros → DIN-01); 'descritivo', 'provisório' e 'não se aplica' não são selos",
    "regra_do_excesso": {
        "decisao": "dono, 14/09/2026: desempate MODERADO x FRACO = 'olhar a lista inteira'",
        "familia": "a família DECLARADA de dados/prototipo_indicadores.json da linha (tecnico_col, elenco, fisico_col_elenco, fisico_col_setor, tecnico_ind) ou a família declarada da análise (medidas da nota por setor, contadas por clube)",
        "comparacao": "a da conclusão (SM, SC; e CR, SR, CM para comparações escolhidas depois)",
        "contagem_observada": "número de linhas da família com p bruto < 0,05 na comparação",
        "nulo": "rótulos sobe/meio/cai permutados DENTRO de cada ano; o clube-temporada leva todas as colunas; recontagem em cada sorteio nos dois níveis (bruto e, nas famílias físicas e por clube, rod) com os mesmos rótulos; resíduo do rodízio calculado uma vez nos dados reais",
        "sorteios": 10000,
        "semente": "default_rng([SEMENTE, 3, i]) com i = 5 × índice da família + índice da comparação (declaracoes_novas.excesso_por_familia); por clube, default_rng([SEMENTE, 17, i]) com i = índice do setor (o [SEMENTE, 13, id] já é o gerador de cada atleta na etapa 13: não pode ser reusado)",
        "p_excesso": "(1 + sorteios com contagem >= observada) / (sorteios + 1)",
        "corte": "estrito: p_excesso < 0,05",
        "nivel": "contagem BRUTA decide; o nível rod é a 5ª pergunta só na FIS-04 (a conclusão é sobre a lista) e fica descrito nas outras",
        "gravar": "etapa_3.por_familia[f].excesso[comparacao][nivel] = {observado, nulo_mediana, nulo_p95, p_excesso, erro_monte_carlo, sorteios, semente, lista}; sobecai_corrigido_por_clube.<setor>.excesso.SC[nivel] = idem",
        "medido_15_09": "ver CONCLUSOES.md, rodapé da régua (dado novo prototipo_novo.json, sementes declaradas); valores de referência para conferir o gerador, não para a tela",
        "fronteira_elenco": "SM bruto 0,044 a 0,052 em 12 sementes em 14/09; a declarada [7,3,5] dá 0,0502 no dado novo: não se afirma excesso; conclusão do elenco não fica moderada por essa conta",
    },
    "faixa_de_pontos": {"campo": "vale_pela_faixa_de_pontos em cada conclusão", "regra": "só entra quando medido; sempre provisório até dados/pontos.json ser regerado no item 6 e fechado; nunca promove o selo", "de_onde_a_tela_le": "PONTOS.conclusoes (gerado por gerar_pontos.py)"},
    "comparacao_escolhida_depois_de_olhar": {
        "decisao": "dono, 14/09/2026 (decisão 1); sem o 'E sobreviver ao desconto do dinheiro' desde 15/09",
        "regra": "comparação, índice ou lista escolhida DEPOIS de ver os números (toda chave declarada_depois_de_olhar=true em declaracoes_novas; toda comparação CR, SR, CM; a família da A1; a divisão do título da M4/M8 não, porque família e comparação foram declaradas antes) não conta no BH; pode ser MODERADA só se a lista dela tiver mais achados que a sorte (p_excesso < 0,05, contagem bruta, na família declarada e na comparação escolhida); senão teto FRACO; nunca FORTE; sem lista de onde a comparação saia, teto FRACO",
        "selo_da_conclusao": "o da comparação do título; o título é o que a conclusão já tinha (a declarada antes ou a da pergunta do dono) e não se troca para a comparação que passa depois de ver os números; a outra comparação da mesma medida fica descrita ao lado",
        "excecao": "régua escolhida depois que só deixa a conta mais dura (posto por setor na FIS-07) não rebaixa, se a régua declarada antes der o mesmo selo",
        "efeito_por_conclusao": {
            "J5": "moderado de 2022 a 2025 (lista tecnico_col CR 13 contra 1, p 0,0024); 'em 2018-2021 não se repetiu'",
            "J5_zagueiros": "fraco (lista tecnico_ind CR 8 contra 5, p 0,19)",
            "J17": "a comparação do título é a SC declarada (moderado pela resposta a do dono: firme por pouco com uma conferência só); a CM (lista elenco CM 5 contra 0, p 0,0067) fica descrita ao lado",
            "M8": "teto moderado: família e comparação declaradas antes, divisão do título escolhida depois de olhar; a lista do ataque tem mais achados do que a sorte e alcança o moderado",
            "DIN-03": "fraco (cai x meio sem lista)",
            "A1": "fraco (família dos 2 eixos escolhida depois, sem lista)",
            "A4": "fraco (comparação entre períodos sem lista)",
            "FIS-01": "fraco (índice sem lista; e não continua só com o rodízio, 0,077)",
            "J16": "fraco (linha escolhida depois, sem lista)",
            "ELE-06": "não sobe (sem lista); sem sinal pela regra das contas da mesma pergunta",
            "ELE-07": "fraco (2 medidas não formam lista)",
            "ORI-01": "fraco (sem lista)",
            "M6": "fraco (1 achado em 10 métricas)",
            "M7": "fraco (comparação físico x técnico montada depois, sem lista)",
            "M1": "não dá para afirmar (intervalo cruza zero; a regra não sobe)",
            "J7": "fraco pela declarada (SM); SR: lista tecnico_ind 10 contra 5, p 0,085 → teto fraco; CR zona cinzenta",
            "ELE-01": "moderado pela SC declarada; a parte CM também seria moderada (lista 0,0067) — sem efeito",
            "FIS-07": "exceção da régua mais dura — sem efeito",
        },
    },
    "repeticao_do_atleta": {
        "aplica_a": ["FIS-07", "M1", "M6", "M7"],
        "decisao": "dono, 14/09/2026 (decisão 3)",
        "medida": "Spearman do posto do mesmo atleta em t e t+1, nas 10 métricas declaradas da etapa 11, na régua declarada, ano <= 2025, chave do atleta nome + data de nascimento",
        "forte_se": "o teste de cada par de anos (Spearman de cada métrica, H0 rho = 0) dá p < 0,05 em todas as métricas e pares (p_max < 0,05), na régua do setor E na régua declarada antes (posto no ano)",
        "moderado_se": "p < 0,05 em algum par e não em todos",
        "tamanho": "mediana, ic95 e o corte de 0,5 descrevem o tamanho; não decidem",
        "diferenca_entre_grupos": "mudou x ficou e físico x técnico são 'qual é maior': nao_da_para_afirmar se o ic95 da diferença cruza zero; se não cruza, régua comum e regra da comparação escolhida depois (M7)",
    },
    "selo_calculado": {"forma_do_criterio": dict(MQ.FORMA_DO_CRITERIO, papel="só na régua comum: declarada | p | zona | outra | q | q_folga | conf | ha_conf | uma_conf | lista | rod (regua.regime_comum.papeis)"),
                       "leitura_da_regra": MQ.LEITURA_DA_REGRA,
                       "campo_da_conclusao": "conclusoes[].regra_maquina = {ordem: [{selo, exige: {id_do_criterio: passou}}], selo_padrao}; conclusoes[].regime; conclusoes[].entradas_da_regua = {regime, papeis: {papel: [ids]}, declarada_constante}",
                       "regra_do_selo": "conclusoes[].regra_do_selo continua como texto para leitura; quem decide é regra_maquina"},
    "selo_documento_e_tela": "o selo do CONCLUSOES.md e o forca_esperada_hoje saem da medida conferida da rodada (script nomeado) contra o dado novo de 15/09. A tela só mostra a conclusão quando o gerador gravar todo critério com decide=true; até lá ela fica fora da tela e fora das cinco. Não existe selo provisório nem rótulo de espera.",
}

# ----------------------------------------------------------------- regime das conclusões que não mudaram de forma em 15/09
# (a régua comum só gera as linhas das diferenças entre grupos; estas seguem com as linhas próprias de 14/09, sem critério de dinheiro)
REGIME_ANTIGO = {
    "DIN-02": "propria: contagem com corte declarado e conferência por ano", "DIN-06": "propria: não dá para afirmar", "J12": "propria: não dá para afirmar",
    "A3": "propria: não dá para afirmar", "M1": "propria: não dá para afirmar", "M3": "propria: não dá para afirmar",
    "ORI-02": "propria: sem sinal", "ELE-04": "propria: sem sinal", "ELE-05": "propria: sem sinal", "FIS-05": "propria: sem sinal", "FIS-09": "propria: sem sinal (contas da mesma pergunta, segue a declarada)",
    "J10": "propria: sem sinal (contas da mesma pergunta, segue a declarada)", "J11": "propria: sem sinal", "J14": "propria: sem sinal", "J18": "propria: sem sinal", "A5": "propria: sem sinal",
    "A6": "propria: sem sinal", "M2": "propria: sem sinal", "FIS-07": "propria: repetição do atleta", "M6": "propria: repetição do atleta", "M7": "propria: repetição do atleta (qual base é maior, montada depois)",
    "J8": "propria: contas da mesma pergunta", "J9": "propria: contas da mesma pergunta",
}

MOTIVO_15_09 = {
    "DIN-04": "relida por jogador (decisão do coordenador): o índice da defesa dá p 0,26; a fatia em euros (p 0,036, q 0,144) fica descrita; sai o desconto do valor total",
    "DIN-05": "'algo além do valor do elenco' lido pela partição por jogador: menor p 0,26 nos 4 setores; o valor por jogador maior fica como descrição da DIN-01",
    "ELE-03": "era fraca só pelo desconto do valor (0,076); firme por pouco (q 0,038) e sem conferência testável; ressalva do elenco valioso sem desconto",
    "FIS-04": "era fraca porque o desconto do valor levava quase tudo; só com o rodízio sobram 34 de 41 e a lista por setor segue acima da sorte (p 0,0108); sem conferência testável",
    "J17": "o desconto do valor (0,125) era o único motivo do fraco; firme por pouco (q 0,0447) e com uma conferência só (2018-2021, p 0,025): moderado pela resposta a do dono",
    "J19": "era fraca só pelo desconto do valor (0,83); firme (q 0,0086); o 1º turno (0,31) e 2018-2021 (0,87) falham; ressalva do elenco valioso sem desconto",
    "A2": "era fraca porque 7 dos 12 números não passavam no desconto do valor; teste único declarado e firme (p 0,020), sem conferência testável",
    "M4": "partida (resposta d do dono): fica só com zaga e lateral, fraco (listas 0,127 e 0,151, nenhuma firme por clube); o ataque saiu para a M8",
    "M8": "nova (partida da M4): o ataque é firme por clube, 13 medidas continuam só com o rodízio e a lista tem 13 contra 1 (p 0,010); teto moderado, porque a divisão do título foi escolhida depois de olhar",
}

# ----------------------------------------------------------------- montagem
def main():
    concs = [c for m in MODS for c in importlib.import_module(m).C]
    ids = [c["id"] for c in concs]
    assert len(ids) == len(set(ids))
    bk = parse_bk()
    bk_spec = {c["id"]: c for c in json.load(open(BK_SPEC, encoding="utf-8"))["conclusoes"]}
    cont = {s_: 0 for s_ in SELO_ORD}
    itens, blocos_md = [], {t: [] for t in TEMAS_ORDEM}
    for c in concs:
        MQ.aplicar(c)
        lac, val = preencher(c)
        cont[c["selo"]] += 1
        rod_bk, fx_bk = bk.get(c["id"], (None, None))
        if c.get("rodape_texto"):
            rodape = c["rodape_texto"]
        else:
            if rod_bk is None:
                raise SystemExit(f"{c['id']}: sem rodapé no documento antigo")
            rodape = aplicar_ops(rod_bk, c.get("rodape_ops", []), c["id"])
        rodape = LZ.aplicar(LZ.RODAPE, c["id"], rodape, "rodapé")
        if c.get("faixa_texto"):
            faixa = c["faixa_texto"] if c["faixa_texto"].startswith("<sub>") else "<sub>" + c["faixa_texto"] + "</sub>"
        else:
            faixa = fx_bk
        if faixa:
            faixa = LZ.aplicar(LZ.FAIXA, c["id"], faixa, "faixa")
        m = moldes(c)
        falta = faltando(c)
        entry = {
            "id": c["id"], "tema": c["tema"], "etapa": c["etapa"], "forca_esperada_hoje": c["selo"], "comparacao_declarada_antes": c["declarada"],
            "molde": m, "universo": c["universo"], "lacunas": lac, "valores_14_09": val,
            "criterios_do_selo": c["crit"], "regra_do_selo": c["regra"], "regra_maquina": c["regra_maquina"], "p_principal": c["p"],
            "elegivel_hoje_para_as_cinco": not falta, "campos_que_decidem_e_faltam": falta,
            "passou_pelos_ceticos": c["ceticos"],
            "revisao_14_09": dict(bk_spec.get(c["id"], {}).get("revisao_14_09", {}), reconferencia=c["rev"]),
            "vale_pela_faixa_de_pontos": {"texto_documento": faixa, "provisorio": True, "gerador": "PONTOS.conclusoes[id]"},
            "documento": {"rodape": rodape},
        }
        if c.get("nova_em"):
            entry["nova_em"] = c["nova_em"]
        elif bk_spec.get(c["id"], {}).get("nova_em"):
            entry["nova_em"] = bk_spec[c["id"]]["nova_em"]
        entry["regime"] = c.get("regime", "comum") if c.get("entradas_da_regua") else REGIME_ANTIGO[c["id"]]
        if c.get("entradas_da_regua"):
            entry["entradas_da_regua"] = c["entradas_da_regua"]
        if c.get("rev15"):
            entry["revisao_15_09"] = c["rev15"]
        if c.get("regra_da_etapa_14"):
            entry["regra_da_etapa_14"] = c["regra_da_etapa_14"]
        itens.append(entry)
        # bloco do documento
        ls = [f"**[{SELO_TAG[c['selo']]}] {c['id']} · {titulo_md(render(m['titulo'], val))}**"]
        corpo = render(m["frase"], val) + ((" " + render(m["numero"], val)) if m["numero"] else "")
        ls.append(corpo + "  ")
        ls.append("*O que isso não quer dizer:* " + ressalva_doc(render(m["ressalva"], val)) + "  ")
        if m.get("descricao_em_euros"):
            ls.append("*Em euros (descrição desta conclusão, mesmo selo):* " + render(m["descricao_em_euros"], val) + "  ")
        ls.append("*Universo:* " + render(c["universo"], val) + ".  ")
        ls.append("*Critérios do selo:* " + " · ".join(crit_md(k) for k in c["crit"]) + ".")
        if m["tecnico"]:
            ls.append("<sub>Na tela, em letra pequena: " + render(m["tecnico"], val) + "</sub>")
        ls.append("<sub>" + rodape + "</sub>")
        if faixa:
            ls.append(faixa)
        blocos_md[c["tema"]].append("\n".join(ls))

    hoje = cinco(concs, True)
    antes = {x["id"]: x for x in json.load(open(ANTES_SPEC, encoding="utf-8"))["conclusoes"]}
    mudancas = []
    for c in concs:
        s_antes = antes[c["id"]]["forca_esperada_hoje"] if c["id"] in antes else None
        partida = c["id"] == "M4"
        if s_antes != c["selo"] or partida:
            mudancas.append({"id": c["id"], "antes": s_antes, "depois": c["selo"], "motivo": MOTIVO_15_09[c["id"]]})
    if sorted(m_["id"] for m_ in mudancas) != sorted(MOTIVO_15_09):
        raise SystemExit(f"motivos da tabela antes → depois não batem com as mudanças: {sorted(m_['id'] for m_ in mudancas)}")
    depois = cinco(concs, False)
    total = len(concs)
    val_de = {it["id"]: it["valores_14_09"] for it in itens}
    mold_de = {it["id"]: it["molde"] for it in itens}

    # ---------------- spec
    old = json.load(open(BK_SPEC, encoding="utf-8"))
    spec = {
        "_doc": ("Especificação do bloco `conclusoes` que o gerador vai gravar em dados/prototipo.json e a tela vai montar. Uma entrada por conclusão do _fonte/prototipo/CONCLUSOES.md, "
                 "e as duas saem da mesma fonte (scratchpad/sp6_c*.py, montadas por sp6_montar.py; prova id a id em sp7_prova.py). Moldes sem número digitado: todo número vem de uma lacuna; "
                 "valores_14_09 são os valores desta rodada para cada lacuna (os de caminho gravado conferidos contra o prototipo.json). 'forca_esperada_hoje' é o selo que a régua dá com as medidas conferidas "
                 "da rodada; a tela usa o selo CALCULADO pelo gerador e só mostra uma conclusão quando todo critério com decide=true estiver gravado. Toda lacuna ou critério que lê campo ainda não gravado "
                 "aponta um caminho coberto por _fonte/prototipo/sessao_14_09/ordem_gerador_bloco2.json. Reconferido em 14/09/2026 (três lentes e três decisões do dono) e refeito em 15/09/2026 na rodada sem dinheiro: régua final do plano aprovado, com as quatro respostas do dono e as decisões do coordenador; valores_14_09 (o nome da chave ficou, para não quebrar quem lê) trazem os valores do dado novo de 15/09 (scratchpad/dinheiro2/prototipo_novo.json, ainda não gravado); revisao_15_09 diz o que mudou em cada conclusão; regime e entradas_da_regua dizem como a régua lê cada uma."),
        "gerado_em": "2026-09-15",
        "regua": REGUA_SPEC,
        "formatos": FORMATOS_DOC,
        "cinco_que_precisa_ler": [c["id"] for c in hoje],
        "temas": {t: TEMAS_NOME[t] for t in TEMAS_ORDEM},
        "temas_ordem": TEMAS_ORDEM,
        "conclusoes": itens,
        "descartadas": {"fonte": "_fonte/prototipo/CONCLUSOES.md, seção 'O que parecia conclusão e não é'", "regra_da_tela": "a lista é texto fixo de auditoria (o que foi recusado e por quê), não molde"},
        "campos_novos_no_gerador_resumo": {"arquivo": "_fonte/prototipo/sessao_14_09/ordem_gerador_bloco2.json (versão 2026-09-14-noite-sem-dinheiro)", "caminhos": [cp["caminho"] for cp in ORDEM["campos"]]},
        "historico": json.load(open(ANTES_SPEC, encoding="utf-8"))["historico"] + [{"data": "2026-09-15", "sessao": "1abbf5c7 (rodada sem dinheiro)", "o_que": "régua final do plano aprovado ('contra a sorte'): sai o desconto pelo valor do elenco e o mesmo clube no ano seguinte dos critérios; sem conferência testável = moderado; firme por pouco com uma conferência só = moderado (resposta a); ressalva do elenco valioso sem desconto (b); porta A só leitura (c); M4 = zaga e lateral e o ataque vira a M8 (d); A1 na família dos 2 eixos, DIN-04/05 por jogador (coordenador); vocabulário único de sorte; régua comum com critérios por papel e linhas geradas; selos conferidos contra prototipo_novo.json; 57 conclusões"}],
        "regra_das_cinco": {
            "decisao": "dono, 14/09/2026 (decisão 2): as cinco MAIS FIRMES, de qualquer tema",
            "passos": ["só entram conclusões com todo critério decide=true GRAVADO numa base que o gerador lê (dados/prototipo.json, _fonte/prototipo/teste_cego_2018_2021.json, bases declaradas) ou contado direto de uma lista gravada; número só de scratchpad, laudo ou dados/pontos.json não conta",
                       "ordenar pelo selo calculado: forte, moderado, fraco, sem_sinal, nao_da_para_afirmar; sem limite por tema",
                       "desempate dentro do mesmo selo pelo número mais firme: menor p_principal.valor (p bilateral do teste que decide o selo); p_principal nulo vai depois dos que têm p; empate exato ou dois nulos: a ordem de 'conclusoes'",
                       "as cinco primeiras; fracas e sem sinal continuam no documento e na aba, por tema"],
            "resultado_com_o_gravado_no_dado_novo_15_09": [{"id": c["id"], "selo": c["selo"], "p_principal": c["p"]["valor_14_09"]} for c in hoje],
            "quando_o_gerador_gravar_a_ordem_de_servico": [{"id": c["id"], "selo": c["selo"], "p_principal": c["p"]["valor_14_09"]} for c in depois],
            "gerador_calcula": "conclusoes.cinco_que_precisa_ler; os dois resultados acima são referência de 15/09 (dado novo, ainda não gravado)",
            "nota": "DIN-01 e DIN-02 são o mesmo sinal visto por dois cortes; a regra não junta conclusões, só ordena",
        },
        "temas_da_regra_antiga": "a primeira passada com uma conclusão por tema foi retirada pela decisão 2 do dono (14/09)",
        "fontes_externas": {
            "_doc": "arquivos que conclusões usam e o gerador ainda NÃO lê como base; cada um entra em `bases` com caminho e sha256 antes do bloco conclusoes; resolvedor falha alto se faltar",
            "_fonte/prototipo/teste_cego_2018_2021.json": {"usado_por": sorted({c["id"] for c in concs if "teste_cego" in json.dumps(c["lac"]) + json.dumps(c["crit"]) + json.dumps(c["p"])}), "congelado": True,
                                                            "regra": "só leitura; A3 grava em etapa_8.teste_cego.diferenca_entre_blocos e A4 em etapa_0.mando no prototipo.json"},
            "dados/serieb_clube_temporada_2018_2021.csv": {"usado_por": sorted({c["id"] for c in concs if "antigo" in json.dumps(c["lac"]) + json.dumps(c["crit"])} | {"ELE-06"})},
            "dados/serieb_origem_2018_2026.csv": {"usado_por": ["ORI-01", "ORI-02"], "estado": "base gravada e conferida em 14/09 (Wikipedia pt e en concordam nos 9 anos; jogo a jogo 128 sim, 52 sem dado, 0 não)"},
            "skillcorner.db (Portal Skillcorner, só leitura, via gerar_raio_serieb.carregar)": {"usado_por": ["FIS-07", "M1", "M4", "M5", "M6", "M7", "M8"]},
            "dados/pontos.json": {"usado_por": "linhas vale_pela_faixa_de_pontos", "estado": "em conferência; provisório"},
        },
        "contagem_de_selos_referencia_15_09": dict(total=total, **cont, revisao="rodada sem dinheiro de 15/09 (antes: conserto final de 14/09, 56, 3/11/24/13/5)", gerador_calcula="conclusoes.contagem_de_selos a partir de selo_calculado"),
        "contagem_de_selos_referencia_14_09": json.load(open(ANTES_SPEC, encoding="utf-8"))["contagem_de_selos_referencia_14_09"],
        "mudancas_de_selo_15_09": mudancas,
    }
    json.dump(spec, open(OUT_SPEC, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(OUT_SPEC, "a", encoding="utf-8").write("\n")

    # ---------------- documento
    def plural(n, s, p):
        return f"{n} {s if n == 1 else p}"
    contagem = (f"**Contagem de selos ({total} conclusões):** {plural(cont['forte'], 'FORTE', 'FORTES')} · {plural(cont['moderado'], 'MODERADA', 'MODERADAS')} · "
                f"{plural(cont['fraco'], 'FRACA', 'FRACAS')} · {cont['sem_sinal']} SEM SINAL · {cont['nao_da_para_afirmar']} NÃO DÁ PARA AFIRMAR.")
    cinco_txt = ["## AS CINCO QUE VOCÊ PRECISA LER", "",
                 "**A regra que escolhe as cinco** (decisão 2 do dono, 14/09; o gerador aplica, ninguém escolhe à mão):",
                 "1. Entram só as conclusões que têm GRAVADO todo campo que decide o selo (os critérios que decidem): em `dados/prototipo.json`, em",
                 "   `_fonte/prototipo/teste_cego_2018_2021.json` ou em outra base que o gerador lê, ou contado direto de uma lista gravada. Número que só",
                 "   existe no scratchpad, num laudo (`CONFERENCIA.md`) ou em `dados/pontos.json` (em conferência) não conta, mesmo conferido.",
                 "2. Ordenar pelo selo: forte, moderado, fraco, sem sinal, não dá para afirmar. Sem limite por tema.",
                 "3. Desempate dentro do mesmo selo pelo número mais firme: o menor p bilateral do teste que decide o selo (`p_principal`, lido sem arredondar). Conclusão sem p",
                 "   (pergunta de intervalo ou dado inexistente) vai depois das que têm p; empate exato, a ordem deste documento.",
                 "4. As cinco são as cinco primeiras, com título, frase e número. Fracas e sem sinal continuam no documento e na aba, por tema.",
                 "",
                 ("<sub>**Aplicada com o que está gravado no dado novo de 15/09** (`prototipo_novo.json`, ainda não gravado no projeto): " + "; ".join(f"{c['id']} ({SELO_TAG[c['selo']].lower()}, p {p_txt(c['p']['valor_14_09'])})" for c in hoje)
                  + ". Ficam de fora, por campo que decide o selo e ainda não está gravado: " + "; ".join(f"{c['id']} ({SELO_TAG[c['selo']].lower()}: falta `{faltando(c)[0]}`)" for c in concs if c["selo"] in ("forte", "moderado") and faltando(c))
                  + ". **Quando o gerador gravar o bloco 2 da ordem de serviço** (`_fonte/prototipo/sessao_14_09/ordem_gerador_bloco2.json`), a mesma regra, com os números desta rodada, dá: "
                  + "; ".join(f"{c['id']} ({SELO_TAG[c['selo']].lower()}, p {p_txt(c['p']['valor_14_09'])})" for c in depois)
                  + ". A tela lê a lista do gerador, nunca esta. DIN-01 e DIN-02 são o mesmo sinal visto por dois cortes; a regra só ordena, não junta.</sub>"),
                 ""]
    for i, c in enumerate(hoje, 1):
        mo, va = mold_de[c['id']], val_de[c['id']]
        cinco_txt.append(f"{i}. **[{SELO_TAG[c['selo']]}] {c['id']} · {titulo_md(render(mo['titulo'], va))}** {render(mo['frase'], va)}" + ((" " + render(mo['numero'], va)) if mo['numero'] else ""))
    TAG_M = {None: "(nova)", **{k: v for k, v in SELO_TAG.items()}}
    tabela_mud = ["**O que mudou de selo na rodada sem dinheiro (15/09)**", "", "| conclusão | 14/09 | 15/09 | por quê |", "|---|---|---|---|"]
    tabela_mud += [f"| {m_['id']} | {TAG_M[m_['antes']]} | {SELO_TAG[m_['depois']]} | {m_['motivo']} |" for m_ in mudancas]
    hist = HISTORICO_SUB.replace("{contagem_15}", f"{cont['forte']} / {cont['moderado']} / {cont['fraco']} / {cont['sem_sinal']} / {cont['nao_da_para_afirmar']}").replace(
        "{mudaram_15}", "; ".join(f"{m_['id']} {SELO_TAG[m_['antes']].lower() if m_['antes'] else 'nova'} → {SELO_TAG[m_['depois']].lower()}" for m_ in mudancas if m_["antes"] != m_["depois"]))
    doc = [CABECALHO, contagem, hist, "", REGUA, "\n".join(tabela_mud), "", MEDIDO_SUB, "", REGRAS_FRASE, "", "---", "", "\n".join(cinco_txt), ""]
    for n, t in enumerate(TEMAS_ORDEM, 1):
        doc += ["---", f"## {n}. {TEMAS_NOME[t]}", "", INTROS[t], ""]
        for b in blocos_md[t]:
            doc += [b, ""]
    bk_txt = open(BK_DOC, encoding="utf-8").read()
    ini = bk_txt.index("## O QUE PARECIA CONCLUSÃO E NÃO É")
    fim = bk_txt.index("\n---\n\n<sub>Fontes")
    rec = bk_txt[ini:fim]
    for a, b in RECUSADAS_TROCAS:
        if a not in rec:
            raise SystemExit("recusada não encontrada: " + a[:80])
        rec = rec.replace(a, b)
    rec = rec.rstrip() + "\n\n" + RECUSADAS_NOVAS.rstrip() + "\n\n" + RECUSADAS_FINAL
    rec = LZ.aplicar_recusadas(rec).rstrip() + "\n\n" + LZ.RECUSADAS_15_09
    fontes = bk_txt[fim + len("\n---\n\n"):].strip()
    fontes = fontes[:-len("</sub>")] + FONTES_EXTRA + "</sub>"
    ant = "`dados/prototipo.json` (gerado pelo `gerar_prototipo.py` de 12-13/09)"
    if ant not in fontes:
        raise SystemExit("fontes: trecho do prototipo.json não encontrado")
    fontes = fontes.replace(ant, "`scratchpad/dinheiro2/prototipo_novo.json` (gerado pelo `gerar_prototipo.py` da rodada sem dinheiro de 15/09; `dados/prototipo.json` ainda é o de 14/09)")
    doc += ["---", "", rec, "---", "", fontes, ""]
    open(OUT_DOC, "w", encoding="utf-8").write("\n".join(doc))
    print("conclusões", total, cont)
    print("cinco hoje", [c["id"] for c in hoje])
    print("cinco quando gravar", [c["id"] for c in depois])

if __name__ == "__main__":
    main()
