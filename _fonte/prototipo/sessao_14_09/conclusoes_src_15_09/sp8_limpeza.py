# sp8_limpeza - rodada sem dinheiro (15/09/2026): tira dos rodapés, das linhas de faixa de pontos e da lista do que foi
# recusado os pedaços em que o desconto pelo valor do elenco (ou o mesmo clube no ano seguinte) aparece como número que
# decide ou como motivo. Cada troca é de texto exato e falha alto se o trecho não estiver lá: nada é trocado por aproximação.
# O que é registro de 14/09 fica dito como registro ("na conta de 14/09 ..."), nunca como critério.
import sys
sys.dont_write_bytecode = True
from sp6_base import resolver, milhar
from sp6_maquina import _fmt

# conserto de 15/09 (rodada única): os números novos que entram nos rodapés saem do dado novo pelo leitor de caminhos,
# nunca digitados; o que continua escrito à mão é número que já estava no rodapé e só mudou de lugar
def _g(caminho):
    ok, v = resolver(caminho)
    if not ok or v is None:
        raise SystemExit(f"sp8: campo não gravado no dado novo: {caminho}")
    return v

def _semente(s):
    return "[" + ", ".join(str(x) for x in s) + "]"

def _p_excesso(e):
    return f"p do excesso {_fmt(e['p_excesso'])} ({milhar(e['sorteios'])} sorteios, {_semente(e['semente'])}, dado novo de 15/09)"

def _lista(caminho):
    """'O contra N, p do excesso X (10.000 sorteios, [semente], dado novo de 15/09)' de um bloco excesso[comparação][nível]."""
    e = _g(caminho)
    return f"{e['observado']} contra {int(e['nulo_mediana'])}, {_p_excesso(e)}"

def _sorte(p, q):
    """vocabulário único de sorte (regua.vocabulario_sorte): firme q < 0,05; pode ser sorte p < 0,05 e q >= 0,05; sem diferença clara p >= 0,05."""
    if p >= 0.05:
        return "sem diferença clara"
    return "firme" if q < 0.05 else "pode ser sorte"

TEC_SM = "etapa_3.por_familia.tecnico_col.excesso.SM.bruto"
FIS_SM = _g("etapa_3.por_familia.fisico_col_setor.excesso.SM.bruto")
MEIO = "sobecai_corrigido_por_clube.meio"
XGC = _g("etapa_2.linhas[indicador=xg_contra]")
XGR = _g("etapa_2.linhas[indicador=xg_por_remate_contra]")

