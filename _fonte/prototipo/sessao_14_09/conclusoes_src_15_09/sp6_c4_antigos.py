# Tema 4: os anos antigos (A)
from sp6_base import *

C = []

C.append(conc(
    id="A1", tema="anos_antigos", etapa="etapa_8", selo="fraco", declarada=False,
    titulo="Ocupar o campo e a área do adversário separou quem sobe nos dois períodos",
    frase="O eixo de território separou quem sobe do meio em {periodo_recente} e de novo, com os cortes congelados, em {periodo_antigo}; entradas na área e toques na área também. É um sinal {selo}: a família dos dois eixos (território e rota) foi escolhida depois de olhar; contando os dois eixos, já não dá para descartar a sorte, e não há lista de onde ela saia para comparar com a sorte.",
    numero="Em {periodo_antigo}, o acaso produziria a diferença do território em {p_antigo_chance}; em {periodo_recente}, em {p_recente_chance}.",
    ressalva="Não quer dizer que ocupar o campo adversário é caminho de subida: na Série B inteira, elenco valioso tende a ocupar mais o campo adversário (J10), e o estudo não separa as duas coisas; em {periodo_antigo} não há valor de mercado.",
    universo=UNIVERSOS["periodos"],
    lac={
        "p_antigo_chance": G("chance_em_1000", "teste_cego_2018_2021.json eixos_como_marcador_de_acesso.2018-2021.TERRITORIO.p_SM"),
        "p_recente_chance": G("chance_em_100", "teste_cego_2018_2021.json eixos_como_marcador_de_acesso.2022-2025.TERRITORIO.p_SM"),
    },
    crit=[
        CONST("1. família do eixo declarada antes", False, papel="declarada", txt="não: a família dos 2 eixos da tipologia (território e rota) foi escolhida depois de olhar (decisão do coordenador, 14/09)"),
        KM("território, quem sobe contra o meio, p < 0,05 em 2022-2025", "teste_cego_2018_2021.json eixos_como_marcador_de_acesso.2022-2025.TERRITORIO.p_SM", papel="p", op="<", lim=0.05),
        CONST("4. lista de onde a família saia, com mais achados que a sorte", False, papel="lista", txt="não há lista própria; a de outra família (técnico do time) não se usa: seria garimpo"),
        KM("contando os 2 eixos, q de BH < 0,05 (descrição)", "teste_cego_2018_2021.json eixos_como_marcador_de_acesso.2022-2025", op="<", lim=0.05, ag="bh",
           filtro={"tipo": "dicionario", "nome": "eixo", "valores": ["TERRITORIO", "ROTA"]}, sub="p_SM", decide=False),
        KM("conferência (descrição): 2018-2021, território, p < 0,05", "teste_cego_2018_2021.json eixos_como_marcador_de_acesso.2018-2021.TERRITORIO.p_SM", op="<", lim=0.05, decide=False),
        KM("conferência (descrição): 2018-2021 no mesmo lado (d positivo)", "teste_cego_2018_2021.json eixos_como_marcador_de_acesso.2018-2021.TERRITORIO.d_SM", op=">", lim=0, decide=False),
    ],
    regra={"regua": "régua final de 15/09 (regime comum): família escolhida depois de olhar, sem lista → teto fraco",
           "familia": "os 2 eixos da tipologia (declaracoes_novas.familia_A1), escolhida depois de olhar e registrada assim",
           "se_fosse_teste_unico": "seria forte (2018-2021 p 0,003); não é: a família é a dos 2 eixos",
           "saiu_em_15_09": "o critério 'componentes do eixo depois do desconto do dinheiro' e, do título, '— mas pode ser o dinheiro'",
           "proibido": ["'o que o orçamento compra'", "'em boa parte'", "ρ na frase de reunião", "usar a lista do técnico do time para dar excesso à A1"]},
    p=P("teste_cego_2018_2021.json eixos_como_marcador_de_acesso.2022-2025.TERRITORIO.p_SM", 0.0282), ceticos=False,
    rev="reconferência 14/09: 'orçamento' saiu do molde; períodos por lacuna",
    rev15="rodada sem dinheiro (15/09): segue FRACO. Sai o desconto do dinheiro (critério e título). A família é a dos 2 eixos (decisão do coordenador), escolhida depois de olhar: q 0,056, sem lista → fraco. Como teste único seria forte (2018-2021 p 0,003), e isso fica registrado. Entra a ressalva sem desconto",
    faixa_keep=True, rodape_ops=[],
))

