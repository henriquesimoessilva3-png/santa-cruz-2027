# patch_especificacao - ESPECIFICACAO.md na rodada sem dinheiro (15/09/2026): portas (6.5) e todo lugar em que o desconto
# pelo valor do elenco ou a repetição do mesmo clube no ano seguinte aparecia como critério. Os números da 6.5 e da etapa 10
# não são digitados de cabeça: o script os conta no dado novo e no prototipo.json de 14/09 e só grava se baterem com o texto.
import json, re, collections
R = "/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz/"
S = "/private/tmp/claude-501/-Users-henriquesimoessilva-Meu-Drive-6--arquivos-pessoais-Henrique-fut-BOTA-Analytics-Portal-Ranking/1abbf5c7-a19a-4f3a-89c2-26d0445cdbba/scratchpad/dinheiro2/"
E = open(R + "_fonte/prototipo/ESPECIFICACAO.md", encoding="utf-8").read()
NOVO = json.load(open(S + "prototipo_novo.json", encoding="utf-8"))
VELHO = json.load(open(R + "dados/prototipo.json", encoding="utf-8"))

# ---------------- conferência dos números que o texto cita
pn = {l["indicador"]: l["porta"] for l in NOVO["etapa_2"]["linhas"]}
pv = {l["indicador"]: l["porta"] for l in VELHO["etapa_2"]["linhas"]}
cont_n, cont_v = collections.Counter(pn.values()), collections.Counter(pv.values())
assert (cont_n["A"], cont_n["B"], cont_n.get("C", 0), cont_n["-"], cont_n.get("D", 0)) == (2, 27, 0, 264, 0), cont_n
assert (cont_v["A"], cont_v["B"], cont_v["C"], cont_v["-"]) == (1, 17, 31, 244), cont_v
assert sorted(i for i, p in pn.items() if p == "A") == ["dist_remate", "remates_baliza_pct"]
firmes_b = sorted(l["indicador"] for l in NOVO["etapa_2"]["linhas"] if l["porta"] == "B" and l["sorte_SM"] == "firme")
assert firmes_b == sorted(["faltas", "share_11", "conc_hhi", "min_estrangeiros", "ti_meio_cortes_de_carrinho_ajust_a_posse", "ti_meio_passes_chave_90"]), firmes_b
trans = collections.Counter(f"{pv[i]}→{pn[i]}" for i in pn)
assert dict(trans) == {"A→A": 1, "B→A": 1, "B→B": 16, "C→B": 11, "C→-": 20, "-→-": 244}, trans
borda = [i for i, l in ((l["indicador"], l) for l in NOVO["etapa_2"]["linhas"]) if l["p_1T_2T"] is not None and 0.045 <= l["p_1T_2T"] <= 0.055]
assert borda == [], borda
e10n = sorted(l["indicador"] for l in NOVO["etapa_10"]["linhas"]); e10v = sorted(l["indicador"] for l in VELHO["etapa_10"]["linhas"])
assert len(e10n) == 22 and len(e10v) == 25, (len(e10n), len(e10v))
assert sorted(set(e10n) - set(e10v)) == ["atletas_usados", "nucleo_1000", "nucleo_300"], sorted(set(e10n) - set(e10v))
assert sorted(set(e10v) - set(e10n)) == sorted(["remates_baliza_pct", "duelos_pct", "fis_meio_expl_accel_sprint_p90", "ti_meio_cortes_de_carrinho_ajust_a_posse", "ti_meio_duelos_defensivos_ganhos", "ti_meio_faltas_90"])
marca = {s: NOVO["sobecai_corrigido_por_clube"][s]["excesso"]["SC"]["bruto"]["lista"] for s in ("zaga", "lateral", "meio", "ataque")}
assert marca == {"zaga": "nao_tem_mais_achados_que_a_sorte", "lateral": "nao_tem_mais_achados_que_a_sorte", "meio": "tem_mais_achados_que_a_sorte", "ataque": "tem_mais_achados_que_a_sorte"}, marca
e3 = NOVO["etapa_3"]
assert (e3["bh5_SC"], e3["bh5_SM"], e3["passam5_SC"], e3["passam5_SM"]) == (24, 8, 76, 29)
assert sum(r["sorte"] == "firme" for r in NOVO["etapa_9"]["reguas"]) == 4 and not any("esmaecido" in r for r in NOVO["etapa_9"]["reguas"])

def troca(a, b):
    global E
    if E.count(a) != 1:
        raise SystemExit(f"ESPECIFICACAO: esperado 1, achei {E.count(a)}: {a[:100]}")
    E = E.replace(a, b)