RODAPE = {
    "ELE-01": [(", descontado o valor p 0,0006 (`etapa_2.linhas[atletas_usados].{p_bruto_SC, q_SC, p_liq_SC}`, gravados)", " (`etapa_2.linhas[atletas_usados].{p_bruto_SC, q_SC}`, gravados)")],
    "ELE-02": [(", p líquido 0,017", "")],
    "ELE-03": [(", p líquido 0,076, porta C", ", porta B no catálogo de 15/09")],
    "ELE-04": [("sobe x cai p 0,015, descontado o valor total 0,64", "sobe x cai p 0,015")],
    "FIS-01": [("; descontado o valor p 0,094; valor + atletas p 0,22", "; só com o rodízio 0,077 (rascunho da parte 1 de 15/09, não definitivo)")],
    "FIS-05": [("; descontado o valor p 0,95", "; só com o rodízio p 0,59")],
    "FIS-06": [("; descontado valor e atletas p 0,022", "; só com o rodízio p 0,0046")],
    "J1": [(", p líquido 0,0056 (q do líquido 0,066)", "")],
    "J2": [(", p líquido 0,006", "")],
    "J3": [(", p líquido 0,004", "")],
    "J4": [(", p líquido 0,014", "")],
    "J5": [("descontado o valor d 0,52, p 0,15 → some no dinheiro (`etapa_2.linhas[duelos_aereos_pct].{p_bruto_SC, q_SC, p_liq_SC}`, gravado)", "firme por pouco, só descrição (`etapa_2.linhas[duelos_aereos_pct].{p_bruto_SC, q_SC}`, gravado)"),
           (", descontado o valor d -0,63, p 0,019; na lista cai x resto (31 do técnico do time, montada depois da pergunta): q 0,021 bruto, 0,30 no líquido;", "; na lista cai x resto (31 do técnico do time, montada depois da pergunta): q 0,021;"),
           (", descontado o valor p 0,011, q na família", ", q na família")],
    "J6": [(", p líquido 0,006", "")],
    "J7": [(", descontado o valor 0,044, q 0,22 (92)", ", q 0,22 (92)")],
    "J9": [("MODERADO exige continuar entre elencos de valor parecido, e não há desconto do dinheiro por grupo; as duas baterias discordam", "as duas baterias discordam"),
           ("a partição feita só com dinheiro não separa os validadores", "a partição feita só com o valor do elenco não separa os validadores")],
    "J10": [("bloco do dinheiro da tipologia", "bloco do valor do elenco na tipologia"), (" · descontado o dinheiro, a rota muda 0 de 16 e o território 6", ""),
            (" · sobe x meio descontado o valor: rota p 0,87, território p 0,97", "")],
    "J13": [(", descontado o valor 0,029", "")],
    "J14": [("(bruto / descontado o valor): PPDA p 0,60 / 0,13;", ": PPDA p 0,60;")],
    "J15": [(", descontado o valor 0,98", "")],
    "J16": [(" · descontado o valor, trocam de lado no território Vitória, Criciúma e Chapecoense", "")],
    "J18": [(", descontado o valor 0,60", "")],
    "A1": [("; 22-25 p líquido 0,81", ""), ("; 22-25 p líquido 0,69", ""), (" · posse p líquido 0,98", "")],
    "A2": [("selo: FRACO na rodada de conserto de 14/09 (antes MODERADO, por uma exceção que a régua não previa): como a A1, é concordância crua de sinais que em parte somem no dinheiro",
            "selo de 14/09: FRACO na rodada de conserto (antes MODERADO, por uma exceção que a régua não previa); **MODERADO na rodada sem dinheiro de 15/09**, pela régua final (teste único declarado e firme, sem conferência testável)"),
           ("os 7 que não continuam em 2022-2025 (p líquido do valor ≥ 0,05, `etapa_2.linhas[].p_liq_SM`, gravado): posse 0,98, entradas na área 0,81, toques na área 0,69, passes certos % 0,48, passes 0,46, xG por chute 0,35, xG cedido 0,27",
            "em 14/09 o selo fraco vinha de 7 dos 12 números não passarem no desconto do valor (posse, entradas na área, toques na área, passes certos %, passes, xG por chute, xG cedido); esse desconto saiu da régua em 15/09")],
    "ORI-01": [("dinheiro 2022-2025:", "valor do elenco 2022-2025 (só descrição desde 15/09):")],
}

FAIXA = {
    "ORI-01": [("**Vale também pela faixa de pontos? Sim, a mesma leitura, mas sem o desconto do dinheiro**", "**Vale também pela faixa de pontos? Sim, a mesma leitura**")],
    "ELE-01": [(", descontado o valor 0,034", "")],
    "ELE-02": [(", descontado o valor 0,001", "")],
    "ELE-05": [(" (descontado o valor, 0,046, sem passar na família)", "")],
    "ELE-07": [("; descontado o dinheiro 0,29", "")],
    "J1": [(", descontado o valor 0,004", "")],
    "J2": [(", descontado o valor 0,035", "")],
    "J3": [(", descontado o valor 0,21", "")],
    "J4": [(", descontado o valor 0,012", "")],
    "J5": [(", descontado o valor 0,014 (2022-25)", " (2022-25)"), (", descontado 0,018", "")],
    "J6": [(", descontado o valor 0,34", "")],
    "J7": [(", descontado o valor 0,0018", ""), (", descontado 0,18", "")],
    "J10": [("; descontado o valor, a rota muda 0 de 24 e o território 8", "")],
    "M4": [("alta x baixa, bruto → dinheiro e rodízio: zaga 9 → 1, lateral 10 → 3, ataque 12 → 0 ou 1; nenhuma passa na conta dos testes",
            "alta x baixa no número cru: zaga 9 e lateral 10 (o ataque, 12, está na M8); a conta descontada da aba por pontos é refeita no item 6")],
    "M5": [("alta x baixa no meio-campo, 8 no bruto → 0 com dinheiro e rodízio", "alta x baixa no meio-campo, 8 no número cru; a conta descontada da aba por pontos é refeita no item 6")],
}

