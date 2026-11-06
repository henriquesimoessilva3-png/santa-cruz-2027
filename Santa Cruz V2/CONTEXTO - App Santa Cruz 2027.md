# Contexto — App de montagem de elenco · Santa Cruz 2027

Atualizado em 19/10/2026, 01h. Serve para retomar o trabalho em outra conversa.

## Onde fica
- **Site:** GitHub Pages, repositório `henriquesimoessilva3-png/santa-cruz-2027`, aberto com `?visao=nova`.
- **Pasta no Mac:** `Meu Drive/6. arquivos pessoais Henrique/Santa Cruz`. Na sessão, aparece como `$HOME/mnt/Santa Cruz`. A pasta `Analytics` também está conectada.
- **Publicar:**
  1. `timeout 150 python3 publicar_site.py`
  2. `git add -A static docs templates`
  3. `git commit`, com Co-Authored-By e Claude-Session no fim da mensagem.
  4. Mover os `.git/*.lock` para outro nome: a sessão não consegue apagar arquivos nessa pasta.
- O Henrique faz o push:
  ```
  cd "/Users/henriquesimoessilva/Meu Drive/6. arquivos pessoais Henrique/Santa Cruz" && git push
  ```
- **Pendente:** push dos commits de 8aaf090 até febaf4b.
- **Chrome:** a aba 457601943 tem o site no ar. O retorno de JS vem cortado em uns 1.000 caracteres. Não usar "=" no texto devolvido.

## Regras do Henrique
- Responder em português, curto, com números em **negrito**. Datas em dd/mm/aaaa.
- **Conferir sempre a identidade do jogador** (clube, posição, idade): "a gente não pode errar qual jogador é".
- Só número real, nunca inventado.
- Ficha sem barra de rolagem. Cada indicador em uma linha, com o número perto do nome.

## Régua e seta técnica (oficial)
- **Fundamentais:** indicadores que separam quem sobe de quem cai em 0,15 desvio ou mais. Série B, de 2022 a 2025, titulares com 900 minutos ou mais.
- **Régua de cada fundamental:** a **média** dos titulares dos times que subiram (não é a mediana). Técnico e físico usam a mesma régua. Coluna "sobe" na ficha.
- **Meios:**
  - Volante, médio e meia ficam sem indicadores parecidos: sai quem tem correlação de 0,5 ou mais com um que já ficou. No máximo **15**.
  - Resultado: volante **15** (eram 28), médio **10**, meia **12**.
  - As outras posições não mudaram: lateral **12**, zagueiro **16**, extremo **15**, centroavante **11**.
  - AUC geral da seta foi de **0,641** para **0,654**. Volante foi de **0,70** para **0,79**, médio de **0,69** para **0,82**.
- **Script:** `Santa Cruz V2/scripts/b23_seta_sobe.py`, que gera `static/tecnico_grupos_dados.js`.
- **Testes:**
  - `b24_teste_teto.py`: limite de 20 por posição, desfeito.
  - `b26_teste_piso.py`: régua como piso (percentil 25 de quem sobe) baixa a AUC para **0,60**.
  - `b27_teste_similares.py`: tirar indicadores parecidos.
- **Leitura:** ninguém bate todos os fundamentais. Em média, o titular que sobe fica no nível da régua em uns **45 a 49%** deles, e o que cai em **27 a 36%**. A seta conta a proporção.

## Ficha do jogador
- **Topo:** foto em retrato do Transfermarkt, nome, depois escudo + **clube atual do TM**.
  - Se o clube do TM for diferente do cadastro, aparece "(no cadastro: X)". Exemplo: Keno, Coritiba (no cadastro: Fluminense).
  - A liga mostrada continua a do cadastro.
  - Os dados vêm de `perfil_extra.json`, gerado por `gerar_perfil_js.py`. O índice 9 é o id do clube; o escudo vem de `tmssl.akamaized.net/images/wappen/normquad/{id}.png`.
- **Técnico:** 4, 2 ou 1 coluna conforme a largura do painel (container query em `.sf-col-tec`), para não embolar na ficha aberta pelo "+".

## Dados colados (SkillCorner e Wyscout)
- **Técnico colado:** ok. Os **40** indicadores aparecem para os **49** jogadores, porque o app guarda a linha inteira (`tec_raw`).
- **Físico colado:**
  - A leitura antiga pulava 5 colunas: HSR Count, Medium Accel, Medium Decel, Change of Direction, Running Distance.
  - Corrigido em `MD_FIS` (app.js). Agora o app também guarda a linha inteira (`fis_raw`) e completa o que faltar.
