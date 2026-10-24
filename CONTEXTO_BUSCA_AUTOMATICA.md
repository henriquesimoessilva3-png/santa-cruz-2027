# Busca automática no Wyscout e no SkillCorner (24/10/2026)

Pedido do Henrique: parar de buscar à mão o físico (SkillCorner) e o técnico (Wyscout) de cada jogador.
O app agora procura o jogador nos dois sites logados no Chrome dele e preenche a janela "Físico e técnico".
**Publicado no site** (commits `287546f` e `65206ab`, enviados pela nuvem) e testado no site com Bruno Alves
(Criciúma) e Ricardo Ryller (Al Zulfi). Nada foi salvo nos testes.

## Onde aparece
- **Janela "Físico e técnico"** (menu do card, "+ físico/técnico"): painel "🔎 Buscar no Wyscout e no SkillCorner" no topo.
- **Ficha do jogador**: botão **↻ Wyscout + SkillCorner** ao lado de "+ físico/técnico" (abre a janela e já busca).
- **Jogador fora da base**: botão **Adicionar e buscar no Wyscout/SkillCorner** (adiciona, abre a janela e busca).

## Regras combinadas com o Henrique
- **Wyscout**: busca avançada, esquema **ALL** (119 colunas). Ordem: **últimos 12 meses** ("último ano civil",
  `time_frame=default`) → **época atual** (`current_season`) → **época anterior** (`last_season`). Usa o primeiro
  período com minutos e **avisa em amarelo** quando não foi o primeiro.
- **SkillCorner**: Physical, **Player**, **por 90 min**, **mínimo 60 min por jogo**, **desde 01/06/2025**. Sem jogo,
  **desde 01/01/2025**. Sem jogo de novo, avisa e fica a colagem manual (ele quer pensar outra forma nesse caso).
- **Conferir o jogador** (regra fixa dele): a lista do Wyscout mostra foto, clube, liga, posição, idade, data de
  nascimento e jogos/minutos por período. A sugestão em verde é quem é do mesmo clube do cadastro. Ele escolhe.
  O SkillCorner é ligado ao Wyscout **pela data de nascimento**; sem coincidência, a tela pede confirmação.
- **Nada salva sozinho**: os números caem nos mesmos campos da colagem manual (`mdFis`/`mdTec`, `mdFisRaw`/`mdTecRaw`)
  e só valem no **Salvar** — e aí seguem a regra de que dado colado vale para o sistema todo e substitui o anterior.
  O registro ganha `d.auto` (período do Wyscout, data do SkillCorner, ids).

## Arquivos
- `static/busca_auto.js` — **novo**, toda a lógica e o painel (carregado depois do `app.js` em `templates/index.html`).
- `static/app.js` — só 4 linhas de gancho (`buscaAutoReset` no `abrirDados`, `buscaAutoFicha` na ficha,
  `d.auto` no Salvar, botão escondido ao editar no `abrirManual`).
- `extensao_busca_jogador/` — **extensão nova "BFR Busca Jogador — Wyscout e SkillCorner" 1.0.0**, ID fixo
  `fcononaeoamnokalfgbedngkbddmiljj`, aceita `localhost` e o site do GitHub Pages. Já carregada no Chrome dele.
  Faz as consultas dentro de uma aba de cada site (o mesmo pedido que as telas fazem):
  Wyscout `searchapi.wyscout.com/api/v1/search/results.json` (token `uidirectives.access_key` da página);
  SkillCorner `/api/players/?search=` e `/api/physical/?player=…&date__gte=…` (sessão do site).
  Traduz as colunas para os nomes do Excel/CSV que o app já lê (mapa conferido coluna a coluna). `LEIA-ME.md` na pasta.
  Mudou o `background.js`? Pedir ↻ da extensão em `chrome://extensions`.
- Backup de antes: `_backup_20261024_busca/`.

## Atenção
- No Mac, `docs/` ficou com os arquivos iguais aos do site **sem commit** (o envio foi pela nuvem). O próximo
  `publicar_site.py --push` pode reclamar de diferença com o remoto; o conteúdo é o mesmo.
- Ricardo Ryller: SkillCorner desde 01/06/2025 só tem **3 jogos** — pouco para a letra física. Ponto em aberto:
  definir um mínimo de jogos para aceitar o recorte (ou cair para 01/01/2025).
- Ainda **não testado** no app local (`localhost:5090` estava desligado), só no site.
