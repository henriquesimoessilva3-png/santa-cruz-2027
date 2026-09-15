# varredura_rodapes - acha, nos rodapés, nas linhas de faixa e nos textos renderizados de cada conclusão, os pedaços em que
# o desconto pelo valor do elenco ou o mesmo clube no ano seguinte ainda aparecem como número ou veredito, e o "no limite"
# fora do selo da zona cinzenta. Escrito sem importar o montador: é usado pela prova (sp7_prova) e, solto, para listar os
# achados antes de consertar. Um pedaço (separado por " · ") só passa se disser que é registro ("na conta de 14/09").
import re

# padrões do dinheiro e do ano seguinte; "descontado só o rodízio", "descontada a posse" e "descontadas entradas e toques"
# são descontos que continuam na régua ou são descrição de outra medida, e não entram
DINHEIRO_E_ANO = [
    r"descontad[oa]s?\s+(o\s+)?(valor|dinheiro)", r"descontad[oa]s?\s+\d", r"\bdescontos\b", r"\be valor p\b", r"valor \+ atletas",
    r"também o valor", r"\blíquid[oa]\b", r"some (no|com o) dinheiro", r"desconto do (valor|dinheiro)", r", valor \d",
    r"clube ρ", r"repetição no clube", r"ρ de repetição", r"\[2026, 91\d",
]
# "regra de 14/09" como motivo de selo nunca passa, nem ao lado de uma marca de registro
SEMPRE = [r"regra de 14/09"]
# um pedaço com uma destas marcas diz que o número é registro da conta de 14/09, não critério de hoje
MARCAS = ("na conta de 14/09", "em 14/09")
# "no limite" é o nome da zona cinzenta e só vai no selo dela; as conclusões cujo selo sai da zona cinzenta ficam liberadas
LIMITE = r"no limite"
# conclusões cujo assunto é a repetição: o ano seguinte e o mesmo clube são a pergunta delas
ASSUNTO_REPETICAO = {"FIS-07", "M1", "M6", "M7", "ELE-06"}
ZONA_PROPRIA = {"ELE-06"}   # regime próprio (contas da mesma pergunta) em que a conta do título fica na zona cinzenta


def libera_limite(c):
    er = c.get("entradas_da_regua") or {}
    return "zona" in (er.get("papeis") or {}) or c["id"] in ZONA_PROPRIA


def pedacos(texto):
    return [p for p in re.split(r" · ", texto or "") if p.strip()]


def achados(c, textos):
    """textos: {nome: texto}. Devolve [(nome, padrão, pedaço)]."""
    out = []
    for nome, t in sorted(textos.items()):
        for pd in pedacos(t):
            for p in SEMPRE:
                if re.search(p, pd, re.I):
                    out.append((nome, p, pd))
            if not libera_limite(c) and re.search(LIMITE, pd, re.I):
                out.append((nome, LIMITE, pd))
            if any(m in pd for m in MARCAS):
                continue
            for p in DINHEIRO_E_ANO:
                if c["id"] in ASSUNTO_REPETICAO and p in (r"clube ρ", r"repetição no clube", r"ρ de repetição"):
                    continue
                if re.search(p, pd, re.I):
                    out.append((nome, p, pd))
    return out


if __name__ == "__main__":
    import json, sys
    d = sys.argv[1] if len(sys.argv) > 1 else "../saida/"
    spec = json.load(open(d + "conclusoes_spec.json", encoding="utf-8"))
    n = 0
    for c in spec["conclusoes"]:
        val = c["valores_14_09"]
        rend = lambda t: re.sub(r"\{([a-zA-Z0-9_]+)\}", lambda m: val.get(m.group(1), m.group(0)), t or "")
        textos = {"rodape": c["documento"]["rodape"], "faixa": c["vale_pela_faixa_de_pontos"]["texto_documento"] or ""}
        textos.update({"molde." + k: rend(v) for k, v in c["molde"].items() if isinstance(v, str)})
        for nome, p, pd in achados(c, textos):
            n += 1
            print(f"{c['id']:7} {nome:14} {p:32} | {pd[:170]}")
    print("achados:", n)