RECUSADAS = [
    ('*"Invista na defesa para subir."* — Receita, e a fatia da defesa morre nos dois descontos.',
     '*"Invista na defesa para subir."* — Receita; e, contando por jogador, não se viu a defesa de quem sobe valer mais do que a parte de gente que ocupa (DIN-04).'),
    ('*"Estrangeiros ajudam a subir."* — Morre no desconto do dinheiro.',
     '*"Estrangeiros ajudam a subir."* — Receita: o que se viu é que quem sobe dá mais minutos a estrangeiro (ELE-03), não que isso ajude.'),
    ('*"Goleiro caro separa quem sobe de quem cai."* — Descontado o valor total, p 0,64.',
     '*"Goleiro caro separa quem sobe de quem cai."* — Contra o meio não se viu diferença (p 0,24); contra quem cai vai no mesmo lado do elenco inteiro, e essa não é a comparação do título (ELE-04).'),
    ("contra o resto fica no limite e some com o dinheiro. Quem destoa é quem sobe.", "contra o resto fica no limite. Quem destoa é quem sobe."),
    ("— Descontado o dinheiro, subiram 6 contra 7 a 8 esperadas e caíram 0 contra menos de 2 em qualquer das contas (0,6 a 1,75): FRACO.",
     "— A comparação da origem foi montada depois de olhar e não há lista de onde ela saia: FRACO (até 14/09 o motivo era o desconto do dinheiro, que saiu da régua em 15/09)."),
    ("Não se reproduziu: p 0,029, some com o dinheiro (0,46) e não se repete em 2018-2021 (0,88).", "Não se reproduziu: p 0,029, e não se repete em 2018-2021 (0,88)."),
    ("— Houve medida e ela morre no dinheiro: FRACO.", "— Houve medida: p < 0,05 numa linha escolhida depois de olhar, sem lista: FRACO."),
    ("— Descontado o valor, não se viu a origem acrescentar nada, com 16 casos; ausência afirmada como fato.", "— Mecanismo não medido afirmado como fato: o estudo não separa a origem do valor do elenco."),
    ("— A régua não previa exceção; 7 dos 12 números somem no dinheiro em 2022-2025: FRACO, como a A1.",
     "— Recusada em 14/09 (a régua não previa exceção, e 7 dos 12 números não passavam no desconto do valor). **Desfeita em 15/09:** sem o desconto, a régua final dá MODERADO a um teste único declarado e firme, sem conferência testável."),
    ("— Sem desconto do dinheiro por grupo e com baterias que discordam: FRACO;", "— Com baterias que discordam: FRACO;"),
    ("quando a lista dela tem mais achados que a sorte e ela sobrevive ao dinheiro: 13 contra 1 (p 0,002) e descontado 0,019.", "quando a lista dela tem mais achados que a sorte: 13 contra 1 (p 0,002)."),
    ('*"FIS-04: descontado o dinheiro, não se viu."* — Sinal cru que some no dinheiro é FRACO.',
     '*"FIS-04: descontado o dinheiro, não se viu."* — Ausência afirmada. Desde 15/09, sem o desconto do dinheiro, a lista física de quem sobe contra quem cai continua acima da sorte só com o rodízio: MODERADO.'),
    ("— Descontado o dinheiro, o aproveitamento some (p 0,16 nos 36 pares); a posição, conta do título, fica no limite; nenhuma das duas foi declarada antes: SEM SINAL.",
     "— A posição, conta do título, fica no limite; o aproveitamento passa; nenhuma das duas foi declarada antes e os períodos discordam: SEM SINAL."),
    ("— Ausência afirmada: descontado o valor do elenco, não se viu diferença (p 0,64).", "— Mecanismo afirmado como fato; contra quem cai o goleiro vale mais, no mesmo lado do elenco inteiro."),
    ("Sinal sem selo próprio: virou a J19 (FRACO: some no dinheiro).", "Sinal sem selo próprio: virou a J19 (FRACO em 14/09; MODERADO desde 15/09, com a ressalva do elenco valioso)."),
    ("A velocidade de pico some nos descontos (0,12 e 0,175); o que continua de pé é a contagem de corridas em alta velocidade.",
     "O título é a contagem de corridas em alta velocidade; a velocidade de pico não é a pergunta."),
    ("— A forma que esta própria tabela tinha cortado: \"descontado o valor do elenco, não se viu a origem acrescentar nada\".",
     "— Mecanismo afirmado como fato; desde 15/09 a ressalva diz que o estudo não separa a origem do valor do elenco."),
    ("ficou no número, como descrição do dinheiro.", "ficou no número como descrição e saiu em 15/09, junto com o resto do ano seguinte."),
]

