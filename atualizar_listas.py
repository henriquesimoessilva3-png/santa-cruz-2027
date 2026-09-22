#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Traz os grupos da nuvem para o repositorio e atualiza o que o site publicado mostra.

## O problema que ela resolve

O site e' estatico. Quem abre SEM login ve uma FOTO do elenco, gravada em `docs/dados/` na
hora de publicar — e essa foto so' muda quando alguem roda o `publicar_site.py` e da' push.
A lista de trabalho, essa sim, vive no Firestore e muda toda vez que alguem salva no app.

As duas andavam separadas, e em 22/09/2026 a distancia ficou visivel: o site mostrava 120
atletas enquanto o Cenario 1 2027 ja' tinha 343. Nao era bug de codigo — era a foto velha.

Esta rotina fecha a distancia sem abrir a nuvem para ninguem: ela LE o Firestore com uma
chave de servico, escreve os mesmos dois arquivos que o `publicar_site.py` escreve, e
commita se algo mudou. As regras do `firestore.rules` continuam fechadas, e nenhum salario
fica legivel por quem nao esta na lista de e-mails.

## O que ela NAO faz

Nao remonta o site inteiro: nao mexe em HTML, CSS, JS nem nos dados de analise. Toca
exatamente tres arquivos — `dados/cenarios.json`, `docs/dados/cenarios_publicados.json` e
`docs/dados/elenco_inicial.json` — e usa a funcao do proprio `publicar_site.py` para
escrever os dois ultimos, para as duas nao divergirem.

Nao apaga grupo: se um grupo sumiu da nuvem, ele CONTINUA no repositorio, e a rotina avisa.
Apagar por sincronia automatica e' o tipo de coisa que ninguem desfaz depois.

## A chave

Precisa de uma chave de conta de servico do projeto Firebase, que NAO mora no repositorio:

  - localmente:  export SC_FIREBASE_KEY=~/.config/santa-cruz/chave.json
  - no GitHub:   o secret FIREBASE_KEY, com o conteudo do JSON (o workflow escreve o arquivo)

Sem a chave a rotina para e explica, em vez de gravar pela metade.

Uso:
    python3 atualizar_listas.py             # atualiza os arquivos e mostra o que mudou
    python3 atualizar_listas.py --push      # e commita e envia, se mudou algo
