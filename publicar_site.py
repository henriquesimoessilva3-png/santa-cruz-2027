#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera a versao estatica do app em docs/, para o GitHub Pages.

Mesmo caminho do Ranking (viewer/ -> github.io): o app ja e quase todo do lado do
navegador, entao o que o Flask faz e servir arquivo e guardar coisas. Aqui o servir
vira arquivo solto e o guardar vira localStorage.

O que muda na versao publicada:
  - grupos (cenarios) e premissas passam a viver no NAVEGADOR de quem abre. Cada
    visitante tem os seus; nada e compartilhado, porque nao ha servidor para guardar.
  - a exportacao em Excel sai (era o servidor que montava o xlsx). PNG e PDF ficam,
    porque sao feitos na propria pagina.
  - o rastro do tremor (api/diagnostico) nao e enviado.

Isso e dito na tela, num aviso no rodape — melhor do que o usuario descobrir que
salvou e nao salvou.

Uso:  python3 publicar_site.py           # so gera docs/
      python3 publicar_site.py --push    # gera, commita e envia
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time

AQUI = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(AQUI, "docs")
PYTHON = sys.executable


def versao(caminho):
    try:
        return str(int(os.path.getmtime(caminho)))
    except OSError:
        return str(int(time.time()))


def montar():
    if os.path.exists(DOCS):
        shutil.rmtree(DOCS)
    os.makedirs(DOCS)

    # --- estaticos e dados ---
    shutil.copytree(os.path.join(AQUI, "static"), os.path.join(DOCS, "static"))
    dados_dest = os.path.join(DOCS, "dados")
    os.makedirs(dados_dest)
    for nome in ("jogadores.json", "historico.json", "premissas.json"):
        origem = os.path.join(AQUI, "dados", nome)
        if os.path.exists(origem):
            shutil.copy2(origem, os.path.join(dados_dest, nome))
    kpis = os.path.join(AQUI, "dados", "kpis")
    if os.path.isdir(kpis):
        shutil.copytree(kpis, os.path.join(dados_dest, "kpis"))

    # --- escudo: no Flask e uma rota, aqui vira arquivo ---
    escudo_ext = None
    for nome in ("escudo.svg", "escudo.png", "escudo.jpg", "escudo.webp"):
        origem = os.path.join(AQUI, "static", nome)
        if os.path.exists(origem):
            escudo_ext = nome
            break

    # --- index.html: o template do Flask com os buracos preenchidos ---
    with open(os.path.join(AQUI, "templates", "index.html"), encoding="utf-8") as fh:
        html = fh.read()
    v = versao(os.path.join(AQUI, "static", "app.js"))
    vd = versao(os.path.join(AQUI, "dados", "jogadores.json"))
    html = (html.replace("{{ ver }}", v).replace("{{ verDados }}", vd)
                .replace("{{ver}}", v).replace("{{verDados}}", vd))
    html = re.sub(r'\{\{\s*url_for\([^)]*\)\s*\}\}', lambda m: 'static/app.js', html)
    if escudo_ext:
        html = html.replace('"/escudo"', f'"static/{escudo_ext}"')
    # caminhos absolutos nao servem sob /santa-cruz-2027/ do Pages
    html = html.replace('href="/static/', 'href="static/').replace('src="/static/', 'src="static/')
    # a pagina se declara estatica; o app.js le isto e desliga o que precisa de servidor
    html = html.replace("<script", "<script>window.__estatico = true;</script>\n<script", 1)
    with open(os.path.join(DOCS, "index.html"), "w", encoding="utf-8") as fh:
        fh.write(html)

    # --- elenco de partida ---
    # Quem abre o site nao tem nada no navegador e veria o campo vazio. Vai junto o
    # cenario com mais atletas (o que esta sendo trabalhado), como estado inicial. O
    # app so o usa quando NAO ha nada gravado no navegador do visitante — quem ja
    # mexeu no seu campograma nao o perde.
    cen = os.path.join(AQUI, "dados", "cenarios.json")
    if os.path.exists(cen):
        with open(cen, encoding="utf-8") as fh:
            todos = json.load(fh)
        lista = list(todos.values()) if isinstance(todos, dict) else todos
        def atletas(c):
            return sum(len(v) for v in (c.get("elenco") or {}).values())
        escolhido = max(lista, key=atletas, default=None)
        if escolhido and atletas(escolhido) > 0:
            with open(os.path.join(dados_dest, "elenco_inicial.json"), "w",
                      encoding="utf-8") as fh:
                json.dump(escolhido, fh, ensure_ascii=False, separators=(",", ":"))
            print(f"elenco de partida: {escolhido.get('nome')!r} "
                  f"({atletas(escolhido)} atletas)")

    # o Pages nao deve passar a pasta pelo Jekyll (nomes com _ sumiriam)
    open(os.path.join(DOCS, ".nojekyll"), "w").close()

    tam = sum(os.path.getsize(os.path.join(r, f))
              for r, _d, fs in os.walk(DOCS) for f in fs) / 1024 / 1024
    print(f"docs/ montado: {tam:.1f} MB")
    return tam


def publicar():
    subprocess.run(["git", "add", "docs"], cwd=AQUI, check=True)
    r = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=AQUI)
    if r.returncode == 0:
        print("nada mudou em docs/")
        return
    subprocess.run(["git", "commit", "-q", "-m",
                    "Publica a versao estatica em docs/ para o GitHub Pages"],
                   cwd=AQUI, check=True)
    subprocess.run(["git", "push", "-q", "origin", "main"], cwd=AQUI, check=True)
    print("enviado")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--push", action="store_true")
    args = ap.parse_args()
    montar()
    if args.push:
        publicar()


if __name__ == "__main__":
    sys.exit(main())