def entre(ini, fim, novo):
    global E
    a = E.index(ini); b = E.index(fim, a + len(ini))
    E = E[:a] + novo + E[b:]

troca("""que três planos pediram; as substituições estão nas seções 7 e 9).

---""", """que três planos pediram; as substituições estão nas seções 7 e 9).
>
> **Revisão de 15/09/2026 — rodada sem dinheiro** (decisões do dono de 14/09, plano aprovado em `_fonte/prototipo/sessao_14_09/dinheiro_parte1_resultado.json`, declarações em `sessao_14_09/declaracoes_novas.json`). **O desconto pelo valor do elenco** ("descontado o dinheiro": colunas `d_liq_*`/`p_liq_*`/`d_liq2_*`/`p_liq2_*`, porta C, Controle 1 e a coluna líquida do Controle 2) **e a repetição do mesmo clube no ano seguinte como critério** (`rho_persist` na porta A, réguas esmaecidas da etapa 9, corte da etapa 10) **saem de todo selo, porta, marca e gate.** O valor do elenco continua **descrito** (etapa 1, régua `H_dinheiro`, DIN-*, cenários e contrafactual da etapa 14) e `etapa_6.rho` continua como dado. No físico fica um desconto só: o do rodízio (nº de atletas rastreados). Onde esta especificação dizia outra coisa, o texto antigo está marcado *(até 14/09)*. A régua dos selos das conclusões está em `CONCLUSOES.md`; as portas novas, em 6.5.

---""")

troca("1. Quais indicadores separam quem subiu de quem ficou no meio, **depois** de descontar o valor do elenco, com correção para comparações múltiplas.",
      "1. Quais indicadores separam quem subiu de quem ficou no meio, com correção para comparações múltiplas, conferidos por outro caminho (o 1º turno prevendo o 2º, e 2018-2021) e, no físico, descontado o rodízio. *(Até 14/09: \"depois de descontar o valor do elenco\"; esse desconto saiu em 15/09 e o valor do elenco passou a ser descrito, não descontado.)*")
troca("2. Quais desses indicadores **se repetem de um ano para o outro** (característica) e quais são retrato de um ano (episódio).",
      "2. Quais desses indicadores **se repetem de um ano para o outro** no mesmo clube — como **dado descritivo** (etapa 6). *(Até 14/09 isso separava \"característica\" de \"episódio\" e decidia porta; desde 15/09 não decide selo nem porta.)*")

troca("**Armadilha.** `ppda` é dinheiro disfarçado (cai de `d=-1,23` bruto para `-0,08` líquido de valor) **e** tem persistência 0,129 (conferido). `share_11`/`conc_hhi` sobrevivem ao dinheiro mas têm persistência 0,049 e 0,050 (conferido) — ver a decisão na seção 6.5.",
      "**Armadilha.** `ppda` anda com o valor do elenco (na conta de até 14/09 caía de `d=-1,23` bruto para `-0,08` descontado o valor) **e** tem persistência 0,129 (conferido). Desde 15/09 nenhuma das duas coisas decide porta: a relação com o valor vira ressalva sem desconto (\"elenco valioso tende a ter isso; o estudo não separa as duas coisas\"). `share_11`/`conc_hhi` são consequência do resultado (lista fixa da etapa 10) — ver a decisão na seção 6.5.")

troca("| `d_liq_SM`, `p_liq_SM` | **os mesmos, residualizados no posto de `tm_valor_total`** |",
      "| `d_rod_SM`, `p_rod_SM`, `d_rod_SC`, `p_rod_SC` | **só nas 160 linhas físicas:** os mesmos, residualizados SÓ no posto de atletas rastreados (`fis_atletas` ou `fis_<setor>_atletas`, em `rod_controle`); nas outras, null com `rod_motivo`. *(Até 14/09: `d_liq_*`/`p_liq_*` residualizados no posto de `tm_valor_total`, e `d_liq2_*`/`p_liq2_*`; saíram em 15/09.)* |\n| `sorte_SM`, `sorte_SC` | chave de sorte (firme: q < 0,05 · pode ser sorte: p < 0,05 e q ≥ 0,05 · sem diferença clara: p ≥ 0,05), decidida no p e no q sem arredondar |")
troca("| `rho_persist` | ρ de Spearman t→t+1 nos 36 pares |",
      "| ~~`rho_persist`~~ | *(saiu da linha em 15/09: o ρ t→t+1 nos 36 pares continua em `etapa_6.rho`, como dado, e não entra em porta nem selo)* |")
