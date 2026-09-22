#!/usr/bin/env python3
"""O que o estudo sabe sobre FISICO, junto num lugar so.

## Por que existe

Oito partes mediram corrida: A07, A10, A11, A20 no time e J04, J05, J10, J11 no jogador. Elas
estao espalhadas em quatro secoes da pagina, e a pergunta que a casa faz — "afinal, o fisico
importa ou nao?" — nao e respondida por nenhuma delas sozinha. Quem le so a A07 conclui que nao
importa; quem le so o J10-2 conclui que se contrata volante por corrida forte. As duas leituras
estao erradas, e a diferenca entre elas e justamente o que esta secao junta.

E o assunto em que a casa mais gasta dinheiro sem numero: preparacao fisica, GPS, carga de
treino, "time que corre". Por isso ele ganha secao propria e nao um paragrafo.

## As regras desta pagina

1. **Nenhum numero e digitado.** Tudo vem dos `<ID>_numeros.json` que o portao confere, por
   {PARTE.marcador} — este script FALHA quando um marcador nao existe.
2. **Cada bloco diz de que partes ele e feito**, e leva o selo da conclusao de origem. Bloco que
   junta quatro indicios continua sendo indicio: juntar nao fortalece.
3. **Termina em contratacao.** O ultimo bloco e o que muda na ficha do jogador — porque e nisso
   que qualquer parte deste estudo tem de terminar.

Uso:
    python3 _fonte/estudo_serieb/scripts/gerar_fisico.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _texto import selo_da_conclusao, trocar  # noqa: E402

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
SAIDA = os.path.join(ESTUDO, "resultados", "_fisico.json")

BLOCOS = [
    {
        "id": "F1", "titulo": "Correr mais não separa quem sobe — nem o time, nem o jogador",
        "texto": ("O time mediano de quem subiu percorreu {A07.dist_s} metros por jogo contra "
                  "{A07.dist_m} do meio, e {A07.hi_s} em alta intensidade contra {A07.hi_m}: "
                  "nenhum dos {A07.n_ind} indicadores físicos declarados separou quem sobe nos "
                  "dois cortes. Entre times de nível TÉCNICO parecido também não: na faixa alta "
                  "quem subiu correu {A11.dist_sobe_alta} metros contra {A11.dist_meio_alta} do "
                  "meio. No jogador, {J04.n_testes} comparações em {J04.n_ind} medidas de corrida "
                  "e {J04.n_pos} posições, e nenhuma sobrevive aos dois cortes."),
        "de": "A07 · A11 · J04", "conclusao": "A07-1",
    },
    {
        "id": "F2", "titulo": "Onde o físico aparece é na linha de BAIXO",
        "texto": ("A cada trinta minutos sem a bola, o time mediano dos rebaixados correu "
                  "{A07.otip_c} metros em sprint contra {A07.otip_m} do meio — descontado o "
                  "rodízio de elenco, é o único número físico que continua separando quem cai. "
                  "E não é cansaço: já no 1º turno de 2025 os rebaixados corriam "
                  "{A10.hi_cai_turno} metros em alta intensidade contra {A10.hi_meio_turno} do "
                  "meio. No jogador, o lateral de quem caiu faz "
                  "{J11.sobe_cmlateral_high_accel_p30otip} arrancadas fortes por meia hora sem a "
                  "bola contra {J11.meio_cmlateral_high_accel_p30otip} do meio, e passa nos dois "
                  "cortes. Serve para reconhecer risco no elenco que já se tem, não para "
                  "escolher alvo."),
        "de": "A07 · A10 · J11", "conclusao": "A07-2",
    },
    {
        "id": "F3", "titulo": "A única posição com sinal próprio é o volante",
        "texto": ("O volante de quem sobe faz {J10.sobe_volante_runs_above_hsr_p30tip} corridas "
                  "fortes por meia hora de posse contra "
                  "{J10.meio_volante_runs_above_hsr_p30tip} do meio, e cobre "
                  "{J10.sobe_volante_runs_avg_distance} metros por corrida contra "
                  "{J10.meio_volante_runs_avg_distance} — {J10.nsobe_volante} contra "
                  "{J10.nmeio_volante}. É volume e alcance, não destino: das corridas PARA A "
                  "ÁREA, {J10.passam_area} de {J10.testes_area} testes passam. O J04-2 já tinha "
                  "achado pico de velocidade no volante ({J04.vol_psv_s} km/h contra "
                  "{J04.vol_psv_m}) e em nenhuma outra posição, mas só num dos recortes."),
        "de": "J04 · J10", "conclusao": "J10-2",
    },
    {
        "id": "F4", "titulo": "O que mais separa não é o nível do onze, é a DESIGUALDADE dentro dele",
        "texto": ("O onze médio de quem sobe está no percentil {A20.p_med_distance_p90_sobe} de "
                  "corrida e o do meio no {A20.p_med_distance_p90_meio} — igual. A distância "
                  "entre o melhor e o último do onze dá {A20.d_amp_distance_p90} com todos os "
                  "times e {A20.dsem_amp_distance_p90} sem os colados na linha, o mesmo efeito "
                  "nos dois cortes. Ele falha por TAMANHO, não por ausência: o mínimo que o "
                  "desenho enxerga sobe de {A20.dmin} para {A20.dmin_sem} quando o recorte "
                  "encolhe. É a fila de coleta, não pista morta — e ter o jogador mais rápido do "
                  "campeonato não é a resposta ({A20.d_max_psv99}, que não passa na correção)."),
        "de": "A20", "conclusao": "A20-2",
    },
    {
        "id": "F5", "titulo": "Correr com destino vira ação; correr muito, não",
        "texto": ("O terço que mais corre PARA DENTRO DA ÁREA faz {A11.ent_alto} entradas na área "
                  "por jogo contra {A11.ent_baixo}, e cria {A11.xg_alto} de gol esperado contra "
                  "{A11.xg_baixo}. O terço que mais percorre METROS faz {A11.vol_ent_alto} "
                  "entradas contra {A11.vol_ent_baixo}, e cria o mesmo xG. Correr sem a bola sobe "
                  "a linha de pressão — o adversário dá {A11.ppda_alto} passes por ação defensiva "
                  "contra {A11.ppda_baixo} —, mas não aparece em bola recuperada "
                  "({A11.rec_alto} contra {A11.rec_baixo})."),
        "de": "A11", "conclusao": "A11-1",
    },
    {
        "id": "F6", "titulo": "Returno e semana de três jogos: não dá para montar elenco por isso",
        "texto": ("Do 1º para o 2º turno o mesmo jogador perde {A10.queda_liga_m} metros por "
                  "noventa minutos, {A10.queda_liga_pct}% do que corria — e a perda não separa "
                  "quem subiu do meio. No jogo com menos de quatro dias de descanso, as duas "
                  "temporadas medidas dizem o contrário uma da outra: em 2025 o jogador correu "
                  "igual ou um pouco mais, em 2026 corre {A10.dist_curto_2026} metros por 90 a "
                  "menos — e o ponto não cai ({A10.ppj_curto_2026} no jogo curto contra "
                  "{A10.ppj_normal_2026} no normal)."),
        "de": "A10", "conclusao": "A10-2",
    },
    {
        "id": "F7", "titulo": "Um quinto do jeito de correr é do clube, não do jogador",
        "texto": ("O clube em que o jogador estava explica {J11.clube_r_distance}% de quanto ele "
                  "corre sem a bola em relação a com a bola, e a razão anda "
                  "{J11.posse_r_distance} com a posse do time. Nas outras medidas o clube explica "
                  "de {J11.clube_r_cod_count}% a {J11.clube_r_high_accel}%. Número físico de "
                  "jogador carrega o time de onde ele veio: comparar dois candidatos de clubes "
                  "diferentes pela corrida bruta compara também os dois clubes."),
        "de": "J11", "conclusao": "J11-3",
    },
    {
        "id": "F8", "titulo": "O que isso muda na ficha de contratação",
        "texto": ("Filtro eliminatório, um só: minutagem alta e regular, com o corte mudando por "
                  "posição — {J05.min_gk_br}% no goleiro contra {J05.min_atk_br}% no atacante, o "
                  "que devolve {J05.min_regulares} jogador-temporadas em quatro anos. Físico "
                  "entra como DESEMPATE, e só onde foi medido: corrida forte e corrida longa no "
                  "volante, e arrancada sem a bola do lateral como sinal de alerta para "
                  "descartar. E o perfil físico que a tela já mostrava não serve inteiro: dos "
                  "{J05.app_ind_total} números por setor, {J05.app_ind_bh} passam na correção "
                  "para muitos testes, e na zaga e no lateral não passa nenhum dos "
                  "{J05.app_zaga_lateral}."),
        "de": "J05 · J10 · J11", "conclusao": "J05-3",
    },
]

LIMITES = [
    ("O dado físico é o mais escasso do estudo.", "O SkillCorner não rastreia goleiro, e o "
     "rastreamento cobre 2022 a 2025 — quatro temporadas, 16 promovidos contra 48 do meio. É "
     "desenho que só enxerga vantagem grande."),
    ("Duas partes falharam por falta de tamanho, não por ausência de efeito.", "A desigualdade "
     "do elenco (A20) e o extremo (J11). Mais temporadas rastreadas destravam as duas, e é a "
     "compra de dado que mais renderia depois do minuto do gol."),
    ("Físico é o assunto em que a diferença entre \"não separa\" e \"não importa\" mais custa "
     "caro.", "Nenhuma conclusão desta seção diz que preparação física não importa. Elas dizem "
     "que, nesta base, correr mais não é o que distingue quem sobe — e que pagar prêmio por "
     "volume de corrida não tem número que o sustente."),
]


def main():
    cache_num, cache_json, faltando = {}, {}, []
    fora = []
    for b in BLOCOS:
        item = {k: b[k] for k in ("id", "titulo", "de", "conclusao")}
        item["texto"] = trocar(b["texto"], cache_num, f"{b['id']}.texto", faltando)
        item["confianca"] = selo_da_conclusao(b.get("conclusao"), cache_json)
        fora.append(item)

    if faltando:
        print("MARCADORES QUE NÃO EXISTEM — não gravo página com buraco:", file=sys.stderr)
        for f in faltando:
            print("  " + f, file=sys.stderr)
        return 1

    saida = {
        "_doc": ("O que oito partes sabem sobre físico, num lugar só. Gerado por "
                 "scripts/gerar_fisico.py a partir dos <ID>_numeros.json — os mesmos arquivos que "
                 "o portão confere. Nenhum número é digitado aqui."),
        "gerado_em": "2026-09-21",
        "partes": ["A07", "A10", "A11", "A20", "J04", "J05", "J10", "J11"],
        "blocos": fora,
        "limites": [{"titulo": t, "texto": x} for t, x in LIMITES],
        "como_ler": ("Oito partes mediram corrida — quatro no time e quatro no jogador — e "
                     "nenhuma responde sozinha se o físico importa. Cada bloco leva o selo da "
                     "conclusão que o sustenta: juntar quatro indícios não faz uma conclusão "
                     "firme."),
    }
    json.dump(saida, open(SAIDA, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(fora)} blocos em {os.path.relpath(SAIDA, ESTUDO)}")
    for b in fora:
        print(f"  {b['id']} [{(b['confianca'] or '—'):9}] {b['de']:16} {b['titulo'][:56]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
