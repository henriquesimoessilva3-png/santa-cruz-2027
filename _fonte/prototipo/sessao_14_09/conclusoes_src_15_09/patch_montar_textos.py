# patch_montar_textos - troca, no sp6_montar.py, os textos fixos da régua (documento e spec) pela régua final de 15/09
# e liga a limpeza (sp8_limpeza) e a tabela antes → depois. Cada troca confere que o trecho antigo existe.
import re

M = open("sp6_montar.py", encoding="utf-8").read()

def entre(ini, fim, novo):
    global M
    a = M.index(ini)
    b = M.index(fim, a + len(ini))
    M = M[:a] + novo + M[b:]

def troca(a, b, n=1):
    global M
    if M.count(a) != n:
        raise SystemExit(f"esperado {n}, achei {M.count(a)}: {a[:90]}")
    M = M.replace(a, b)

troca("import sp6_maquina as MQ\n", "import sp6_maquina as MQ\nimport sp8_limpeza as LZ\n")
troca('BK_SPEC = S + "bk_reconf/conclusoes_spec_antes_reconf.json"\n',
      'BK_SPEC = S + "bk_reconf/conclusoes_spec_antes_reconf.json"\n# o spec e o documento como estavam antes desta rodada (conserto final de 14/09): base da tabela antes → depois\nANTES_SPEC = S + "antes/conclusoes_spec.json"\n')

entre('CABECALHO = """', 'HISTORICO_SUB = (', '''CABECALHO = """# O que o estudo da Série B conclui — e quanto dá para confiar em cada coisa

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

''')

troca('                 "a decisão 1 vale para a comparação que a conclusão já tinha no título. Nenhum outro selo mudou; mudaram frases que ainda afirmavam ausência ou equivalência (DIN-03, DIN-05, ORI-01, FIS-10, A6, ELE-06) e os critérios do selo ganharam forma de máquina.</sub>")',
      '                 "a decisão 1 vale para a comparação que a conclusão já tinha no título. Nenhum outro selo mudou; mudaram frases que ainda afirmavam ausência ou equivalência (DIN-03, DIN-05, ORI-01, FIS-10, A6, ELE-06) e os critérios do selo ganharam forma de máquina. "\n                 "**Na rodada sem dinheiro de 15/09, 57:** {contagem_15} — saem dos critérios o desconto pelo valor do elenco e o mesmo clube no ano seguinte; mudam de selo {mudaram_15}; a M4 fica com zaga e lateral e o ataque vira a M8. A tabela antes → depois está logo abaixo da régua.</sub>")')

entre('REGUA = """', 'MEDIDO_SUB = (', '''REGUA = """## A régua — leia o selo antes da frase

São cinco selos, e só estes cinco. Nada ganha um sexto rótulo ("descritivo", "não se aplica", "provisório"):
uma contagem sem teste próprio vira descrição da conclusão de onde herda o selo.

**Régua final, de 15/09/2026** (plano aprovado "contra a sorte", com as quatro respostas do dono da noite de 14/09). Toda
conclusão de diferença entre grupos responde às mesmas perguntas, nesta ordem:
1. **A comparação foi escrita antes de olhar?**
2. **É firme?** Firme é passar na conta de todos os testes parecidos: q de Benjamini-Hochberg < 0,05 na família declarada
   (num teste único declarado, q = p).
3. **Foi conferida por outro caminho?** Conferências que valem: o 1º turno prevendo o 2º (p parcial < 0,05, no lado
   declarado; não pelo q dos 28 números) e 2018-2021 (p < 0,05 e o mesmo lado). Quando o próprio teste é por ano (DIN-01,
   DIN-02), valem também "cada ano sozinho" e "deixando um ano de fora".
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
  fica no rodapé). Escreve-se "não se viu", nunca "não separa", "não é" nem "não existe".
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
família e a comparação foram declaradas antes, a divisão do título foi feita depois de olhar e fica registrada); a A1 usa a
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
  depois, sem lista), a M6 (1 achado em 10 métricas), a M7 (sem lista) e os zagueiros da J5 (lista no nível da sorte).
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

''')