C.append(conc(
    id="A2", tema="anos_antigos", etapa="etapa_8", selo="moderado", declarada=True,
    titulo="O que separou quem sobe em {periodo_recente} apontou para o mesmo lado em {periodo_antigo}",
    frase="Dos {n_ind} números de jogo com selo que existem nos dois períodos, {mesmo_sinal} foram para o mesmo lado, e os que separavam mais num período tendiam a separar mais no outro. É um sinal {selo}: é um teste só, declarado antes, e não há outro caminho para conferir.",
    numero="O acaso produziria essa concordância em {p_conc_chance}.",
    ressalva="Não quer dizer que cada número replicou: só {replicam} dos {n_ind} ficaram, sozinhos, abaixo do limite em {periodo_antigo}. Elenco valioso tende a ter vários desses números; o estudo não separa as duas coisas, e em {periodo_antigo} não há valor de mercado.",
    universo=UNIVERSOS["periodos"],
    lac={
        "n_ind": D("inteiro", "denominador de porta_concordancia.mesmo_sinal_SM ('12/12' → 12)", ["teste_cego_2018_2021.json porta_concordancia.mesmo_sinal_SM"]),
        "mesmo_sinal": G("numerador", "teste_cego_2018_2021.json porta_concordancia.mesmo_sinal_SM"),
        "p_conc_chance": G("chance_em_100", "teste_cego_2018_2021.json porta_concordancia.p"),
        "replicam": G("inteiro", "teste_cego_2018_2021.json porta_concordancia.replicam_p05_SM"),
    },
    val={"n_ind": "12"},
    crit=[
        CONST("1. teste declarado antes: concordância entre os períodos", True, papel="declarada", txt="sim"),
        KM("concordância entre os períodos, p < 0,05", "teste_cego_2018_2021.json porta_concordancia.p", papel="p", op="<", lim=0.05),
        KM("2. firme: teste único declarado, q = p < 0,05", "teste_cego_2018_2021.json porta_concordancia.p", papel="q", op="<", lim=0.05),
        KM("firme com folga (q < 0,025)", "teste_cego_2018_2021.json porta_concordancia.p", papel="q_folga", op="<", lim=0.025),
        CONST("3. há conferência testável por outro caminho", False, papel="ha_conf", txt="não: a concordância já é a comparação entre os dois períodos; não há terceiro período nem versão por jogo"),
        CONST("há uma conferência testável só", False, papel="uma_conf", txt="não: não há nenhuma"),
    ],
    regra={"regua": "régua final de 15/09 (regime comum): teste único declarado e firme, sem conferência testável → moderado",
           "moderado_se": "porta_concordancia.p < 0,05 sem conferência testável",
           "ressalva": "sem desconto e sem receita (resposta b do dono); na parte 1, 7 dos 12 indicadores andavam com o valor do elenco; a medida por coluna vai para etapa_2.andam_com_o_valor",
           "saiu_em_15_09": "o critério 'todos os 12 continuam depois do desconto do dinheiro' (era o único motivo do fraco)",
           "proibido": ["exceção de régua para concordância crua", "'os 12 números de jogo que existem nos dois períodos' sem 'com selo' (o técnico do time tem 31)", "'a concordância pode ser o elenco caro' como fato"]},
    p=P("teste_cego_2018_2021.json porta_concordancia.p", 0.0202), ceticos=False,
    rev="reconferência 14/09: n_morrem lê a lista de teste_cego porta.novo[].ind cruzada com etapa_2.linhas[].p_liq_SM; períodos por lacuna",
    rev15="rodada sem dinheiro (15/09): FRACO → MODERADO. Era fraco só porque 7 dos 12 números não passavam no desconto do valor. Pela régua final: teste único declarado, p 0,020 (firme, q = p), sem outra conferência → moderado. Entra a ressalva sem desconto e sem receita (resposta b do dono)",
    faixa_keep=True, rodape_ops=[],
))

