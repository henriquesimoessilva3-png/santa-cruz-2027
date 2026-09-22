# Santa Cruz V2 — orientacao para quem abre esta pasta

Estudo novo, do zero, com um objetivo so: **nomes** — o treinador e 26 a 30 jogadores, por
posicao, para o Santa Cruz disputar a Serie B de 2027. Tudo que nao termina em nome e etapa
intermediaria.

Leia nesta ordem antes de mexer:
1. `PLANO.md` — o que o estudo quer responder, bloco a bloco (Fisico, Tecnico, Bola parada,
   Treinador, Padrao de equipes), as definicoes fixas e a ordem de trabalho.
2. `ARMADILHAS.md` — o que o estudo anterior aprendeu sobre defeito de dado e de desenho.
   E a UNICA coisa herdada de la: nenhuma conclusao antiga entra aqui.
3. `bases/INVENTARIO.md` — cada arquivo de dado, o que traz, quantas linhas, que temporadas
   cobre, e o que ainda falta.

## Onde esta cada coisa

```
Santa Cruz V2/
├── bases/                      # DADO. So copia ou coleta; nunca conclusao
│   ├── serieb_tecnico.csv        # jogador-temporada Wyscout 2022-2026 (118 indicadores)
│   ├── serieb_jogos.csv          # clube-jogo Wyscout (traz estaduais e copas: filtrar Serie B)
│   ├── serieb_elencos.csv        # Transfermarkt: elencos, contrato, valor
│   ├── serieb_lesoes.csv         # Transfermarkt: lesoes 2018-2026
│   ├── skillcorner/skillcorner_serieb.db   # FISICO (ver abaixo)
│   ├── wyscout_ligas/            # foto de ago/26 das ligas de fora + notas 2018-2026
│   └── coletas/                  # treinador por rodada, classificacao por rodada, gols por minuto
├── scripts/
│   ├── _comum.py                 # leitura das bases, chave de nome, setor, classificacao, valor de elenco
│   ├── b1_*.py                   # Bloco 1 (fisico): base -> time / posicao / desgaste / perfis
│   ├── b2_*.py                   # Bloco 2 (tecnico): time / posicao
│   └── copiar_skillcorner.py     # refaz a copia do banco fisico (le o Portal Skillcorner so em leitura)
├── resultados/b1/, b2/           # CSVs + o texto do bloco (B1.md, B1_perfis.md)
├── blocos/ e listas/             # ainda vazias: entregas finais por bloco e as listas por posicao
```

Rodar: `python3 scripts/<nome>.py`, de qualquer pasta (os caminhos sao relativos ao script).
No Bloco 1 a ordem e `b1_base.py` primeiro (gera `resultados/b1/base_fisico.csv`), depois os
outros.

## O banco fisico (SkillCorner)

`bases/skillcorner/skillcorner_serieb.db` e uma FATIA da Serie B (2022 a 2026) do
`skillcorner.db` do Portal Skillcorner, que vive em outra pasta e outro repositorio
(`fut/BOTA/Analytics/Portal Skillcorner/dados/`). Regra: **nada de la e alterado**; o que
for usado entra aqui como copia, e a data da copia fica no `bases/INVENTARIO.md`.

- `physical` = agregado por jogador-temporada (por 90, e por 30 min com e sem posse).
- `physical_match` = uma linha por jogador-partida, com data, clube e posicao.
  **Desde 22/09/2026 cobre as 5 temporadas** (49.731 linhas; antes so 2025 e 2026).
  So tem por 90 — nao tem as fases com/sem posse.
- Goleiro nao e rastreado. `passes` e `possessions` so existem em 2026.
- Pra atualizar: `python3 scripts/copiar_skillcorner.py` (precisa do banco do Portal nesta
  maquina). Ele apaga e regrava o arquivo inteiro.

## Onde parou o trabalho

- **22/09/2026** — o Portal Skillcorner coletou na API o fisico por jogo de 2022, 2023 e
  2024 da Serie B, e a copia foi refeita com as 5 temporadas. Os resultados em
  `resultados/b1/` foram calculados ANTES disso, com o jogo a jogo de 2025-2026 apenas:
  **refazer o que usa `physical_match`** (`b1_desgaste.py` e o que mais depender dele) e
  reler as conclusoes do B1.md que citam "2025 e 2026".

## Como escrever aqui

Portugues simples e direto, sem jargao. Conclusao publicavel diz o numero em unidade de
jogo, o n, e o que muda na contratacao — sem uso pratico nao sobe (regra do `PLANO.md`).

## Git

Esta pasta fica DENTRO do repositorio `Santa Cruz` (GitHub `santa-cruz-2027`). Ao gravar,
adicione so os arquivos em que mexeu (`git add "Santa Cruz V2/..."`), nunca `git add .` na
raiz — a raiz tem o site e o estudo antigo, que o Henrique mexe em paralelo. Arquivo acima
de 100 MB nao entra no GitHub; o maior daqui e o banco fisico (34 MB).
