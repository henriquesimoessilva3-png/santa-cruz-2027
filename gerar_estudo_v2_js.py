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
    # Ordem de leitura (26/09): do dado à decisão — físico, técnico, treinadores, modelo de jogo,
    # conclusões e, por último, as recomendações de nomes. Sem número no menu: o número do bloco
    # fica no título do documento (é o nome da pasta em resultados/).
    ("Físico", "b1", "resultados/b1/B1.md", "O que rende ponto (B1)"),
    ("Físico", "b1p", "resultados/b1/B1_perfis.md", "Perfil por posição (B1)"),
    ("Físico", "b8", "resultados/b8/B8.md", "Físico × técnico e tipos físicos (B8)"),
    ("Físico", "b13", "resultados/b13/B13.md", "Patamar de Série A (B13)"),
    ("Técnico", "b2", "resultados/b2/B2.md", "O que rende ponto (B2)"),
    ("Técnico", "b3", "resultados/b3/B3.md", "Bola parada (B3)"),
    ("Técnico", "b9", "resultados/b9/B9.md", "Duelos e posse (B9)"),
    ("Técnico", "b11", "resultados/b11/B11.md", "Conversão de liga (B11)"),
    ("Treinadores", "b4", "resultados/b4/B4.md", "Rendimento por passagem (B4)"),
    ("Treinadores", "b12", "resultados/b12/B12.md", "Sorte × mérito (B12)"),
    ("Treinadores", "b10", "resultados/b10/B10.md", "Modelo de jogo de cada treinador (B10)"),
    ("Modelo de jogo", "b5", "resultados/b5/B5.md", "Padrão dos times que rendem (B5)"),
    ("Modelo de jogo", "b6", "resultados/b6/B6.md", "Temporada e elenco (B6)"),
    ("Modelo de jogo", "b14", "resultados/b14/B14.md", "Sofascore jogo a jogo (B14)"),
    ("Modelo de jogo", "b7", "resultados/b7/B7.md", "O que faltava olhar (B7)"),
    ("Conclusões", "sintese", "listas/SINTESE.md", "Síntese: régua e filtros"),
    ("Conclusões", "diferenciais", "listas/DIFERENCIAIS.md", "O que faz subir"),
    ("Recomendação", "elenco", "listas/ELENCO_2027.md", "Quem eu contrataria"),
    ("Recomendação", "treinadores", "listas/TREINADORES.md", "Treinadores: lista para avaliação"),
    ("Recomendação", "ideal", "listas/IDEAL_2027.md", "Os meus dez por posição"),
    ("Recomendação", "top10", "listas/TOP10_POR_POSICAO.md", "Dez alvos por posição (livres primeiro)"),
    ("Recomendação", "listas", "listas/LISTAS.md", "Listas por posição e mercado"),
    ("Recomendação", "fisico", "listas/RANKING_FISICO.md", "Ranking físico por posição"),
    ("Recomendação", "b15", "resultados/b15/B15.md", "Sugestões pelo tipo físico (B15)"),
    ("Recomendação", "bolaparada", "listas/BOLA_PARADA.md", "Especialistas de bola parada"),
    ("Recomendação", "livres", "listas/ELENCO_2027_LIVRES_B_ARG.md", "Só livres (B + ARG)"),
    ("Recomendação", "seriea", "listas/SERIE_A_OPORTUNIDADES.md", "Série A: jovens, veteranos, Remo/Chape"),
    ("Recomendação", "emprestimos", "listas/EMPRESTIMOS_EXTERIOR.md", "Empréstimos do exterior"),
    ("Recomendação", "nao", "listas/NAO_CONTRATAR.md", "Quem não contratar"),
    ("Recomendação", "campograma", "listas/CAMPOGRAMA_x_ESTUDO.md", "Campograma × estudo"),
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