C.append(conc(
    id="A3", tema="anos_antigos", etapa="etapa_8", selo="nao_da_para_afirmar", declarada=False,
    titulo="Algum sinal ficou mais forte ou mais fraco de um período para o outro?",
    frase="Nenhuma diferença entre {periodo_recente} e {periodo_antigo} foi distinguível do acaso, nos {n_ind} números. Por isso não se pode dizer que o território ficou mais forte, nem que a rota não replica: a rota não se estabeleceu em nenhum dos dois períodos.",
    numero="O teste de diferença mais perto do limite ficou em {menor_p_chance}.",
    ressalva="Não quer dizer que os sinais são iguais nos dois períodos: {n_sobe} contra {n_meio} não tem tamanho para medir a mudança.",
    universo=UNIVERSOS["periodos"],
    lac={
        "n_ind": N("contagem_da_lista", "etapa_8.teste_cego.diferenca_entre_blocos"),
        "menor_p_chance": N("chance_em_100", "etapa_8.teste_cego.diferenca_entre_blocos", "menor p"),
    },
    val={"n_ind": "12", "menor_p_chance": "8 de cada 100 tentativas"},
    crit=[
        K("a pergunta é qual período é maior (caso a da régua)", None, "sim", True),
        K("nenhuma diferença entre períodos com p < 0,05 (o intervalo de cada uma cruza zero)", "etapa_8.teste_cego.diferenca_entre_blocos", "menor p 0,081 (entradas na área)", True),
    ],
    regra={"nao_da_para_afirmar_se": "pergunta 'qual período é maior' com todo p de diferença entre blocos >= 0,05 (caso a da régua)", "teste": "z = (d_novo − d_velho) / raiz(se_novo² + se_velho²), se_d = raiz((n1+n2)/(n1·n2) + d²/(2(n1+n2))), n 16 × 48, bilateral, nos 12 de teste_cego porta",
           "proibido": ["'ficou mais forte'", "'não replica'", "'a tipologia caiu no teste cego'"]},
    p=P("etapa_8.teste_cego.diferenca_entre_blocos", 0.0813, "min", "p"), ceticos=True,
    rev="reconferência 14/09: o destino do teste passa a ser etapa_8.teste_cego.diferenca_entre_blocos no prototipo.json (o teste cego é congelado e não recebe escrita); menor p reproduzido: 0,081 (entradas na área, z −1,74)",
    faixa_keep=True,
    rodape_ops=[("replace", "o campo `diferenca_entre_blocos` não está gravado em `teste_cego_2018_2021.json` (conferido em 14/09): até o gerador gravar, a A3 fica fora da tela e fora das cinco",
                 "reproduzido em `r13_varios.py` com a fórmula declarada (z dos dois d de quem sobe contra o meio, 16 × 48): entradas na área z −1,74, p 0,081; chutes no alvo 0,092; distância do chute 0,13 · o destino é `etapa_8.teste_cego.diferenca_entre_blocos` no `prototipo.json` (o `teste_cego_2018_2021.json` é congelado e não recebe escrita); até o gerador gravar, a A3 fica fora da tela e fora das cinco")],
))