"""
import argparse
import json
import os
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import publicar_site  # noqa: E402  reaproveita escrever_cenarios() e atletas_do_cenario()

COLECAO = "cenarios"
ARQ_LOCAL = os.path.join(AQUI, "dados", "cenarios.json")
DOCS_DADOS = os.path.join(AQUI, "docs", "dados")


def caminho_da_chave():
    p = os.environ.get("SC_FIREBASE_KEY")
    if p:
        return os.path.expanduser(p)
    padrao = os.path.expanduser("~/.config/santa-cruz/chave.json")
    return padrao if os.path.exists(padrao) else None


def ler_nuvem():
    """Os documentos da colecao `cenarios`, como o app os grava."""
    chave = caminho_da_chave()
    if not chave or not os.path.exists(chave):
        print("FALTA A CHAVE da conta de servico.\n"
              "  Aponte SC_FIREBASE_KEY para o JSON, ou deixe-o em "
              "~/.config/santa-cruz/chave.json\n"
              "  Como gerar: PUBLICAR.md, seção “A rotina que sincroniza as listas”.",
              file=sys.stderr)
        return None
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError:
        print("FALTA A BIBLIOTECA: pip install firebase-admin", file=sys.stderr)
        return None
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(chave))
    db = firestore.client()
    fora = {}
    for d in db.collection(COLECAO).stream():
        c = d.to_dict() or {}
        c["id"] = d.id
        fora[d.id] = c
    return fora


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--push", action="store_true",
                    help="commita e envia, se algum arquivo mudou")
    args = ap.parse_args()

    nuvem = ler_nuvem()
    if nuvem is None:
        return 1
    if not nuvem:
        print("a nuvem respondeu, mas não veio nenhum grupo — não gravo nada por cima",
              file=sys.stderr)
        return 1

    # DE ONDE VEM O "ANTES". No Mac de quem trabalha, do proprio dados/cenarios.json. No
    # GitHub esse arquivo NAO EXISTE: ele e' ignorado pelo git de proposito, porque carrega a
    # folha salarial e e' estado de trabalho. Sem tratar isso, a rotina rodaria no CI com o
    # "antes" vazio e reescreveria o cenarios_publicados.json so' com o que ha' na nuvem —
    # apagando do site os MODELO A e MODELO B, que sao locais e nunca foram para a nuvem.
    # Por isso o CI parte do proprio snapshot publicado, que e' versionado.
    local, de_onde = {}, ""
    if os.path.exists(ARQ_LOCAL):
        with open(ARQ_LOCAL, encoding="utf-8") as fh:
            local = json.load(fh)
        de_onde = "dados/cenarios.json"
    else:
        pub = os.path.join(DOCS_DADOS, "cenarios_publicados.json")
        if os.path.exists(pub):
            with open(pub, encoding="utf-8") as fh:
                for c in json.load(fh):
                    if c.get("id"):
                        local[c["id"]] = c
            de_onde = "docs/dados/cenarios_publicados.json (o arquivo local não existe aqui)"
    print(f"partindo de {de_onde or 'nada'} — {len(local)} grupo(s)")

    at = publicar_site.atletas_do_cenario
    mudou, novos = [], []
    for cid, c in nuvem.items():
        antes = local.get(cid)
        if antes is None:
            novos.append((cid, c))
        elif at(antes) != at(c) or (antes.get("atualizado") or "") != (c.get("atualizado") or ""):
            mudou.append((cid, at(antes), at(c)))
        local[cid] = c

    # Grupo que saiu da nuvem NAO e' apagado daqui: fica, e a rotina diz que ficou.
    so_local = [k for k in local if k not in nuvem and not k.startswith("modelo-")]

    for cid, c in novos:
        print(f"  novo:    {c.get('nome','?')[:36]:38} {at(c):4} atletas")
    for cid, a, b in mudou:
        print(f"  mudou:   {local[cid].get('nome','?')[:36]:38} {a:4} → {b} atletas")
    for cid in so_local:
        print(f"  só aqui: {local[cid].get('nome','?')[:36]:38} "
              f"{at(local[cid]):4} atletas (não está mais na nuvem — mantido)")
    if not novos and not mudou:
        print("nada mudou na nuvem desde a última vez")

    with open(ARQ_LOCAL, "w", encoding="utf-8") as fh:
        json.dump(local, fh, ensure_ascii=False)
    os.makedirs(DOCS_DADOS, exist_ok=True)
    publicar_site.escrever_cenarios(DOCS_DADOS)

    # dados/cenarios.json fica FORA daqui: ele e' ignorado pelo git (estado de trabalho, com
    # salario dentro), e um `git add` nele falharia. O que vai para o site sao os dois de docs/.
    alvos = ["docs/dados/cenarios_publicados.json", "docs/dados/elenco_inicial.json"]
    sujo = subprocess.run(["git", "status", "--porcelain", "--"] + alvos,
                          cwd=AQUI, capture_output=True, text=True).stdout.strip()
    if not sujo:
        print("nenhum arquivo mudou — nada a enviar")
        return 0
    print("arquivos alterados:\n" + sujo)
    if not args.push:
        print("(rode com --push para commitar e enviar)")
        return 0

    corpo = "\n".join(
        [f"- novo: {c.get('nome')} ({at(c)} atletas)" for _i, c in novos] +
        [f"- {local[i].get('nome')}: {a} -> {b} atletas" for i, a, b in mudou])
    msg = ("Listas: sincroniza o site com o que esta na nuvem\n\n"
           "Gerado por atualizar_listas.py — a foto que o visitante sem login ve\n"
           "passa a bater com a lista de trabalho salva no app.\n\n" + (corpo or "- sem mudanca de elenco"))
    subprocess.run(["git", "add"] + alvos, cwd=AQUI, check=True)
    subprocess.run(["git", "commit", "-m", msg], cwd=AQUI, check=True)
    subprocess.run(["git", "push", "origin", "HEAD"], cwd=AQUI, check=True)
    print("enviado")
    return 0


if __name__ == "__main__":
    sys.exit(main())
