#!/usr/bin/env python3
"""Hub do Santa Cruz — porta 5091.

Uma pagina so, com um card por app. Cada card mostra se a porta esta no ar.
Nao tem relacao com o hub do Botafogo (:5555): sao ambientes separados.
"""
import json
import os
import socket
from flask import Flask, Response, render_template_string

PORTA = 5091
AQUI = os.path.dirname(os.path.abspath(__file__))

APPS = [
    {
        "id": "elenco",
        "nome": "Montagem de Elenco 2027",
        "desc": "Campograma, folha salarial e grupos de opções para o acesso à Série B",
        "porta": 5090,
        "url": "http://localhost:5090",
        "icone": "&#9917;",
        "detalhe": "11 posições · 40 mil jogadores · ficha técnica e física · PDF e Excel",
        "web": "https://santa-cruz-2027.onrender.com",
    },
]


def no_ar(porta):
    try:
        with socket.create_connection(("127.0.0.1", porta), timeout=0.35):
            return True
    except OSError:
        return False


app = Flask(__name__)

PAGINA = """<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Santa Cruz · Portal</title>
<link rel="icon" href="/escudo">
<style>
  :root{
    --tinta:#e8eaee; --tinta2:#9aa3b2; --tinta3:#6b7482;
    --fundo:#0d0f13; --painel:#151922; --borda:#262d3a; --borda2:#333c4c;
    --coral:#c8102e; --coral-cl:#ef3f5c; --verde:#22c55e;
    --fonte:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,sans-serif;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--fundo);color:var(--tinta);font-family:var(--fonte);
    font-size:14px;-webkit-font-smoothing:antialiased;min-height:100vh}
  header{display:flex;align-items:center;gap:14px;padding:20px 28px;
    background:linear-gradient(180deg,#191d26,#12151c);border-bottom:1px solid var(--borda);
    position:relative}
  header::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;
    background:linear-gradient(90deg,var(--coral),#111 45%,var(--coral))}
  .escudo{width:52px;height:52px;flex:none}
  .escudo img{width:100%;height:100%;object-fit:contain}
  h1{margin:0;font-size:20px;font-weight:700;letter-spacing:-.3px}
  header p{margin:2px 0 0;font-size:12px;color:var(--tinta3)}
  main{padding:26px 28px;max-width:1400px}
  .secao{font-size:10.5px;text-transform:uppercase;letter-spacing:1px;color:var(--tinta3);
    font-weight:700;margin:0 0 12px;display:flex;align-items:center;gap:10px}
  .secao::after{content:"";flex:1;height:1px;background:var(--borda)}
  .grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
  .card{background:var(--painel);border:1px solid var(--borda);border-radius:12px;
    padding:18px;text-decoration:none;color:inherit;display:flex;flex-direction:column;
    transition:.15s;position:relative;overflow:hidden}
  .card:hover{border-color:var(--coral);transform:translateY(-2px);
    box-shadow:0 10px 30px #0008}
  .card-icone{font-size:26px;margin-bottom:10px;line-height:1}
  .card-nome{font-size:15px;font-weight:700;margin-bottom:5px}
  .card-desc{font-size:12px;color:var(--tinta2);line-height:1.45;margin-bottom:9px}
  .card-detalhe{font-size:10.5px;color:var(--tinta3);line-height:1.4;
    padding-top:9px;border-top:1px solid var(--borda);margin-top:auto}
  .card-pe{display:flex;align-items:center;gap:7px;margin-top:11px;font-size:10.5px}
  .porta{color:var(--tinta3);font-variant-numeric:tabular-nums}
  .luz{width:8px;height:8px;border-radius:50%;flex:none}
  .luz.on{background:var(--verde);box-shadow:0 0 8px #22c55e88}
  .luz.off{background:var(--tinta3)}
  .estado{color:var(--tinta3)}
  .estado.on{color:var(--verde)}
  .web{margin-left:auto;color:var(--coral-cl);font-weight:600}
  .web:hover{text-decoration:underline}
  .vazio{color:var(--tinta3);font-size:12.5px;padding:18px;border:1px dashed var(--borda2);
    border-radius:12px;line-height:1.6}
  footer{padding:18px 28px;color:var(--tinta3);font-size:11px}
  code{background:var(--painel);border:1px solid var(--borda);border-radius:5px;
    padding:1px 6px;font-size:11px}
</style></head><body>

<header>
  <div class="escudo"><img src="/escudo" alt="Santa Cruz"></div>
  <div>
    <h1>Santa Cruz · Portal</h1>
    <p>Ambiente próprio do clube — separado do hub do Botafogo (:5555)</p>
  </div>
</header>

<main>
  <p class="secao">Aplicativos</p>
  <div class="grade">
    {% for a in apps %}
    <a class="card" href="{{ a.url }}" target="_blank" rel="noopener">
      <div class="card-icone">{{ a.icone|safe }}</div>
      <div class="card-nome">{{ a.nome }}</div>
      <div class="card-desc">{{ a.desc }}</div>
      <div class="card-detalhe">{{ a.detalhe }}</div>
      <div class="card-pe">
        <span class="luz {{ 'on' if a.no_ar else 'off' }}"></span>
        <span class="estado {{ 'on' if a.no_ar else '' }}">{{ 'no ar' if a.no_ar else 'desligado' }}</span>
        <span class="porta">:{{ a.porta }}</span>
        {% if a.web %}<span class="web" onclick="event.preventDefault();event.stopPropagation();window.open('{{ a.web }}','_blank')">web ↗</span>{% endif %}
      </div>
    </a>
    {% endfor %}
  </div>

  <p class="secao" style="margin-top:30px">Em breve</p>
  <div class="vazio">
    Espaço para os próximos apps do clube. Para acrescentar um card, edite a lista
    <code>APPS</code> em <code>hub/hub_santacruz.py</code> — nome, descrição, porta e
    a linha de detalhe.
  </div>
</main>

<footer>
  Subir tudo: <code>~/projetos/santa-cruz-2027/hub/iniciar_hub.sh</code> ·
  esta página se atualiza sozinha a cada 20 s
</footer>

<script>setTimeout(() => location.reload(), 20000);</script>
</body></html>"""


@app.route("/")
def index():
    apps = [dict(a, no_ar=no_ar(a["porta"])) for a in APPS]
    return render_template_string(PAGINA, apps=apps)


@app.route("/escudo")
def escudo():
    for nome in ("escudo.svg", "escudo.png", "escudo.jpg", "escudo.webp"):
        caminho = os.path.join(AQUI, "..", "static", nome)
        if os.path.exists(caminho):
            from flask import send_file
            return send_file(os.path.abspath(caminho), max_age=0)
    return Response(status=404)


@app.route("/api/status")
def status():
    return json.dumps({a["id"]: no_ar(a["porta"]) for a in APPS}), 200, \
        {"Content-Type": "application/json"}


if __name__ == "__main__":
    print(f"\n  Santa Cruz · Portal\n  http://localhost:{PORTA}\n")
    app.run(host="127.0.0.1", port=PORTA, debug=False)