C.append(conc(
    id="A4", tema="anos_antigos", etapa="etapa_0", selo="fraco", declarada=False,
    titulo="O mando de campo pesou mais em {periodo_recente} do que em {periodo_antigo}",
    frase="Os mandantes fizeram {pct_recente}% dos pontos em {periodo_recente}, contra {pct_antigo}% em {periodo_antigo}. É um sinal {selo}: a comparação entre os dois períodos foi notada depois de olhar os dados (o critério declarado antes era outro: se o ano sem torcida sairia da faixa dos outros), não há lista de onde ela saia para comparar com a sorte, e com {n_anos_lado} anos de cada lado não há como repetir.",
    numero="Tomando o ano como unidade ({n_anos_lado} contra {n_anos_lado}), o acaso produziria essa diferença em {p_bloco_chance}.",
    ressalva="Não quer dizer que se sabe por que mudou, nem que o mando continua subindo. Qualquer conta em número cru que dependa de jogar em casa não pode juntar os dois períodos; as contas do estudo usam a posição no ranking do ano, o que neutraliza isso.",
    universo="os jogos da Série B de {periodo_antigo} e de {periodo_recente}, com o ano como unidade ({n_anos_lado} anos de cada lado); {ano_parcial} fica fora de toda conta",
    lac={
        "pct_recente": N("dec1", "etapa_0.mando.media_2022_2025"),
        "pct_antigo": N("dec1", "etapa_0.mando.media_2018_2021"),
        "n_anos_lado": N("inteiro", "etapa_0.mando.n_anos_por_lado"),
        "p_bloco_chance": N("chance_em_100", "etapa_0.mando.p_bloco_por_ano"),
    },
    val={"pct_recente": "64,5", "pct_antigo": "59,3", "n_anos_lado": "4", "p_bloco_chance": "3 de cada 100 tentativas"},
    crit=[
        CONST("1. comparação declarada antes", False, papel="declarada", txt="não: o critério declarado antes era o de 2020"),
        KM("t de Welch com o ano como unidade, p < 0,05", "etapa_0.mando.p_bloco_por_ano", papel="p", op="<", lim=0.05, v=0.027),
        CONST("4. lista acima da sorte (regra do dono)", False, papel="lista", txt="não há lista"),
    ],
    regra={"regua": "régua final de 15/09 (regime comum): comparação escolhida depois de olhar, sem lista → teto fraco",
           "fraco_se": "p_bloco_por_ano < 0,05 E comparação notada depois de olhar sem lista", "sem_sinal_se": "p_bloco_por_ano >= 0,10", "teste": "t de Welch, ano como unidade (não Student)",
           "saiu_em_15_09": "o 'desconto não se aplica' do critério da regra do dono"},
    p=P("etapa_0.mando.p_bloco_por_ano", 0.0269), ceticos=True,
    rev="reconferência 14/09: regra do dono reaplicada (sem lista): segue fraco; o destino do p passa a ser etapa_0.mando no prototipo.json, não o teste cego congelado",
    rev15="rodada sem dinheiro (15/09): segue FRACO. Sai o desconto do critério da regra do dono; a regra_maquina ganha a linha 'escolhida depois sem lista → fraco'",
    faixa_keep=True,
    rodape_ops=[("replace", "pela regra da comparação escolhida depois de olhar ·", "pela regra da comparação escolhida depois de olhar; na reconferência segue FRACO pela decisão 1 do dono (não há lista de onde a comparação entre períodos saia) ·"),
                ("replace", "o p com o ano como unidade não está gravado (`regime_veredito.p_bloco_por_ano` ausente): a A4 fica fora da tela e fora das cinco até o gerador gravar",
                 "o p com o ano como unidade vai para `etapa_0.mando.p_bloco_por_ano` no `prototipo.json` (o teste cego é congelado e não recebe escrita); até o gerador gravar, a A4 fica fora da tela e fora das cinco · vitória do mandante 42,9% (1.519 jogos) x 48,5% (1.518), só descrição")],
))

