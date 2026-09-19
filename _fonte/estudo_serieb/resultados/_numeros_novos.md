# Os números da proposta — calculados em 19/09/2026

> Run `wf_c71fbc17-65c`, 20 agentes. Cru: `_numeros_novos.json`.
> **Nenhum `<ID>.json` foi tocado.** Isto prepara a validação, não a aplica.

| | |
|---|---|
| marcadores calculados | **646** |
| conferidos por dois caminhos | **todos** |
| bloqueados (frase sem número possível) | 13 |
| **números JÁ PUBLICADOS que estão errados** | **98** |
| conflitos entre partes | 15 |
| números que viajam entre partes | 23 |

## ⚠️ Os números errados que já estão no ar

Estes NÃO são da proposta: estão hoje no `<ID>.json`, e portanto na aba.

| parte | quantos |
|---|---|
| **J07** | 26 |
| **J01** | 22 |
| **T01** | 10 |
| **A07** | 7 |
| **A03** | 6 |
| **A06** | 5 |
| **A12** | 5 |
| **J02** | 4 |
| **A01** | 3 |
| **A05** | 2 |
| **A11** | 2 |
| **T02** | 2 |
| **A04** | 1 |
| **A02** | 1 |
| **J03** | 1 |
| **T03** | 1 |

### Detalhe

**A01**

- `trave_mediana`: está **60**, deveria ser **60,5**
  - Mediana dos pontos das 16 linhas com trave=1 e temporada != 2026 em A01_clube_temporada.csv: (60+61)/2 = 60,5. Bate com o recalculo independente a partir de SB_TABELAS (static/app.js:6933). O 60 foi digitado direto em A01.json — A01.py nao produz esse valor.
- `trave_dist_mediana`: está **-2**, deveria ser **2,5 (no texto: '2,5 pontos abaixo do corte do G4')**
  - Mediana de dist_g4 nas mesmas 16 linhas: -2,5. O valor guardado esta truncado para menos e com o sinal cru, que a Didatica nao usa no texto.
- `corte_z4_mediana`: está **39**, deveria ser **39,5**
  - pontos_17o em A01_regua.csv: 42 (2022), 39 (2023), 38 (2024), 40 (2025) -> mediana 39,5. A01_resumo.json ja grava corte_z4.mediana = 39.5; so A01.json esta com 39.

**A02**

- `trave_firmes`: está **0**, deveria ser **1 (na leitura literal 'indicadores firmes na comparacao Sobe x Trave')**
  - A02_testes.csv tem indicador com selo 'firme' na comparacao ST nos DOIS cortes: com/sobra/ST/finalizacao com q 0,00144 e sem/sobra/ST/finalizacao com q 0,03821. O proprio texto de A02-3, dentro do mesmo A02.json, diz que gols menos xG e 'o UNICO indicador que separa quem sobe da Trave' — ou seja, um, e nao zero; o arquivo se contradiz. RESSALVA HONESTA: pode ser leitura e nao erro — se trave_firmes quiser dizer 'firmes na Trave que NAO sao o placar redescrito', entao 0 esta certo, porque finalizacao tem placar_redescrito=True e e o unico firme em ST. Nenhum texto do A02 usa este marcador e a proposta de destino nao o pede, entao nada na tela depende disso. Registrado, NAO corrigido: A02.json nao foi tocado.

**A03**

- `xgc_casa_s`: está **0.736 (e string, nao numero)**, deveria ser **0.80**
  - 0,736 e a mediana do Sobe no corte SEM fronteira (A03_testes.csv, sem | casa | SM | xgc_casa, cru_a, n=8). O n declarado na conclusao A03-2 e '16 promovidos contra 48 do meio', que e o corte COM fronteira, onde a mediana e 0,798421 -> 0,80. Nao e numero inventado: e o valor do outro corte colado numa frase que anuncia este.
- `xgc_casa_m`: está **1.026 (string)**, deveria ser **1.02**
  - 1,026 e a mediana do Meio no corte SEM fronteira (n=32; bruto 1,025526). No corte COM fronteira (n=48) e 1,023684 -> 1,02. Mesmo descasamento do par: os dois numeros da frase vem do corte que o n da conclusao nao anuncia.
- `c_xgcasa_c`: está **1.246 (string)**, deveria ser **1.26**
  - 1,246 e a mediana do Cai no corte SEM fronteira (A03_testes.csv, sem | casa | CM | xg_casa, cru_a, n=12; bruto 1,245526). No corte COM fronteira (n=16) e 1,263421 -> 1,26. O texto atual poe esse unico bruto ao lado dos dois d, o com e o sem, como se ele valesse para os dois.
- `c_xgcfora_c`: está **1.646 (string)**, deveria ser **1.56**
  - 1,646 e a mediana do Cai no corte SEM fronteira (sem | fora | CM | xgc_fora, cru_a, n=12; bruto 1,646053). No corte COM fronteira (n=16) e 1,557105 -> 1,56. Aqui a diferenca nao e de arredondamento: sao 0,09 de xG por jogo.
- `c_xgcfora_m`: está **1.394 (string)**, deveria ser **1.36**
  - 1,394 e a mediana do Meio no corte SEM fronteira (n=32; bruto 1,393947). No corte COM fronteira (n=48) e 1,363947 -> 1,36. Somado ao c_xgcfora_c, o par atual (1,646 contra 1,394) mostra uma distancia de 0,25 onde o corte anunciado mostra 0,19.
- `(formato) 20 dos 26 marcadores de A03.json`: está **gravados como string, ex. "0.756", "1.246", "0.77786"**, deveria ser **gravados como numero (float), ex. 0.756**
  - Em A03.json so asm_testes, asm_firmes, dif_sobe, dif_meio, dif_liga, n_cai_sf e n_meio_sf sao numeros; os outros 20 sao string, e string chega a tela com o ponto ingles — e o defeito dos 107 numeros apontado no diagnostico. Nao alterei A03.json. Todos os valores do arquivo novo foram gravados como float, com a versao pt-BR no campo 'formatado'.

**A04**

- `c_pro_m, c_sof, c_sof_m, c_sal, c_aer, c_aer_m (e os d/q que vem com eles), em A04.json.numeros`: está **c_pro_m 0,316 · c_sof 0,461 · c_sof_m 0,368 · c_sal -0,184 · c_aer 43,517 · c_aer_m 46,485**, deveria ser **para o n que a conclusao A04-3 declara (16 rebaixados contra 48 do meio): c_pro_m 0,342 · c_sof 0,447 · c_sof_m 0,355 · c_sal -0,132 · c_aer 44,343 · c_aer_m 46,147**
  - Os valores gravados estao certos, mas para OUTRO corte: sao as linhas fronteira=sem, comparacao=CM de A04_testes.csv, que e 12 rebaixados contra 32 do meio. O campo 'n' da conclusao A04-3 esta digitado a mao e diz '16 rebaixados contra 48 do meio', que e o corte com fronteira — o texto publica numeros de um corte sob o n de outro. Refiz a base do zero e confirmei os dois conjuntos. Nao mexi no arquivo: os marcadores novos c_*_com desta entrega trazem o corte de 16x48. Unica excecao: c_pro = 0,276 coincide nos dois cortes e esta certo dos dois jeitos.

**A05**

- `n_testes`: está **30**, deveria ser **60**
  - A05_testes.csv tem 61 linhas com cabecalho, ou seja 60 testes: 10 indicadores x 3 comparacoes (SM, ST, CM) x 2 cortes de fronteira (com, sem) = 60. O 30 guardado em A05.json conta so um dos dois cortes. Usado duas vezes no texto atual de A05-1.
- `topo_posse`: está **8**, deveria ser **10 pela definicao que a proposta usa — mas o marcador e ambiguo e o 8 nao esta errado contra a base**
  - Recalculei o posto de posse de cada clube dentro do proprio ano (20 clubes por ano, 2022-2025). Promovidos entre os 7 primeiros do ano: 10 (Cruzeiro 1o, Atletico-GO 2o, Sport 3o, Juventude 4o, Vitoria 5o, Coritiba 5o, Vasco 6o, Santos 6o, Bahia 7o, Mirassol 7o). Entre os 6 primeiros: 8. O 8 guardado e exatamente o corte de percentil >= 70 (os 6 de cima de 20, 30%); o 10 da proposta e o corte de percentil >= 66,7 (os 7 de cima, 35%). O terco de cima de 20 times e 6,67 clubes, entao os dois arredondamentos sao defensaveis: falta a definicao escrita, nao o calculo. Detalhe: a propria proposta escreve '5,3 esperados por acaso', que e 16 x 6,67/20 e corresponde ao corte de 6 clubes (contagem 8); com o corte de 7 clubes o esperado seria 5,6. O texto novo de A05-2 nao usa topo_posse, e a proposta admite aposenta-lo. base_posse = 3 esta certo nas duas definicoes.

**A06**