troca("| `porta` | **A / B / C / D** — ver 6.5 |", "| `porta`, `porta_motivo` | **A / B / D / –** — ver 6.5 (a porta C deixou de existir em 15/09; a porta é só leitura) |")
troca("**Nenhuma linha existe só no bruto.** A coluna líquida é a análise, não um refinamento (enxerto do Plano 2).",
      "*(Até 14/09: \"Nenhuma linha existe só no bruto. A coluna líquida é a análise, não um refinamento\".)* **Desde 15/09 a linha é lida no bruto**, com a correção para comparações múltiplas (q), a chave de sorte, a conferência pelo 1º turno e, no físico, o p só com o rodízio.")

troca("Leitura: **`dist_remate` é o único indicador de estilo que sobrevive a tudo** — sobrevive ao dinheiro contra o meio (6.5), tem persistência 0,357, e prevê o 2º turno **depois** de descontar como o time já vinha pontuando. PPDA não passa nem aqui.",
      "Leitura: **`dist_remate` é firme contra o meio e prevê o 2º turno depois de descontar como o time já vinha pontuando** — é uma das duas portas A do catálogo de 15/09, com `remates_baliza_pct` (6.5). PPDA não passa nem aqui. *(Até 14/09 a frase dizia também \"sobrevive ao dinheiro\" e \"tem persistência 0,357\"; os dois critérios saíram em 15/09.)*")

entre("### 6.5 As quatro portas, e o que cada indicador pode fazer", "**Decisão onde os planos discordaram.**", """### 6.5 As portas, e o que cada indicador pode fazer — revisto em 15/09/2026

**Decisão.** Pelo dono (14/09), a porta sai do dinheiro e do ano seguinte, e a **porta C deixa de existir**. Pela resposta c do dono (noite de 14/09), a **porta A deixa de ser "critério de contratação / entra no score" e vira só leitura**, com o nome **"firme e reaparece por outro caminho"**. A nota de encaixe da etapa 13 nunca leu a porta (usa `p_clube_cru` do `sobecai_corrigido_por_clube`) e continua sem ler: nenhum indicador, alvo ou candidato muda. A regra foi declarada antes de medir em `sessao_14_09/declaracoes_novas.json`, chave `portas`.

Cada indicador do catálogo (293, quem sobe × meio) recebe uma letra, testada nesta ordem:

- **Porta D — placar.** Coluna da lista branca de resultado (`DECL['resultado']`). Motivo: *"lista branca de resultado: é o placar redescrito"*.
- **Porta A — firme e reaparece por outro caminho.** `q_SM < 0,05` **e** o 1º turno prevê o 2º no lado declarado (`p_1T_2T < 0,05` e sinal de `rho_1T_2T` igual ao sinal declarado da linha); nas linhas físicas, também `p_rod_SM < 0,05`. Quem não tem versão por jogo não chega à A. Motivo: *"firme e o 1º turno previu o 2º no lado declarado (parcial X, p Y)"*.
- **Porta B — separa, sem chegar à A.** `p_bruto_SM < 0,05`. **Sem subletras.** Ao lado da letra vai a chave de sorte da linha (`sorte_SM`) e o motivo montado com o número que produziu a falha, sem a palavra sorte: *"firme, mas o 1º turno não previu o 2º (parcial X, p Y)"*; *"firme, sem versão por jogo: não deu para ver se vem antes do resultado"*; *"firme, mas não continua entre times que rodaram o elenco parecido (p X)"*; *"separa, mas não sobra na conta dos N parecidos (q X)"*, com o sufixo *"; a lista tem mais achados do que a sorte produz"* quando a lista da família (etapa 3) está acima da sorte.
- **"–"** — `p_bruto_SM ≥ 0,05` (ou ausente): *"não separa quem sobe do meio (p X)"*.
- ~~**Porta C — dinheiro.**~~ **Deixou de existir em 15/09.** *(Até 14/09: passava no bruto e morria no líquido, com o rótulo "explicado pelo valor do elenco".)*

Nomes proibidos para a porta: *"critério de contratação"*, *"entra no score"*, *"sobrevive ao dinheiro"*, *"se repete"*. Nenhum motivo é digitado: todos carregam a medida da própria linha.

**Contado no dado novo de 15/09** (`scratchpad/dinheiro2/prototipo_novo.json`, ainda não gravado em `dados/prototipo.json`; é conferência do gerador, não alvo):

| porta | até 14/09 | 15/09 |
|---|---|---|
| A | 1 | **2** (`dist_remate`, `remates_baliza_pct`) |
| B | 17 | **27** — 6 firmes (`faltas`, `share_11`, `conc_hhi`, `min_estrangeiros`, `ti_meio_cortes_de_carrinho_ajust_a_posse`, `ti_meio_passes_chave_90`) e 21 que podem ser sorte |
| C | 31 | — |
| – | 244 | **264** |

Transições: A→A 1 · B→A 1 · B→B 16 · C→B 11 · C→– 20 · –→– 244. Nenhum `p_1T_2T` fica entre 0,045 e 0,055 (o valor chega da etapa 7 com quatro casas; a borda existe, e o gerador registra se alguma linha cair nela). `share_11` e `conc_hhi` continuam com a marca de consequência do resultado (ranking_gaps) ao lado da letra.

*(Até 14/09 a porta A exigia `q_SM < 0,10`, `p_liq_SM < 0,05`, `rho_persist ≥ 0,30` e a parcial do 1º→2º turno com o sinal certo; a B passava no líquido de valor e falhava num portão seguinte, o primeiro deles `rho_persist < 0,30` → "não se repete de um ano para o outro"; a C passava no bruto e morria no líquido. A tabela de 12/09 com `d líquido`, `p líquido` e `ρ persist.` saiu desta seção em 15/09, junto com as colunas.)*

""")

