#!/usr/bin/env python3
"""As regras de leitura: como NAO ser enganado por um numero deste estudo.

## Por que existe

O estudo entrega 98 conclusoes e 18 decisoes. Quem le uma delas na reuniao nao tem como saber
sozinho por que aquele numero vale e o do slide do ano passado nao valia. As quatro regras daqui
sao a resposta — e nenhuma delas e opiniao de metodo: cada uma nasceu de um numero que ESTE
estudo produziu e que teria enganado a casa se ninguem tivesse feito a conta de controle.

Ate 21/09 elas viviam so no CLAUDE.md, que e o manual de quem RODA a analise. Quem LE a analise
nunca abriu esse arquivo. Sem elas na tela, a proxima reuniao repete as perguntas que a sessao
de 21/09 ja respondeu.

## A regra que a faz ser diferente de um decalogo

**Nenhuma regra entra sem o numero que a produziu e sem a parte de origem.** O texto usa
{PARTE.marcador} e e resolvido contra os `<ID>_numeros.json` que o portao confere — este script
FALHA quando um marcador nao existe. Regra sem custo medido e conselho; com custo medido, e
aprendizado.

Uso:
    python3 _fonte/estudo_serieb/scripts/gerar_regras.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _texto import selo_da_conclusao, trocar  # noqa: E402

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTUDO = os.path.dirname(AQUI)
SAIDA = os.path.join(ESTUDO, "resultados", "_regras.json")

# ==================================================================================================
# AS REGRAS
# ==================================================================================================
# Formato: (numero, a regra em uma frase, o que ela evita, a conta que a produziu, de onde vem).
REGRAS = [
    {
        "id": "R1",
        "regra": "Peça a conta DENTRO do time antes de aceitar a conta ENTRE times.",
        "evita": ("Transformar em meta de treino um número que só descreve que clube é aquele — "
                  "quase sempre, quanto ele custou."),
        "conta": ("Cruzar mais anda {A17.rho_dist_remate_cruzamentos} com finalizar de perto "
                  "quando se comparam clubes DIFERENTES, e "
                  "{A17.jogo_dist_remate_cruzamentos} quando se compara o MESMO time consigo "
                  "mesmo de um jogo para o outro. A ponte entre os dois números é o dinheiro: "
                  "cruzar mais anda {A17.dinheiro_cruzamentos} com o valor do elenco. O time que "
                  "cruza muito finaliza de perto porque é caro, não porque cruza."),
        "de": "A17", "conclusao": "A17-1", "decisao": "D17",
    },
    {
        "id": "R2",
        "regra": "Recorte cujo critério pode ser consequência do desfecho não é robustez, é seleção.",
        "evita": ("Publicar como \"olha só nos jogos limpos\" um filtro que, na prática, já sabe "
                  "quem ganhou — e por isso devolve o efeito que se queria achar."),
        "conta": ("Ficar com os jogos em que o time manteve o desenho de cinco defensores até o "
                  "fim dá {A19.sel_inteiro_541} ponto por jogo ({A19.sel_n_inteiro_541} jogos); "
                  "os jogos em que ele trocou dão {A19.sel_trocou_541} "
                  "({A19.sel_n_trocou_541} jogos). O filtro não mediu a formação: mediu quem "
                  "estava ganhando, porque quem está perdendo é que mexe no time."),
        "de": "A19", "conclusao": "A19-1", "decisao": None,
    },
    {
        "id": "R3",
        "regra": "Falhar porque o efeito SOME é diferente de falhar porque o corte não tem TAMANHO.",
        "evita": ("Enterrar como \"não separa\" um achado que só precisa de mais temporada "
                  "rastreada — e tratar como promissor um que evaporou quando o recorte mudou."),
        "conta": ("Os dois falham no mesmo critério. A desigualdade do elenco dá "
                  "{A20.d_amp_distance_p90} com todos os times e {A20.dsem_amp_distance_p90} sem "
                  "os colados na linha — o MESMO efeito —, e o que muda é o que o desenho "
                  "enxerga: de {A20.dmin} para {A20.dmin_sem}. Já o extremo do J11 vai de "
                  "{J11.d_extremo_r_hi_distance} para {J11.dsem_extremo_r_hi_distance} conforme o "
                  "recorte, com mínimo detectável de {J11.dmin_extremo}: aí o que mudou foi o "
                  "efeito, não a régua. O primeiro é fila de coleta; o segundo, não."),
        "de": "A20", "conclusao": "A20-2", "decisao": None,
    },
    {
        "id": "R4",
        "regra": ("Decisão com nome de régua é decisão vaga; decisão que contradiz a parte que "
                  "ela cita é pior."),
        "evita": ("Levar para a reunião um \"guiar pelo eixo da qualidade da chance\" que ninguém "
                  "sabe executar — ou um critério que a própria análise de origem já reprovou."),
        "conta": ("Medido na própria página de decisões: a D10 mandava escolher treinador pelo "
                  "PISO das passagens, e o T04-1 mede que esse critério põe em 3º lugar quem "
                  "nunca subiu — trocar o piso pela média leva-o de {T04.eb_piso}% a "
                  "{T04.eb_med}% de tempo no G4 e já muda o pódio. Decisão que cita uma parte "
                  "tem de sobreviver à leitura dessa parte."),
        "de": "T04", "conclusao": "T04-1", "decisao": "D10",
    },
]


def main():
    cache_num, cache_json, faltando = {}, {}, []
    fora = []
    for r in REGRAS:
        item = {k: r[k] for k in ("id", "de", "conclusao", "decisao")}
        for campo in ("regra", "evita", "conta"):
            item[campo] = trocar(r[campo], cache_num, f"{r['id']}.{campo}", faltando)
        item["confianca"] = selo_da_conclusao(r.get("conclusao"), cache_json)
        fora.append(item)

    if faltando:
        print("MARCADORES QUE NÃO EXISTEM — não gravo página com buraco:", file=sys.stderr)
        for f in faltando:
            print("  " + f, file=sys.stderr)
        return 1

    saida = {
        "_doc": ("As regras de leitura do estudo, cada uma com a conta que a produziu. Gerado por "
                 "scripts/gerar_regras.py a partir dos <ID>_numeros.json — os mesmos arquivos que "
                 "o portão confere. Nenhum número é digitado aqui. Espelho da §6 do "
                 "_fonte/CONTEXTO_sessao_21_09_noite.md e do CLAUDE.md."),
        "gerado_em": "2026-09-21",
        "regras": fora,
        "como_ler": ("Quatro regras, e nenhuma é conselho genérico: cada uma nasceu de um número "
                     "deste estudo que teria enganado a casa. Valem para ler o que está nesta "
                     "página e também para ler o número que chegar de fora — de um empresário, "
                     "de uma apresentação, de outro clube."),
    }
    json.dump(saida, open(SAIDA, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(fora)} regras em {os.path.relpath(SAIDA, ESTUDO)}")
    for r in fora:
        print(f"  {r['id']} [{(r['confianca'] or '—'):9}] {r['regra'][:70]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