- `porta_dd`: está **0.319, usado em A06.json como resultado da porta temporal do duelo defensivo**, deveria ser **+0,092 (p 0,4160) — e ai a porta REPROVA**
  - 0,319 esta certo como numero, mas e outra medida: e a persistencia do indicador entre a 1a e a 2a metade da temporada (o proprio indicador prevendo o proprio indicador), que scripts/A06.py calcula em porta_temporal() e grava em A06_resumo.json. A porta da §6.4 e o indicador das 19 primeiras rodadas contra os PONTOS das 19 ultimas, com parcial dada aos pontos do 1o turno: rho +0,121 (p 0,2858), parcial +0,092 (p 0,41602), em _porta_temporal.json e §3/§6 do _porta_temporal.md. O limiar rho>0,30 que o A06.py usa e o rho_persist que a §6.5 aposentou em 15/09.
- `porta_ppda`: está **0.571, citado no confianca_motivo de A06-1 como 'passa na porta temporal'**, deveria ser **parcial -0,103 (p 0,36312) na escala crua, +0,103 na alinhada — nao passa**
  - Mesma troca: 0,571 e persistencia entre metades. A porta de verdade para o PPDA esta em _porta_temporal.json, conferencia_6_4: rho -0,195, parcial -0,103, p 0,36312, n 80 — a linha 'PPDA' da tabela da §6.4, reproduzida identica ao publicado. Com p 0,36 nao passa em nenhuma das duas escalas.
- `porta_int`: está **0.56, citado no confianca_motivo de A06-1 como 'passa na porta temporal'**, deveria ser **parcial +0,204 (p 0,06972) — nao passa**
  - 0,56 e persistencia. A porta para 'Intensidade de jogo' esta em _porta_temporal.json, conferencia_6_4: rho +0,190, parcial +0,204, p 0,06972, n 80. Fica acima de 0,05.
- `porta_rec`: está **0.488, citado no confianca_motivo de A06-1 como 'passa na porta temporal'**, deveria ser **nao existe medida de porta para recuperacoes em arquivo nenhum**
  - 0,488 e persistencia entre metades, igual aos outros tres. Procurei a porta das recuperacoes nos 8 componentes de _porta_temporal.json e nas 9 linhas de conferencia_6_4 (a tabela da §6.4) e ela nao esta em nenhuma das duas. Aqui nao e so nome trocado: e afirmacao sem medicao. Rodar scripts/_porta_temporal.py com 'Recuperacoes' resolveria.
- `(sem marcador) os 62 e 56,5 digitados a mao no confianca_motivo de A06-2`: está **mediana 62 pontos nos que saem contra 56,5 nos que ficam**, deveria ser **63 contra 57, no recorte do proprio A06**
  - Refiz as duas medianas em A01_clube_temporada.csv. No recorte do A06 (2022-2025, 16 clube-temporadas na trave) da 63 nos 9 que saem (60, 61, 61, 61, 63, 63, 63, 63, 64) e 57 nos 7 que ficam (56, 56, 57, 57, 58, 58, 58). Os 62 e 56,5 saem do recorte 2022-2026, que tem 20 times na trave, 10 de cada lado — a tabela do _metodo_fronteira.md. Os marcadores novos pts_trave_sai e pts_trave_fica trazem o recorte certo; o '9 dos 16' da mesma frase esta correto.

**A07**

- `dist_s`: está **"9631.175" (string)**, deveria ser **9644, formatado "9.644"**
  - A07_testes.csv: a linha fronteira=com / SM / fis_distance_p90 tem cru_a = 9644.311. O 9631.175 é a linha fronteira=sem. O corte padrão de vitrine é COM fronteira (_metodo_fronteira.md); o A07 publicou o corte secundário.
- `dist_m`: está **"9597.146" (string)**, deveria ser **9598, formatado "9.598"**
  - A07_testes.csv: fronteira=com / SM / fis_distance_p90, cru_b = 9597.973. O 9597.146 é do corte sem fronteira.
- `hi_s`: está **"665.623" (string)**, deveria ser **669**
  - A07_testes.csv: fronteira=com / SM / fis_hi_distance_p90, cru_a = 669.117. O 665.623 é do corte sem fronteira.
- `otip_m`: está **"100.854" (string)**, deveria ser **100,0**
  - A07_testes.csv: fronteira=com / CM / fis_sprint_distance_p30otip, cru_b = 99.955 (cru 99.954714). O 100.854 é do corte sem fronteira.
- `at_m`: está **"22.0" (string)**, deveria ser **21**
  - A07_testes.csv: fronteira=com / CM / fis_atletas, cru_b = 21.0. O 22.0 é do corte sem fronteira. Agrava: J01-3 e J02-3 copiam esse 22,0 à mão de outra parte, então o erro de corte já se espalhou.
- `psv_m`: está **"30.806" (string)**, deveria ser **30,803, se o marcador sobreviver**
  - A07_testes.csv: fronteira=com / CM / fis_psv99_top5, cru_b = 30.803. O 30.806 é do corte sem fronteira. O PSV-99 sai do texto proposto, então o marcador pode morrer — fica registrado só por não ser do corte padrão.
- `hi_m, otip_c, at_c, n_c, psv_c e as demais (defeito de TIPO, não de valor)`: está **string com ponto inglês, ex. "652.318", "91.111", "25.5"**, deveria ser **número no JSON, com a versão pt-BR ao lado ("652", "91,1", "25,5")**
  - A07.json, campo numeros: esses valores batem com a base, mas o gerador manda a string como está para a tela, e '91.111' é lido como noventa e um mil. É o defeito dos 107 números que chegaram à tela com ponto inglês. Conferi um a um contra o A07_testes.csv: dos 30 números de A07.json, nenhum está errado contra a base — todos são leitura fiel do corte SEM fronteira. O erro real é a escolha do corte (as cinco correções acima) e o tipo.

**A11**

- `area_ent, area_xg, mpm_ent, spr_ent, mpm_xg, spr_ppda, mpm_ppda, spr_rec, mpm_rec, mpm_xgc (formato, não valor)`: está **string com ponto inglês, ex. "0.467", "-0.633" e "0.13"**, deveria ser **número, com a versão pt-BR ao lado: 0,467 · −0,633 · 0,130**
  - A11.json, campo numeros: refiz as 17 linhas de A11_correlacoes.csv do zero (80 linhas, Spearman no posto dentro da temporada) e os dez valores batem sem divergência — mas vão para a tela como string com ponto inglês. É o defeito dos 107 números com ponto inglês. Valor certo, tipo errado; não corrigi o arquivo.
- `n (no campo n de A11-3)`: está **80 — 'O físico não separa quem sobe... {n} clube-temporadas em {niveis}'**, deveria ser **49 (o marcador novo n_estrat)**
  - A estratificação usa 4+18+12+15 = 49 das 80 linhas: a faixa técnica baixa não tem promovido nenhum e nem aparece em A11_estratificado.csv. O 80 está certo para A11-1 e A11-2 e errado só na linha do A11-3 (e na linha correspondente do _registro.md). A proposta já prevê a troca; o número está calculado em n_estrat. Não mexi em A11.json nem no _registro.md.

**A12**

- `subiram`: está **6**, deveria ser **4**
  - Dos 22 clube-temporada dentro do perfil publicado da §7.2(b) nas 80 linhas fechadas, 4 tem faixa=Sobe (Criciuma 2023, Mirassol 2024, Athletico-PR 2025, Remo 2025), 11 Meio e 7 Cai. A12_resumo.json ja imprime taxa_de_acesso_no_perfil = 18,2%, que so fecha com 4/22. O 6 nao reproduz por caminho nenhum: com o envelope real sem arredondar tambem da 4 (sobre 20 que cabem). A12.json:numeros.subiram
- `taxa_env`: está **27.3**, deveria ser **18.2**
  - 27,3% e exatamente 6/22, ou seja arrasta o erro de 'subiram'. O certo e 4/22 = 18,1818% -> 18,2%, ja gravado em A12_resumo.json (cenario_barato.taxa_de_acesso_no_perfil). Inverte o sentido da frase: 18,2% e MENOS que os 20,0% da liga, nao mais. A12.json:numeros.taxa_env
- `cabem8`: está **14**, deveria ser **13**
  - A12_resumo.json, cenario_barato.cabem_e_estao_fora_do_top8 = 13, e a recontagem da base confirma 13 (dos 22 no perfil, 9 estao no top-8 de valor do ano). Com o envelope real seriam 12 — nem 13 nem 12 dao 14. A12.json:numeros.cabem8
- `sub8`: está **4**, deveria ser **2**
  - Dos 13 que cabem no perfil e estao fora do top-8, sobem apenas Criciuma 2023 e Mirassol 2024. Vitoria 2023 e Chapecoense 2025 sao baratos mas NAO cabem no perfil publicado (52,0153% de posse e 14,0858% de longo — exatamente o achado da A12-3), entao nao podem entrar nesta contagem. A12_resumo.json grava 2 em n_cabem_dos_baratos. A12.json:numeros.sub8
