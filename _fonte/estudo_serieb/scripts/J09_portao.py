#!/usr/bin/env python3
"""Roda o portão de entrega em J09, sem tocar no `_portao.py`.

Por que existe: a constante `PARTES` de `scripts/_portao.py` lista as 22 partes de 19/09 e **não
inclui J09**, então `python3 scripts/_portao.py J09` sai com "parte desconhecida" antes de conferir
qualquer coisa. Mexer no `_portao.py` seria escrever em arquivo de outra parte — o que esta parte
não pode fazer —, e deixar J09 sem portão seria pior. Este atalho importa o portão e chama a MESMA
função `conferir` com o mesmo contexto: nenhuma regra é reescrita, afrouxada nem pulada. É o mesmo
molde do `J05_portao.py` e do `J06_portao.py`.

O que muda em relação a rodar pelo CLI, e é honesto dizer:
  - a **regra 3** lê a unidade em `UNIDADE_INFERIDA`, que não tem J09. A unidade é `jogador-liga`
    na base dos candidatos e `chegada-jogador` no backtest, que é o que o `J09_testes.csv` mede; o
    corte de fronteira é o clube de DESTINO da chegada estar colado na linha do G4 ou do Z4, e os
    dois cortes rodam e são relatados.
    **Ela sai em REVISAR, e a resposta é esta:** 2 das 8 linhas do corte COM não têm par no corte
    SEM, e as duas são o grupo `minutagem_alta_e_regular`. Não é escolha de texto nem tabela
    meia-rodada: sem os clubes de fronteira esse grupo fica com menos de 8 de um lado, que é o piso
    declarado em `J09_indicadores.json` ANTES de rodar. A regra manda relatar, e está relatado — na
    seção "O backtest desta parte" do `J09.md` e na chave `cortes_sem_par` do `J09_resumo.json`.
    As 6 comparações que emparelharam **concordam todas**: 0 discordâncias.
  - a **regra 7** (mesmo indicador publicado duas vezes com q diferente) monta o índice varrendo só
    as partes de `PARTES`. Como J09 não está lá, o índice não tem linha de J09 e a regra passa por
    vacuidade — ela NÃO conferiu nada. Quando J09 entrar em `PARTES`, ela não vai colidir com J03,
    J04 nem J05: o "indicador" desta parte é `<grupo> × <desfecho>` do backtest, que só existe
    aqui, e a unidade é `chegada-jogador`, que também.
  - a **regra 8** (o registro) é do estudo inteiro e vale como sempre.

Uso:
    python3 _fonte/estudo_serieb/scripts/J09_portao.py
    python3 _fonte/estudo_serieb/scripts/J09_portao.py --json
"""
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import _portao  # noqa: E402

PARTE = "J09"


def main(argv):
    como_json = "--json" in argv
    divergentes, tem_porta = _portao.partes_com_porta_divergente()
    indice, inferidas = _portao.indice_de_indicadores()
    robustez = _portao.json_ou_nada(_portao.RESULTADOS / "_robustez_19_09.json")
    digitados = {}
    blocos = robustez.get("partes") if isinstance(robustez, dict) else {}
    for pid, bloco in (blocos or {}).items():
        if isinstance(bloco, dict) and isinstance(bloco.get("digitados_a_mao"), list):
            digitados[pid] = bloco["digitados_a_mao"]
    contexto = {"divergentes": divergentes, "indice": indice,
                "unidades_inferidas": inferidas, "digitados_a_mao": digitados,
                "registro": _portao.conferir_registro()}

    parte, achados, aceita = _portao.conferir(PARTE, contexto)
    if como_json:
        print(json.dumps({"parte": PARTE, "aceita": aceita,
                          "regras": [a.como_dict() for a in achados]},
                         ensure_ascii=False, indent=1))
    else:
        _portao.imprimir(PARTE, achados, aceita)
        print("\nO que este atalho NÃO conferiu:")
        print("  · regra 7: o índice do portão varre só as partes de PARTES, e J09 não está lá — "
              "a regra passou sem ter uma linha de J09 para comparar.")
        for l in _portao.LIMITACOES:
            print(f"  · {l}")
        if not tem_porta:
            print("  · _porta_temporal.json não foi lido: a regra 2 tratou a porta como ausente, "
                  "que é o certo aqui — J09 declara em J09_resumo.json que ela não roda.")
    return 0 if aceita else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
