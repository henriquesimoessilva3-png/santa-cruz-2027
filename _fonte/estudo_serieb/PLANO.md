# Plano de trabalho — Estudo Série B

> Escrito em 18/09/2026, a pedido do dono, para dar ordem ao que falta.
> **Subordinado ao `CLAUDE.md` desta pasta**: onde os dois divergirem no método, vale o CLAUDE.md.
> Este arquivo só diz **em que ordem** e **de quem é cada passo**.
> Estado detalhado: `_fonte/CONTEXTO_sessao_17_09.md`.

## A regra de ordem

**Correto e menor antes de grande e duvidoso.**

Hoje o estudo tem 19 partes respondidas e 53 conclusões — e uma auditoria que confirmou 350
defeitos nelas, incluindo 18 casos da armadilha da fronteira e 23 de confiança alta demais.
Acrescentar as 8 partes que faltam antes de consertar essas 53 é construir em cima de chão que
ainda não se sabe se é firme. Por isso o conserto vem antes da expansão.

## O quadro

| # | etapa | depende de | de quem | estimativa | pronto quando |
|---|---|---|---|---|---|
| ~~**0**~~ | ~~Fechar o diagnóstico~~ | — | — | gasto: 0,89M | **FEITA em 19/09** — 4 lentes + a porta temporal; ver §16 e §17 do contexto |
| **1** | Consertar as 53 conclusões | etapa 0 | **dono decide**, máquina executa | 2–5M | nada mais em rascunho; espelhos batendo |
| **2a** | ~~Copiar o SkillCorner~~ | — | — | feito | **FEITA em 19/09** — fatia da Série B, 22 MB, em `dados_copiados/`; ver `_registro.md` |
| **2b** | ~~Copiar as ligas do Wyscout~~ | — | — | feito | **FEITA em 19/09** — período ago26, 65 ligas, 60,4 MB; ver `_registro.md` |
| **3** | As 6 partes destravadas pela cópia | etapa 2 | máquina | 3–9M | cada uma com `<ID>.json`, `<ID>.md` e linha no registro |
| **4** | As 2 que precisam de coleta nova | decisão do dono | dono decide, máquina coleta | 1–3M | ou a coleta existe, ou a parte é fechada como sem base |
| **5** | R01 e a publicação | etapas 1 e 3 | **dono aprova** | < 0,5M | abas antigas aposentadas, `docs/` no ar |

Já gastos até aqui: **≈ 19,7M**. O que falta soma **6M a 17M**, e atravessa mais de uma renovação
semanal (o limite reseta às 5h, horário de Brasília).

---

## Etapa 0 — Fechar o diagnóstico

As 4 varreduras transversais, a única parte da auditoria que nunca rodou. Foram disparadas em 18/09
e as 4 morreram no limite do plano.

- **Script pronto, é só re-disparar:**
  `~/.claude/projects/.../workflows/scripts/cruzar-estudo-serieb-wf_47b60a2b-ea4.js`
- As lentes: **cascata**, **contradição**, **completude**, **espelhos** (o que cada uma procura está
  na §14 do contexto).
### Decidido em 18/09: abre pela cascata, sozinha

O dono aprovou começar **só pela cascata**, ~0,3M, antes de gastar o resto. Ela é a única das quatro
que pode mudar a resposta de topo do estudo; as outras três são higiene.

- **Script pronto, no repositório:** `_fonte/estudo_serieb/_cruzar_cascata.js`. Um agente.
  **Atenção:** o `Workflow` recusa `scriptPath` apontando para o repositório — ele só aceita caminho
  que ele mesmo devolveu, dentro da pasta da sessão. **Cole o conteúdo do arquivo no campo `script`.**
  O arquivo no repositório é a cópia durável, não o ponto de invocação.
- Ele devolve os achados **e** um campo `veredito_sintese`: em até 5 linhas, se a resposta de topo
  do estudo sobrevive, muda ou cai.
- **Só depois de ler esse veredito** se decide se vale rodar as outras três (0,6–1,2M).

**Por que ela vem antes de consertar:** a cascata responde se A14 (a síntese) e T04 (o treinador
ideal) ainda têm pé depois dos 350 achados. Sem essa resposta, as decisões da etapa 1 podem ser
tomadas uma a uma e depois viradas em bloco.

## Etapa 1 — Consertar as 53

Cinco passos, nesta ordem:

1. **Decidir, conclusão por conclusão** — o que cai, o que vira indício, o que só precisa de texto
   novo. São 53 decisões e **são do dono**; a auditoria instrui, não decide.
   Material: `resultados/_auditoria_18_09.md` para ler, `_auditoria_18_09.json` para o detalhe.
   **Leia o campo `pareceres` antes de aceitar uma `correcao`** — o cético às vezes corrige o
   auditor (§13.7 do contexto).
2. **Reescrever os `<ID>.json`** conforme decidido. Número sempre por marcador, nunca à mão.
3. **Rodar `gerar_estudo_serieb_js.py`** para a aba refletir. Ele para com erro se algum marcador
   ficar sem valor — isso é proposital.
4. **Sincronizar as duas tabelas do `_registro.md`** (§12.1 do contexto). Só agora, não antes.
5. **Validar** — o passo que move conclusão de rascunho para "O que decidimos". Só o dono dá.

**Sugestão de fatiamento:** por bloco, não tudo de uma vez. Bloco A (11 partes, 31 conclusões),
depois T (4 partes, 10), depois J (4 partes, 12). Relato a cada bloco entregue.

## Etapa 2 — As cópias · **FEITA em 19/09** (era o caminho crítico)

Copiar do Portal Ranking (:5053) as **53 ligas do Wyscout** e o **`skillcorner.db`** com físico por
jogador. Destrava sozinha **6 das 8** partes que faltam: J04, J05, J06, A10, J08, J09.

Custa quase nada em token — é decisão e movimentação de arquivo. **É a coisa de maior alavanca no
plano inteiro, e não depende da máquina.** Enquanto não acontecer, nenhum orçamento resolve essas 6.

Ao copiar, registrar a data da cópia no `_registro.md`, como manda a §4 do contexto.

## Etapa 3 — As 6 destravadas · **fatiada em 19/09**

**Decisão do dono, 19/09:** as seis não rodam juntas. **J04 → J08 → A10** primeiro, porque nenhuma
delas depende do A14. **J05, J06 e J09 ficam seguradas** até o A14 e o J03 estarem consertados e
validados — a auditoria condenou os dois (o A14 perdeu a manchete e metade da validação; o J03 tem
11 achados confirmados e o número do duelo comparando dois cortes diferentes), e J05/J06/J09
dependem deles. Construir agora é construir em chão condenado, e obrigaria a refazer depois.

### A ordem original


Uma parte por pedido, como manda o CLAUDE.md. Ordem sugerida, seguindo as dependências:

`J04` (titular físico) → `J05` (perfil por posição) → `J06` (alvos na B) · `A10` (físico na
temporada) · `J08` (conversão de ligas) → `J09` (alvos no exterior)

J04 primeiro porque J05 e J06 dependem dele. J08 antes de J09 pelo mesmo motivo. A10 é independente
e pode entrar em qualquer ponto.

## Etapa 4 — As 2 sem base

- **A09 (minuto do gol)** — a mais barata das duas. Coleta no molde dos coletores existentes.
- **A08 (físico por tempo de jogo)** — o SkillCorner só guarda `full_all`. **Pode não ter fonte
  nenhuma**; se não tiver, a saída honesta é fechar a parte como "não responde com esta base",
  que é conclusão legítima pela regra da casa.

## Etapa 5 — R01 e a publicação

- **R01** (aposentar Análise Série B e Protótipo) espera **a lista de arquivos aprovada pelo dono**.
- **Publicar em `docs/`** só depois do passo 1.5. Publicar 53 rascunhos com defeito confirmado numa
  página pública é o tipo de coisa que não se desfaz bem.

---

## O que este plano NÃO cobre

Ficaram fora por decisão ou por falta de base, e continuam em aberto:

- **2018–2021** — segunda parte, sem dado físico e sem `SB_TABELAS`.
- **O recorte por estado do jogo** — não existe em base nenhuma; afeta A02, A03 e A06.
- **A altura da recuperação e o contra-ataque sofrido** — não existem; é o que faria mais falta em A06.
- **A conferência do T01 contra fonte independente** — a cobertura feita é prova interna.

## Uma regra de trabalho que veio da sessão de 18/09

**Extrair para o repositório a cada pedaço, não no fim.** A auditoria quase se perdeu por ficar só
no journal da sessão quando o plano acabou. Rodada longa agora grava resultado parcial em
`resultados/` assim que cada pedaço fecha.