- `taxa8`: está **28.6**, deveria ser **15.4**
  - 28,6% e 4/14, herdando os dois erros acima. O certo e 2/13 = 15,3846% -> 15,4%. Continua acima dos 8,3% dos times fora do top-8 em geral (taxa_geral8, que esta certo), mas a distancia cai de 3,4x para 1,8x. A12.json:numeros.taxa8

**J01**

- `n`: está **3864**, deveria ser **3160**
  - dados/minutagem_serieb.json, linhas com ano em 2022-2025: 802 (2022) + 776 (2023) + 773 (2024) + 809 (2025) = 3.160. Os 3.864 incluem as 704 linhas de 2026, que o CLAUDE.md reserva para teste.
- `gk_med`: está **25,9**, deveria ser **21,7**
  - Mediana de fatia_pct dos 216 goleiros de 2022-2025: n par, os dois do meio sao 21,2 e 22,1, mediana exata 21,65 -> 21,7. A proposta escreveu 21,6, que e o mesmo 21,65 arredondado para baixo. Os 25,9 publicados so aparecem com 2026 dentro — 2026 sozinha move a mediana do goleiro mais de 4 pontos.
- `gk_p75`: está **69,3**, deveria ser **64,7**
  - p75 de fatia_pct dos 216 goleiros de 2022-2025: exato 64,65 (vizinhos 64,5 e 65,1) -> 64,7.
- `gk_60`: está **29,2**, deveria ser **27,3**
  - 59 de 216 goleiros com fatia_pct >= 60 em 2022-2025 = 27,3148%.
- `zag_60`: está **23,1**, deveria ser **22,5**
  - 109 de 485 zagueiros = 22,4742%.
- `ext_60`: está **7,5**, deveria ser **7,8**
  - 51 de 653 extremos = 7,8101%.
- `atk_60`: está **7,1**, deveria ser **7,0**
  - 33 de 474 atacantes = 6,9620%.
- `atk_p75`: está **35,6**, deveria ser **34,2**
  - p75 dos 474 atacantes de 2022-2025: 34,20 exato.
- `altos`: está **577**, deveria ser **457**
  - Linhas com fatia_pct >= 60 em 2022-2025. O mesmo codigo devolve 577 quando 2026 volta.
- `regulares`: está **123**, deveria ser **90**
  - Linhas regulares (fatia >= 60 em 2 das 3 temporadas da janela, com 2 temporadas com dado) em 2022-2025. O mesmo codigo devolve 123 com 2026 dentro.
- `les_base`: está **2296**, deveria ser **1974**
  - Linhas com fatia_pct < 60 E com id unico do Transfermarkt, 2022-2025.
- `les_n`: está **159**, deveria ser **138**
  - Das 1.974, as que tem dias de lesao > 0 no ano em dados/serieb_lesoes.csv.
- `les_baixa_pct`: está **6,9**, deveria ser **7,0**
  - 138/1.974 = 6,9909% -> 7,0%.
- `les_alta_pct`: está **6,7**, deveria ser **7,5**
  - 26/348 = 7,4713% -> 7,5%. Alem da temporada que sai, o valor publicado nunca teve o denominador ao lado.
- `les_dias`: está **53**, deveria ser **56**
  - Mediana de dias entre as 138 linhas de minutagem baixa com lesao: exata 55,5 (vizinhos 55 e 56) -> 56, que e o que a proposta escreveu.
- `sobe_altos`: está **7,1**, deveria ser **6,9**
  - 110 linhas de fatia >= 60 em 16 clubes-temporada 'Sobe' = 6,875. Muda por duas razoes: 2026 sai e a ponte de clube entra.
- `meio_altos`: está **6,0**, deveria ser **5,8**
  - 278 linhas de fatia >= 60 em 48 clubes-temporada 'Meio' = 5,7917.
- `cai_altos`: está **4,1**, deveria ser **4,3**
  - 69 linhas de fatia >= 60 em 16 clubes-temporada 'Cai' = 4,3125.
- `sem_ponte`: está **1132**, deveria ser **838**
  - 372 sem id do Transfermarkt + 466 com nome ambiguo, em 2022-2025.
- `pct_sem_ponte`: está **29**, deveria ser **27**
  - 838/3.160 = 26,52% -> 27%.
- `sem_id`: está **594**, deveria ser **372**
  - Linhas de 2022-2025 cujo nome normalizado + ano nao aparece em dados/serieb_elencos.csv.
- `ambiguos`: está **538**, deveria ser **466**
  - Linhas de 2022-2025 cujo nome normalizado + ano devolve 2 ou mais id_jogador.

**J02**

- `at_cd`: está **-1.105 (linha SEM fronteira)**, deveria ser **-1.108 (linha COM fronteira, a mesma dos crus da frase)**
  - A frase de J02-3 e 'Quem cai usa {at_c} atletas contra {at_m} do meio (d {at_cd}, q {at_cq})'. at_c=47.0 e at_m=38.0 sao os crus da linha com/concentracao/CM/atletas_usados de J02_testes.csv, que traz d -1.108 e q 0.00268. Os valores gravados (-1.105 e 0.00312) sao da linha sem fronteira, cujos crus sao 47,5 e 38,5. Os dois pares existem no CSV; o erro e a mistura de cortes dentro da mesma frase. A proposta ja tira esses marcadores do texto; se ficarem na prova, tem de sair da MESMA linha. Nao corrigido no arquivo.
- `at_cq`: está **"0.00312" (linha SEM fronteira, e gravado como texto)**, deveria ser **0.00268 (linha COM fronteira), como numero**
  - Par de at_cd: q 0,00312 e da linha sem fronteira e q 0,00268 e da linha com fronteira, que e a que fornece at_c/at_m usados na mesma frase. Alem do corte trocado, esta como string, o que a propria proposta aponta como furo do formatador da tela. Nao corrigido no arquivo.
- `fic_cd`: está **-0.827 (linha SEM fronteira)**, deveria ser **-0.670 (linha COM fronteira)**
  - Mesma frase de J02-3: 'mantem menos a base ({fic_c}% dos minutos contra {fic_m}%, d {fic_cd}, q {fic_cq})'. fic_c=24.1 e fic_m=32.3 sao os crus de com/continuidade/CM/min_de_quem_ficou_pct (cru_a 24,089, cru_b 32,335, d -0.670, q 0.03038); -0.827 e 0.04028 vem da linha sem fronteira (crus 22,301 e 31,218). Nao corrigido no arquivo.
- `fic_cq`: está **"0.04028" (linha SEM fronteira, e gravado como texto)**, deveria ser **0.03038 (linha COM fronteira), como numero**
  - Par de fic_cd, mesmo problema de corte e mesmo problema de formato (string em vez de numero). Nao corrigido no arquivo.

**J03**

- `dd_time`: está **1.59 (em resultados/J03.json, campo numeros)**, deveria ser **0.805**
  - 1,59 é o d do corte SEM fronteira: A06_testes.csv, linha fronteira=sem / comparacao=SM / indicador=duelos_def_pct, d 1,593, n 8x32. O valor do corte que vale nos dois é o COM fronteira: d 0,805, n 16x48, IC95 por clube de 0,18 a 1,52, q 0,02556. Publicar o 1,59 é exatamente o defeito que resultados/_metodo_fronteira.md documenta ('tratei o recorte sem fronteira como o verdadeiro'). Conferido na linha do A06_testes.csv e recalculado do zero a partir de dados/serieb_jogos.csv (as medianas brutas dos dois cortes batem: 60,768421 x 59,784868 no cheio, 61,672237 x 59,885174 sem fronteira). Não corrigi o arquivo. Consequência que vem junto: com 0,805 cai a frase 'o maior separador do estudo' — ele empata com xg_por_remate_contra (0,805) e fica atrás de dist_remate (1,203) — e o IC do d do volante (0,09 a 1,14) passa a cobrir o do time.

**J07**

- `cob`: está **81,7**, deveria ser **92,9 (5 temporadas) / 94,8 (2022-2025)**
  - É o defeito que gera todos os outros. O cruzamento por nome exato de scripts/J07.py perdia 18,3% das linhas, e a perda não era aleatória: o Wyscout abrevia o prenome do estrangeiro ('C. Palacios') e o Transfermarkt não ('Carlos Palacios'). Refeito com a forma abreviada casada: 3.591 de 3.864 linhas.
- `total_est`: está **57**, deveria ser **184**
  - o 57 somava as 5 temporadas (inclusive 2026, que o _registro.md manda deixar de fora) e vinha do cruzamento defeituoso. Em 2022-2025 são 184 linhas, de 148 pessoas; nas 5 temporadas seriam 225.