entre('MEDIDO_SUB = (', 'REGRAS_FRASE = """', '''MEDIDO_SUB = ("<sub>Medido no dado novo de 15/09 (`scratchpad/dinheiro2/prototipo_novo.json`; sementes declaradas `[7, 3, i]` por família e `[7, 17, i]` por clube, 10.000 sorteios), contagem bruta (e, nas físicas e por clube, só com o rodízio): "
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

''')

troca('"fisico": "*SkillCorner, 2022-2025. Só entram atletas com 300+ minutos rastreados, e cada atleta tem em média uns 15\\njogos rastreados, não 38. Antes de 2022 não há físico. O físico é descontado do dinheiro e do número de\\njogadores usados; esse segundo desconto é obrigatório pela régua, mas o rodízio pode ser consequência\\nde estar caindo, então nas comparações com quem cai ele pode levar junto uma parte real da diferença.*",',
      '"fisico": "*SkillCorner, 2022-2025. Só entram atletas com 300+ minutos rastreados, e cada atleta tem em média uns 15\\njogos rastreados, não 38. Antes de 2022 não há físico. Desde 15/09 o físico é descontado só do número de\\njogadores rastreados (o rodízio), e não mais do dinheiro; esse desconto é a 5ª pergunta da régua, mas o rodízio pode ser\\nconsequência de estar caindo, então nas comparações com quem cai ele pode levar junto uma parte real da diferença.*",')

troca('RECUSADAS_FINAL = """**Cortadas ou mudadas no conserto final de 14/09**', 'RECUSADAS_FINAL = """**Cortadas ou mudadas no conserto final de 14/09**')

troca('FONTES_EXTRA = (" Conserto final de 14/09:', 'FONTES_EXTRA = (" Rodada sem dinheiro de 15/09: dado novo `scratchpad/dinheiro2/prototipo_novo.json`, declarações e ordem de serviço em `_fonte/prototipo/sessao_14_09/` (versão 2026-09-14-noite-sem-dinheiro), régua comum em `sp6_maquina.py` (`ordem_comum`, critérios com papel), limpeza dos rodapés e da lista do que foi recusado em `sp8_limpeza.py`, prova em `sp7_prova.py` (tudo em `scratchpad/dinheiro2/conc/src/`). Conserto final de 14/09:')

# ---------------- spec: régua inteira
a = M.index("REGUA_SPEC = {")
b = M.index("\n}\n", a) + len("\n}\n")
M = M[:a] + open("regua_spec_15_09.py", encoding="utf-8").read().rstrip() + "\n" + M[b:]

# ---------------- montagem: limpeza, antes → depois, spec
troca('            rodape = aplicar_ops(rod_bk, c.get("rodape_ops", []), c["id"])\n',
      '            rodape = aplicar_ops(rod_bk, c.get("rodape_ops", []), c["id"])\n        rodape = LZ.aplicar(LZ.RODAPE, c["id"], rodape, "rodapé")\n')
troca('        else:\n            faixa = fx_bk\n', '        else:\n            faixa = fx_bk\n        if faixa:\n            faixa = LZ.aplicar(LZ.FAIXA, c["id"], faixa, "faixa")\n')

troca('    hoje = cinco(concs, True)\n', '''    hoje = cinco(concs, True)
    antes = {x["id"]: x for x in json.load(open(ANTES_SPEC, encoding="utf-8"))["conclusoes"]}
    mudancas = []
    for c in concs:
        s_antes = antes[c["id"]]["forca_esperada_hoje"] if c["id"] in antes else None
        partida = c["id"] == "M4"
        if s_antes != c["selo"] or partida:
            mudancas.append({"id": c["id"], "antes": s_antes, "depois": c["selo"], "motivo": MOTIVO_15_09[c["id"]]})
    if sorted(m_["id"] for m_ in mudancas) != sorted(MOTIVO_15_09):
        raise SystemExit(f"motivos da tabela antes → depois não batem com as mudanças: {sorted(m_['id'] for m_ in mudancas)}")
''')