RECUSADAS_15_09 = """**Cortadas ou mudadas na rodada sem dinheiro de 15/09** (decisões do dono de 14/09; plano aprovado "contra a sorte", com as quatro respostas do dono da noite de 14/09)

Até 14/09 vários motivos das listas acima eram o desconto do dinheiro ou o mesmo clube no ano seguinte. Desde 15/09 nenhum dos dois decide selo: onde o motivo era só esse, a frase ou foi revista acima, ou continua recusada pelo outro motivo escrito ao lado.

- *"Descontado o dinheiro"*, *"continua entre times (ou elencos) de valor parecido"* e *"some quando se comparam elencos de valor parecido"* como critério de selo, porta ou frase — Saíram de todas as conclusões. O valor do elenco continua descrito (DIN-*, etapa 1), e onde o número anda com ele a ressalva diz, sem desconto e sem receita: "elenco valioso tende a ter isso; o estudo não separa as duas coisas".
- *"Não se viu o mesmo clube repetir o número de um ano para o outro"* como motivo do selo (ELE-01, ELE-02, J1, J2, J3, J4, J6, J7, J13, J19, FIS-06, FIS-10) — Saiu das conferências e do desempate; ficam o 1º turno prevendo o 2º e 2018-2021. As conclusões cujo assunto é a repetição (FIS-07, M1, M6, M7, ELE-06) ficam, com o selo.
- *"J17 FORTE"* (a régua final como escrita) — Resposta a do dono: firme por pouco (q entre 0,025 e 0,05) com uma conferência só é MODERADO, como regra geral para todas.
- *"Sem conferência para fazer, vale forte"* — Sem conferência testável é MODERADO, nunca FORTE. Sem essa cláusula a máquina daria forte a ELE-01, ELE-02, ELE-03, FIS-04, J6, A2, M5 e à nova M8.
- *"Na zaga, na lateral e no ataque, o perfil físico da nota é fraco."* (M4) — Falso no ataque, que é firme por clube e continua só com o rodízio: a M4 ficou com zaga e lateral, e o ataque virou a M8 (resposta d do dono), com a divisão registrada como feita depois de olhar.
- *"Quem sobe tem uma parte maior do valor do elenco na defesa: FRACO."* (DIN-04) e *"a fatia do setor não passa nos descontos"* (DIN-05) — O título lê por jogador (decisão do coordenador): o índice da defesa dá p 0,26 e nenhum setor passa; SEM SINAL, com a fatia em euros descrita.
- *"O território é um teste único declarado: FORTE."* (A1) — A família são os 2 eixos da tipologia, escolhida depois de olhar (decisão do coordenador): q 0,056, sem lista, FRACO.
- *"Descontado quanto do elenco o Transfermarkt avalia, o sinal continua."* (DIN-01) — O controle da cobertura saiu: jogador sem preço é valor baixo, não dado faltando (decisão do dono de 14/09).
- *"Na corrida forte do ataque, logo abaixo do corte"* e *"depois dos dois descontos, a lista inteira fica no nível da sorte"* (FIS-10) — Eram contas com o desconto do dinheiro; só com o rodízio a medida passa (p 0,0049) e a lista continua acima da sorte.
- *"A etapa 10 marca como resultado redescrito"* (J2, J7) — As duas medidas saíram da lista fixa da etapa 10 (resultado + consequência do ranking_gaps).
- *"Dificilmente é sorte"* e *"no limite"* como rótulo de sorte — Vocabulário único: firme / pode ser sorte / sem diferença clara, gravado como chave; "por pouco" só atrás de firme; "no limite" só no selo, para a zona cinzenta.
- *"Porta A: critério de contratação, entra no score."* — A porta é só leitura, com o nome "firme e reaparece por outro caminho" (resposta c do dono); a nota da etapa 13 nunca leu a porta e não muda.
- *Números descontados pelo valor do elenco e "repetição no clube ρ ... passa / falha" nos rodapés e nas linhas de faixa* (conserto de 15/09) — Saíram; onde o número é registro, vai com "na conta de 14/09" (ou "em 14/09"). O total cedido da J13 ficou só descrito, com o vocabulário da sorte e sem selo próprio; "no limite" fora do selo virou "na zona cinzenta" ou "sem diferença clara" (J1, J3, J7, FIS-08, FIS-10).
- *"A M8 foi declarada antes."* (na máquina) — A família e a comparação foram, a divisão do título não: desde o conserto de 15/09 a M8 tem teto MODERADO na máquina, e firmeza e conferência só descrevem.
"""

