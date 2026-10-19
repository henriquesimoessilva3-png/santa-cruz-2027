# Minutagem pelo Wyscout (19/10/2026)

Pedido do Henrique: minutagem do card = jogos e minutos do jogador em TODAS as competições oficiais (sem amistosos,
seleção e base) ÷ total do time no mesmo período, por temporada do clube (europeia 25/26 = 2026), direto do Wyscout.

Como foi feito (108 alvos do campograma "Alvos Santa Cruz 2027", nuvem nuv-mvep2nel):
1. No Chrome, aba do Wyscout logada (wyscout.hudl.com/app), JS na página com o token `window.uidirectives.access_key`:
   - busca: POST /app/aengine-service.php {obj:'search', act:'player'} → subtítulo "Clube Nome (ano) País";
   - identidade: ano de nascimento compatível com a idade do card E clube do card no subtítulo, ou (se ambíguo) jogos
     do candidato em 2024+ por esse clube. Mais de um ou nenhum = fica de fora (11 de 108);
   - jogos do jogador: searchapi /match_stats/players/{id}?from=2023-01-01 (minutes_on_field);
   - jogos do clube: searchapi /team_stats/teams/{cid}/stats?from=(Y-1)-07-01&to=Y-12-31 (duration = duração real);
   - passagem: começa no 1º jogo dele pelo clube se antes jogava por outro; termina no último se depois jogou por outro.
   O token vence em ~30 min (API devolve 403): recarregar a aba e continuar (progresso no localStorage da aba).
2. Resultado bruto: dados/_minutagem_wyscout_bruto.txt (i|wy|conferência|subtítulo|ano:clube,j,min,jogos_time,min_time,ini,fim+...),
   lista em _minutagem_wyscout_lista.txt e ligas em _minutagem_wyscout_ligas.txt → dados/minutagem_wyscout.json.
3. preparar_minutagem_v4.aplicar_wyscout grava no historico.json (fonte "wyscout"; min_l = minutos da liga, para o
   por-90 da bola parada). Vale sobre a liga.

Fora (não achados com certeza): Ítalo Carvalho, Rodrigo Guetti, Max (Athletic), Luan (livre), Max Alves, Guilherme
Sityá, Maykon Jesus, DG, Kayke (livre), Kauê, Gustavo Pereira — ficam com a minutagem da liga.