troca("**Decisão onde os planos discordaram.** O Plano 1 concluiu que *\"depois de tirar o dinheiro nenhum eixo separa sobe de meio a p<0,05\"* e mandou escrever isso na tela. **Isso é falso, e é artefato de ter composto eixos antes de testar** (o eixo `I_estabilidade_11` diluiu `share_11` e `conc_hhi` com `atletas_usados` e `nucleo_300`, que não separam). A tabela acima é a prova.",
      "**Decisão onde os planos discordaram.** O Plano 1 concluiu que *\"depois de tirar o dinheiro nenhum eixo separa sobe de meio a p<0,05\"* e mandou escrever isso na tela. **Isso era falso, e era artefato de ter composto eixos antes de testar** (o eixo `I_estabilidade_11` diluiu `share_11` e `conc_hhi` com `atletas_usados` e `nucleo_300`, que não separam). A prova era a tabela de 12/09, com o desconto que saiu em 15/09; a regra que ela deixou continua:")

troca("**Decisão sobre concentração de minutos.** `share_11` e `conc_hhi` sobrevivem ao dinheiro contra o meio (d≈0,6-0,7, p<0,05) **e** têm persistência 0,049 e 0,050. O Plano 2 fez deles a espinha da aba; **isto é rejeitado**. Um traço com ρ=0,05 não é plano de clube — é o que sobrou de uma temporada em que deu certo: quem ganha não mexe no time, quem perde roda 45 atletas. E o teste que resolveria (recalcular só no 1º turno) **é impossível**: `minutagem.json` guarda minutos por temporada, não por rodada, e `serieb_jogos.csv` não traz escalação. **Ficam na Porta B, com o rótulo \"não contrate para isto\", e a aba diz que o teste não é possível com o dado atual.**",
      "**Decisão sobre concentração de minutos.** `share_11` e `conc_hhi` são firmes contra o meio (porta B, sem versão por jogo) e o ranking_gaps os marca como consequência do resultado. O Plano 2 fez deles a espinha da aba; **isto é rejeitado**: quem ganha não mexe no time, quem perde roda 45 atletas, e o teste que resolveria (recalcular só no 1º turno) **é impossível** — `minutagem.json` guarda minutos por temporada, não por rodada, e `serieb_jogos.csv` não traz escalação. **Ficam na porta B e na lista fixa da etapa 10, com o rótulo \"não contrate para isto\", e a aba diz que o teste não é possível com o dado atual.** *(Até 14/09 o argumento central era a persistência de 0,05 no ano seguinte, que saiu dos critérios em 15/09.)*")

troca("são justamente os que morrem sob controle de valor (Porta C na tabela 6.5) — os 28%×7% são, em boa parte, caro contra barato com nome tático.",
      "andam com o valor do elenco (eram porta C até 14/09) — os 28%×7% não separam o estilo do elenco caro, e o estudo não tem como separar as duas coisas.")