- `sobe_min`: está **4,3**, deveria ser **10,6**
  - além do defeito de nome, ('2025','Athletico Paranaense') não casava com 'Athletico-PR' de A01_clube_temporada.csv e as 36 linhas do clube mais estrangeiro da Sobe ficavam sem faixa. Refeito: 60 linhas de estrangeiro em 555 da Sobe, 10,63% dos minutos.
- `meio_min`: está **1,0**, deveria ser **3,9**
  - 87 linhas de estrangeiro em 1.749 do Meio, 3,92% dos minutos, 2022-2025.
- `cai_min`: está **2,2**, deveria ser **4,7**
  - 37 linhas de estrangeiro em 692 do Cai, 4,66% dos minutos, 2022-2025.
- `sobe_por`: está **1,1**, deveria ser **3,8**
  - 60 estrangeiros / 16 clube-temporadas da faixa Sobe.
- `meio_por`: está **0,4**, deveria ser **1,8**
  - 87 estrangeiros / 48 clube-temporadas da faixa Meio.
- `sobe_n`: está **17**, deveria ser **60**
  - linhas de estrangeiro na faixa Sobe, 2022-2025, com o cruzamento refeito.
- `arg`: está **11**, deveria ser **43**
  - linhas com primeira nacionalidade Argentina, 2022-2025 (28 pessoas).
- `col`: está **12**, deveria ser **37**
  - linhas com primeira nacionalidade Colômbia, 2022-2025 (33 pessoas).
- `uru`: está **10**, deveria ser **34**
  - linhas com primeira nacionalidade Uruguai, 2022-2025 (28 pessoas).
- `por`: está **8**, deveria ser **7**
  - o 8 incluía 2026; em 2022-2025 são 7 linhas e 6 pessoas de Portugal. Único caso em que o número publicado estava ALTO demais.
- `sulamer`: está **40**, deveria ser **159**
  - linhas de nacionalidade sul-americana, 2022-2025 (125 pessoas).
- `pri_est`: está **25,9**, deveria ser **18,1**
  - fatia mediana na primeira temporada, estreias 2022-2025, n=149. O 25,9 saía de 40 estreias, e as que escapavam do cruzamento defeituoso eram justamente os estrangeiros de nome cheio, com mais minuto.
- `pri_br`: está **17,5**, deveria ser **16,8**
  - estreias de brasileiro 2022-2025, n=1.685. A distância estrangeiro x brasileiro cai de 8,4 para 1,3 ponto.
- `perm_est`: está **25,0**, deveria ser **26,6**
  - 49 de 184 linhas de estrangeiro reaparecem na Série B no ano seguinte, com o alvo montado sobre as 3.864 linhas da base.
- `perm_br`: está **48,5**, deveria ser **51,1**
  - 1.438 de 2.812 linhas de brasileiro reaparecem, mesmo alvo.
- `perm_n`: está **44**, deveria ser **184**
  - o n da coorte estrangeira de permanência em 2022-2025.
- `pct_min_min`: está **0,1**, deveria ser **1,0**
  - menor % de minutos de estrangeiro numa temporada de 2022-2025: 2023, com 0,96%.
- `pct_min_max`: está **4,2**, deveria ser **10,4**
  - maior: 2025, com 10,36%.
- `pct_jog_min`: está **0,3**, deveria ser **2,3**
  - menor % de jogadores estrangeiros numa temporada: 2023, com 2,28%.
- `pct_jog_max`: está **3,7**, deveria ser **10,6**
  - maior: 2025, com 10,61%.
- `clubes_min`: está **2**, deveria ser **12**
  - menor número de clubes com algum estrangeiro numa temporada: 2023, com 12 de 20.
- `clubes_max`: está **10**, deveria ser **19**
  - maior: 2025, com 19 de 20.
- `dupla_med`: está **40**, deveria ser **44**
  - média por temporada 2022-2025 das linhas com dupla nacionalidade incluindo Brasil: 38, 44, 47, 48 = 44,2.
- `est_med`: está **11**, deveria ser **46**
  - média por temporada 2022-2025 das linhas de estrangeiro: 34, 17, 53, 80 = 46,0. O contraste 40 x 11 vira 44 x 46 — praticamente 1:1, que é o que a premissa nova de J07-3 precisa.

**T01**

- `clube_temporadas`: está **188**, deveria ser **180**
  - Com d.year a Serie B de 2020 (ago/2020 a jan/2021) e partida em dois anos e 2021 aparece com 28 clubes. Pelos blocos de meses com jogo (A01.py:blocos_de_temporada) sao 20 por ano nos nove anos: 180. A mesma contagem feita direto em dados/serieb_jogos.csv, sem passar pela coleta de treinador, tambem da 180.
- `passagens_temporada`: está **506**, deveria ser **492**
  - Passagens que atravessam a virada do ano viram duas linhas por d.year. Reagrupando as 6.546 linhas de T01_rodada_treinador.csv por (clube, treinador, inicio, fim, temporada-bloco) saem 492; o mesmo codigo em modo d.year devolve 506, identico ao valor de hoje — a diferenca e so a regra de temporada. Nao sao os 497 que o auditor propos.
- `com_10_rodadas`: está **273**, deveria ser **278**
  - Passagens-temporada com 10+ rodadas sobre as 492. Sobe porque passagens que d.year partia em duas (uma de 6 e outra de 7 rodadas, por exemplo) voltam a ser uma so e cruzam o corte de 10.
- `cobertura_exata`: está **159**, deveria ser **151**
  - 151 de 180 clube-temporadas fecham a conta exata (29 com buraco, 0 com sobra). Os 159 de hoje sao sobre as 188 clube-temporadas falsas de d.year. Em proporcao: 84% contra 85%.
- `um_efetivo_so`: está **54 de 188, com pct_um_efetivo_so = 29**, deveria ser **49 de 180, pct 27, na mesma definicao; 39 de 160, pct 24, no recorte das fechadas que o texto novo usa**
  - T01_rodada_treinador.csv reagrupado: clube-temporadas com 1 treinador efetivo distinto. Todas as temporadas 49/180 (27%); so as fechadas de 2018-2025, 39/160 (24%). Os 54 de 188 saem do artefato de d.year, que cria clube-temporadas curtas de 2021 com um treinador so.
- `media_efetivos`: está **2.23**, deveria ser **2,26 na mesma definicao; 2,25 contando efetivos distintos; 2,32 nas 160 fechadas**
  - O 2,23 de hoje e a media de PASSAGENS efetivas por clube-temporada com d.year (2,2287). Com a temporada corrigida, mesma definicao, 2,2556 -> 2,26; contando treinadores efetivos DISTINTOS, 2,2500 -> 2,25. Nas fechadas, 2,3188 -> 2,32, que e o numero de que sai media_trocas_fechadas.
- `mediana_efetivos`: está **2.0, gravado como decimal**, deveria ser **2, inteiro**
  - O valor 2 esta certo em qualquer recorte, mas gravado como 2.0 o gerador manda '2,0 treinadores' para a tela. Defeito de formato, nao de conta.
- `rodadas_total`: está **6546, usado no texto como 'das 6.546 rodadas'**, deveria ser **o valor 6.546 esta certo; o NOME e que engana — sao as rodadas COM DONO. As rodadas jogadas sao 6.608**
  - dados/serieb_jogos.csv + serieb_jogos_2018_2021.csv, Competicao = 'Brazil. Serie B': 6.608 linhas clube-jogo. T01_rodada_treinador.csv tem 6.546 linhas. 6.608 - 6.546 = 62 rodadas sem treinador conhecido. O marcador novo chama-se rodadas_com_dono.
- `topo_clubes`: está **Allan Aal 8, Claudinei Oliveira 7, Mozart 7, Daniel Paulista 6, Marcelo Cabo 6**, deveria ser **Allan Aal 9, Claudinei Oliveira 7, Marcelo Cabo 7, Mozart 7, Daniel Paulista 6, Guto Ferreira 6**
  - Com a temporada corrigida e com UM criterio so (passagem de 10+ rodadas, interino incluido — o mesmo que produz o 29 de rodam_3_clubes), Allan Aal tem 9 clubes e Marcelo Cabo tem 7, porque o interinato de 19 rodadas no Goias de 2021 conta. A lista de hoje mistura dois criterios: o 29 conta interino e a lista nao. Guto Ferreira tambem tem 6 e estava fora.
- `cobertura_sobra`: está **0, citado no confianca_motivo como conferencia**, deveria ser **o 0 esta certo, mas nao e conferencia: e garantido por construcao**
  - T01_rodadas.py atribui dono[clube][data] = um treinador so (regra 3, 'cada jogo tem um dono so'). Com um dono por jogo, sobra zero nao e um teste que poderia falhar. Confirmado na base: 0 clube-temporadas com sobra, nos dois modos de temporada.

**T02**

