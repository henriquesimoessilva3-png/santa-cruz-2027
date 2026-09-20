#!/usr/bin/env python3
"""Roda o portão de entrega em J05, sem tocar no `_portao.py`.

Por que existe: a constante `PARTES` de `scripts/_portao.py` lista as 22 partes de 19/09 e **não
inclui J05**, então `python3 scripts/_portao.py J05` sai com "parte desconhecida" antes de conferir
qualquer coisa. Mexer no `_portao.py` seria escrever em arquivo de outra parte — o que esta parte
não pode fazer —, e deixar J05 sem portão seria pior. Este atalho importa o portão e chama a MESMA
função `conferir` com o mesmo contexto: nenhuma regra é reescrita, afrouxada nem pulada.

O que muda em relação a rodar pelo CLI, e é honesto dizer:
  - a **regra 7** (mesmo indicador publicado duas vezes com q diferente) monta o índice varrendo só
    as partes de `PARTES`. Como J05 não está lá, o índice não tem linha de J05 e a regra passa por
    vacuidade — ela NÃO conferiu nada. Quando J05 entrar em `PARTES`, ela vai comparar J05 com J03 e
    J04, e aí o q vai divergir de propósito: a família desta parte é a da §6.3 (bloco × comparação),
    e a daquelas duas foi partida por setor. A divergência está declarada em `J05_indicadores.json`,
    chave `familia_e_a_unidade_do_bh`.
  - a **regra 8** (o registro) é do estudo inteiro e vale como sempre.

Uso:
    python3 _fonte/estudo_serieb/scripts/J05_portao.py
    python3 _fonte/estudo_serieb/scripts/J05_portao.py --json
"""
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import _portao  # noqa: E402

PARTE = "J05"


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
        print("  · regra 7: o índice do portão varre só as partes de PARTES, e J05 não está lá — "
              "a regra passou sem ter uma linha de J05 para comparar.")
        for l in _portao.LIMITACOES:
            print(f"  · {l}")
        if not tem_porta:
            print("  · não consegui ler resultados/_porta_temporal.json: a regra 2 tratou toda "
                  "porta como ausente.")
    return 0 if aceita else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