C.append(conc(
    id="A5", tema="anos_antigos", etapa="etapa_0", selo="sem_sinal", declarada=True,
    titulo="Não se viu o ano sem torcida ({ano}) fora da faixa do mando dos outros anos",
    frase="Em {ano} os mandantes fizeram {pct}% dos pontos, dentro da faixa dos outros {n_outros} anos ({lo}% a {hi}%). O critério declarado antes para tratar o ano sem torcida como ano à parte não disparou.",
    numero="",
    ressalva="Não quer dizer que torcida não faz diferença: com um ano só, só um efeito grande apareceria.",
    universo="os jogos da Série B de {periodo_antigo} e de {periodo_recente}, ano a ano; {ano_parcial} fica fora de toda conta",
    lac={
        "ano": D("ano", "ano do campo pct_pts_casa_2020 (2020)", ["teste_cego_2018_2021.json regime_veredito.pct_pts_casa_2020"]),
        "pct": G("dec1", "teste_cego_2018_2021.json regime_veredito.pct_pts_casa_2020"),
        "n_outros": D("inteiro", "len(regime) de 2018 a 2025 menos 1", ["teste_cego_2018_2021.json regime"]),
        "lo": G("dec1", "teste_cego_2018_2021.json regime_veredito.intervalo_outros[0]"),
        "hi": G("dec1", "teste_cego_2018_2021.json regime_veredito.intervalo_outros[1]"),
    },
    val={"ano": "2020", "n_outros": "7"},
    crit=[K("o critério declarado antes disparou (2020 fora da faixa dos outros sete)", "teste_cego_2018_2021.json regime_veredito.disparou", "não", True)],
    regra={"sem_sinal_se": "regime_veredito.disparou = false", "proibido": ["'o ano sem torcida não apagou o mando' (ausência afirmada: 'não se viu')"]},
    p=P(None, None), ceticos=False, rev="reconferência 14/09: título com 'não se viu'; p_principal nulo (critério de faixa, sem p)", faixa_keep=True, rodape_ops=[],
))

C.append(conc(
    id="A6", tema="anos_antigos", etapa="etapa_8", selo="sem_sinal", declarada=True,
    titulo="Em {periodo_antigo} ninguém subiu jogando como controlador paciente — mas não se viu isso fora do acaso",
    frase="Acessos por estilo em {periodo_antigo}: {observado}. O quadrante do controlador existia e estava povoado ({ocupacao} times); ninguém subiu de dentro dele.",
    numero="Corrigido pelas {n_casas} casas testadas, o acaso produziria uma casa vazia em {p_bonf_chance}.",
    ressalva="Não quer dizer que esse estilo deixou de funcionar, nem que a tipologia caiu no teste cego: com {n_acessos} acessos, uma casa vazia acontece por acaso.",
    universo="os {n_acessos} acessos de {periodo_antigo}, com os dois eixos e os dois cortes congelados em {periodo_recente}",
    lac={
        "observado": D("texto", "teste_cego tipologia.observado com os nomes simples dos grupos: 'dono do jogo N, cerco de bola direta N, controlador paciente N e reativo de bola direta N'", ["teste_cego_2018_2021.json tipologia.observado"]),
        "ocupacao": G("inteiro", "teste_cego_2018_2021.json tipologia.G3_vazio.ocupacao_do_quadrante_no_painel.a_2018_2021"),
        "n_casas": D("inteiro", "número de grupos da tipologia (4)", ["teste_cego_2018_2021.json tipologia.observado"]),
        "p_bonf_chance": G("chance_em_100", "teste_cego_2018_2021.json tipologia.G3_vazio.p_bonferroni_4_celulas"),
        "n_acessos": D("inteiro", "soma de tipologia.observado", ["teste_cego_2018_2021.json tipologia.observado"]),
    },
    val={"observado": "dono do jogo 7, cerco de bola direta 2, controlador paciente 0 e reativo de bola direta 7", "n_casas": "4", "n_acessos": "16"},
    crit=[
        K("casa vazia corrigida pelas 4 casas, p >= 0,10", "teste_cego_2018_2021.json tipologia.G3_vazio.p_bonferroni_4_celulas", "0,14", True),
        K("taxa de acesso do quadrante entre períodos, p >= 0,10", "teste_cego_2018_2021.json tipologia.G3_vazio.taxa_de_acesso.fisher_p", "0,22", True),
    ],
    regra={"sem_sinal_se": "G3_vazio.p_bonferroni_4_celulas >= 0,10 E taxa_de_acesso.fisher_p >= 0,10"},
    p=P("teste_cego_2018_2021.json tipologia.G3_vazio.p_bonferroni_4_celulas", 0.1443), ceticos=False,
    rev="reconferência 14/09: períodos por lacuna; universo e critérios", faixa_keep=True, rodape_ops=[],
))