- `oscilam`: está **Jorginho, Guto Ferreira, Enderson Moreira, Léo Condé, Vagner Mancini, Mozart (6 nomes)**, deveria ser **7 nomes — falta Claudinei Oliveira (vale tanto em 2022-2026 quanto em 2022-2025)**
  - T02_passagem.csv, no_ranking=1. Pelo criterio que a propria frase enuncia (uma passagem em 0% e outra acima de 85%), Claudinei Oliveira cabe: Vila Nova 2023 tem 18 de 21 rodadas no G4 (85,7%) e ele tem tres passagens com no_g4=0 (Sport 2022, Chapecoense 2023, Paysandu 2025).
- `amp_mediana`: está **16.2**, deveria ser **16,3**
  - T02_passagem.csv, no_ranking=1, 2022-2026, 34 treinadores multiclube: a mediana da amplitude de pct_g4 e exatamente 16,25. Arredondando (nao truncando) da 16,3. O 16,2 e o round() do Python sobre o float 16,2499999 — defeito de arredondamento, nao de conta. O texto novo nao usa mais este marcador.

**T03**

- `esperado_por_acaso`: está **3,4 (T03.json, campo numeros)**, deveria ser **1,7 no mesmo recorte do numero publicado (base com 2026, 34 multiclube, 5 acima da linha); 1,3 no recorte fechado que o texto novo usa (28 multiclube, 4 acima da linha)**
  - 3,4 e 34 x 10%: trata cada treinador multiclube como um sorteio independente com 10% de chance de passar do percentil 90. Nao e — o rho de cada treinador e a MEDIA dos seus pares entre clubes, e media de varios pares tem variancia menor, entao chega ao percentil 90 bem menos que 10% das vezes. Medindo em vez de supor: permutacao do rotulo de treinador (embaralha a coluna treinador de T03_passagens.csv e reconta quantos 'multiclube' sorteados passam de 0,609) da media 1,68 na base com 2026 (2.000 replicas) e 1,271 nas fechadas (30.000 replicas, erro de Monte Carlo +-0,006). O erro e de um fator de 2 e inverte o sentido da frase publicada: '5 acima, o acaso previa 3,4' vira '5 acima, o acaso previa 1,7'. Sob o nulo, a chance de sair 4 ou mais acima da linha nas fechadas e 3,2%.

## Bloqueados — frases da proposta que não têm número possível

**A06-3** · `ca_contra_q, ca_contra_ic e ca_contra_selo (o contra-ataque sofrido com o metodo da casa)`

O bruto eu calculei (ca_contra_s e ca_contra_m) e o teste isolado tambem sai: no posto dentro da temporada, com fronteira 16x48 d +0,414 (p 0,14131, d minimo 0,82); sem fronteira 8x32 d +0,460 (p 0,29618, d minimo 1,14); trave com 16x16 d +0,492 (p 0,17448); trave sem 8x7 d +0,706 (p 0,19946). O que NAO posso entregar e o q e o selo, porque o BH e por familia: por o contra-ataque sofrido numa familia muda o q de TODOS os outros indicadores dela, o que regravaria A06_testes.csv e mexeria nas tres conclusoes. Escolher a familia e decisao de quem declara a lista, nao minha, e a regra de escrita desta tarefa proibe tocar em qualquer arquivo alem do A06_numeros_novos.json.

*O que resolveria:* Acrescentar 'contra-ataques sofridos' a A06_indicadores.json declarando a familia (a 'cede_ajustado' e a candidata natural, e ai e preciso decidir se entra ajustado pela posse do adversario, como os outros dois volumes cedidos, ou cru) e rodar de novo scripts/A06.py, que regrava A06_testes.csv, A06_resumo.json e os q de toda a parte. E o 'rodar mais uma vez' que a nota_da_parte ja pede.

**A07-1 e A07-2** · `porta_temporal_fisico (a proposta não batizou marcador porque o número não existe)`

A porta temporal da §6.4 precisa do 1º turno prevendo o 2º, e isso exige físico POR JOGO. No repositório a única tabela física por jogo é physical_match em _fonte/estudo_serieb/dados_copiados/skillcorner_serieb.db, que tem Série B 2025 (374 jogos) e 2026 parcial; 2022, 2023 e 2024 têm zero linhas. O agregado clube-temporada de dados/serieb_clube_temporada.csv não separa turno de returno, e o SkillCorner guarda um período só (full_all). É a mesma falta registrada em 'O que a base não tem' do CLAUDE.md.

*O que resolveria:* Copiar o skillcorner.db do Portal Ranking (outro projeto, porta 5053), que tem físico por jogador e por jogo, com a data da cópia no _registro.md. É decisão do dono, não minha. Sem esse dado nenhum número de porta temporal existe para A07 — e é por isso que a proposta diz que A07-2 não passa de provável.

**A07-1 e A07-2** · `recorte_por_estado_do_jogo (a ressalva 'pode ser efeito do placar', sem número)`

O CLAUDE.md manda recortar por estado do jogo quando a base permitir. Não permite: o SkillCorner guarda um período só (full_all), não há corrida com o time à frente, empatando ou atrás em fonte alguma do repositório. É a mesma falta que derruba A08 inteira.

*O que resolveria:* Dado físico por faixa de minutos ou por estado do placar, que a extração atual do SkillCorner não expõe. Enquanto não houver, a ressalva fica como texto, sem número — o que não é grave no A07-2, porque o placar empurra CONTRA o achado (quem está atrás corre mais, e quem cai corre menos).

**A07-1 e A07-2** · `d_rod / p_rod / q_rod como colunas de A07_testes.csv, e os 4 rô do rodízio em A07_resumo.json`

Bloqueio de LUGAR, não de cálculo: os números foram calculados e estão todos em A07_numeros_novos.json (as 72 linhas em tabela_d_rod_q_rod; os rô em numeros). O que a regra desta tarefa proíbe é escrever em A07_testes.csv e em A07_resumo.json, que é onde a proposta pediu que morassem.

*O que resolveria:* Quem for reescrever a parte copia daqui as colunas para o A07_testes.csv e a chave dos rô para o A07_resumo.json, ou roda de novo scripts/_rodar.py com o desconto embutido (a mecânica está descrita em cada linha de 'de_onde' e é a de residualiza() em gerar_prototipo.py:267).

**A11-1, A11-2 e A11-3** · `físico por turno (a proposta não batizou marcador — ela própria reconhece que o número não existe)`

A porta temporal da §6.4 precisa do 1º turno prevendo o 2º, e para isso é preciso físico por jogo. No repositório o único físico por jogo é dados_copiados/skillcorner_serieb.db → physical_match, que tem 374 jogos de 2025 (edição 1061) e 207 de 2026 (edição 1399) e ZERO linhas de 2022, 2023 e 2024 — conferido por SELECT agrupando por sc_competition_edition_id. A tabela physical, que alimenta as colunas fis_ de dados/serieb_clube_temporada.csv, é de temporada inteira e não separa turno de returno.

*O que resolveria:* Físico por jogo de 2022 a 2024 — a cópia do skillcorner.db do Portal Ranking com physical_match das edições 335, 446 e 773, o mesmo pedido que A07 já registrou. Sem isso nenhuma conclusão do A11 passa de provável, e é por isso que a proposta rebaixa A11-1.

**A11-1 e A11-2** · `recorte por estado do jogo (placar)`

As três conclusões carregam a ressalva 'pode ser efeito do placar' e nenhuma tem número para ela: o SkillCorner guarda um período só (full_all), sem corrida com o time à frente, empatando ou atrás, em fonte nenhuma do repositório. É a mesma falta que derruba A08.

*O que resolveria:* Dado físico por faixa de minutos ou por estado do placar, que o SkillCorner atual não expõe. Enquanto não houver, a ressalva fica como texto, sem número.

**A13-2 (prova)** · `r19_perto_simetrico`

A proposta manda tirar r19_perto (80,0%) do texto dizendo que 'a regra simetrica daria 95,0%', mas nao escreve qual e a regra simetrica. O script so aplica a folga de 3 pontos a quem termina no G4 ou no Z4; para quem termina no Meio exige estar exatamente no Meio. Escrevendo a versao simetrica mais direta (time de Meio que esta no G4 conta se estiver a ate 3 pontos de cair para 5o; se esta no Z4, se estiver a ate 3 pontos de sair dele) eu chego a 91,2% (73 de 80), nao a 95,0%. Sem a definicao escrita nao da para saber qual conta a proposta quis, e numero de conclusao nao se estima.

*O que resolveria:* Uma linha dizendo o que conta como 'a ate 3 pontos da faixa' para quem termina no Meio. Com a definicao escrita o numero sai na hora dos mesmos dois arquivos (classificacao_rodada.csv e A01_clube_temporada.csv).

**A14-1 e A14-3 (campo prova)** · `data_da_execucao`