- **11 de 46 completados** pela base da API do SkillCorner (`Analytics/Portal Skillcorner/dados/skillcorner.db`, sincronizada em 16/10), só com dados de 2026:
  - Camilo, Charles, Gustavo Barreto, Guilherme Portuga, Gabriel Feliciano, Marcos Paulo, Rodrigo Pinho, Lucas Janson, Gustavo Ferrareis, Mádson, Bruno Rodrigues.
  - Identidade conferida por nome completo + nascimento + números parecidos com os do colado.
  - Gravado em DADOSJOG, com o campo `fis_comp` indicando a fonte.
- **PENDENTE, 35 jogadores:** a API não tem 2026 para eles.
  - Ou só tem temporada antiga (Keno até 2024, Tiquinho 2022, Shinyashiki MLS 2022…), ou não aparecem / não deu para ter certeza da identidade (Ítalo Carvalho, Maykon Jesus, Cano, Hebert, Dudu do Vitória, Guilherme do Atlético-GO…).
  - Caminhos: o Henrique libera a pasta ~/Downloads, onde devem estar os `SkillCorner-*.csv` (o pedido de acesso foi bloqueado nesta sessão), ou sobe de novo o CSV de cada um no app.
  - **Corridas sem bola** e **Corridas p/ área** não vêm no CSV físico. Saem do export de corridas sem bola ou da tabela `off_ball_runs` da API.

## Abas (visão nova)
1. Elenco 2027 (Campograma, Indicados, Empresários)
2. Estudo (Físico, Técnico, Bola parada)
3. Mercado
4. Treinador

A aba **Jogador** (Consulta) foi ocultada em 19/10 com `oculta: true` em visao_nova.js.

## Grupos e listas
- **"Disponível p/ salários":** R$ 2.500.000, editável, salvo na nuvem.
- **Campograma "Alvos Santa Cruz 2027":** id nuv-mvep2nel, **100** jogadores.
- **Planilha e PDF de alvos:** `Santa Cruz V2/listas`.
- **Contexto dos treinadores:** `CONTEXTO - Treinadores Santa Cruz 2027.md` (próxima etapa: um resumo por treinador).

---

# Atualização · sessão de 03 a 06/11/2026

## Estado do repositório
- **Commits locais ainda sem push** (o Henrique roda `git push`):
  - 234864b e 858427f: altura do Japa corrigida para 177 cm.
  - 6bdbc51: campograma publicado "Emprestados".
  - Os anteriores desta sessão (SofaScore, PDF do campograma, Listas, contrato do João Victor) também, se ainda não foram.
- **Depois do push, conferir no ar:**
  - grupo SofaScore no "+ indicador" (Escolher jogador);
  - PDF do campograma igual à tela;
  - aba Listas, com a ficha abrindo pelo nome;
  - contrato do João Victor (jun/2028) e altura do Japa (177);
  - Treinador escondido na visão nova;
  - A+ no médio e no meia;
  - grupo "Emprestados".
- **Permissão de apagar:** liberada nesta sessão. Numa sessão nova, o git volta a deixar `.lock` (pedir a permissão ou renomear o `.lock`).

## O que foi feito (onde está)
- **Listas por campeonato** (Série A, Série B, brasileiros no exterior, sul-americanos, segundas divisões sul-americanas):
  - Montadas pelos scripts do scratchpad `sb/` (`gerar.py`, `gerar_liga.py`, `pdf_liga.py`).
  - Ordem: físico → técnico → altura → 2º tempo → contrato.
  - Só entra quem tem todos os indicadores da posição e 600+ minutos em 2026.
  - Nota TR depois do 2º tempo. Também há versão sem Nota TR.
  - Aba 5 "Listas" no app: `static/listas.js`, `listas.css`, `listas_dados.js`.
- **Correções manuais:** `docs/dados/contrato_overrides.json` aceita `ct` (contrato) e `alt` (altura), pela primary_key. Vale por cima da base e é aplicado em `aplicarOverridesContrato()` no `app.js`.
  - Casos: João Victor (Mirassol), contrato 30/06/2028. Japa (Cruzeiro e Mirassol), 177 cm.