troca("Cada régua exibe **quatro números**: `d` sobe×meio, `q` de BH, `d` líquido de valor e **ρ de persistência**. Réguas com ρ<0,30 aparecem esmaecidas.",
      "Cada régua exibe `d` sobe×meio, `q` de BH e a chave de sorte (firme / pode ser sorte / sem diferença clara). *(Até 14/09 exibia também o `d` líquido de valor e o ρ de persistência, com as réguas de ρ<0,30 esmaecidas; os dois saíram em 15/09 e nenhuma régua é esmaecida — no dado novo, 4 das 9 são firmes.)*")
troca("**(c) Um índice contínuo**, média dos postos dos indicadores de Porta A e B com sinal alinhado, publicado **sempre** ao lado do baseline de dinheiro (seção 11)",
      "**(c) Um índice contínuo**, média dos postos dos indicadores de porta A e B com sinal alinhado (a porta é só leitura), publicado **sempre** ao lado da descrição do valor do elenco (etapa 1; seção 11)")
troca("3. **Persistência ano a ano** dos eixos e dos indicadores crus (36 pares).", "3. **Persistência ano a ano** dos eixos e dos indicadores crus (36 pares) — *descrição, não critério, desde 15/09*.")
troca("**o estilo explica cerca de metade de quem sobe; a outra metade é dinheiro e não está neste dado.**",
      "**o estilo explica cerca de metade de quem sobe; a outra metade anda com o valor do elenco e com o que não está neste dado, e o estudo não separa as duas coisas.**")

troca("**Só entra no score indicador de Porta A** (6.5). Isso **expulsa `ppda` (ρ=0,129) apesar do `d` alto**, expulsa `share_11` e `conc_hhi` (ρ≈0,05), e expulsa",
      "*(Até 14/09: \"Só entra no score indicador de Porta A (6.5)\". Em 15/09 ficou registrado que a nota nunca leu a porta — usa `p_clube_cru` do `sobecai_corrigido_por_clube` — e a porta passou a ser só leitura: a nota não muda.)* A lista declarada dos blocos **deixa de fora `ppda` apesar do `d` alto**, deixa de fora `share_11` e `conc_hhi` (consequência do resultado), e deixa de fora")

troca("**ETAPA 1 — A linha de base do dinheiro, ANTES de qualquer pilar.**", "**ETAPA 1 — A linha de base do valor do elenco, ANTES de qualquer pilar** (descrição; desde 15/09 não é régua de recomendação nem desconto).")
troca("dos 293, **24 sobrevivem ao BH contra quem caiu e 8 contra o meio** (76 e 29 antes da correção de multiplicidade).",
      "dos 293, **24 sobrevivem ao BH contra quem caiu e 8 contra o meio** (76 e 29 antes da correção de multiplicidade), cada linha com a chave de sorte e a porta A/B/D/– (6.5).")
troca("Legenda: *\"característica que não se repete de um ano para o outro é retrato de um ano, não modelo de jogo\"*.",
      "*(Até 14/09 levava a legenda \"característica que não se repete de um ano para o outro é retrato de um ano, não modelo de jogo\" e servia de critério.)* Desde 15/09 é descrição: o foco da etapa é o mesmo ano (`etapa_6.mesmo_ano`, pedido do dono), e o ρ t→t+1 continua como dado, sem decidir porta nem selo.")
troca("**ETAPA 9 — As nove réguas** + os itens crus de cada eixo com seus próprios p.", "**ETAPA 9 — As nove réguas** + os itens crus de cada eixo com seus próprios p, cada régua com a chave de sorte; nenhuma esmaecida (15/09).")
troca("**ETAPA 10 — Causa ou consequência.** Lista curta do que separa forte e é o resultado redescrito (`pontos_fora` 25,4×18,3; `maxSemVencer` 4,19×6,62; `share_11` e `conc_hhi` com ρ≈0,05). Rótulo: **\"não contrate para isto\"**.",
      "**ETAPA 10 — Causa ou consequência.** Rótulo: **\"não contrate para isto\"**. **Lista fixa desde 15/09:** as colunas da lista branca de resultado e as marcadas como consequência do resultado no ranking_gaps que estão no catálogo — **22 linhas** no dado novo (entraram `atletas_usados`, `nucleo_300` e `nucleo_1000`; saíram `remates_baliza_pct`, `duelos_pct`, `fis_meio_expl_accel_sprint_p90`, `ti_meio_cortes_de_carrinho_ajust_a_posse`, `ti_meio_duelos_defensivos_ganhos` e `ti_meio_faltas_90`). Não depende de porta, de ρ nem de p, e não é filtro de sorte. *(Até 14/09 entrava por \"porta D ou porta B com ρ t→t+1 < 0,15\", com 25 linhas.)*")