A proposta pede que a prova cite "A14_resumo.json + resultados/A14.md + a data da execução" depois de prender a varredura de candidatos() aos arquivos do Bloco A. Não há data para citar: o A14_resumo.json em disco é o do índice de 8 componentes, gravado em 17/09, e resultados/A14.md não existe (nota_da_parte da própria proposta já diz isso). Regravar o resumo ou criar o .md está fora do único arquivo que esta tarefa pode escrever.

*O que resolveria:* uma execução do A14.py corrigido — varredura presa ao Bloco A (hoje quebra com KeyError 'comparacao' em J03_testes.csv e J08_testes.csv, e com TypeError em A10_indicadores.json) e I_estabilidade_11 fora do índice — regravando A14_resumo.json e escrevendo A14.md. Todos os números dessa execução já estão calculados e conferidos em A14_numeros_novos.json: o que falta é o arquivo e a data.

**A14-2** · `negativa`

A proposta lista "marcar negativa = true no JSON" dentro de numeros_a_criar, mas não é número da base: é um campo de A14.json que manda a conclusão para "Parece, mas não é" em vez de deixá-la elegível a "O que decidimos" (gerar_estudo_serieb_js.py, linhas 139-146). Esta tarefa não pode tocar em A14.json.

*O que resolveria:* quem aplicar a proposta em A14.json acrescenta o campo; nada precisa ser calculado.

**J07-3** · `de_clube_europeu`

Não existe tabela de clube -> país/liga no repositório. A coluna clube_anterior de dados/serieb_elencos.csv traz 116 nomes distintos só entre as 184 linhas de estrangeiro, e o campo está sujo: 8 linhas dizem 'Sem clube', 6 dizem ': Ablöse ?' e 3 ': Ablöse custo zero' (resíduo da raspagem do Transfermarkt alemão), 4 vêm vazias. Nomes como 'Legia de Varsóvia' ou 'Club León' só viram país por classificação manual — exatamente a saída que a própria proposta reservou ao dono, porque é dado e não método.

*O que resolveria:* Uma das duas saídas que a proposta já desenhou: (1) o dono aprova uma lista clube -> país montada uma vez sobre esses 116 nomes (mais os ~90 das demais linhas), conferível e versionada, e a frase sai com número; ou (2) a frase da Europa cai e a origem continua saindo só da nacionalidade, com a aproximação declarada. A mesma lista destrava a liga de origem de J08 e J09.

**J07 (métrica do CLAUDE.md, fora das três conclusões)** · `percentis do estrangeiro contra o brasileiro da mesma posição`

O CLAUDE.md pede 'percentis em relação aos brasileiros da mesma posição', mas base_jogador_temporada.csv só tem minutos, jogos, fatia, idade e lesão — nenhuma métrica técnica por jogador. Nenhum marcador da proposta o pede; registro porque o em_aberto do J07.json atual o promete.

*O que resolveria:* Cruzar J04_base.csv ou J08_base.csv (que têm métrica por jogador) com esta classificação de nacionalidade. Com 13 a 49 estrangeiros por posição em quatro temporadas, o resultado seria descritivo, nunca testável.

**J07 (métrica do CLAUDE.md)** · `comparação com a Série A`

O CLAUDE.md diz 'Se houver base da Série A, repetir para comparação, porque a amostra é maior'. Não há base de elenco nem de minutagem da Série A no repositório.

*O que resolveria:* Coleta de elencos da Série A no molde de coletar_serieb_lesoes.py, ou os Excels do Portal Ranking (dados/abr26), que é outro repositório e entra aqui como base copiada.

**T03-1 e T03-2 (item de numeros_a_criar)** · `xgc_casa / dd_casa medidos na passagem`

Nao sao um numero: sao duas COLUNAS novas em T03_passagens.csv (xG sofrido em casa e duelo defensivo ganho em casa, por passagem) e, pelo que a proposta pede, entram no lugar de xg e xg_contra no conjunto de tracos. Isso muda a familia dos sete e, com ela, TODOS os marcadores que esta tarefa calculou: rho entre clubes (0,153), 4 contra 1,3 acima da linha, 6 em 10 na distancia do remate, 3,7 do meia-meia, as medianas de mudanca e o minimo detectavel do T03-2. Entregar as duas colunas E os oito marcadores do texto seria entregar dois conjuntos incompativeis. Trocar traco exige rodar scripts/T03.py de novo — reanalise, fora do 'so calcular', e fora da regra de escrita (nao posso tocar em T03.py nem em T03_passagens.csv).

*O que resolveria:* Um pedido separado que rode scripts/T03.py com a lista de tracos revista e reescreva T03_passagens.csv, T03_antes_depois.csv e T03_resumo.json de uma vez; os marcadores se recalculam depois sobre a base nova. A cobertura nao bloqueia: 124 das 126 passagens fechadas tem 5+ jogos em casa, mediana de 9 jogos em casa por passagem (serieb_jogos.csv, mando='casa', 1.785 jogos de casa no periodo) — e essa mediana de 9 e justamente a 'janela de casa' que a proposta manda declarar no em_aberto.

## Conflitos entre partes, e qual valor vale

**n_sobe / n_sobe_sf / d_min_sm (e todo o n do J02)** — J02, A04, A05, A07, A12, A14, J01, A02, A03, A06, J03

- valores: J02: n_sobe 15, n_sobe_sf 7, n 79, d_min_sm 0,84 (1,20 sem fronteira). Todas as outras: n_sobe 16, n_sobe_sf 8, n 80, d_min 0,82 (1,14 sem fronteira).
- **vale:** Vale 16 / 8 / 80 e 0,82 / 1,14. O 15, o 7, o 79 e o 0,84 do J02 sao defeito, nao recorte. — O proprio J02 documenta a causa: o J02.py perde Athletico-PR 2025 no 'if not js: continue', porque T01_ponte_clubes.json traduz o nome do Transfermarkt PARA o do Wyscout e a busca dos minutos e feita no sentido contrario. Nao e corte de cobertura — o clube some antes disso. Conferi na base: dados/serieb_clube_temporada.csv tem a linha ('2025','Athletico-PR') completa, com atletas_usados 36 e share_11 53,1. A01_clube_temporada.csv tem 20 linhas por ano em 2022-2025 = 80, com 16 Sobe. Enquanto a ponte nao for corrigida, todo n do J02 fica um abaixo e o poder do desenho piora de 0,82 para 0,84.

**at_s / at_m / at_c (J02) contra sobe_usados / meio_usados / cai_usados (J01) — 'jogadores usados por faixa'** — J02, J01

- valores: J02: Sobe 35,0 · Meio 38,0 · Cai 47,0. J01: Sobe 36,6 · Meio 38,4 · Cai 45,6.
- **vale:** Vale a MEDIANA da coluna atletas_usados sobre os 80 completos: Sobe 35,5 · Meio 38,0 · Cai 47,0. Os dois valores de Sobe publicados estao errados — o 35,0 do J02 e o 36,6 do J01. — Recalculei da base: dados/serieb_clube_temporada.csv cruzado com A01_clube_temporada.csv da, para atletas_usados, mediana 35,5 / 38,0 / 47,0 e media 36,62 / 38,46 / 45,62. Ou seja o J01 publica MEDIA e o J02 publica MEDIANA da mesma grandeza, com o mesmo rotulo. E o 35,0 do J02 e a mediana de 15 linhas: com Athletico-PR 2025 de volta (36 atletas, o valor que cai exatamente no meio) a mediana sobe para 35,5. A unidade fixa do estudo e posto/mediana dentro da temporada, e A02, A05 e A06 usam st.median — entao a mediana e que vale, e o 36,6 do J01 tem de ser rerrotulado como media ou refeito. A direcao da historia (Cai usa mais gente que Meio, que usa mais que Sobe) sobrevive nos dois jeitos.

**dist_sobe_alta / dist_meio_alta (A11) contra dist_s / dist_m (A07) — distancia percorrida por 90** — A11, A07

- valores: A07: Sobe 9.644 · Meio 9.598 (Sobe corre 46 m a MAIS). A11 faixa tecnica alta: Sobe 9.614 · Meio 9.620 (Sobe corre 6 m a MENOS).
- **vale:** Vale a mediana do A07 (9.644 contra 9.598) para a comparacao entre faixas. Os numeros do A11 sao medias e so podem aparecer dizendo 'media' na frase, ou tem de ser refeitos como mediana. — Mesma coluna (fis_distance_p90), mesmos 16 Sobe e 48 Meio. Conferi na base: mediana Sobe 9.644,3 e Meio 9.598,0; media Sobe 9.612,5 e Meio 9.572,9. Os 9.614 e 9.607 do A11 sao medias de 12 e de 4 Sobe, que somadas dao a media dos 16 (9.612,5). O A11 ja avisa disso na nota, mas os dois numeros vao para a tela lado a lado e o SINAL da diferenca inverte: quem ler as duas conclusoes ve quem sobe correndo mais numa e menos na outra, por troca de estatistica, nao por achado.

**ad_n — trocas de treinador com 8+ jogos de cada lado** — T03, T04