- **SofaScore:** grupo no "+ indicador", marcado como "não é Wyscout".
  - Arquivo: `docs/static/sofascore_dados.js`, com **19.289** jogadores.
  - Script: `ferramentas/montar_sofascore.py`. Bruto em `dados/sofascore/`.
- **Campograma no PDF:** sai como imagem da tela, verde e com os cards (`gerarPdf` → `#impCampoImg`).
- **Emails liberados no Firestore:** jrmannarino@hotmail.com e lucioguisilva@gmail.com.
- **Comparativos de 3 períodos (PDF de 1 página, visual da ficha do app):** Ricardo Silva e Gustavo Barreto (América-MG).
  - Barreto: América × 12 meses (Kyoto, só minutagem) × 13–24 meses (Criciúma + Avaí).
  - ▲ marca o melhor período em cada indicador.
- **Emprestados (saída) da Série A 2026:** **187** jogadores.
  - Fonte: Footlink, conferido com o Transfermarkt.
  - Entregues: PDF e planilha por clube e por posição, texto para WhatsApp e levantamento no formato das listas (letra, técnico, 2º tempo, Nota TR).
  - **4 entradas ficaram de fora:** Arthur Chaves, Bustos, Pedro Lima e Edson.
  - **Grupo publicado "Emprestados"** (`docs/dados/cenarios_publicados.json`, id `emprestados-serie-a`): os **43** que o Henrique marcou de amarelo, pela posição do app e na ordem das listas.

## Como pegar dados (o que funcionou)
- **Footlink:** web.footlink.app, logado no Chrome do Henrique.
  - Token: `JSON.parse(localStorage.footlink_udata).accessToken` (Bearer).
  - Endpoints:
    - `api-v1.footlink.app/api/v1/teams/{id}/on_loan_athletes/`, com `src_team`, `current_team` e `contract_info`.
    - `teams/?q=nome`, para achar o id do clube.
  - Ids da Série A: Atlético-MG 889, Athletico 891, Bahia 901, Botafogo 922, Bragantino 927, Chapecoense 986, Corinthians 1003, Coritiba 1007, Cruzeiro 1021, Flamengo 1067, Fluminense 1072, Grêmio 1098, Internacional 1145, Mirassol 1236, Palmeiras 1286, Remo 1352, Santos 1400, São Paulo 1423, Vasco 1502, Vitória 1517.
  - **Cuidado 1:** usar só o token do próprio site. Um token errado derrubou a sessão.
  - **Cuidado 2:** login no celular derruba o do computador.
  - **Cuidado 3:** o Footlink põe entrada e saída de empréstimo juntas, todas como `src_team` = o clube.
- **Transfermarkt (empréstimos):** `/x/leihspielerhistorie/verein/{id}/plus/1?saison_id=2025&leihe=ist` lista quem o clube emprestou; com `leihe=war`, quem chegou emprestado. O `saison_id` 2025 é a temporada 2026 do Brasil. Separa entrada de saída.
- **App (coleta para listas):** no Chrome, na aba do app, para cada jogador da `BASE`:
  - `tipoLetra` / `tipoMais` dão a letra (A+ quando os dois batem);
  - `subidaSelo` dá "X de N fundamentais";
  - `segTempoQuadrado` dá a classe t2: azul elite, verde mantém, amarelo cai um pouco, vermelho cai muito;
  - `minutagemDe`, `histDe(j, pk)[2].min`, `bolaParadaDe` e `await perfilExtraDe` dão minutagem, minutos de 2026, bola parada, altura, valor e nascimento;
  - `comFisicoDoEstudo(j)` dá psv, spr_n, dist e hi_n.
  - Retornos grandes: escrever num `<article>` e ler com `get_page_text`. Depois extrair do transcript `.jsonl`.

## Pendências / ideias
- Campogramas com outros esquemas (4-2-3-1, 4-4-2, 3-5-2): o Henrique disse "pode ser depois".
- **Campograma que "assume" outro grupo ou some ao criar novo:** diagnóstico feito, o Henrique preferiu deixar como está por enquanto. Causas possíveis:
  - estado único no localStorage dividido entre abas;
  - "Novo" só fica salvo depois do Salvar;
  - "Novo" começa vazio (para copiar, é "Duplicar");
  - precedência nuvem > navegador.
