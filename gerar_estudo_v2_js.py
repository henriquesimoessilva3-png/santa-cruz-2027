#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Escreve static/estudo_v2_dados.js — o estudo Santa Cruz V2 do jeito que a subaba le.

Fonte: os .md de `Santa Cruz V2/` (conclusoes, listas, blocos e metodo). Nada e reescrito
aqui: o texto e o do estudo, convertido de markdown para HTML. Para mudar a tela, mude o .md
e rode de novo:  python3 gerar_estudo_v2_js.py
"""
import datetime
import json
import os
import re

import markdown

AQUI = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.join(AQUI, "Santa Cruz V2")
SAIDA = os.path.join(AQUI, "static", "estudo_v2_dados.js")

# (grupo, id, arquivo, rotulo curto no menu)
DOCS = [
    ("Conclusões", "sintese", "listas/SINTESE.md", "Síntese: régua e filtros"),
    ("Conclusões", "diferenciais", "listas/DIFERENCIAIS.md", "O que faz subir"),
    ("Recomendação", "elenco", "listas/ELENCO_2027.md", "Quem eu contrataria"),
    ("Recomendação", "treinadores", "listas/TREINADORES.md", "Treinadores"),
    ("Recomendação", "ideal", "listas/IDEAL_2027.md", "Os meus dez por posição"),
    ("Recomendação", "top10", "listas/TOP10_POR_POSICAO.md", "Dez alvos por posição"),
    ("Recomendação", "livres", "listas/ELENCO_2027_LIVRES_B_ARG.md", "Só livres (B + ARG)"),
    ("Recomendação", "bolaparada", "listas/BOLA_PARADA.md", "Especialistas de bola parada"),
    ("Recomendação", "listas", "listas/LISTAS.md", "Listas por posição"),
    ("Recomendação", "campograma", "listas/CAMPOGRAMA_x_ESTUDO.md", "Campograma × estudo"),
    ("Recomendação", "emprestimos", "listas/EMPRESTIMOS_EXTERIOR.md", "Empréstimos do exterior"),
    ("Blocos", "b1", "resultados/b1/B1.md", "1 · Físico"),
    ("Blocos", "b1p", "resultados/b1/B1_perfis.md", "1 · Físico por posição"),
    ("Blocos", "b2", "resultados/b2/B2.md", "2 · Técnico"),
    ("Blocos", "b3", "resultados/b3/B3.md", "3 · Bola parada"),
    ("Blocos", "b4", "resultados/b4/B4.md", "4 · Treinador"),
    ("Blocos", "b5", "resultados/b5/B5.md", "5 · Padrão de equipes"),
    ("Blocos", "b6", "resultados/b6/B6.md", "6 · Temporada e elenco"),
    ("Blocos", "b7", "resultados/b7/B7.md", "7 · O que faltava olhar"),
    ("Blocos", "b8", "resultados/b8/B8.md", "8 · Físico × técnico"),
    ("Blocos", "b9", "resultados/b9/B9.md", "9 · Duelos e posse"),
    ("Blocos", "b11", "resultados/b11/B11.md", "11 · Treinador e modelo de jogo"),
    ("Blocos", "b12", "resultados/b12/B12.md", "12 · Conversão de liga"),
    ("Blocos", "b13", "resultados/b13/B13.md", "13 · Treinador: sorte × mérito"),
    ("Blocos", "b14", "resultados/b14/B14.md", "14 · Patamar de Série A"),
    ("Blocos", "b15", "resultados/b15/B15.md", "15 · Sofascore jogo a jogo"),
    ("Blocos", "b10", "resultados/b10/B10.md", "10 · Sugestões pelo tipo físico (lista)"),
    ("Método", "plano", "PLANO.md", "Plano do estudo"),
    ("Método", "armadilhas", "ARMADILHAS.md", "Armadilhas dos dados"),
]


def html_de(texto):
    # listas coladas no paragrafo anterior nao viram <ul> no markdown padrao
    texto = re.sub(r"([^\n])\n(- |\d+\. )", r"\1\n\n\2", texto)
    return markdown.markdown(texto, extensions=["tables", "sane_lists"])


def main():
    saida = []
    for grupo, did, rel, rotulo in DOCS:
        caminho = os.path.join(V2, rel)
        if not os.path.exists(caminho):
            print("  falta", rel)
            continue
        with open(caminho, encoding="utf-8") as f:
            txt = f.read()
        m = re.match(r"#\s+(.+)\n", txt)
        titulo = m.group(1).strip() if m else rotulo
        corpo = txt[m.end():] if m else txt
        mtime = datetime.date.fromtimestamp(os.path.getmtime(caminho)).isoformat()
        saida.append({"grupo": grupo, "id": did, "rotulo": rotulo, "titulo": titulo,
                      "arquivo": "Santa Cruz V2/" + rel, "data": mtime, "html": html_de(corpo)})
    dados = {"gerado": datetime.date.today().isoformat(), "docs": saida}
    with open(SAIDA, "w", encoding="utf-8") as f:
        f.write("/* GERADO POR gerar_estudo_v2_js.py - NAO EDITE A MAO. Fonte: Santa Cruz V2/*.md */\n")
        f.write("window.ESTUDO_V2 = " + json.dumps(dados, ensure_ascii=False) + ";\n")
    print(f"{SAIDA}: {len(saida)} documentos")


if __name__ == "__main__":
    main()
