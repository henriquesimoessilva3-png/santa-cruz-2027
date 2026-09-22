#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera o _registro.md a partir dos <ID>.json. NAO editar o _registro.md a mao.

Existe por causa da regra 8 do portao (scripts/_portao.py): o registro afirmava um estado
que os JSON contradiziam — o cabecalho dizia estar em dia e as tabelas estavam dois dias
atras. Tabela escrita a mao mente sem avisar; tabela gerada nao.

O que e GERADO: a tabela de conclusoes e a de status. Saem dos <ID>.json, sempre.
O que e CURADO: tudo em _registro_notas.md — armadilhas, bases copiadas, o que ficou em
aberto. Isso e prosa que ninguem deriva de dado, e o gerador copia sem tocar.

Uso:  python3 scripts/gerar_registro.py
"""
import json
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RES = AQUI.parent / "resultados"
# A15 entrou em 21/09 (a pergunta na unidade do jogo). Esta lista e a do _portao.py são a mesma
# lista em dois lugares — parte fora de uma delas fica publicada sem conferência, que foi o que
# aconteceu com J05, J06 e J09 até 20/09.
PARTES = ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10", "A11",
          "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "J01", "J02", "J03", "J04", "J05", "J06", "J07", "J08", "J10",
          "J09", "T01", "T02", "T03", "T04"]
TAREFAS = {"E00": "feita (17/09)", "R01": "pendente"}
SENTINELA = ("> **Gerado por `scripts/gerar_registro.py` a partir dos `<ID>.json`. "
             "Não editar à mão.**\n> A prosa curada vive em `_registro_notas.md`; "
             "as tabelas saem sempre do dado.")


def ler(parte):
    f = RES / f"{parte}.json"
    if not f.exists():
        return None
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def main():
    dados = {p: ler(p) for p in PARTES}
    linhas = ["# Registro do Estudo Série B", "", SENTINELA, ""]

    # --- contagem, do dado ---
    todas = [c for d in dados.values() if d for c in (d.get("conclusoes") or [])]
    vivas = [c for c in todas if c.get("status") != "removida"]
    niveis = {}
    for c in vivas:
        niveis[c.get("confianca")] = niveis.get(c.get("confianca"), 0) + 1
    validadas = sum(1 for c in vivas if c.get("status") == "validada")
    respondidas = [p for p in PARTES if dados.get(p)]
    linhas += [
        f"**{len(respondidas)} das {len(PARTES)} perguntas respondidas** · "
        f"**{len(vivas)} conclusões** ("
        + " · ".join(f"{v} {k}" for k, v in sorted(niveis.items(), key=lambda x: -x[1]))
        + f") · **{validadas} validadas**.",
        "",
    ]
    rem = [c["id"] for c in todas if c.get("status") == "removida"]
    if rem:
        linhas += [f"Removidas, com o motivo no próprio JSON: {', '.join(rem)}.", ""]

    # --- tabela de conclusoes ---
    # Conclusao removida CONTINUA publicada no JSON: ela entra na tabela marcada, nunca
    # some. Tabela que omite e tabela que esconde — foi a regra 8 do portao que cobrou isto.
    linhas += ["## Conclusões registradas", "",
               "| ID | Manchete | Confiança | n |", "|----|----------|-----------|---|"]
    for p in PARTES:
        d = dados.get(p)
        if not d:
            continue
        for c in d.get("conclusoes") or []:
            m = (c.get("manchete") or "").replace("|", "\\|")
            if c.get("status") == "removida":
                # o ID fica limpo: o portao casa a tabela pelo ID, e marcacao em volta dele quebra
                linhas.append(f"| {c.get('id')} | ~~{m}~~ | **removida** | — |")
            else:
                linhas.append(f"| {c.get('id')} | {m} | {c.get('confianca')} | "
                              f"{(c.get('n') or '—')} |")

    # --- tabela de status ---
    linhas += ["", "## Status das partes", "",
               "| ID | Status | Conclusões | Tem `.md`? |", "|----|--------|-----------|-----------|"]
    for t, st in TAREFAS.items():
        linhas.append(f"| {t} | {st} | — | — |")
    for p in PARTES:
        d = dados.get(p)
        if not d:
            linhas.append(f"| {p} | pendente | — | — |")
            continue
        cs = [c for c in (d.get("conclusoes") or []) if c.get("status") != "removida"]
        sts = {c.get("status") for c in cs}
        st = "validada" if sts == {"validada"} else ("rascunho" if cs else "sem conclusão")
        temmd = "sim" if (RES / f"{p}.md").exists() else "**não**"
        linhas.append(f"| {p} | {st} | {len(cs)} | {temmd} |")

    # --- a prosa curada, copiada sem tocar ---
    notas = RES / "_registro_notas.md"
    if notas.exists():
        linhas += ["", notas.read_text(encoding="utf-8").rstrip()]

    (RES / "_registro.md").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print(f"_registro.md gerado: {len(respondidas)} partes, {len(vivas)} conclusões, "
          f"{validadas} validadas")


if __name__ == "__main__":
    main()