troca('    "gerado_em": "2026-09-14",', '    "gerado_em": "2026-09-15",')
troca('"aponta um caminho coberto por scratchpad/ordem_gerador_bloco2.json. Reconferido em 14/09/2026 (três lentes e três decisões do dono)."),',
      '"aponta um caminho coberto por _fonte/prototipo/sessao_14_09/ordem_gerador_bloco2.json. Reconferido em 14/09/2026 (três lentes e três decisões do dono) e refeito em 15/09/2026 na rodada sem dinheiro: régua final do plano aprovado, com as quatro respostas do dono e as decisões do coordenador; valores_14_09 (o nome da chave ficou, para não quebrar quem lê) trazem os valores do dado novo de 15/09 (scratchpad/dinheiro2/prototipo_novo.json, ainda não gravado); revisao_15_09 diz o que mudou em cada conclusão; regime e entradas_da_regua dizem como a régua lê cada uma."),')
troca('"campos_novos_no_gerador_resumo": {"arquivo": "scratchpad/ordem_gerador_bloco2.json (sessão 3b480dcb)",',
      '"campos_novos_no_gerador_resumo": {"arquivo": "_fonte/prototipo/sessao_14_09/ordem_gerador_bloco2.json (versão 2026-09-14-noite-sem-dinheiro)",')
a = M.index('        "historico": old["historico"] + [')
b = M.index('\n', M.index('as cinco com frase e número"}],', a))
M = M[:a] + '        "historico": json.load(open(ANTES_SPEC, encoding="utf-8"))["historico"] + [{"data": "2026-09-15", "sessao": "1abbf5c7 (rodada sem dinheiro)", "o_que": "régua final do plano aprovado (\'contra a sorte\'): sai o desconto pelo valor do elenco e o mesmo clube no ano seguinte dos critérios; sem conferência testável = moderado; firme por pouco com uma conferência só = moderado (resposta a); ressalva do elenco valioso sem desconto (b); porta A só leitura (c); M4 = zaga e lateral e o ataque vira a M8 (d); A1 na família dos 2 eixos, DIN-04/05 por jogador (coordenador); vocabulário único de sorte; régua comum com critérios por papel e linhas geradas; selos conferidos contra prototipo_novo.json; 57 conclusões"}],' + M[b:]
troca('        "resultado_com_o_gravado_hoje"', '        "resultado_com_o_gravado_no_dado_novo_15_09"')
troca('"gerador_calcula": "conclusoes.cinco_que_precisa_ler; os dois resultados acima são referência de 14/09",', '"gerador_calcula": "conclusoes.cinco_que_precisa_ler; os dois resultados acima são referência de 15/09 (dado novo, ainda não gravado)",')
troca('"skillcorner.db (Portal Skillcorner, só leitura, via gerar_raio_serieb.carregar)": {"usado_por": ["FIS-07", "M1", "M4", "M5", "M6", "M7"]},',
      '"skillcorner.db (Portal Skillcorner, só leitura, via gerar_raio_serieb.carregar)": {"usado_por": ["FIS-07", "M1", "M4", "M5", "M6", "M7", "M8"]},')
a = M.index('        "contagem_de_selos_referencia_14_09": dict(')
b = M.index('\n', a)
M = M[:a] + ('        "contagem_de_selos_referencia_15_09": dict(total=total, **cont, revisao="rodada sem dinheiro de 15/09 (antes: conserto final de 14/09, 56, 3/11/24/13/5)", gerador_calcula="conclusoes.contagem_de_selos a partir de selo_calculado"),\n'
             '        "contagem_de_selos_referencia_14_09": json.load(open(ANTES_SPEC, encoding="utf-8"))["contagem_de_selos_referencia_14_09"],\n'
             '        "mudancas_de_selo_15_09": mudancas,') + M[b:]

troca('                 ("<sub>**Aplicada com o que está gravado hoje:** "', '                 ("<sub>**Aplicada com o que está gravado no dado novo de 15/09** (`prototipo_novo.json`, ainda não gravado no projeto): "')
troca('+ ". **Quando o gerador gravar a ordem de serviço** (`scratchpad/ordem_gerador_bloco2.json`), a mesma regra, com os números desta rodada, dá: "',
      '+ ". **Quando o gerador gravar o bloco 2 da ordem de serviço** (`_fonte/prototipo/sessao_14_09/ordem_gerador_bloco2.json`), a mesma regra, com os números desta rodada, dá: "')