- valores: T03: 66. T04: 73 (e guarda 66 em ad_n_fechadas).
- **vale:** Vale 66 em qualquer frase que diga '2022 a 2025'. O 73 so vale se a frase disser que 2026 esta dentro. — Sao 7 trocas de 2026 de diferenca (por temporada: 2022=17, 2023=18, 2024=12, 2025=19, 2026=7). Nao e erro de conta, e janela. O problema e que T03 e T04 falam da mesma coisa com janelas diferentes e o leitor ve dois n para o mesmo teste. Com 66 pares o minimo detectavel pareado vai de 0,33 para 0,35, entao o dmin_antes_depois do T04 tambem acompanha a escolha.

**multi / t02_multi — treinadores com passagem em 2 clubes ou mais** — T02, T03, T04

- valores: T02: 28. T03: 28. T04: 34 (e guarda 28 em t02_multi_fechadas).
- **vale:** Vale 28. O 34 e o mesmo recorte com 2026 dentro, e seis dos 34 so sao multiclube por causa de 2026. — T02 e T03 ja recortaram em 2022-2025 e chegaram aos mesmos 28 por caminhos diferentes (T02_passagem.csv e T03_passagens.csv). Quem ficou fora do passo foi o T04, que copiou o 34 publicado em T02.json. Como as conclusoes T04-1 e T04-2 aparecem no mesmo cartao, publicar 34 numa e 28 na outra e o pior dos dois mundos.

**t03_pass / n_pass e t03_tec / n_tec — passagens de 10+ rodadas com perfil completo, e treinadores distintos nelas** — T03, T04

- valores: T03: 126 passagens de 64 treinadores. T04: 151 passagens de 69 treinadores.
- **vale:** Vale 126 e 64 para o texto que diz '2022 a 2025'; 151 e 69 sao a mesma conta com 2026 dentro. — Mesma causa do ad_n e do multi: o T04 copiou os valores publicados em T03.json, que incluem 2026, enquanto o T03 recortou. Ou os tres pares (126/151, 64/69, 66/73) andam juntos numa janela so, ou o cartao do Bloco T mostra dois tamanhos de base para a mesma amostra.

**t02_amp_mediana / amp_mediana — amplitude de tempo no G4 entre clubes do mesmo treinador** — T02, T04

- valores: T02: 21,7 pontos percentuais (2022-2025, todas as rodadas) e 3,45 (a partir da 10a rodada). T04: 16,2 (com 2026) e 21,7 em t02_amp_mediana_fechadas.
- **vale:** Vale 21,7, com o 3,45 obrigatoriamente ao lado. O 16,2 e o mesmo numero com 2026 dentro. — Alem da janela, ha uma armadilha extra que o cruzamento revela: T04.t02_amp50 = 9 e T02.amp_50mais_apos10 = 9 sao o MESMO numero por coincidencia, vindos de cortes diferentes — o 9 do T04 e 'todas as rodadas, 2022-2026' e o 9 do T02 e 'a partir da 10a, 2022-2025'. O valor do T02 comparavel ao do T04 e 8. Um revisor que veja 9 nos dois lugares vai concluir que batem.

**1,59 — d_sm do indice (A14) contra o 1,59 do duelo que a proposta manda apagar** — A14, A06, J03, A03

- valores: A14: d_sm = 1,59 (indice de 7 indicadores, Sobe x Meio, corte com fronteira). Duelo: 1,59 = d de duelos_def_pct no corte SEM fronteira (A06_testes.csv linha sem|duelo|SM: d 1,593), que a proposta manda tirar de quatro lugares.
- **vale:** Os dois valem — sao grandezas diferentes que por acaso dao 1,59. O que NAO vale e tratar as duas como a mesma. — Conferi A06_testes.csv: com fronteira o duelo da d 0,805 (IC 0,18 a 1,52) e sem fronteira da 1,593. O 1,59 do duelo esta em J03.json (numeros.dd_time), A03_indicadores.json linha 49, _fonte/CONTEXTO_sessao_17_09.md linha 49 e static/estudo_serieb_dados.js (este no ar), e a proposta o substitui por 60,8 contra 59,8. O A14 estreia um 1,59 novo, que e legitimo. Quem for executar a proposta com busca-e-troca de '1,59' quebra o A14. A troca tem de ser por marcador, nunca por texto.

**cob_min — dois nomes iguais para coberturas diferentes** — A07, J02

- valores: A07: 62 (% de cobertura fisica do SkillCorner, pior caso Gremio 2022, 0,620). J02: 64,6 (% de cobertura da ponte minutagem x elencos).
- **vale:** Os dois valem. Sao grandezas diferentes e um dos dois tem de mudar de nome (ex.: cob_fis_min e cob_ponte_min). — O marcador e por parte no gerador, entao nao ha colisao na tela hoje. Mas os dois aparecem em 'Como sabemos' com a mesma palavra 'cobertura' e numeros vizinhos (62 e 64,6), o que convida a ler como a mesma medida com dois valores. Primeiro pedido de sincronizacao que junte tabelas de partes diferentes cria o bug de verdade.

**n_ind — dois nomes iguais para contagens diferentes** — A07, A14

- valores: A07: 12 (indicadores fisicos: 3 de volume + 5 de intensidade + 4 de com/sem bola). A14: 7 (indicadores que sobram no indice depois dos dois cortes).
- **vale:** Os dois valem; o nome tem de se separar (n_ind_fis e n_ind_indice). — Mesmo caso do cob_min, e mais perigoso porque o A14 e a sintese que cita o A07: a manchete do A14 e 'Sete indicadores...' e a prova do A07 fala em 12. Vale registrar tambem que A14.json ainda guarda n_ind = 8 (indice antigo, com I_estabilidade_11 dentro) — nao e erro contra a base, e a definicao que a proposta muda.

**rho_min_80 / rho_min_det / r_min_80 — menor correlacao detectavel** — A02, A11, T02

- valores: A02: 0,31 (n=80). A11: 0,309 (n=80). T02: 0,508 (n=28).
- **vale:** A02 e A11 sao o MESMO numero (tanh de 0,31927 = 0,308847) e tem de sair com o mesmo arredondamento: 0,31. O 0,508 do T02 esta certo para o desenho dele. — Duas coisas. Primeira, a mesma grandeza sai 0,31 numa parte e 0,309 na outra — duas casas contra tres, no mesmo lugar da tela. Segunda, o sufixo '_80' quer dizer coisas opostas: em rho_min_80 quer dizer n = 80; em r_min_80 quer dizer 80% de poder, com n = 28. Quem juntar as duas partes vai ler o 0,508 como 'n = 80'.

**diferenca do duelo defensivo Sobe menos Meio, em ponto percentual** — A06, J03

- valores: A06 (nota do proprio arquivo): 0,99. J03 (marcador dd_time_pp): 0,98.
- **vale:** Vale 0,98. — Os valores brutos sao 60,768421 e 59,784868, e a diferenca e 0,983553, que arredonda para 0,98. O 0,99 sai de subtrair os ja arredondados (60,77 menos 59,78) — arredondamento duplo, exatamente o defeito que a auditoria achou. E o mesmo defeito que os dois arquivos ja pegaram no 59,79 da proposta (o certo e 59,78). Como a frase de J03-2 e a que vai ao ar com o marcador, o 0,98 tem de ser o unico numero.

**total de jogos-time da Serie B 2022-2025** — A04, A02, A06

- valores: A04 (nota): 3.040 jogos-time = 1.520 partidas x 2. A02: 76 clube-temporadas com 38 jogos e 4 com 37.
- **vale:** Vale 3.036. O 3.040 e o nominal, nao o que a base tem. — Contei dados/serieb_jogos.csv com filtro Competicao = 'Brazil. Serie B' e 2022-2025: 80 clube-temporadas, 3.036 linhas; faltam quatro jogos, um em cada um de Londrina 2022, Tombense 2022, Chapecoense 2024 e Operario-PR 2024. Nao muda os 33,7% do A04 (que sao gols sobre gols), mas invalida a frase '3.040 jogos-time' e o 'media dos 38 jogos por clube-temporada' que o A06 escreve no de_onde de dd_s_com. Onde o texto escala por 38 jogos (liga_bp_38, saldo_sobe_38) esses quatro casos entram com 37.

**n_barato / subiram / taxa_env — os 4 que subiram baratos contra os 4 que cabem e subiram** — A12