# ---------------------------------------------------------------- conserto de 15/09 (rodada única)
# Aplicado DEPOIS das trocas acima, sobre o texto que elas já deixaram. Cada entrada é texto exato e falha alto se faltar.
# Regra: número descontado pelo valor, ρ do mesmo clube no ano seguinte e semente de 14/09 saem; o que é registro fica com a marca.
RODAPE_CONSERTO = {
    "ELE-01": [(" · repetição no clube ρ 0,15 (p 0,37, 36 pares), falha", ""),
               ("nenhuma repetição independente foi possível — os 4 anos e as duas fontes saem das mesmas 80 temporadas; a do clube (ρ 0,15, p 0,37) quase não tem rebaixados;",
                "não há conferência testável por outro caminho — os 4 anos e as duas fontes saem das mesmas 80 temporadas;")],
    "ELE-02": [(" · ρ de repetição 0,049", "")],
    "FIS-06": [("9 de 128 contra mediana 6 do sorteio, p do excesso 0,33 (10.000, [2026, 916]) → FRACO pela regra de 14/09",
                f"{FIS_SM['observado']} de 128 contra mediana {int(FIS_SM['nulo_mediana'])} do sorteio, {_p_excesso(FIS_SM)} → FRACO; na conta de 14/09, 0,33 com [2026, 916]"),
               (" · repetição no clube ρ 0,14 (p 0,43, 33 pares)", "")],
    "FIS-08": [("sobe x meio p 0,023, valor + atletas p 0,019, q 0,58", f"sobe x meio p 0,023, só com o rodízio p {_fmt(_g('etapa_2.linhas[indicador=fis_zaga_distance_p90].p_rod_SM'))}, q 0,58"),
               (" · sem o corte: bruto 0,053, valor 0,042, valor + atletas 0,023", " · sem o corte: bruto 0,053"),
               ("das 7 medidas por setor que passam no bruto e com os dois descontos, 5 são a distância da zaga contada de jeitos diferentes",
                "na conta de 14/09, das 7 medidas por setor que passavam no bruto e com os dois descontos, 5 eram a distância da zaga contada de jeitos diferentes"),
               (" · repetição no clube ρ 0,64 (p 0,00007, 32 pares)", "")],
    "FIS-11": [("sobe x meio p 0,013; valor + atletas p 0,034; q 0,58", f"sobe x meio p 0,013; só com o rodízio p {_fmt(_g('etapa_2.linhas[indicador=fis_lateral_runs_dangerous_p30tip].p_rod_SM'))}; q 0,58"),
               (" · repetição no clube ρ 0,42 (p 0,043, 24 pares)", "")],
    # J1: o motivo do selo de 15/09 é o 1º turno passando e 2018-2021 falhando; o mesmo clube e o valor saem
    "J1": [("repetições: clube ρ 0,357 (p 0,032, 36 pares) passa; 1º → 2º turno parcial -0,34 (p 0,0022, q nos 28 = 0,062) passa só no p; 2018-2021 d -0,56, p 0,079, falha → **as repetições discordam e vale o selo mais fraco**",
            "conferências: 1º → 2º turno parcial -0,34 (p 0,0022, lado declarado; o q nos 28, 0,062, não decide) passa; 2018-2021 d -0,56, p 0,079, falha → **as conferências discordam e vale a mais fraca**"),
           ("; também o valor, p 0,0013", "")],
    "J2": [(" · ρ de repetição 0,097", "")],
    "J3": [(" · ρ de repetição 0,23", ""), ("; posse e valor p 0,0055", "")],
    "J4": [("7 contra 1, p do excesso 0,040 (10.000, [2026, 916]; segunda semente 0,038) → MODERADO",
            f"{_lista(TEC_SM)} → MODERADO; na conta de 14/09, 0,040 com [2026, 916] e 0,038 noutra semente")],
    "J5": [("repetições, todas falham: 2018-2021 d -0,17, p 0,52; clube ρ 0,21 (p 0,22); 1º → 2º turno parcial 0,145 (p 0,20)",
            "conferências, todas falham: 2018-2021 d -0,17, p 0,52; 1º → 2º turno parcial 0,145 (p 0,20)"),
           ("; repetição no clube ρ 0,33 (p 0,052)", "")],
    "J7": [(", descontado 0,028, q 0,097", ", q 0,097"),
           (", descontado 0,26 → zona cinzenta com sinal na mesma linha: FRACO no limite", " → na zona cinzenta, só descrição"),
           (" · repetição no clube ρ 0,105 (p 0,54)", ""),
           (", descontado 0,074, q 0,46 — fraco", ", q 0,46 — pode ser sorte")],
    # J13: o total cedido fica descrito com o vocabulário da sorte, sem selo próprio (revisao_15_09 da própria J13)
    "J13": [("lista 7 contra 1, p do excesso 0,040", "lista " + _lista(TEC_SM)),
            (", descontado 0,008 · repetição no clube ρ 0,21 (p 0,21)", f" ({_sorte(XGR['p_bruto_SC'], XGR['q_SC'])}, só descrição: a comparação do título é contra o meio)"),
            ("`xg_contra` 1,08 / 1,19 / 1,35: sobe x cai d -1,53, p 0,0002, q 0,0017, descontado 0,010; repetições discordam (2018-21 sobe x cai p 0,037 passa; clube ρ 0,31, p 0,065 falha) → MODERADO; sobe x meio p 0,049, descontado 0,27 → FRACO; em 2018-2021 sobe x meio d -0,93, p 0,0034",
             f"`xg_contra` (total cedido) 1,08 / 1,19 / 1,35, só descrição, sem selo próprio desde 15/09: sobe x cai d -1,53, p {_fmt(XGC['p_bruto_SC'])}, q {_fmt(XGC['q_SC'])} nos 31, {_sorte(XGC['p_bruto_SC'], XGC['q_SC'])}; "
             f"sobe x meio p {_fmt(XGC['p_bruto_SM'])}, q {_fmt(XGC['q_SM'])} nos 31, {_sorte(XGC['p_bruto_SM'], XGC['q_SM'])}; em 2018-2021 sobe x cai p 0,037 e sobe x meio d -0,93, p 0,0034")],
    "J15": [(", descontado 0,87", "")],
    "J18": [(", descontado 0,56", "")],
    "A2": [("10.000 sorteios, [2026, 918])", "10.000 sorteios, [2026, 918], medido em 14/09)")],
    "ORI-01": [("valor do elenco 2022-2025 (só descrição desde 15/09):", "valor do elenco 2022-2025 (só descrição desde 15/09; contas feitas em 14/09):")],
    "M5": [("bruto 11 de 34 (lista contra o sorteio: mediana 1, p do excesso 0,024, 10.000 sorteios, [2026, 919]) → com os dois descontos sobram 4: `expl` (arrancadas que viram sprint por 90) p 0,0055, `t505_180` (tempo de giro 505 a 180°) p 0,011, `t505_90` (giro 505 a 90°) p 0,013, `t_hsr` (tempo até corrida forte) p 0,044; q de BH 0,14 a 0,38; depois dos descontos a lista já não tem excesso (4 contra 1, p 0,16) — a regra usa a lista crua · sobe x meio no meio-campo: 6 → 2 com os dois descontos (giros de 90° e 180°)",
            f"bruto {_g(MEIO + '.p5_clube')} de {_g(MEIO + '.testes')}; lista contra o sorteio: mediana {int(_g(MEIO + '.excesso.SC.bruto')['nulo_mediana'])}, {_p_excesso(_g(MEIO + '.excesso.SC.bruto'))}"
            f" · só com o rodízio continuam {_g(MEIO + '.passam5_rod')}, e a mesma lista dá p do excesso {_fmt(_g(MEIO + '.excesso.SC.rod')['p_excesso'])} (só descrição; a regra usa a lista crua)"
            " · na conta de 14/09, com a semente [2026, 919] a lista crua dava 0,024, e com os dois descontos sobravam 4 (`expl`, arrancadas que viram sprint, p 0,0055; `t505_180`, giro a 180°, p 0,011; `t505_90`, giro a 90°, p 0,013; `t_hsr`, tempo até a corrida forte, p 0,044; q de BH 0,14 a 0,38), sem excesso na lista (4 contra 1, p 0,16)"
            " · na conta de 14/09, sobe x meio no meio-campo: 6 no número cru e 2 com os dois descontos (giros de 90° e 180°)")],
}
FAIXA_CONSERTO = {
    "FIS-06": [(", com os dois descontos 0,31", "")],
    "FIS-08": [("**Vale também pela faixa de pontos? No limite, não confirma** (provisório): alta x média p 0,063, com os dois descontos 0,093.",
                "**Vale também pela faixa de pontos? Na zona cinzenta, não confirma** (provisório): alta x média p 0,063.")],
    "FIS-10": [(", descontado 0,26", "")],
    "FIS-11": [(", com os dois descontos 0,013", "")],
    "J3": [("p 0,027 e q 0,0497, no limite.", "p 0,027 e q 0,0497, firme por pouco.")],
    "J13": [(", descontado 0,0009", ""), (", descontado 0,017", "")],
    "J14": [(", descontado 0,46", "")],
}
for _t, _c in ((RODAPE, RODAPE_CONSERTO), (FAIXA, FAIXA_CONSERTO)):
    for _k in sorted(_c):
        _t.setdefault(_k, []).extend(_c[_k])
RECUSADAS.append(('na zona cinzenta: "com uma medida no limite", de 0,053 a 0,46.',
                  'na zona cinzenta: "com uma medida na zona cinzenta", de 0,053 a 0,46 (desde 15/09 "no limite" só vai no selo).'))
RECUSADAS_15_09 = RECUSADAS_15_09.replace("J6, A2, M5 e à nova M8.", "J6, A2 e M5 (a M8, além disso, tem o teto da divisão escolhida depois de olhar).", 1)
if "tem o teto da divisão escolhida depois de olhar" not in RECUSADAS_15_09:
    raise SystemExit("sp8: trecho da M8 nas recusadas de 15/09 não encontrado")

def aplicar(tabela, cid, texto, onde):
    for a, b in tabela.get(cid, []):
        if a not in texto:
            raise SystemExit(f"{cid} ({onde}): trecho não encontrado: {a[:90]}")
        texto = texto.replace(a, b)
    return texto

def aplicar_recusadas(texto):
    for a, b in RECUSADAS:
        if a not in texto:
            raise SystemExit("recusada (15/09) não encontrada: " + a[:90])
        texto = texto.replace(a, b)
    return texto
