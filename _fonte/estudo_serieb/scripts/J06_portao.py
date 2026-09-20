#!/usr/bin/env python3
"""Roda o portão de entrega em J06, sem tocar no `_portao.py`.

Por que existe: a constante `PARTES` de `scripts/_portao.py` lista as 22 partes de 19/09 e **não
inclui J06**, então `python3 scripts/_portao.py J06` sai com "parte desconhecida" antes de conferir
qualquer coisa. Mexer no `_portao.py` seria escrever em arquivo de outra parte — o que esta parte
não pode fazer —, e deixar J06 sem portão seria pior. Este atalho importa o portão e chama a MESMA
função `conferir` com o mesmo contexto: nenhuma regra é reescrita, afrouxada nem pulada. É o mesmo
molde do `J05_portao.py`.

O que muda em relação a rodar pelo CLI, e é honesto dizer:
  - a **regra 3** lê a unidade em `UNIDADE_INFERIDA`, que não tem J06. A unidade desta parte é
    `chegada-jogador` e ela está declarada na coluna `unidade` do `J06_testes.csv`; o corte de
    fronteira desta parte é o clube de DESTINO da chegada estar colado na linha do G4 ou do Z4, e
    os dois cortes rodam. A regra confere os dois normalmente.
  - a **regra 7** (mesmo indicador publicado duas vezes com q diferente) monta o índice varrendo só
    as partes de `PARTES`. Como J06 não está lá, o índice não tem linha de J06 e a regra passa por
    vacuidade — ela NÃO conferiu nada. Quando J06 entrar em `PARTES`, ela não vai colidir com J03,
    J04 nem J05: o "indicador" desta parte é `<grupo> -> <desfecho>`, que só existe aqui, e a
    unidade é `chegada-jogador`, que também.
  - a **regra 8** (o registro) é do estudo inteiro e vale como sempre.

Uso:
    python3 _fonte/estudo_serieb/scripts/J06_portao.py
    python3 _fonte/estudo_serieb/scripts/J06_portao.py --json
"""
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import _portao  # noqa: E402

PARTE = "J06"


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
        print("  · regra 7: o índice do portão varre só as partes de PARTES, e J06 não está lá — "
              "a regra passou sem ter uma linha de J06 para comparar.")
        for l in _portao.LIMITACOES:
            print(f"  · {l}")
        if not tem_porta:
            print("  · _porta_temporal.json não foi lido: a regra 2 tratou a porta como ausente, "
                  "que é o certo aqui — J06 declara em J06_resumo.json que ela não roda.")
    return 0 if aceita else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