- valores: n_barato = 4 (Vitoria 2023, Criciuma 2023, Mirassol 2024, Chapecoense 2025). subiram = 4 (Criciuma 2023, Mirassol 2024, Athletico-PR 2025, Remo 2025). taxa_env = 18,2% (4 de 22).
- **vale:** Os dois 4 estao certos e sao conjuntos DIFERENTES. O que nao se sustenta e a leitura de que sao os mesmos quatro. — Conferi caso a caso contra dados/serieb_clube_temporada.csv com o perfil publicado da 7.2(b) (ppda 10,0-13,2 · posse 47-52% · passe longo 10-14%): Vitoria 2023 fica de fora por posse 52,0153 e Chapecoense 2025 por passe longo 14,0858 — ou seja, o perfil exclui 2 dos 4 casos de que foi tirado, porque as pontas publicadas truncaram para baixo em vez de arredondar (52,0153 vira 52 e 14,0858 vira 14). E os 4 que 'cabem e subiram' incluem Athletico-PR 2025 (1o em valor do ano) e Remo 2025 (3o), que sao o oposto de barato. A taxa de 18,2% e, portanto, meio Cenario Barato e meio clube rico. Ou as pontas do perfil sao arredondadas para fora (52,1 e 14,1), ou a frase diz que dois dos quatro ficaram de fora do proprio perfil.

**posse minima de quem sobe** — A05, A12

- valores: A05 posse_min: 47,4. A12 posse_lo: 47 (e envelope_real: 47,4203).
- **vale:** O numero medido e 47,4203 (Chapecoense 2025) e vale em unidade de jogo como 47,4. O 47 do A12 nao e medida, e o piso publicado na 7.2(b). — E o mesmo clube e o mesmo valor em duas partes, com tres grafias na tela (47, 47,4 e 47,4203). Baixa gravidade sozinho, mas e a mesma ponta que faz o Chapecoense 2025 cair fora do perfil do A12 — entao muda junto com o item anterior.

## Números que viajam (mudar num lugar obriga a mudar no outro)

- A01 (faixa e fronteira) -> TODO MUNDO: n_sobe 16, n_meio 48, n_cai 16, n_sobe_sf 8 (= n_sobe_sem do A12), n_meio_sf 32 (= n_meio_sem), n_cai_sf 12, n_sf 52 (= n_sem_fronteira do A13). Estao em A02, A03, A04, A05, A06, A07, A11, A12, A13, A14, J01, J02 e J03, com quatro nomes diferentes para a mesma coisa. Mexer na regra de fronteira do A01 muda 13 partes.
- A01 (desenho 16x48 e 8x32) -> o minimo detectavel 0,82 e 1,14, que viaja com seis nomes: dmin_SM_cf (A02), d_min_com / d_min_sem (A03 e A05), dmin_sm_com / dmin_sm_sem (A04), dmin_SM_com (A06), d_min_cai_meio (A13), d_min_menor / d_min_sem_menor (J03). Um clube-temporada a mais ou a menos reescreve os nove.
- A01 trave_de 16 -> A04 n_trave e A06 n_trave; A01 trave_fronteira 9 -> A06 n_trave_sai 9; A06 n_trave_sf 7 = 16 menos 9. Mesmo numero, tres nomes, tres partes.
- A01 pontos do 4o colocado (62, 64, 64, 62) -> A01 corte_por_ano_frase e margens_frase; T04 eb_temps ('5o com 63 · 5o com 64 · 5o com 61') e eb_dist ('a um ponto do 4o'); A13 lista_perderam_g4 e lista_viraram. Se o A01 recalcular a tabela, o T04 e o A13 ficam velhos sem avisar.
- A02 dist_remate 19,522 / 20,472 -> A02 dist_s_cf e dist_m_cf (19,5 / 20,5) e A12 dist_sobe e dist_meio (19,5 / 20,5). Mesmo par, duas partes, quatro marcadores.
- A02 xg_por_remate_contra 0,089 / 0,098 -> A02 xgpr_s100_cf e xgpr_m100_cf (multiplicados por 100: 8,9 / 9,8), A06 xgpr_s_com e xgpr_m_com, A12 xgr_sobe e xgr_meio. Tres partes, seis marcadores, uma so medida — e uma delas em escala diferente.
- A02 remates_contra 11,618 / 12,053 -> A02 remc_s_cf e remc_m_cf (11,6 / 12,1) e A06 rc_s_com e rc_m_com (11,62 / 12,05). Mesma coluna da base, duas casas num lugar e uma no outro.
- A02 conf_xgpr_contra 0,36 -> A06 conf_xgpr 0,36 (split-half do mesmo indicador, calculado duas vezes e batendo). A confiabilidade do xG 0,30 -> A03 conf_xg e A11 conf_xg.
- A06 duelos_def_pct com fronteira 60,768 / 59,785 -> J03 dd_time_s, dd_time_m e dd_time_pp (0,98); A06 n_sobe_com / n_meio_com 16 e 48 -> J03 n_a06_s e n_a06_m; A06 dmin sem fronteira 1,14 -> J03 d_min_sem_menor e gk_n_s_sem / gk_n_m_sem. Se o A06 for refeito, cinco marcadores do J03 caem junto.
- A06_testes.csv sem fronteira, duelo, d 1,593 -> o '1,59' que esta em J03.json (numeros.dd_time), A03_indicadores.json linha 49, _fonte/CONTEXTO_sessao_17_09.md linha 49 e static/estudo_serieb_dados.js linhas 335 e 1086 (esta no ar). A proposta manda substitui-lo nos quatro. CUIDADO: o A14 estreia um d_sm que tambem vale 1,59 e nao pode ser trocado junto.
- A07 cobertura fisica -> A11 n_cob 60 e n_cob_fora 20; o n_cob_baixa 20 do A07 e o mesmo 20 do A11, com outro nome. E o corte de 0,75 que define os dois.
- A07 dist_s 9.644 -> o A11 se posiciona explicitamente contra ele em dist_sobe_alta 9.614. Um numero comparado com o outro em partes diferentes, e em estatisticas diferentes.
- J01 sobe_altos 7,1 e cai_altos 4,1 -> J02 j01_sobe_altos e j01_cai_altos. Copia declarada: o J02 nao recalculou da base de minutagem. Se o J01 for refeito, os dois acompanham.
- J02 share_11 68,1 / 63,1 -> A12 sh_sobe e sh_meio (recalculados na base e batendo, 68,083 e 63,127).
- T01_ponte_clubes.json (a ponte de nome de clube, nao um numero) -> J01 (sobe_usados, meio_usados, cai_usados, casadas_so_nome), J02 (n_fora, cob_med, cob_min e TODOS os n), J03 (n_usado 723), J07 (liga_ct 2,3). Uma linha de ponte errada ja tirou 1 clube-temporada do J02; corrigi-la mexe em quatro partes de uma vez.
- T01 (base de passagens) -> T02 ct_top5_rod 14,6 e multi; T03 n_pass, n_tec, multi, ad_n, ad_ct, ad_cl, ad_sobe, ad_mexe_min/max, dist_mesmo_lado, meia_meia, n_um_par; T04 por tabela. T01 rodam_3_clubes_2225 14 ja cita o T03.
- T02 -> T04: eb_pass 3, eb_rod 108, eb_piso 37,5, eb_piso10 41,4, eb_med 47,2, pz_piso 89,5, ca_piso 89,2, carp_piso 31,2, t02_multi 34, t02_amp_mediana 16,2, t02_amp50 9, n_lista 30, n_lista10 22. Treze marcadores do T04 sao copia do T02 — e tres deles (multi, amp_mediana, amp50) chegaram com a janela errada.
- T03 -> T04: ad_n 73, dmin_antes_depois 0,33, dmin_multi 0,48, eb_ind 73,6, eb_ind_piso 56,1, t03_pass 151, t03_tec 69, conf_tracos 3. Seis marcadores do T04 sao copia do T03, quatro deles com 2026 dentro enquanto o T03 recortou.
- A14 (o indice de 7) -> os sete nomes vem das reguas de A02, A03, A06 e A12 (H_dinheiro, dist_remate, E_qualidade_chance, xg_por_remate_contra, duelos_def_pct, xgc_casa, dd_casa); e o indice volta para o Bloco T em T03 bh_familia_7 e teto_por_traco e em T04 eb_ind e conf_tracos. Tirar ou por um indicador no A14 reescreve o T03 e o T04.
- A02 rho_min_80 0,31 = A11 rho_min_det 0,309. Mesma conta de Fisher com n = 80, duas partes, dois arredondamentos.
- A05 rodadas_1t 19 = A02 rod_corte 19 = A13 rodada_turno 19 (a metade do campeonato, tres nomes). A12 rodada 27 = A14 rodada26 27 (a rodada de 2026 do teste, dois nomes — e o nome 'rodada26' guarda 27).
- Os 80 clube-temporadas de 2022-2025 viajam com sete nomes: A02 n_turnos, A12 n_fech, A14 n_base, J01 n_ct, J02 n_esperado (com 79 de fato), J07 ct_total, T02 ct_n. E o T01 conta a mesma base em outra janela: 180 clube-temporadas (2018-2026) e 160 fechadas.
- A05 posse_min 47,4 = a ponta de baixo do A12 envelope_real 47,4203 (Chapecoense 2025), publicada no A12 como posse_lo 47. Mesmo clube, mesmo valor, tres grafias.