# BFR Busca Jogador — Wyscout e SkillCorner

Extensão do app Santa Cruz (24/10/2026). Deixa o app (`localhost:5090` e o site no GitHub Pages)
buscar o jogador no **Wyscout** e no **SkillCorner** em que você já está logado neste Chrome, e trazer
o técnico e o físico para a janela "Físico e técnico". Não guarda senha nem dado, não baixa nada.

## Instalar (uma vez)
1. Chrome → `chrome://extensions` → ligue **Modo do desenvolvedor**.
2. **Carregar sem compactação** → escolha esta pasta (`Santa Cruz/extensao_busca_jogador`).
3. Recarregue a aba do app. ID fixo: `fcononaeoamnokalfgbedngkbddmiljj` (está no `key` do manifest).

Mudou o `background.js`? Clique no ↻ da extensão em `chrome://extensions`.

## O que ela faz (regras combinadas com o Henrique)
- **Wyscout** — a mesma consulta da Busca avançada, esquema **ALL** (as 119 colunas), pelo nome.
  Ordem: **últimos 12 meses** ("último ano civil", `time_frame=default`) → **época atual**
  (`current_season`) → **época anterior** (`last_season`). A tela avisa qual período valeu.
  As colunas vêm com os nomes do Excel exportado (conferido coluna a coluna em 24/10).
- **SkillCorner** — Physical, **Player**, **por 90 min**, **mínimo 60 min por jogo**, a partir de
  **01/06/2025**; sem jogo, a partir de **01/01/2025**; sem jogo de novo, avisa e fica a colagem manual.
  O jogador do SkillCorner é casado com o do Wyscout pela **data de nascimento**.
- Abre uma aba do Wyscout/SkillCorner em segundo plano se não houver uma aberta, e a deixa aberta.

Pedidos (do app): `ping`, `wy_buscar {nome}`, `sc_buscar {nomes}`, `sc_fisico {id, datas}`.