troca("**E o resultado do backtest (8.6) no cabeçalho da tela.**",
      "**E o resultado do backtest (8.6) no cabeçalho da tela.** A nota nunca leu a porta. Ao lado de cada setor vai só a marca da lista por clube de quem sobe × quem cai (`sobecai_corrigido_por_clube.<setor>.excesso.SC.bruto.lista`): meio-campo e ataque \"a lista tem mais achados do que a sorte\", zaga e lateral \"não tem\" — rótulo, não filtro (decisão do coordenador, 15/09).")
troca("**ETAPA 14 — Elenco como faixa**, com o contrafactual do dinheiro ao pé (seção 11).",
      "**ETAPA 14 — Elenco como faixa**, com o contrafactual do valor do elenco ao pé, como descrição (seção 11); a porta de cada indicador citado é lida do catálogo.")

entre("## 11. Os controles obrigatórios", "Mais dois controles de integridade", """## 11. Os controles obrigatórios

Até 14/09 eram três. Desde 15/09 (rodada sem dinheiro):

1. **Valor do elenco descrito ao lado das propostas, não como régua.** *(Até 14/09, Controle 1: "baseline de dinheiro impresso ao lado de TODA proposta… qualquer eixo, índice ou elenco que não bata isso fora da amostra é descrição, não recomendação". Saiu em 15/09.)* O número (AUC 0,828 e 10 de 16 acertos só com o posto de valor, conferido) continua na etapa 1 e ao lado das propostas, como informação.
2. **Só nas 160 linhas físicas, o desconto do número de atletas rastreados** (`fis_atletas` no elenco, `fis_<setor>_atletas` no setor), nas colunas `d_rod_*`/`p_rod_*`, porque toda média física é média POR ATLETA e quem sobe usa menos gente: sem esse controle o denominador menor levanta a média sem que ninguém tenha corrido mais. O técnico não recebe `rod` e a linha grava o motivo. *(Até 14/09, Controle 2: coluna líquida de valor em toda linha, pareamento por caliper como checagem e o nível `liq2` de valor e atletas. Saíram em 15/09.)* A cobertura do valor por temporada (47% a 77%, não falta ao acaso) fica descrita na etapa 1; não é controle.
3. **Contrafactual da proposta de elenco**, como descrição: a folha implícita e o valor somado do elenco proposto, colocados no **posto de valor** que ocupariam na Série B, com a taxa histórica de subida daquele quartil escrita em voz alta. Se a proposta cai no segundo quartil, a tela diz que a taxa histórica foi **4,8%**.

""")

troca("    5  testes sobe×meio e sobe×cai, bruto e líquido, BH por família .. ETAPA 2", "    5  testes sobe×meio e sobe×cai, bruto e (físico) só rodízio, BH .. ETAPA 2")
troca("    8  persistência t→t+1 (36 pares) .................................. ETAPA 6", "    8  mesmo ano; t→t+1 (36 pares) só como dado ...................... ETAPA 6")
troca("   10  selo de porta A/B/C/D por indicador ........................... seção 6.5", "   10  porta A/B/D/– (só leitura) e chave de sorte por indicador ..... seção 6.5")
troca("   14  notas de encaixe (3 blocos, só Porta A, posto por liga+posição) ETAPA 13", "   14  notas de encaixe (3 blocos, posto por liga+posição; não lê porta) ETAPA 13")
troca("- Nada de frase escrita à mão no JSON: cada afirmação carrega seu n, seu p líquido e seu ρ.", "- Nada de frase escrita à mão no JSON: cada afirmação carrega seu n, seu p e seu q (e, no físico, o p só com o rodízio). *(Até 14/09: \"seu p líquido e seu ρ\".)*")
troca("4. **Concentração de minutos como recomendação.** Fica na Porta B, com \"não contrate para isto\" — ρ≈0,05 e o teste que a resolveria é impossível (falta escalação por rodada em `minutagem.json`).",
      "4. **Concentração de minutos como recomendação.** Fica na porta B e na lista fixa da etapa 10, com \"não contrate para isto\" — é consequência do resultado, e o teste que a resolveria é impossível (falta escalação por rodada em `minutagem.json`).")

open(S + "conc/saida/ESPECIFICACAO.md", "w", encoding="utf-8").write(E)
print("ESPECIFICACAO ok; portas", dict(cont_n), "etapa 10", len(e10n))
