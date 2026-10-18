# Contexto para o próximo chat — Visão nova do app Santa Cruz 2027 (18/10/2026)

Site: https://henriquesimoessilva3-png.github.io/santa-cruz-2027/?visao=nova · repo `henriquesimoessilva3-png/santa-cruz-2027`
(pasta no Mac: `~/…/Santa Cruz`). Ao terminar um trabalho: `python3 publicar_site.py` → commit (Henrique Simoes
<henriquesimoessilva3@gmail.com>) → push → `git pull --ff-only` no Mac. Respostas em português, curtas, números em negrito.

## O que é a visão nova
Em paralelo à barra de hoje (nada apagado). Liga por botão "Visão nova" / `?visao=nova` (localStorage `sc_visao`);
flag `window.VISAO_NOVA`, definida em `static/visao_nova.js` (carregado antes dos módulos das abas).
4 abas: **1 Elenco 2027** (Campograma · Indicados · Empresários; abre no campograma) · **2 Estudo** (Físico · Técnico ·
Bola parada [Jogadores/Treinadores]) · **3 Mercado** (Tipo físico A+, A e B · Banco de consulta, com xT e "só Wyscout") ·
**4 Jogador** (Consulta).

## Regras em vigor
- **Letra física** (A+/A/B/C): regra de sempre (6 indicadores SkillCorner, explosão × volume). Testes b17/b18/b19 não mudaram nada.
- **Seta técnica** (só na visão nova, `static/subida.js` → `notaVals`): nota por grupo do b21
  (`Santa Cruz V2/scripts/b21_seta_tecnica.py` → `static/tecnico_grupos_dados.js`). 4 grupos (Defensivo, Passe, Ofensivo,
  Participação em gols); entra o que separa sobe × cai ≥ 0,30 e ainda ≥ 0,20 "a time igual"; peso = separação a time igual;
  z contra Série B 2025–26 da régua (gêmeas juntas), ±2,5; ▲ ≥ mediana de quem sobe, ▼ ≤ mediana de quem cai.
  Zagueiro: defesa forçada (decisão do clube). AUC: nova 0,64 × hoje 0,65 (sem a regra do zagueiro 0,66 — decisão pendente do Henrique).
  Volante: participação em gols fica (confirmado pelo Henrique).
- **Farol** (`farolDe` em app.js): Validado/Dúvida/Alerta = letra + seta pela posição (LD, LE, EE, VOL, MED exigem A/A+);
  minutagem vermelha tira o Validado; bola parada não entra.
- **Card do campograma** (`painelCard`): retângulo na cor do farol com letra · seta · minutagem · ⚑ bola parada.
  Minutagem = média por ano de 2024–26 (min ÷ 3.400; 2026 ÷ 2.100; só jogos ÷ 38); número branco em fundo escuro,
  filete colorido; hover com ano a ano. Card mínimo 300 px (escala do campo); raio e bola aérea fora do card.
- **Ficha**: blocos do ranking da posição + faixa "Outros indicadores" (os técnicos fora do ranking, base Subida ≥ 900 min).
- **Estudo › Físico**: regra, 6 indicadores em 2 grupos, os 15 excluídos, escopo, matriz por posição com contagens (só sobe/fica/cai).
- **Estudo › Técnico**: dois quadros novos (`montarTecnico` em visao_nova.js): regra das setas e "entra/fica de fora" por régua.

## Pendências
- Henrique conferir na tela o card novo (largura, nome, minutagem) — não foi visto em tela cheia.
- Decidir a regra do zagueiro (defesa forçada custa previsão).
- Lista final do grupo salvo para comparar com a nuvem (ele ia mandar).
- Banco "+ Mais"/seta do export do Portal ainda mistura físico (precisa reexportar).
- Ideias: lesão no card; limpeza das abas restantes; preencher Empresários.