troca('    doc = [CABECALHO, contagem, HISTORICO_SUB, "", REGUA, MEDIDO_SUB, "", REGRAS_FRASE, "", "---", "", "\\n".join(cinco_txt), ""]',
      '''    TAG_M = {None: "(nova)", **{k: v for k, v in SELO_TAG.items()}}
    tabela_mud = ["**O que mudou de selo na rodada sem dinheiro (15/09)**", "", "| conclusão | 14/09 | 15/09 | por quê |", "|---|---|---|---|"]
    tabela_mud += [f"| {m_['id']} | {TAG_M[m_['antes']]} | {SELO_TAG[m_['depois']]} | {m_['motivo']} |" for m_ in mudancas]
    hist = HISTORICO_SUB.replace("{contagem_15}", f"{cont['forte']} / {cont['moderado']} / {cont['fraco']} / {cont['sem_sinal']} / {cont['nao_da_para_afirmar']}").replace(
        "{mudaram_15}", "; ".join(f"{m_['id']} {SELO_TAG[m_['antes']].lower() if m_['antes'] else 'nova'} → {SELO_TAG[m_['depois']].lower()}" for m_ in mudancas if m_["antes"] != m_["depois"]))
    doc = [CABECALHO, contagem, hist, "", REGUA, "\\n".join(tabela_mud), "", MEDIDO_SUB, "", REGRAS_FRASE, "", "---", "", "\\n".join(cinco_txt), ""]''')

troca('    rec = rec.rstrip() + "\\n\\n" + RECUSADAS_NOVAS.rstrip() + "\\n\\n" + RECUSADAS_FINAL\n',
      '    rec = rec.rstrip() + "\\n\\n" + RECUSADAS_NOVAS.rstrip() + "\\n\\n" + RECUSADAS_FINAL\n    rec = LZ.aplicar_recusadas(rec).rstrip() + "\\n\\n" + LZ.RECUSADAS_15_09\n')
troca('    fontes = fontes[:-len("</sub>")] + FONTES_EXTRA + "</sub>"\n',
      '    fontes = fontes[:-len("</sub>")] + FONTES_EXTRA + "</sub>"\n    ant = "`dados/prototipo.json` (gerado pelo `gerar_prototipo.py` de 12-13/09)"\n    if ant not in fontes:\n        raise SystemExit("fontes: trecho do prototipo.json não encontrado")\n    fontes = fontes.replace(ant, "`scratchpad/dinheiro2/prototipo_novo.json` (gerado pelo `gerar_prototipo.py` da rodada sem dinheiro de 15/09; `dados/prototipo.json` ainda é o de 14/09)")\n')

troca('# ----------------------------------------------------------------- montagem\n', '''MOTIVO_15_09 = {
    "DIN-04": "relida por jogador (decisão do coordenador): o índice da defesa dá p 0,26; a fatia em euros (p 0,036, q 0,144) fica descrita; sai o desconto do valor total",
    "DIN-05": "'algo além do valor do elenco' lido pela partição por jogador: menor p 0,26 nos 4 setores; o valor por jogador maior fica como descrição da DIN-01",
    "ELE-03": "era fraca só pelo desconto do valor (0,076); firme por pouco (q 0,038) e sem conferência testável; ressalva do elenco valioso sem desconto",
    "FIS-04": "era fraca porque o desconto do valor levava quase tudo; só com o rodízio sobram 34 de 41 e a lista por setor segue acima da sorte (p 0,0108); sem conferência testável",
    "J17": "o desconto do valor (0,125) era o único motivo do fraco; firme por pouco (q 0,0447) e com uma conferência só (2018-2021, p 0,025): moderado pela resposta a do dono",
    "J19": "era fraca só pelo desconto do valor (0,83); firme (q 0,0086); o 1º turno (0,31) e 2018-2021 (0,87) falham; ressalva do elenco valioso sem desconto",
    "A2": "era fraca porque 7 dos 12 números não passavam no desconto do valor; teste único declarado e firme (p 0,020), sem conferência testável",
    "M4": "partida (resposta d do dono): fica só com zaga e lateral, fraco (listas 0,127 e 0,151, nenhuma firme por clube); o ataque saiu para a M8",
    "M8": "nova (partida da M4): o ataque é firme por clube, 13 medidas continuam só com o rodízio e a lista tem 13 contra 1 (p 0,010); sem conferência testável",
}

# ----------------------------------------------------------------- montagem
''')

open("sp6_montar.py", "w", encoding="utf-8").write(M)
print("montar ok")
