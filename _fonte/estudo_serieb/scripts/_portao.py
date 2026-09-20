#!/usr/bin/env python3
"""O portão de entrega do Estudo Série B: onze regras que conferem o que a parte alega sobre si mesma.

Por que existe (etapa 6 do PLANO.md, aprovada pelo dono em 19/09). O estudo falhou numa CLASSE de
erro: ele afirma coisas sobre si mesmo que não são verdade, e nada confere. 191 números digitados
à mão com `gerado_por` apontando um script que não os produz; 35 conclusões "firme" sem que
nenhuma parte tivesse rodado a porta temporal da §6.4; 81 casos de rodar os dois cortes de
fronteira e publicar só o que favorece. Disciplina foi a única trava, e disciplina falha.

O portão roda ANTES de a parte ser aceita e RECUSA o que não prova o que alega. Ele não lê o
mérito: não diz se a conclusão é interessante, se a interpretação está certa nem se a pergunta
valia a pena. Ele lê a alegação de procedência — "isto veio do script", "isto passou no critério",
"esta é a prova" — que é onde tudo falhou.

PRINCÍPIO DE DESENHO: FALHA FECHADA. Na dúvida reprova ou marca REVISAR, nunca aprova. Ausência de
arquivo é reprovação, não dispensa. Dado ausente não é concordância. Arquivo ilegível não é parte
conferida. Um portão que aprova por omissão é pior que nenhum portão, porque dá confiança.

O QUE ELE NÃO CONSEGUE PROVAR (leia antes de confiar): o portão NÃO executa script nenhum e NÃO
abre base nenhuma. Ele confere que o número publicado é IGUAL ao número que a saída do script
declara, que o script existe, que ele grava aquela saída e que importa o método da casa — mas não
recalcula o número a partir do dado bruto. Uma saída inteira escrita à mão, com script de fachada
que grave o mesmo arquivo, ainda passa nas onze regras. Fechar isso exige rodar o script e comparar
com o que ele devolve, e nenhum script do estudo aceita ser rodado em modo de conferência hoje.
A seção "O que o portão ainda NÃO consegue provar" no fim de cada rodada repete este aviso.

Como se usa:
    python3 scripts/_portao.py             as 22 partes
    python3 scripts/_portao.py A06 J04     só essas
    python3 scripts/_portao.py --json      a mesma conferência, legível por máquina

Sai com código 0 se toda parte pedida é aceita, 1 se alguma reprova — para virar gancho depois.
Ele só LÊ: não escreve nem altera nada no repositório.
"""
import ast
import collections
import csv
import json
import re
import sys
import unicodedata
from pathlib import Path

# ----------------------------------------------------------------------------------------------
# Onde as coisas estão
# ----------------------------------------------------------------------------------------------
SCRIPTS = Path(__file__).resolve().parent
ESTUDO = SCRIPTS.parent
RESULTADOS = ESTUDO / "resultados"
RAIZ = ESTUDO.parent.parent                       # a raiz do repositório
PROTOTIPO = RAIZ / "_fonte" / "prototipo"         # onde mora a ESPECIFICACAO.md

# A09 entrou em 20/09, quando a coleta do minuto do gol a tirou do "não roda".
# ATENÇÃO, e não é detalhe: J05, J06 e J09 NÃO estão nesta lista e nunca passaram pelo portão.
# Elas foram validadas pelo dono em 20/09 e estão na tela como decididas, mas sem conferência
# automática nenhuma — nem regra 1 (número que sai do script), nem regra 3 (os dois cortes).
# Entrar aqui é trabalho, não uma linha: cada uma precisa de <ID>_testes.csv e <ID>_numeros.json.
PARTES = ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A09", "A10", "A11", "A12", "A13",
          "A14", "J01", "J02", "J03", "J04", "J07", "J08", "T01", "T02", "T03", "T04"]

# Vereditos. Só REPROVA impede a parte de ser aceita; AVISO e REVISAR pedem olho humano.
PASSA, REPROVA, REVISAR, AVISO, NAO_APLICAVEL = "PASSA", "REPROVA", "REVISAR", "AVISO", "NÃO APLICÁVEL"

# Regra 6, seção Linguagem do CLAUDE.md. Duas listas, porque as palavras não são iguais entre si:
# `rho` e `jaccard` não existem em português de futebol, mas `família`, `porta`, `BH` (Belo
# Horizonte), `posto` e `nulo` existem — e num estudo de clubes brasileiros aparecem no sentido
# comum. A ambígua sem contexto técnico ao lado vira REVISAR, nunca PASSA silencioso.
PROIBIDAS_SEMPRE = ["rho", "silhueta", "jaccard", "garimpo"]
PROIBIDAS_AMBIGUAS = ["porta", "nulo", "familia", "bh", "posto"]
# O que confirma que a palavra está no sentido técnico. Procurado NA VIZINHANÇA, fora da própria
# palavra, para que "família" não confirme a si mesma.
CONTEXTO_TECNICO = ["teste", "5%", "benjamini", "correcao", "multiplo", "hipotese", "temporal",
                    "garimpo", "significan", "percentil", "amostra", "p-valor", "q-valor",
                    "falso positivo", "estatistic"]
JANELA_DE_CONTEXTO = 45
# d, q e p só contam coladas a um número, senão "de", "que" e "para" disparariam falso positivo.
UMA_LETRA = ["d", "q", "p"]

# Regra 7: a unidade quando o CSV da parte não a declara. A distinção importa porque A10 e J04
# compartilham 8 indicadores físicos e NÃO são duplicata: a unidade é outra.
UNIDADE_INFERIDA = {
    "A01": "clube-temporada", "A02": "clube-temporada", "A03": "clube-temporada",
    "A04": "clube-temporada", "A05": "clube-temporada", "A06": "clube-temporada",
    "A07": "clube-temporada", "A10": "clube-temporada", "A11": "clube-temporada",
    "A12": "clube-temporada", "A13": "clube-temporada", "A14": "clube-temporada",
    "J01": "jogador-temporada", "J02": "clube-temporada", "J03": "jogador-temporada",
    "J04": "jogador-temporada", "J07": "jogador-temporada", "J08": "liga-transferencia",
    "T01": "treinador-passagem", "T02": "treinador-passagem", "T03": "treinador-passagem",
    "T04": "treinador-passagem",
}

# Regra 3: unidades em que a fronteira G4/Z4 não existe. A fronteira é uma régua de posição na
# tabela: numa unidade liga-transferência não há 4º nem 17º colocado para tirar. A parte ainda
# precisa mostrar que rodou ALGUM corte de sensibilidade; sem nenhum, é REVISAR, não dispensa.
UNIDADES_SEM_FRONTEIRA = {"liga-transferencia"}

# Colunas de resultado do teste: tudo o que NÃO é identidade da linha. O que sobra identifica a
# comparação, e é por isso que se emparelham os dois cortes de fronteira (regra 3) e se procura o
# mesmo indicador em partes diferentes (regra 7).
PREFIXOS_DE_RESULTADO = ("n_", "cru_", "dif_", "ic95", "d_minimo", "pct_", "clubes_", "q_",
                         "selo", "poder", "passou", "porta_", "quantos_", "limiar_", "confianca")
NOMES_DE_RESULTADO = {"d", "p", "q", "nome", "medida_nome", "placar_redescrito", "regua_curta",
                      "consequencia_do_resultado", "abaixo_do_piso", "fator_pp", "dif_bruta"}

# Rótulos do corte, conferidos SEM acento, sem caixa e com espaço/hífen virando "_". São listas
# fechadas de propósito: "com_identidade_incoerente" (J08) e "sem_cobertura_baixa" (A10) são outros
# cortes de sensibilidade, não o corte da fronteira, e cair neles por prefixo seria pior que não
# reconhecer nada.
CORTE_COM = {"com", "com_fronteira", "com_os_de_fronteira", "principal", "todos", "todas",
             "completo", "completa", "base", "geral"}
CORTE_SEM = {"sem", "sem_fronteira", "sem_os_de_fronteira", "sem_times_de_fronteira",
             "sem_a_fronteira", "sem_as_fronteiras"}
BH = 0.05                                          # Benjamini-Hochberg a 5% (§6, ESPECIFICACAO.md)

# Um JSON com 4 mil níveis de aninhamento não derruba o portão: a caminhada tem fundo, e bater no
# fundo é relatado (falha fechada), não engolido.
LIMITE_DE_PROFUNDIDADE = 60


# ----------------------------------------------------------------------------------------------
# Utilidades
# ----------------------------------------------------------------------------------------------
def sem_acento(t, manter_caixa=False):
    t = unicodedata.normalize("NFD", str(t))
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return t if manter_caixa else t.lower()


def ler_texto(caminho):
    try:
        if caminho.is_dir():
            return None
        return caminho.read_text(encoding="utf-8-sig", errors="ignore")
    except Exception:
        return None


def ler_json(caminho):
    """(dados, erro). O erro é sempre dito: arquivo ilegível nunca vira {} silencioso."""
    try:
        if caminho.is_dir():
            return None, "é uma pasta, não um arquivo"
        texto = caminho.read_text(encoding="utf-8-sig")
    except FileNotFoundError:
        return None, "não existe"
    except Exception as e:
        return None, f"não deu para abrir ({type(e).__name__})"
    if not texto.strip():
        return None, "arquivo de 0 byte"
    try:
        return json.loads(texto), None
    except Exception as e:
        return None, f"não é JSON legível ({str(e)[:70]})"


def json_ou_nada(caminho):
    return ler_json(caminho)[0]


def ler_csv(caminho):
    """(linhas, erro). Lista vazia = existe e só tem cabeçalho, que NÃO é o mesmo que não existir."""
    try:
        if caminho.is_dir():
            return None, "é uma pasta, não um arquivo"
        with open(caminho, encoding="utf-8-sig", newline="") as f:
            leitor = csv.DictReader(f)
            if leitor.fieldnames is None:
                return None, "arquivo de 0 byte"
            return [l for l in leitor], None
    except FileNotFoundError:
        return None, "não existe"
    except Exception as e:
        return None, f"não deu para ler ({type(e).__name__})"


def plural(n, um, varios):
    return f"{n} {um if n == 1 else varios}"


def numero(t):
    if isinstance(t, bool):
        return None
    try:
        return float(t)
    except (TypeError, ValueError):
        return None


def e_numero(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def andar(objeto, limite=LIMITE_DE_PROFUNDIDADE):
    """Percorre um JSON SEM recursão — 4 mil níveis não estouram a pilha. Devolve (caminho, nó,
    profundidade); quem chama vê pela profundidade quando a caminhada bateu no fundo."""
    pilha = [("", objeto, 0)]
    while pilha:
        caminho, o, prof = pilha.pop()
        yield caminho, o, prof
        if prof >= limite:
            continue
        if isinstance(o, dict):
            for k, v in o.items():
                pilha.append((f"{caminho}.{k}" if caminho else str(k), v, prof + 1))
        elif isinstance(o, list):
            for i, v in enumerate(o):
                pilha.append((f"{caminho}[{i}]", v, prof + 1))


def normalizar_rotulo(v):
    """“Sem Fronteira”, “sem fronteira”, “sem-fronteira” e “sem_fronteira” são o mesmo rótulo."""
    t = sem_acento(v or "").strip()
    return re.sub(r"[\s\-]+", "_", t)


def lado_do_corte(v):
    r = normalizar_rotulo(v)
    if r in CORTE_COM:
        return "com"
    if r in CORTE_SEM:
        return "sem"
    return None


def colunas_de_identidade(linha, coluna_corte):
    """As colunas que dizem QUAL comparação é esta, sem o corte e sem o resultado do teste."""
    fora = {coluna_corte} | NOMES_DE_RESULTADO
    return {k: (v or "").strip() for k, v in linha.items()
            if k and k not in fora and not k.startswith(PREFIXOS_DE_RESULTADO)}


def identidade(linha, coluna_corte):
    return tuple(sorted(colunas_de_identidade(linha, coluna_corte).items()))


def nome_do_indicador(linha):
    return (linha.get("indicador") or linha.get("alvo") or "").strip()


def chave_curta(linha, coluna_corte):
    """A identidade reduzida ao essencial, para reencontrar o par quando uma coluna qualquer
    (um carimbo de data, um `obs`) muda entre os dois cortes e separa a chave cheia."""
    ident = colunas_de_identidade(linha, coluna_corte)
    return (nome_do_indicador(linha), ident.get("comparacao", ""), ident.get("familia", ""),
            (linha.get("nome") or "").strip())


def coluna_de_corte(linhas):
    for nome in ("fronteira", "corte"):
        if linhas and nome in linhas[0]:
            return nome
    return None


class Achado:
    def __init__(self, regra, titulo, veredito, motivo, evidencia=None):
        self.regra = regra
        self.titulo = titulo
        self.veredito = veredito
        self.motivo = motivo
        self.evidencia = evidencia or []

    def como_dict(self):
        return {"regra": self.regra, "titulo": self.titulo, "veredito": self.veredito,
                "motivo": self.motivo, "evidencia": self.evidencia}


# ----------------------------------------------------------------------------------------------
# A parte: tudo o que o portão precisa ler de uma vez
# ----------------------------------------------------------------------------------------------
class Parte:
    def __init__(self, pid):
        self.id = pid
        self.json_path = RESULTADOS / f"{pid}.json"
        self.problemas = []           # defeito de forma: cada um sozinho já é REPROVA

        dados, erro = ler_json(self.json_path)
        if erro:
            self.problemas.append(f"{pid}.json: {erro}")
            dados = {}
        elif not isinstance(dados, dict):
            self.problemas.append(f"{pid}.json: o topo do arquivo é "
                                  f"{type(dados).__name__}, e a parte tem de ser um objeto")
            dados = {}
        self.dados = dados

        self.conclusoes = []
        cru = dados.get("conclusoes")
        if "conclusoes" not in dados:
            self.problemas.append(f"{pid}.json não tem o campo `conclusoes`")
        elif not isinstance(cru, list):
            self.problemas.append(f"{pid}.json: `conclusoes` é {type(cru).__name__}, "
                                  "e tem de ser uma lista")
        elif not cru:
            self.problemas.append(f"{pid}.json não publica conclusão nenhuma")
        else:
            for i, c in enumerate(cru):
                if isinstance(c, dict):
                    self.conclusoes.append(c)
                else:
                    self.problemas.append(f"{pid}.json: conclusoes[{i}] é "
                                          f"{type(c).__name__}, e tem de ser um objeto")

        self.numeros = dados.get("numeros", {})
        if not isinstance(self.numeros, dict):
            self.problemas.append(f"{pid}.json: `numeros` é {type(self.numeros).__name__}, "
                                  "e tem de ser um mapa de marcador para valor")
            self.numeros = {}

        self.testes_path = RESULTADOS / f"{pid}_testes.csv"
        self.testes, self.erro_testes = ler_csv(self.testes_path)
        self.resumo = json_ou_nada(RESULTADOS / f"{pid}_resumo.json")
        self.saida_path = RESULTADOS / f"{pid}_numeros.json"   # a saída que o script deveria gravar
        self.md_path = RESULTADOS / f"{pid}.md"

    # -- texto -----------------------------------------------------------------------------
    def render(self, texto):
        """O texto como a tela mostra: com os marcadores trocados pelos valores de `numeros`.
        Marcador sem valor fica como {marcador} — e assim aparece no relatório, que é o certo."""
        if not isinstance(texto, str):
            return ""
        def troca(m):
            v = self.numeros.get(m.group(1))
            return m.group(0) if v is None else str(v)
        return re.sub(r"\{([A-Za-z_][A-Za-z0-9_]*)\}", troca, texto)

    def cru(self, conclusao, campos):
        return " ".join(str(conclusao.get(c) or "") for c in campos)

    def marcadores_do_texto(self):
        usados = set()
        for c in self.conclusoes:
            for campo in ("manchete", "o_que_vimos", "para_o_santa_cruz", "confianca_motivo",
                          "n", "premissa_motivo"):
                v = c.get(campo)
                if isinstance(v, str):
                    usados |= set(re.findall(r"\{([A-Za-z_][A-Za-z0-9_]*)\}", v))
        return usados

    def textos_das_conclusoes(self):
        """(id, texto renderizado) de cada conclusão, separados — a regra 3 precisa saber se a
        palavra “fronteira” e o indicador estão na MESMA conclusão, e não espalhados pela parte."""
        saida = []
        for c in self.conclusoes:
            t = " ".join(self.render(c.get(campo) or "")
                         for campo in ("manchete", "o_que_vimos", "para_o_santa_cruz",
                                       "confianca_motivo", "n", "prova"))
            saida.append((c.get("id") or "?", t))
        return saida

    # -- scripts ---------------------------------------------------------------------------
    def script_proprio(self):
        return SCRIPTS / f"{self.id}.py"

    def scripts_do_gerado_por(self):
        """Só os que o `gerado_por` cita. NÃO entram no lugar do scripts/<ID>.py: citar script
        alheio não satisfaz uma regra que fala do script da parte."""
        achados = []
        for t in re.findall(r"[\w./-]+\.py", str(self.dados.get("gerado_por") or "")):
            p = achar_script(t)
            if p and p not in achados:
                achados.append(p)
        return achados

    # -- testes ----------------------------------------------------------------------------
    def rotulos_do_corte(self):
        if not self.testes:
            return None, set()
        col = coluna_de_corte(self.testes)
        if col is None:
            return None, set()
        return col, {(l.get(col) or "").strip() for l in self.testes}

    def linhas_do_corte(self, lado="com"):
        """As linhas da tabela inteira (ou as do corte sem fronteira). Devolve None quando a
        coluna de corte existe mas nenhum rótulo dela foi reconhecido — “não entendi” não pode
        ser respondido como “nenhuma linha passou”."""
        if not self.testes:
            return []
        col = coluna_de_corte(self.testes)
        if col is None:
            return list(self.testes) if lado == "com" else []
        linhas = [l for l in self.testes if lado_do_corte(l.get(col)) == lado]
        if not linhas and not any(lado_do_corte(l.get(col)) for l in self.testes):
            return None
        return linhas

    def passou_no_bh(self, linhas=None):
        """Linhas que passam no BH a 5% dentro da família (a coluna q já é o q da família).

        q = 0 é o resultado mais forte que um teste pode dar: tem de contar como passou. O código
        antigo fazia `numero(q) or 1.0`, e em Python 0.0 é falsy — 17 indicadores reais do estudo
        (A03, A10, J08) eram lidos como reprovados."""
        if linhas is None:
            linhas = self.linhas_do_corte("com")
        if linhas is None:
            return None
        passaram = []
        for l in linhas:
            q = numero(l.get("q"))
            if q is not None and q < BH:
                passaram.append(l)
        return passaram


# ----------------------------------------------------------------------------------------------
# A porta temporal (§6.4): indicador do 1º turno contra os PONTOS do 2º, com parcial
# ----------------------------------------------------------------------------------------------
# Bloco que confessa não ter rodado. "parcial_nao_rodou: null" com "passa: true" ao lado é
# autodeclaração, e autodeclaração é exatamente o que o portão existe para recusar.
RE_AUTODECLARACAO = re.compile(r"nao (calcul|rod|test|confer|apur)|assumi|assumin|supo[sn]|"
                               r"nao foi (calcul|rod)|pendente|a fazer|por fazer")


def partes_com_porta_divergente():
    """Partes que o _porta_temporal.json registra como tendo rodado OUTRA coisa no lugar da §6.4."""
    d = json_ou_nada(RESULTADOS / "_porta_temporal.json")
    if not isinstance(d, dict):
        return {}, False
    metodo = d.get("metodo")
    div = (metodo.get("divergencia_entre_as_partes") if isinstance(metodo, dict) else None) or {}
    if not isinstance(div, dict):
        return {}, True
    return {k: v for k, v in div.items() if isinstance(k, str) and re.fullmatch(r"[AJT]\d\d", k)}, True


def procurar_porta_que_passa(bloco):
    """Assinatura da §6.4 dentro de um bloco `porta_*`: uma parcial COM NÚMERO e um passa/passou
    verdadeiro, sem o próprio bloco confessar que não rodou.

    Registrar a porta não basta: o bloco tem de dizer que ELA SUSTENTA o indicador, e tem de
    trazer o valor da parcial. Uma chave chamada `parcial_nao_rodou` valendo null satisfazia a
    versão antiga — a porta virava uma palavra. Persistência (o indicador do 1º turno contra ele
    mesmo no 2º) não tem parcial e não conta: é o `rho_persist` que a §6.5 aposentou em 15/09."""
    achados, negados, bateu_no_fundo = [], [], False
    for caminho, o, prof in andar(bloco):
        if prof >= LIMITE_DE_PROFUNDIDADE:
            bateu_no_fundo = True
        if not isinstance(o, dict):
            continue
        parciais = [(k, v) for k, v in o.items() if "parcial" in sem_acento(k)]
        passa = any(sem_acento(k) in ("passa", "passou") and v is True for k, v in o.items())
        if not parciais or not passa:
            continue
        onde = caminho or "(raiz)"
        if not any(e_numero(v) for _, v in parciais):
            negados.append(f"{onde}: a chave de parcial não traz número "
                           f"({', '.join(k for k, _ in parciais)}) — não é porta, é rótulo")
            continue
        confissao = [v for v in o.values()
                     if isinstance(v, str) and RE_AUTODECLARACAO.search(sem_acento(v))]
        if confissao:
            negados.append(f"{onde}: o próprio bloco diz que não rodou — “{confissao[0][:70]}”")
            continue
        achados.append(onde)
    return achados, negados, bateu_no_fundo


def conferir_porta(parte, divergentes):
    """Devolve (tem_porta, motivo, evidencia). Sem porta conferível é NÃO TEM — falha fechada."""
    if parte.id in divergentes:
        return False, ("a porta que a parte rodou não é a da §6.4: "
                       f"{divergentes[parte.id]}"), [f"_porta_temporal.json, metodo.divergencia_entre_as_partes.{parte.id}"]
    blocos = {k: v for k, v in (parte.resumo or {}).items()
              if isinstance(k, str) and sem_acento(k).startswith("porta")} if isinstance(parte.resumo, dict) else {}
    # O _porta_temporal.json ainda não guarda resultado POR PARTE; quando guardar, entra aqui.
    geral = json_ou_nada(RESULTADOS / "_porta_temporal.json")
    por_parte = geral.get("partes") if isinstance(geral, dict) else None
    if isinstance(por_parte, dict) and parte.id in por_parte:
        blocos[f"_porta_temporal.json:{parte.id}"] = por_parte[parte.id]
    if not blocos:
        return False, "não há bloco `porta_*` no resumo nem registro da parte em _porta_temporal.json", []
    recusados, fundo = [], False
    for nome, bloco in blocos.items():
        onde, negados, bateu = procurar_porta_que_passa(bloco)
        fundo = fundo or bateu
        recusados += [f"{parte.id}_resumo.json → {nome}.{n}" for n in negados]
        if onde:
            return True, f"porta da §6.4 registrada e sustentada em {nome}", [f"{parte.id}_resumo.json → {o}" for o in onde[:3]]
    motivo = ("há bloco `porta_*`, mas nenhuma entrada com parcial numérica e `passa` verdadeiro — "
              "registrar a porta não é passar nela")
    if fundo:
        motivo += f"; o bloco passa de {LIMITE_DE_PROFUNDIDADE} níveis e não foi lido até o fim"
    return False, motivo, ([f"{parte.id}_resumo.json → {n}" for n in blocos] + recusados)[:6]


# ----------------------------------------------------------------------------------------------
# Regra 1 — todo marcador publicado consta na saída do próprio script, COM O MESMO VALOR
# ----------------------------------------------------------------------------------------------
# Número que aparece cravado no texto, sem passar por marcador, é número digitado à mão — é assim
# que se foge da regra 1 sem publicar marcador nenhum. Estes trechos não são medida: ano, posição
# ordinal, G4/Z4, Série B, top-8.
RE_NAO_E_MEDIDA = re.compile(
    r"\{[^}]*\}"
    r"|§\s*\d+(?:\.\d+)*"             # §7.2(b): referência de seção, não medida
    r"|\betapa\s+\d+"
    r"|\b(?:19|20)\d\d\b"
    r"|\d+\s*[ºª°]"
    r"|\b[gz]\s?[1-9]\b"
    r"|\btop[ -]?\d+\b"
    r"|\bsub[ -]?\d+\b"
    r"|\bserie\s+[a-d]\b"
    r"|\b\d+\s*x\s*\d+\b", re.I)


def numeros_cravados(texto):
    """(decimais, inteiros) digitados direto no texto, fora de marcador."""
    limpo = RE_NAO_E_MEDIDA.sub(" ", sem_acento(texto))
    decimais = re.findall(r"\d+[.,]\d+", limpo)
    inteiros = re.findall(r"(?<![\d.,])\d+(?![\d.,])", limpo)
    return decimais, inteiros


def casas_decimais(v):
    t = str(v).strip().replace(",", ".")
    return len(t.split(".", 1)[1]) if "." in t else 0


def mesmo_valor(do_script, publicado):
    if isinstance(do_script, bool) or isinstance(publicado, bool):
        return do_script is publicado
    a, b = numero(do_script), numero(publicado)
    if a is not None and b is not None:
        return abs(a - b) <= 1e-9
    if isinstance(do_script, (list, dict)) or isinstance(publicado, (list, dict)):
        return do_script == publicado
    return str(do_script).strip() == str(publicado).strip()


def saida_mais_velha_que_o_script(parte):
    """A única pista de PRODUÇÃO que se lê sem executar nada: a ordem no relógio. Não prova que o
    número saiu do dado — prova que a saída não saiu da versão do script que está no disco."""
    try:
        quando = parte.saida_path.stat().st_mtime
    except OSError:
        return []
    velhos = []
    for p in [parte.script_proprio()] + parte.scripts_do_gerado_por():
        try:
            if p.exists() and p.stat().st_mtime > quando + 1:
                velhos.append(f"{p.name} é mais novo que {parte.saida_path.name}")
        except OSError:
            continue
    return velhos


def so_arredondou(do_script, publicado):
    a, b = numero(do_script), numero(publicado)
    if a is None or b is None:
        return False
    return round(a, casas_decimais(publicado)) == b


def regra_1(parte, contexto):
    titulo = "Todo marcador de numeros consta na saída do próprio script, com o mesmo valor"
    digitados = contexto["digitados_a_mao"].get(parte.id, [])
    conferencia = ([f"conferência do portão: a auditoria de 19/09 aponta "
                    f"{plural(len(digitados), 'marcador digitado', 'marcadores digitados')} à mão "
                    f"nesta parte (_robustez_19_09.json, partes.{parte.id}.digitados_a_mao)"]
                   if digitados else [])

    # Número cravado no texto foge da regra inteira: sem marcador não há o que conferir.
    cravados_dec, cravados_int = [], []
    for c in parte.conclusoes:
        cid = c.get("id") or "?"
        for campo in ("manchete", "o_que_vimos"):
            dec, inte = numeros_cravados(parte.cru(c, [campo]))
            cravados_dec += [f"{cid} · {campo}: {d}" for d in dec]
            cravados_int += [f"{cid} · {campo}: {i}" for i in inte]
    if cravados_dec:
        return Achado(1, titulo, REPROVA,
                      f"{plural(len(cravados_dec), 'número medido está cravado', 'números medidos estão cravados')}"
                      " no texto, sem marcador: nada a conferir contra a saída do script",
                      cravados_dec[:10] + (["…"] if len(cravados_dec) > 10 else []) + conferencia)

    if not parte.saida_path.exists():
        return Achado(1, titulo, REPROVA,
                      "o script não declara a saída: nenhum script grava os números que a parte publica",
                      [f"falta {parte.saida_path.relative_to(RAIZ)}",
                       f"{len(parte.numeros)} marcadores em {parte.id}.json.numeros e "
                       f"{len(parte.marcadores_do_texto())} usados no texto, nenhum conferível"] + conferencia)
    saida, erro = ler_json(parte.saida_path)
    if erro:
        return Achado(1, titulo, REPROVA, f"a saída do script não é legível: {erro}",
                      [str(parte.saida_path.relative_to(RAIZ))] + conferencia)
    if isinstance(saida, dict) and isinstance(saida.get("numeros"), dict):
        saida = saida["numeros"]
    if not isinstance(saida, dict):
        return Achado(1, titulo, REPROVA,
                      f"a saída do script é {type(saida).__name__} e tem de ser um mapa de "
                      "marcador para VALOR: uma lista de nomes declara o nome e esconde o número",
                      [f"{parte.saida_path.name}: {str(saida)[:80]}"] + conferencia)

    declarados = set(saida)
    publicados = set(parte.numeros) | parte.marcadores_do_texto()
    faltam = sorted(publicados - declarados)
    if faltam:
        return Achado(1, titulo, REPROVA,
                      f"{len(faltam)} de {len(publicados)} marcadores publicados não saem do script",
                      [f"ausentes de {parte.saida_path.name}: " + ", ".join(faltam[:12])
                       + (" …" if len(faltam) > 12 else "")] + conferencia)
    if not publicados:
        return Achado(1, titulo, REPROVA,
                      "a parte não publica marcador nenhum: não há número por marcador para conferir",
                      [f"{parte.id}.json.numeros está vazio e o texto não usa marcador"] + conferencia)

    # O coração da regra: o VALOR publicado tem de ser o valor que o script gravou.
    diferentes, arredondados = [], []
    for m in sorted(publicados):
        if m not in parte.numeros:
            continue                      # marcador usado no texto e sem valor publicado: regra 1 já cobriu
        pub, cal = parte.numeros[m], saida[m]
        if mesmo_valor(cal, pub):
            continue
        if so_arredondou(cal, pub):
            arredondados.append(f"{m}: script {cal}, publicado {pub}")
        else:
            diferentes.append(f"{m}: o script grava {cal!r} e a parte publica {pub!r}")
    if diferentes:
        return Achado(1, titulo, REPROVA,
                      plural(len(diferentes), "marcador publica valor diferente",
                             "marcadores publicam valor diferente") + " do que o script gravou",
                      diferentes[:10] + (["…"] if len(diferentes) > 10 else []) + conferencia)
    if arredondados:
        return Achado(1, titulo, REVISAR,
                      f"{plural(len(arredondados), 'marcador foi arredondado', 'marcadores foram arredondados')}"
                      " entre a saída do script e o que a parte publica",
                      arredondados[:10] + conferencia)
    # O portão não roda o script, então a única pista de que a saída veio DAQUELE script é a
    # ordem no relógio: saída mais velha que o script é saída que não saiu da versão que está lá.
    velha = saida_mais_velha_que_o_script(parte)
    if velha:
        return Achado(1, titulo, REVISAR,
                      "os valores conferem, mas a saída dos números é mais antiga que o script "
                      "que a declara: ou o script mudou depois, ou a saída não veio dele",
                      velha + conferencia)
    extra = ([f"{plural(len(cravados_int), 'inteiro cravado', 'inteiros cravados')} no texto, "
              "fora de marcador: " + ", ".join(cravados_int[:6])] if cravados_int else [])
    if cravados_int:
        return Achado(1, titulo, REVISAR,
                      "os marcadores conferem, mas o texto ainda traz inteiro digitado à mão "
                      "(pode ser contagem legítima — confira)",
                      extra + conferencia)
    return Achado(1, titulo, PASSA,
                  f"{plural(len(publicados), 'marcador publicado consta', 'marcadores publicados constam')}"
                  f" de {parte.saida_path.name} com o mesmo valor",
                  conferencia)


# ----------------------------------------------------------------------------------------------
# Regra 2 — a confiança é recalculada do testes.csv, nunca lida do JSON
# ----------------------------------------------------------------------------------------------
NIVEL = {"firme": 3, "provavel": 2, "indicio": 1}
NOME_DO_NIVEL = {3: "firme", 2: "provável", 1: "indício"}


def nucleo_do_nome(nome):
    """“Toques na área por jogo” → “toques na area”: o texto de reunião corta o rabo da unidade."""
    n = sem_acento(nome)
    n = re.sub(r"\(.*?\)", " ", n)
    n = re.split(r"\bpor\s+(jogo|90|30|minuto)", n)[0]
    n = n.replace(", %", " ").replace("%", " ")
    return " ".join(n.split())


def radical(t):
    """Tira o plural de cada palavra dos dois lados da comparação: a tabela diz “Gols de bola
    parada” e a manchete diz “mais gol de bola parada”."""
    return re.sub(r"(\w)s\b", r"\1", t)


# Como o texto do estudo DIZ a ressalva do corte de fronteira — acrescentado em 20/09.
#
# Até aqui esta regra procurava a palavra "fronteira" e só ela. Mas "times de fronteira" é
# vocabulário de método, e a passada de texto de 20/09 trocou-o de propósito por "times colados na
# linha" no que o leitor vê — a ressalva continuou no texto, escrita em português de reunião, e a
# regra passou a não achá-la. Procurar uma grafia só transformava uma decisão de escrita em
# reprovação de análise.
#
# A lista é FECHADA e cada entrada nomeia o corte, nunca um recorte qualquer: "recorte" sozinho
# também serve para subamostra (cobertura física, identidade marcada) e deixaria a regra passar por
# uma ressalva que não é esta.
MODOS_DE_DIZER_FRONTEIRA = ("fronteira", "colados na linha", "colado na linha",
                            "colada na linha", "coladas na linha", "nos dois recortes",
                            "nos dois cortes", "troca de recorte", "troca de corte",
                            "num recorte so", "num corte so", "sem os times colados",
                            "quando esses times saem")


def fala_do_corte(texto):
    """O texto carrega a ressalva dos dois cortes, em qualquer das grafias da casa?"""
    return any(radical(sem_acento(m)) in texto for m in MODOS_DE_DIZER_FRONTEIRA)


def apelidos_declarados(pid):
    """Os apelidos que a PARTE declara para cada indicador, em <ID>_indicadores.json.

    Acrescentado em 20/09. A tabela de testes nomeia o indicador como a base o nomeia
    (`distance_p90`, “Distância por 90 min (m)”) e o texto de reunião o nomeia como o clube fala
    (“corre menos”, “velocidade de pico”). Sem ponte entre os dois, a regra 3 não conseguia ver
    que a conclusão CITAVA a discordância dos cortes, e reprovava texto correto.

    A ponte é DADO, não código: mora na lista pré-declarada da parte, um campo `apelidos` por
    indicador, e por isso pode ser auditada linha a linha como o resto da lista. O portão não
    inventa apelido nenhum — sem o campo, nada muda.
    """
    d = json_ou_nada(RESULTADOS / f"{pid}_indicadores.json")
    fora = collections.defaultdict(set)
    if not isinstance(d, dict):
        return fora
    for _, o, _ in andar(d):
        if not isinstance(o, dict):
            continue
        ident = o.get("id") or o.get("indicador") or o.get("coluna")
        apelidos = o.get("apelidos")
        if isinstance(ident, str) and isinstance(apelidos, list):
            fora[ident] |= {radical(sem_acento(str(a).lower())) for a in apelidos if str(a).strip()}
    return fora


def apelidos_da_linha(linha, declarados=None):
    """Como o texto de reunião pode chamar o indicador desta linha."""
    nomes = set()
    for campo in ("indicador", "alvo", "nome", "medida_nome"):
        v = (linha.get(campo) or "").strip()
        if not v:
            continue
        nomes.add(nucleo_do_nome(v.replace("_", " ")))
    fora = {radical(n) for n in nomes if len(n) >= 5}
    if declarados:
        for campo in ("indicador", "alvo", "id"):
            fora |= declarados.get((linha.get(campo) or "").strip(), set())
    return fora


def linhas_que_sustentam(texto_da_conclusao, linhas, declarados=None):
    """As linhas de teste que a conclusão de fato cita, pelo nome do indicador.

    Os apelidos DECLARADOS pela parte entram aqui pelo mesmo motivo que entram na regra 3: a
    tabela nomeia a medida como a base a nomeia e o texto a nomeia como o clube fala.
    """
    plano = radical(sem_acento(texto_da_conclusao))
    return [l for l in linhas if any(a in plano for a in apelidos_da_linha(l, declarados))]


def regra_2(parte, contexto):
    titulo = "A confiança recalculada do testes.csv (firme = BH a 5% E porta temporal)"
    declaradas = [(c.get("id") or "?", sem_acento(c.get("confianca") or "indicio"))
                  for c in parte.conclusoes]
    acima_de_indicio = [i for i, n in declaradas if NIVEL.get(n, 1) > 1]

    if parte.testes is None:
        if acima_de_indicio:
            return Achado(2, titulo, REPROVA,
                          "sem <ID>_testes.csv nenhuma conclusão pode ser firme nem provável, "
                          f"e {plural(len(acima_de_indicio), 'conclusão passa', 'conclusões passam')} disso",
                          [f"{parte.testes_path.name}: {parte.erro_testes}",
                           "acima do teto: " + ", ".join(acima_de_indicio)])
        return Achado(2, titulo, PASSA,
                      "a parte não roda teste: o teto recalculado é indício, e nenhuma conclusão passa disso",
                      [f"{parte.testes_path.name}: {parte.erro_testes}"])
    if not parte.testes:
        if acima_de_indicio:
            return Achado(2, titulo, REPROVA,
                          "a tabela de testes existe mas não tem uma linha de dado: nada sustenta "
                          f"{plural(len(acima_de_indicio), 'conclusão acima de indício', 'conclusões acima de indício')}",
                          [f"{parte.testes_path.name}: só o cabeçalho",
                           "acima do teto: " + ", ".join(acima_de_indicio)])
        return Achado(2, titulo, PASSA, "tabela de testes sem linha de dado, e nenhuma conclusão "
                      "passa de indício", [f"{parte.testes_path.name}: só o cabeçalho"])

    linhas = parte.linhas_do_corte("com")
    tem_porta, motivo_porta, ev_porta = conferir_porta(parte, contexto["divergentes"])
    if linhas is None:
        col, valores = parte.rotulos_do_corte()
        return Achado(2, titulo, REVISAR,
                      "não reconheci nenhum rótulo da coluna de corte, então NÃO recalculei o teto "
                      "— o portão não sabe quais linhas são a tabela inteira (a regra 3 reprova "
                      "pelo mesmo motivo)",
                      [f"{parte.testes_path.name}, coluna {col}: {sorted(valores)}",
                       "rótulos que o portão conhece para a tabela inteira: " + ", ".join(sorted(CORTE_COM)),
                       f"porta temporal: {motivo_porta}"])

    passaram = parte.passou_no_bh(linhas)
    tem_bh = len(passaram) > 0
    teto = 3 if (tem_bh and tem_porta) else (2 if (tem_bh or tem_porta) else 1)
    evidencia = [f"{len(passaram)} de {len(linhas)} indicadores com q < {BH} em "
                 f"{parte.testes_path.name} (corte com fronteira)", f"porta temporal: {motivo_porta}"] + ev_porta

    # O teto da PARTE é o limite de cima; abaixo dele, cada conclusão responde pelos indicadores
    # que ELA cita. Era por aqui que uma parte com um único indicador no BH carimbava "firme" em
    # três conclusões, inclusive na que falava de um indicador reprovado.
    ids_passaram = {id(l) for l in passaram}
    acima, sem_amarra = [], []
    for c in parte.conclusoes:
        cid = c.get("id") or "?"
        nivel = NIVEL.get(sem_acento(c.get("confianca") or "indicio"), 1)
        if nivel <= 1:
            continue
        if nivel > teto:
            acima.append(f"{cid} diz {NOME_DO_NIVEL.get(nivel, '?')}, e o teto da parte é "
                         f"{NOME_DO_NIVEL[teto]}")
            continue
        texto = " ".join(t for i, t in parte.textos_das_conclusoes() if i == cid)
        suas = linhas_que_sustentam(texto, linhas, apelidos_declarados(parte.id))
        if not suas:
            if len(passaram) < len(linhas):
                sem_amarra.append(f"{cid} diz {NOME_DO_NIVEL.get(nivel, '?')} e não nomeia "
                                  "indicador nenhum: não dá para saber se o que a sustenta passou")
            continue
        se_passou = [l for l in suas if id(l) in ids_passaram]
        if not se_passou:
            teto_c = 2 if tem_porta else 1
            if nivel > teto_c:
                quais = sorted({nome_do_indicador(l) or "?" for l in suas})[:4]
                acima.append(f"{cid} diz {NOME_DO_NIVEL.get(nivel, '?')}, mas nenhum indicador que "
                             f"ela cita passou no BH ({', '.join(quais)}): o teto dela é "
                             f"{NOME_DO_NIVEL[teto_c]}")

    if acima:
        return Achado(2, titulo, REPROVA,
                      f"{plural(len(acima), 'conclusão passa do teto recalculado', 'conclusões passam do teto recalculado')}",
                      acima + evidencia)
    if sem_amarra:
        return Achado(2, titulo, REVISAR,
                      f"{plural(len(sem_amarra), 'conclusão está dentro do teto da parte', 'conclusões estão dentro do teto da parte')}"
                      " mas não dá para amarrá-la a um indicador que passou",
                      sem_amarra + evidencia)
    return Achado(2, titulo, PASSA,
                  f"nenhuma conclusão passa do teto recalculado ({NOME_DO_NIVEL[teto]})", evidencia)


# ----------------------------------------------------------------------------------------------
# Regra 3 — os dois cortes de fronteira existem e, quando discordam, o texto cita os dois
# ----------------------------------------------------------------------------------------------
def formatos_do_numero(v):
    """Como o mesmo número pode aparecer no texto: 0.805, 0,805, 0.81, 0,81."""
    x = numero(v)
    if x is None:
        return set()
    fs = {str(v).strip()}
    for casas in (2, 3):
        fs.add(f"{x:.{casas}f}")
    return {f for f in fs if f} | {f.replace(".", ",") for f in fs if f}


TROCA_DE_SINAL_FRACA = 0.2   # abaixo disto o sinal é ruído em volta do zero, não discordância


def emparelhar_os_cortes(linhas, col):
    """Junta cada linha do corte COM à sua gêmea do corte SEM.

    Duas passadas. A primeira usa a identidade cheia. A segunda pega o que sobrou e tenta de novo
    pela identidade curta (indicador × comparação × família × nome), aceitando só quando de cada
    lado sobrou exatamente uma linha — é assim que uma coluna a mais (um `rodada_execucao`, um
    `obs`) deixa de apagar o par. O que não emparelhar de jeito nenhum é RELATADO: a versão antiga
    fazia `continue` e ainda dizia “os dois cortes concordam em tudo”."""
    com = [l for l in linhas if lado_do_corte(l.get(col)) == "com"]
    sem = [l for l in linhas if lado_do_corte(l.get(col)) == "sem"]

    indice = {}
    for l in sem:
        indice.setdefault(identidade(l, col), []).append(l)
    pares, sobra_com = [], []
    for l in com:
        k = identidade(l, col)
        if indice.get(k):
            pares.append((l, indice[k].pop(0), []))
        else:
            sobra_com.append(l)
    sobra_sem = [l for v in indice.values() for l in v]

    if sobra_com and sobra_sem:
        curto = {}
        for l in sobra_sem:
            curto.setdefault(chave_curta(l, col), []).append(l)
        resto_com = []
        for l in sobra_com:
            k = chave_curta(l, col)
            candidatos = curto.get(k) or []
            if len(candidatos) == 1 and sum(1 for x in sobra_com if chave_curta(x, col) == k) == 1:
                b = candidatos.pop()
                a_id, b_id = colunas_de_identidade(l, col), colunas_de_identidade(b, col)
                diferem = sorted(c for c in set(a_id) | set(b_id)
                                 if a_id.get(c, "") != b_id.get(c, ""))
                pares.append((l, b, diferem))
            else:
                resto_com.append(l)
        sobra_com = resto_com
        sobra_sem = [l for v in curto.values() for l in v]
    return pares, sobra_com, sobra_sem


def declara_sem_testes(parte):
    """A parte pode DECLARAR, no campo `sem_testes` do topo, que não roda comparação nenhuma.

    Por que isto existe. A regra 3 é de falha fechada: sem `<ID>_testes.csv` ela reprova, porque
    ausência de prova não é prova. Só que há parte que legitimamente não compara faixa alguma — a
    de base monta a régua por contagem, a de coleta raspa e conta, a descritiva lista casos porque
    o próprio CLAUDE.md manda listar sem aplicar o critério. Reprovar essas por não terem tabela é
    burocracia com cara de rigor, e verificador que reprova o certo acaba ignorado.

    O QUE IMPEDE A DECLARAÇÃO DE VIRAR SAÍDA FÁCIL: ela é conferida contra a própria parte. Quem
    declara que não testa e publica conclusão apoiada em teste — que diz que algo “se sustenta”,
    que cita q ou BH, ou que carrega selo firme ou provável — está alegando duas coisas que não
    cabem juntas, e aí a reprovação volta, agora por contradição, que é pior que a ausência."""
    motivo = parte.dados.get("sem_testes")
    if not isinstance(motivo, str) or not motivo.strip():
        return None, []
    contra = []
    # A conferência é por SINAL INEQUÍVOCO, nunca por palavra no texto. Uma primeira versão
    # procurava “se sustenta”, “Benjamini” e “correção para múltiplos testes” na prosa, e reprovou
    # as quatro partes que declararam — porque as frases delas dizem justamente que aquilo NÃO se
    # aplica ali. É a armadilha que a regra 6 já tinha aprendido com “BH”, e casar prosa não
    # distingue a afirmação da negação dela.
    if parte.testes:
        contra.append(f"{parte.id}_testes.csv existe: a parte testa, e a declaração é falsa")
    for c in parte.conclusoes:
        conf = sem_acento(str(c.get("confianca") or ""))
        if conf in ("firme", "provavel"):
            contra.append(f"{c.get('id') or '?'}: selo “{c.get('confianca')}” exige teste, "
                          "e a parte declara que não roda nenhum")
    return motivo.strip(), contra


def regra_3(parte, contexto):
    titulo = "Os dois cortes de fronteira existem, e quando discordam o texto cita os dois"
    declarado, contradiz = declara_sem_testes(parte)
    if declarado and contradiz:
        return Achado(3, titulo, REPROVA,
                      "a parte declara que não roda comparação e publica conclusão que alega teste: "
                      "as duas coisas não cabem juntas",
                      contradiz + [f"sem_testes: “{declarado[:180]}”"])
    if declarado:
        return Achado(3, titulo, NAO_APLICAVEL,
                      "a parte declara que não compara faixas, e nenhuma conclusão dela alega teste",
                      [f"sem_testes: “{declarado[:180]}”"])
    unidade = UNIDADE_INFERIDA.get(parte.id, "")

    if parte.testes is None:
        if unidade in UNIDADES_SEM_FRONTEIRA:
            return Achado(3, titulo, NAO_APLICAVEL,
                          f"a fronteira G4/Z4 não existe na unidade {unidade}", [])
        return Achado(3, titulo, REPROVA,
                      "sem <ID>_testes.csv não há como provar que os dois cortes rodaram",
                      [f"{parte.testes_path.name}: {parte.erro_testes}"])
    if not parte.testes:
        return Achado(3, titulo, REPROVA,
                      "a tabela de testes não tem uma linha de dado: não há corte nenhum para conferir",
                      [f"{parte.testes_path.name}: só o cabeçalho"])
    col = coluna_de_corte(parte.testes)
    if col is None:
        colunas = list(parte.testes[0]) if parte.testes else []
        return Achado(3, titulo, REPROVA,
                      "a tabela de testes não tem coluna de corte: a robustez da fronteira não rodou",
                      [f"{parte.testes_path.name}: colunas {', '.join(colunas[:8]) or '(nenhuma)'}…"])
    valores = sorted({(l.get(col) or "").strip() for l in parte.testes})
    com = [v for v in valores if lado_do_corte(v) == "com"]
    sem = [v for v in valores if lado_do_corte(v) == "sem"]
    outros = [v for v in valores if lado_do_corte(v) is None]

    if not com and not sem:
        return Achado(3, titulo, REPROVA,
                      "não reconheci NENHUM rótulo de corte nesta coluna: não é que a fronteira "
                      "não separou — é que o portão não sabe qual linha é qual",
                      [f"{parte.testes_path.name}, coluna {col}: {valores}",
                       "rótulos conhecidos: " + ", ".join(sorted(CORTE_COM | CORTE_SEM))])
    if not sem:
        if unidade in UNIDADES_SEM_FRONTEIRA:
            if outros:
                return Achado(3, titulo, NAO_APLICAVEL,
                              f"a fronteira G4/Z4 não existe na unidade {unidade}, e a parte rodou "
                              f"{plural(len(outros), 'outro corte de sensibilidade', 'outros cortes de sensibilidade')}",
                              [f"{parte.testes_path.name}, coluna {col}: {valores}"])
            return Achado(3, titulo, REVISAR,
                          f"a fronteira G4/Z4 não existe na unidade {unidade}, mas a parte também "
                          "não rodou nenhum outro corte de sensibilidade no lugar dela",
                          [f"{parte.testes_path.name}, coluna {col}: {valores}"])
        return Achado(3, titulo, REPROVA, "só o corte com a fronteira rodou",
                      [f"{parte.testes_path.name}, coluna {col}: valores {valores}"])
    if not com:
        return Achado(3, titulo, REPROVA, "só o corte sem a fronteira rodou",
                      [f"{parte.testes_path.name}, coluna {col}: valores {valores}"])

    declarados = apelidos_declarados(parte.id)
    pares, sobra_com, sobra_sem = emparelhar_os_cortes(parte.testes, col)
    textos = [(cid, radical(sem_acento(t))) for cid, t in parte.textos_das_conclusoes()]
    texto_todo = "\n".join(t for _, t in textos)

    discordam, reprovam, revisam, colunas_que_variam = [], [], [], set()
    for a, b, diferem in pares:
        colunas_que_variam |= set(diferem)
        qa, qb = numero(a.get("q")), numero(b.get("q"))
        da, db = numero(a.get("d")), numero(b.get("d"))
        # Célula em branco de um lado NÃO é concordância: é resultado que o corte não publicou.
        falta_dado = (qa is None) != (qb is None) or (da is None) != (db is None)
        troca_selo = qa is not None and qb is not None and (qa < BH) != (qb < BH)
        troca_sinal = da is not None and db is not None and da * db < 0
        if not (troca_selo or troca_sinal or falta_dado):
            continue
        ind = nome_do_indicador(a) or nome_do_indicador(b) or "?"
        comp = a.get("comparacao") or ""
        if falta_dado:
            motivo = "um dos cortes não publicou o resultado (célula em branco)"
        elif troca_selo:
            motivo = "passa num corte e não no outro"
        else:
            motivo = "troca de sinal entre os cortes"
        # Troca de sinal que não obriga o texto a nada — vai para REVISAR, não para REPROVA, e
        # continua impressa no relatório. Dois casos:
        #   perto de zero: o d de um dos lados é ruído;
        #   nenhum dos dois cortes separa: os dois dizem a mesma coisa ("sem diferença clara") e o
        #     que virou foi o sinal de uma NÃO-diferença. Não há resultado publicado de um lado
        #     para o texto ressalvar do outro. O aviso continua valendo — estimativa instável, n
        #     pequeno — e é por isso que ele não some do relatório, só deixa de reprovar.
        # Com falta_dado, d ou q vêm vazios de um dos lados: nada a classificar.
        comparavel = not falta_dado and not troca_selo
        perto_de_zero = comparavel and min(abs(da), abs(db)) < TROCA_DE_SINAL_FRACA
        sem_achado = comparavel and qa >= BH and qb >= BH
        fraca = perto_de_zero or sem_achado
        rotulo = (f"{ind}{' (' + comp + ')' if comp else ''}: {motivo} "
                  f"(q {qa} × {qb}, d {da} × {db})" + (" [perto de zero]" if fraca and perto_de_zero
                                              else " [nenhum dos dois cortes separa]" if fraca else "")
                  + (f" [emparelhado apesar de {', '.join(diferem)}]" if diferem else ""))
        discordam.append(rotulo)

        apelidos = apelidos_da_linha(a, declarados) | apelidos_da_linha(b, declarados)
        cita_numero = (any(f in texto_todo for f in formatos_do_numero(a.get("d")))
                       and any(f in texto_todo for f in formatos_do_numero(b.get("d"))))
        if cita_numero:
            continue
        # A frase de praxe ("rodamos também sem os times de fronteira") não vale sozinha: a
        # fronteira e o indicador têm de aparecer NA MESMA conclusão, senão uma palavra solta
        # desarmava a regra para a parte inteira.
        amarrada = any(fala_do_corte(t) and any(x in t for x in apelidos) for _, t in textos)
        if amarrada or fraca:
            revisam.append(rotulo)
        else:
            reprovam.append(rotulo)

    resumo = [f"{plural(len(pares), 'comparação emparelhada', 'comparações emparelhadas')} "
              f"nos dois cortes, {len(discordam)} discordam"]
    if colunas_que_variam:
        resumo.append("colunas que mudam entre os cortes e quase apagaram o par: "
                      + ", ".join(sorted(colunas_que_variam)))
    if outros:
        resumo.append(f"outros cortes na mesma coluna (não conferidos por esta regra): {outros}")
    if sobra_com or sobra_sem:
        resumo.append(f"{len(sobra_com)} linhas do corte com e {len(sobra_sem)} do corte sem NÃO "
                      "emparelharam: os dois cortes não rodaram a mesma tabela")
        exemplos = [f"só com: {nome_do_indicador(l) or '?'} "
                    f"({a_ou_b(l, col)})" for l in sobra_com[:3]]
        exemplos += [f"só sem: {nome_do_indicador(l) or '?'} ({a_ou_b(l, col)})" for l in sobra_sem[:3]]
        resumo += exemplos

    if reprovam:
        return Achado(3, titulo, REPROVA,
                      f"{plural(len(reprovam), 'discordância que o texto não cita', 'discordâncias que o texto não cita')}",
                      resumo + reprovam[:8] + (["…"] if len(reprovam) > 8 else []))
    if sobra_com or sobra_sem:
        return Achado(3, titulo, REVISAR,
                      "há linha sem par entre os dois cortes: não dá para afirmar que eles concordam",
                      resumo)
    if revisam:
        return Achado(3, titulo, REVISAR,
                      f"{len(revisam)} discordâncias em que o texto fala de fronteira mas não "
                      "amarra o indicador: conferir à mão",
                      resumo + revisam[:8] + (["…"] if len(revisam) > 8 else []))
    if discordam:
        return Achado(3, titulo, PASSA,
                      f"{plural(len(discordam), 'discordância está citada', 'discordâncias estão citadas')}"
                      " no texto", resumo)
    return Achado(3, titulo, PASSA, "os dois cortes rodaram e concordam em tudo", resumo)


def a_ou_b(linha, col):
    ident = colunas_de_identidade(linha, col)
    return ", ".join(f"{k}={v}" for k, v in sorted(ident.items()) if v)[:90] or "sem identidade"


# ----------------------------------------------------------------------------------------------
# Regra 4 — o campo prova aponta para algo que existe e não está vazio
# ----------------------------------------------------------------------------------------------
def achar_arquivo(token):
    for base in (RESULTADOS, ESTUDO, SCRIPTS, RAIZ, RAIZ / "_fonte", PROTOTIPO, RAIZ / "dados"):
        p = base / token
        if p.exists() and p.is_file():
            return p
    return None


RE_COMENTARIO_HTML = re.compile(r"<!--.*?-->", re.S)


def esta_vazio(caminho):
    """Vazio é o que não traz prova nenhuma — e um cabeçalho de CSV, um `{}` de JSON e um `.md` só
    com comentário HTML não trazem. A versão antiga só pegava 0 byte e título solto."""
    try:
        if caminho.stat().st_size == 0:
            return True, "arquivo de 0 byte"
    except OSError:
        return True, "não deu para medir o arquivo"
    sufixo = caminho.suffix.lower()
    if sufixo == ".md":
        texto = RE_COMENTARIO_HTML.sub(" ", ler_texto(caminho) or "")
        corpo = [l for l in texto.splitlines() if l.strip() and not l.lstrip().startswith("#")]
        if not corpo:
            return True, ".md sem corpo (só título, comentário ou espaço)"
    elif sufixo == ".csv":
        linhas, erro = ler_csv(caminho)
        if erro:
            return True, f"CSV ilegível ({erro})"
        if not linhas:
            return True, "CSV só com o cabeçalho, sem uma linha de dado"
    elif sufixo == ".json":
        dados, erro = ler_json(caminho)
        if erro:
            return True, f"JSON ilegível ({erro})"
        if dados in ({}, [], "", None):
            return True, "JSON sem conteúdo"
    elif sufixo == ".py":
        texto = ler_texto(caminho) or ""
        corpo = [l for l in texto.splitlines() if l.strip() and not l.lstrip().startswith("#")]
        if not corpo:
            return True, ".py só com comentário"
    return False, ""


PALAVRAS_DE_LIGACAO = {"chave", "chaves", "secao", "seção", "coluna", "colunas", "aba", "linha",
                       "linhas", "tabela", "campo", "campos", "para", "todos", "todas", "onde",
                       "veja", "com", "sem"}


def alvo_dentro_do_arquivo(prova, token):
    """O que a prova cita DENTRO do arquivo: “A05_testes.csv, chave inexistente_total” → a chave."""
    resto = prova.split(token, 1)[1] if token in prova else ""
    m = re.match(r"\s*[,:(]?\s*(?:seção|secao|chave|chaves|coluna|colunas|aba)?\s*"
                 r"([A-Za-zÀ-ÿ0-9_]{4,})", resto)
    if not m:
        return None
    nome = m.group(1)
    return None if sem_acento(nome) in PALAVRAS_DE_LIGACAO else nome


def regra_4(parte, contexto):
    titulo = "O campo prova aponta para algo que existe e não está vazio"
    reprovam, conferidos = [], 0
    for c in parte.conclusoes:
        cid = c.get("id") or "?"
        prova = c.get("prova")
        if not isinstance(prova, str) or not prova.strip():
            reprovam.append(f"{cid}: sem campo prova")
            continue
        tokens = re.findall(r"[A-Za-z0-9_./ÀÁÂÃÉÊÍÓÔÕÚÇàáâãéêíóôõúç-]+\.(?:csv|json|md|py)", prova)
        if not tokens:
            # “conferido na reunião com o dono” não é prova conferível: é o caso mais claro de
            # não provar o que alega, e era justamente o que escapava por REVISAR.
            reprovam.append(f"{cid}: a prova não aponta arquivo nenhum — “{prova.strip()[:70]}”")
            continue
        for t in tokens:
            conferidos += 1
            alvo = achar_arquivo(t)
            if alvo is None:
                reprovam.append(f"{cid}: “{t}” não existe em resultados/, no estudo nem na raiz")
                continue
            vazio, por_que = esta_vazio(alvo)
            if vazio:
                reprovam.append(f"{cid}: “{t}” está vazio ({por_que})")
                continue
            nome = alvo_dentro_do_arquivo(prova, t)
            if not nome:
                continue
            # Busca no texto cru, e não só nas chaves: serve a .csv (coluna OU valor), .json e .md,
            # e é o suficiente para pegar a chave inventada sem inventar falso positivo.
            texto = sem_acento(ler_texto(alvo) or "")
            if sem_acento(nome) not in texto:
                reprovam.append(f"{cid}: “{t}” existe, mas não traz “{nome}” em lugar nenhum")
    if reprovam:
        return Achado(4, titulo, REPROVA,
                      f"{plural(len(reprovam), 'prova não sustenta o que alega', 'provas não sustentam o que alegam')}",
                      reprovam)
    return Achado(4, titulo, PASSA,
                  plural(conferidos, "arquivo citado como prova existe e tem conteúdo",
                         "arquivos citados como prova existem e têm conteúdo"), [])


# ----------------------------------------------------------------------------------------------
# Regra 5 — o script importa o _metodo.py (nada de teste reimplementado)
# ----------------------------------------------------------------------------------------------
RE_REIMPLEMENTA = re.compile(r"^(bh|fdr|benjamini|holm|bonferroni|corrigir_q|cohen_d)")


def achar_script(token):
    """Resolve o caminho de um script citado. scripts/ entra na busca: todo script da casa mora
    lá, e a versão antiga procurava só na raiz e no estudo — “A05.py” virava “não existe”."""
    alvos = [RAIZ / token, ESTUDO / token, SCRIPTS / token, SCRIPTS / Path(token).name]
    for p in alvos:
        try:
            if p.exists() and p.is_file():
                return p
        except OSError:
            continue
    return None


def importes_do_script(caminho):
    """Os módulos que o script importa DE VERDADE, pela árvore sintática.

    Regex sobre o texto cru achava `import _metodo` dentro de docstring e de string de três aspas,
    e `import _metodo_falso` casava com `import\\s+_metodo`. O ast não cai em nenhum dos dois.
    Devolve None quando o arquivo não é Python válido."""
    texto = ler_texto(caminho)
    if texto is None:
        return None
    try:
        arvore = ast.parse(texto)
    except SyntaxError:
        return None
    modulos, funcoes = set(), set()
    for no in ast.walk(arvore):
        if isinstance(no, ast.Import):
            for a in no.names:
                modulos.add(a.name)
        elif isinstance(no, ast.ImportFrom):
            if no.module:
                modulos.add(no.module)
        elif isinstance(no, ast.Call):
            alvo = no.func
            nome = getattr(alvo, "id", None) or getattr(alvo, "attr", None)
            if nome in ("__import__", "import_module") and no.args and \
                    isinstance(no.args[0], ast.Constant) and isinstance(no.args[0].value, str):
                modulos.add(no.args[0].value)
        elif isinstance(no, (ast.FunctionDef, ast.AsyncFunctionDef)):
            funcoes.add(no.name)
    return modulos, funcoes


def importa_o_metodo(modulos):
    return any(m == "_metodo" or m.endswith("._metodo") for m in modulos)


def caminho_ate_o_metodo(caminho, profundidade=1):
    """(chega, por_onde). Aceita um nível de ponte: A10.py → A10_base.py → _metodo.py."""
    lido = importes_do_script(caminho)
    if lido is None:
        return None, None
    modulos, _ = lido
    if importa_o_metodo(modulos):
        return True, caminho.name
    if profundidade > 0:
        for m in sorted(modulos):
            p = SCRIPTS / f"{m}.py"
            if p.exists() and p != caminho:
                chega, por_onde = caminho_ate_o_metodo(p, profundidade - 1)
                if chega:
                    return True, f"{caminho.name} → {por_onde}"
    return False, None


def regra_5(parte, contexto):
    titulo = "scripts/<ID>.py importa scripts/_metodo.py"
    proprio = parte.script_proprio()
    declarados = parte.scripts_do_gerado_por()
    alegam_teste = [c.get("id") for c in parte.conclusoes
                    if NIVEL.get(sem_acento(c.get("confianca") or "indicio"), 1) > 1]
    descritiva = not parte.testes and not alegam_teste

    if not proprio.exists():
        # Citar script alheio não satisfaz uma regra que fala do script da parte. A05 e A07 rodam
        # pelo _rodar.py, que é legítimo — mas é REVISAR, não PASSA.
        com_metodo = [(p, caminho_ate_o_metodo(p)) for p in declarados]
        bons = [(p, por) for p, (chega, por) in com_metodo if chega]
        if bons:
            return Achado(5, titulo, REVISAR,
                          f"não existe scripts/{parte.id}.py: o método vem de um script comum, "
                          "que é outra alegação — conferir à mão que ele roda ESTA parte",
                          [f"gerado_por: {parte.dados.get('gerado_por')}",
                           "importa o _metodo: " + ", ".join(por for _, por in bons)])
        if descritiva:
            return Achado(5, titulo, AVISO,
                          "parte puramente descritiva e sem script próprio: não há teste para "
                          "reimplementar — a regra 2 já a prende no indício", [])
        return Achado(5, titulo, REPROVA,
                      f"não existe scripts/{parte.id}.py, e nenhum script citado no gerado_por "
                      "importa o _metodo.py",
                      [f"procurei: scripts/{parte.id}.py"
                       + (", " + ", ".join(p.name for p in declarados) if declarados else "")])

    lido = importes_do_script(proprio)
    if lido is None:
        return Achado(5, titulo, REPROVA,
                      f"scripts/{parte.id}.py não é Python válido: não dá para saber o que ele importa",
                      [str(proprio.relative_to(RAIZ))])
    modulos, funcoes = lido
    chega, por_onde = caminho_ate_o_metodo(proprio)
    reimplementa = sorted(f for f in funcoes if RE_REIMPLEMENTA.match(sem_acento(f)))
    if chega:
        if reimplementa:
            return Achado(5, titulo, REVISAR,
                          f"{proprio.name} importa o _metodo.py, mas também define "
                          f"{plural(len(reimplementa), 'função', 'funções')} com cara de teste "
                          "próprio: conferir qual das duas é usada",
                          [f"em {proprio.name}: " + ", ".join(reimplementa), f"chega pelo {por_onde}"])
        return Achado(5, titulo, PASSA, f"{por_onde} importa o _metodo.py", [])
    if descritiva:
        return Achado(5, titulo, AVISO,
                      "parte puramente descritiva: não há tabela de testes nem conclusão acima de "
                      "indício, então não há método reimplementado — a regra 2 já a prende no indício",
                      [f"script sem import de _metodo: {proprio.name}",
                       "importa: " + (", ".join(sorted(modulos)) or "(nada)")])
    motivo = ("a parte roda teste e o script dela não importa o _metodo.py: o método está reimplementado"
              if parte.testes else
              "a parte não tem tabela de testes, mas publica conclusão acima de indício sem importar "
              "o _metodo.py: o teste que ela alega foi reimplementado fora do método da casa")
    evidencia = [f"{proprio.name} importa: " + (", ".join(sorted(modulos)) or "(nada)")]
    if reimplementa:
        evidencia.append("e define: " + ", ".join(reimplementa))
    evidencia.append(f"{parte.testes_path.name} tem {len(parte.testes)} linhas de teste"
                     if parte.testes else
                     "conclusões acima de indício: " + ", ".join(str(i) for i in alegam_teste))
    return Achado(5, titulo, REPROVA, motivo, evidencia)


# ----------------------------------------------------------------------------------------------
# Regra 6 — nenhuma palavra proibida na manchete e no que vimos
# ----------------------------------------------------------------------------------------------
RE_SEMPRE = re.compile(r"(?<![a-z0-9_])(" + "|".join(PROIBIDAS_SEMPRE) + r")s?(?![a-z0-9_])")
RE_AMBIGUAS = re.compile(r"(?<![a-z0-9_])(" + "|".join(PROIBIDAS_AMBIGUAS) + r")s?(?![a-z0-9_])")
# d/q/p só quando coladas a um número — ou a um marcador ainda não resolvido, que vira número na
# tela. Aceita o que o texto de verdade escreve: "d 1,59", "d=1,59", "d de 1,59", "o q-valor deu
# 0,002". Exige LETRA MINÚSCULA e recusa "Série D 2 anos" e "grupo D 2 vezes", que é futebol.
RE_UMA_LETRA = re.compile(
    r"(?<![A-Za-z0-9_])"
    r"(?<!(?i:serie)\s)(?<!(?i:grupo)\s)(?<!(?i:chave)\s)(?<!(?i:divisao)\s)"
    r"([" + "".join(UMA_LETRA) + r"])"
    r"(?:\s*[-–]\s*valor|\s+valor)?"
    r"(?:\s*[=:]|\s+(?:de|do|deu|foi|ficou|vale|em)\b)?"
    r"\s*(?:[-+]?\d|\{)")


def tem_contexto_tecnico(plano, i, j):
    vizinhanca = plano[max(0, i - JANELA_DE_CONTEXTO):i] + " " + plano[j:j + JANELA_DE_CONTEXTO]
    return any(m in vizinhanca for m in CONTEXTO_TECNICO)


def regra_6(parte, contexto):
    titulo = "Nenhuma palavra proibida na manchete e no que vimos"
    reprovam, revisam = [], []
    for c in parte.conclusoes:
        cid = c.get("id") or "?"
        for campo in ("manchete", "o_que_vimos"):
            texto = parte.render(c.get(campo) or "")
            plano = sem_acento(texto)                       # minúsculo, para as palavras inteiras
            com_caixa = sem_acento(texto, manter_caixa=True)  # com caixa, para d/q/p
            for m in RE_SEMPRE.finditer(plano):
                reprovam.append(trecho(cid, campo, m.group(1), texto, m.start(), m.end()))
            for m in RE_UMA_LETRA.finditer(com_caixa):
                reprovam.append(trecho(cid, campo, m.group(1), texto, m.start(1), m.end(1)))
            for m in RE_AMBIGUAS.finditer(plano):
                onde = trecho(cid, campo, m.group(1), texto, m.start(), m.end())
                if tem_contexto_tecnico(plano, m.start(), m.end()):
                    reprovam.append(onde)
                else:
                    revisam.append(onde + "  ← parece o sentido comum (Belo Horizonte, a família "
                                          "do treinador, a porta do G4); confira")
    if reprovam:
        return Achado(6, titulo, REPROVA,
                      f"{plural(len(reprovam), 'palavra técnica', 'palavras técnicas')} no texto de 10 segundos",
                      reprovam + revisam)
    if revisam:
        return Achado(6, titulo, REVISAR,
                      f"{plural(len(revisam), 'palavra da lista aparece', 'palavras da lista aparecem')}"
                      " sem contexto técnico ao redor: pode ser o sentido comum",
                      revisam)
    return Achado(6, titulo, PASSA, "manchete e o que vimos sem palavra da lista", [])


def trecho(cid, campo, palavra, texto, i, j):
    return f"{cid} · {campo}: “{palavra}” em …{texto[max(0, i - 28):j + 22].strip()}…"


# ----------------------------------------------------------------------------------------------
# Regra 7 — nenhum indicador publicado duas vezes com q diferente
# ----------------------------------------------------------------------------------------------
def indice_de_indicadores():
    """{(indicador, unidade, comparação): {parte: [(recorte, q)]}}, lido de TODAS as partes.

    A unidade separa o que parece igual e não é: A10 e J04 compartilham 8 indicadores físicos, mas
    um é clube e o outro é jogador. A unidade DECLARADA no CSV vale como está — a versão antiga só
    aceitava quatro palavras (clube, jogador, treinador, liga) e trocava qualquer outra pela do
    mapa, de modo que uma unidade nova e legítima (“equipe-jogo”) era lida como fraude. A família
    fica FORA da chave: o mesmo indicador aparece como `cede` no A02 e `cede_ajustado` no A06, e é
    exatamente esse caso que a regra pega."""
    indice, inferidas = {}, set()
    for pid in PARTES:
        linhas, _ = ler_csv(RESULTADOS / f"{pid}_testes.csv")
        if not linhas:
            continue
        col = coluna_de_corte(linhas)
        for l in linhas:
            if col and lado_do_corte(l.get(col)) != "com":
                continue
            ident = colunas_de_identidade(l, col)
            ind = ident.pop("indicador", None) or ident.pop("alvo", None)
            if not ind:
                continue
            unidade = sem_acento(ident.pop("unidade", "") or "").strip()
            if not unidade:
                unidade = UNIDADE_INFERIDA.get(pid, pid)
                inferidas.add(pid)
            comp = ident.pop("comparacao", "") or ""
            ident.pop("familia", None)
            q = numero(l.get("q"))
            if q is None:
                continue
            recorte = tuple(sorted((k, v) for k, v in ident.items() if v))
            indice.setdefault((ind, unidade, comp), {}).setdefault(pid, []).append((recorte, round(q, 6)))
    return indice, inferidas


def projetar(recorte, colunas):
    return tuple(sorted((k, v) for k, v in recorte if k in colunas))


def regra_7(parte, contexto):
    titulo = "Nenhum indicador publicado duas vezes com q diferente"
    if not parte.testes:
        return Achado(7, titulo, NAO_APLICAVEL, "a parte não publica tabela de testes", [])
    indice, inferidas = contexto["indice"], contexto["unidades_inferidas"]
    choques, ambiguos, internos = [], [], []

    for (ind, unidade, comp), por_parte in indice.items():
        if parte.id not in por_parte:
            continue
        meus = por_parte[parte.id]
        etiqueta = f"{ind} × {unidade} × {comp or 'sem comparação'}"

        # Dentro da própria parte: a mesma comparação publicada duas vezes com q diferente. Era
        # por aqui que uma linha-isca (repetir o q da outra parte) fazia o choque sumir.
        por_recorte = {}
        for recorte, q in meus:
            por_recorte.setdefault(recorte, set()).add(q)
        for recorte, qs in por_recorte.items():
            if len(qs) > 1:
                internos.append(f"{etiqueta}: a própria {parte.id} publica q {sorted(qs)} para a "
                                f"mesma linha" + (f" [recorte {fmt_recorte(recorte)}]" if recorte else ""))

        for outra, deles in por_parte.items():
            if outra == parte.id:
                continue
            # Só se comparam as colunas que as DUAS partes têm: uma coluna a mais de um lado (um
            # `obs=v2`) não pode separar as chaves e fazer o choque desaparecer. Em compensação, se
            # a projeção junta mais de uma linha de um lado, a comparação é ambígua e vira REVISAR.
            colunas = {k for r, _ in meus for k, _ in r} & {k for r, _ in deles for k, _ in r}
            def agrupar(registros, colunas=colunas):
                por_projecao = {}
                for r, q in registros:
                    por_projecao.setdefault(projetar(r, colunas), []).append((r, q))
                return por_projecao

            meus_g, deles_g = agrupar(meus), agrupar(deles)
            for proj, linhas_minhas in meus_g.items():
                linhas_deles = deles_g.get(proj)
                if not linhas_deles:
                    continue
                qs_meus = {q for _, q in linhas_minhas}
                qs_deles = {q for _, q in linhas_deles}
                # Conjuntos IGUAIS é o único caso sem choque. Bastar a interseção não ser vazia
                # deixava passar a linha-isca: republicar também o q da outra parte apagava o caso.
                if qs_meus == qs_deles:
                    continue
                onde = f"{etiqueta}: {parte.id} publica q {sorted(qs_meus)} e {outra} publica q {sorted(qs_deles)}"
                if proj:
                    onde += f" [recorte {fmt_recorte(proj)}]"
                # Ambíguo é quando a projeção juntou medidas DIFERENTES de um dos lados. Juntar
                # duas linhas idênticas não é ambiguidade: é a outra parte publicando a mesma
                # linha duas vezes, que é defeito de qualquer jeito.
                distintas = max(len({r for r, _ in linhas_minhas}), len({r for r, _ in linhas_deles}))
                if distintas > 1:
                    ambiguos.append(onde + " — as duas partes descrevem a linha com colunas "
                                           "diferentes; pode não ser a mesma medida")
                else:
                    choques.append(onde)

    nota = ([f"unidade inferida da parte (o CSV não a declara): {UNIDADE_INFERIDA.get(parte.id)}"]
            if parte.id in inferidas else [])
    if internos or choques:
        todos = sorted(set(internos)) + sorted(set(choques))
        return Achado(7, titulo, REPROVA,
                      plural(len(todos), "caso de mesmo indicador publicado",
                             "casos de mesmo indicador publicado") + " com dois q diferentes",
                      todos + sorted(set(ambiguos)) + nota)
    if ambiguos:
        return Achado(7, titulo, REVISAR,
                      f"{plural(len(set(ambiguos)), 'indicador reaparece', 'indicadores reaparecem')}"
                      " em outra parte com outro q, mas as tabelas não descrevem a linha do mesmo jeito",
                      sorted(set(ambiguos)) + nota)
    return Achado(7, titulo, PASSA, "nenhum indicador desta parte reaparece em outra com outro q", nota)


def fmt_recorte(recorte):
    return "|".join(f"{k}={v}" for k, v in recorte)


# ----------------------------------------------------------------------------------------------
# Regra 8 — o _registro.md é gerado dos JSON, nunca editado à mão
# ----------------------------------------------------------------------------------------------
RE_SENTINELA = re.compile(r"gerado\s+(por|em|a partir)", re.I)
RE_LINHA_DE_CONCLUSAO = re.compile(r"^\|\s*([AJT]\d\d-\d+)\s*\|(.*)$")


def confianca_no_texto(t):
    plano = sem_acento(t)
    for nome in ("firme", "provavel", "indicio"):
        if nome in plano:
            return nome
    return None


def conferir_registro():
    """Sentinela + conteúdo. A sentinela sozinha é uma linha de comentário: qualquer um a escreve,
    e ela liberava a regra 8 para as 22 partes de uma vez. Por isso o portão também confere se o
    gerador citado existe e se o que o registro diz bate com os <ID>.json."""
    caminho = RESULTADOS / "_registro.md"
    titulo = "O _registro.md é gerado dos <ID>.json, nunca editado à mão"
    texto = ler_texto(caminho)
    if texto is None:
        return Achado(8, titulo, REPROVA, "não existe resultados/_registro.md legível", [])

    linhas = texto.splitlines()
    topo = [l for l in linhas[:8] if l.strip()]
    plano = sem_acento(" ".join(topo))
    tem_sentinela = bool(RE_SENTINELA.search(plano)) and "nao editar" in plano
    gerador, gerador_existe = None, False
    if tem_sentinela:
        citados = re.findall(r"[\w./-]+\.py", " ".join(topo))
        gerador = citados[0] if citados else None
        gerador_existe = bool(gerador and achar_script(gerador))

    # Conteúdo: cada linha de conclusão do registro tem de bater com o <ID>.json.
    divergem, orfas, faltam = [], [], []
    no_registro = set()
    for l in linhas:
        m = RE_LINHA_DE_CONCLUSAO.match(l.strip())
        if not m:
            continue
        cid, resto = m.group(1), m.group(2)
        no_registro.add(cid)
        pid = cid.split("-")[0]
        dados, _ = ler_json(RESULTADOS / f"{pid}.json")
        conclusoes = dados.get("conclusoes") if isinstance(dados, dict) else None
        achada = None
        if isinstance(conclusoes, list):
            for c in conclusoes:
                if isinstance(c, dict) and (c.get("id") or "") == cid:
                    achada = c
                    break
        if achada is None:
            orfas.append(f"{cid} está no registro e não está em {pid}.json")
            continue
        celulas = [c.strip() for c in resto.split("|")]
        dita = confianca_no_texto(celulas[1] if len(celulas) > 1 else "")
        real = confianca_no_texto(achada.get("confianca") or "")
        if dita and real and dita != real:
            divergem.append(f"{cid}: o registro diz “{dita}” e {pid}.json diz “{real}”")
    for pid in PARTES:
        dados, _ = ler_json(RESULTADOS / f"{pid}.json")
        conclusoes = dados.get("conclusoes") if isinstance(dados, dict) else None
        if not isinstance(conclusoes, list):
            continue
        for c in conclusoes:
            cid = c.get("id") if isinstance(c, dict) else None
            if cid and cid not in no_registro:
                faltam.append(cid)

    problemas = divergem + orfas
    if faltam:
        problemas.append(f"{plural(len(faltam), 'conclusão publicada não aparece', 'conclusões publicadas não aparecem')}"
                         " no registro: " + ", ".join(sorted(faltam)[:12]) + (" …" if len(faltam) > 12 else ""))
    if not tem_sentinela:
        return Achado(8, titulo, REPROVA,
                      "não há linha-sentinela no topo: o registro é escrito à mão, e nada garante "
                      "que ele diga o que os <ID>.json dizem",
                      ["esperado no topo: uma linha do tipo “gerado por scripts/… — não editar à mão”",
                       "topo hoje: " + (topo[0][:90] if topo else "(vazio)")] + problemas[:8])
    if not gerador_existe:
        return Achado(8, titulo, REPROVA,
                      "a sentinela diz que o registro é gerado, mas o gerador que ela cita não "
                      "existe — a linha é só uma linha",
                      [f"sentinela: {topo[0][:110]}",
                       f"gerador citado: {gerador or '(nenhum script citado)'}"] + problemas[:8])
    if problemas:
        return Achado(8, titulo, REPROVA,
                      f"o registro tem sentinela e gerador, mas {plural(len(problemas), 'ponto não bate', 'pontos não batem')}"
                      " com os <ID>.json — logo ele não foi gerado deles",
                      problemas[:10])
    return Achado(8, titulo, PASSA,
                  f"sentinela no topo, gerador {gerador} existe, e o conteúdo bate com os <ID>.json",
                  topo[:2])


# ----------------------------------------------------------------------------------------------
# Regra 9 — o gerado_por é verdade ou não existe
# ----------------------------------------------------------------------------------------------
RE_ESCRITA = re.compile(r"json\.dump|\.write_text\s*\(|open\s*\([^)]*['\"][wax]")
RE_ARQUIVO_DE_NUMEROS = re.compile(r"_numeros\.json|numeros\.json|NUMEROS_JSON")


def grava_os_numeros(caminho, profundidade=1):
    """(grava, por_onde). Estática: o script tem de MENCIONAR o arquivo de números e escrever algo.
    Aceita um nível de ponte, porque o gravador pode ser um ajudante em scripts/."""
    texto = ler_texto(caminho)
    if texto is None:
        return False, None
    if RE_ARQUIVO_DE_NUMEROS.search(texto) and RE_ESCRITA.search(texto):
        return True, caminho.name
    if profundidade > 0:
        lido = importes_do_script(caminho)
        for m in sorted((lido or ({}, {}))[0]):
            p = SCRIPTS / f"{m}.py"
            if p.exists() and p != caminho:
                grava, por_onde = grava_os_numeros(p, profundidade - 1)
                if grava:
                    return True, f"{caminho.name} → {por_onde}"
    return False, None


def regra_9(parte, contexto):
    titulo = "O campo gerado_por é verdade ou não existe"
    campo = parte.dados.get("gerado_por")
    if not campo:
        return Achado(9, titulo, PASSA, "a parte não declara gerado_por: não há alegação a conferir", [])
    citados = re.findall(r"[\w./-]+\.py", str(campo))
    if not citados:
        # "planilha do dono, aba bola parada" não é conferível — e o que não é conferível não pode
        # ser aceito por não ser conferível. Ou aponta um script, ou o campo sai.
        return Achado(9, titulo, REPROVA,
                      "o gerado_por não aponta script nenhum: é uma alegação de procedência que "
                      "o portão não tem como conferir",
                      [f"“{campo}”", "ou o campo aponta um scripts/<algo>.py, ou não existe"])
    encontrados = {t: achar_script(t) for t in citados}
    faltando = [t for t, p in encontrados.items() if p is None]
    if faltando:
        return Achado(9, titulo, REPROVA, "o gerado_por aponta script que não existe",
                      [f"“{campo}”", "não encontrados: " + ", ".join(faltando),
                       "procurei na raiz, no estudo e em scripts/"])
    if not parte.saida_path.exists():
        return Achado(9, titulo, REPROVA,
                      "o gerado_por aponta script que não produz os números publicados — "
                      "apontar um script que não produz é pior que não ter campo",
                      [f"“{campo}”", f"falta {parte.saida_path.name} (a mesma máquina da regra 1)"])
    gravadores = [(t, grava_os_numeros(p)) for t, p in encontrados.items()]
    quem_grava = [(t, por) for t, (grava, por) in gravadores if grava]
    if not quem_grava:
        return Achado(9, titulo, REPROVA,
                      "o script existe, importa o que tem de importar e NÃO grava a saída dos "
                      "números: existir não é produzir",
                      [f"“{campo}”",
                       f"nenhum deles menciona {parte.saida_path.name} junto de uma escrita "
                       "(json.dump, write_text, open(..., 'w'))"])
    saida, erro = ler_json(parte.saida_path)
    if erro:
        return Achado(9, titulo, REPROVA, f"a saída dos números não é legível: {erro}",
                      [str(parte.saida_path.relative_to(RAIZ))])
    assinatura = str(saida.get("gerado_por") or saida.get("script") or "") if isinstance(saida, dict) else ""
    if not assinatura:
        return Achado(9, titulo, REPROVA,
                      "a saída dos números não assina quem a escreveu: a única conferência de "
                      "conteúdo da regra fica sem contraparte",
                      [f"{parte.saida_path.name} sem campo gerado_por",
                       f"{parte.id}.json diz “{campo}”"])
    if not any(c in assinatura for c in citados):
        return Achado(9, titulo, REPROVA,
                      "a saída dos números diz ter sido escrita por outro script",
                      [f"{parte.id}.json diz “{campo}”", f"{parte.saida_path.name} diz “{assinatura}”"])
    return Achado(9, titulo, PASSA,
                  f"“{campo}” existe, grava a saída dos números e assina o que gravou",
                  [f"grava por: {', '.join(por for _, por in quem_grava)}"])


# ----------------------------------------------------------------------------------------------
# Regras 10 e 11 — a régua do texto (etapa 8.4 do PLANO.md)
# ----------------------------------------------------------------------------------------------
# Por que existem. A regra das 3 frases da seção Didática está cumprida e foi BURLADA PELO
# TAMANHO: medido em 20/09, nenhuma das 62 conclusões passava de 3 frases e a mediana do "o que
# vimos" era de 767 caracteres, com a maior em 1.258 — três frases que ninguém lê em 2 minutos.
# 48 das 62 manchetes passavam de 14 palavras. Tamanho e contagem de palavras são as duas únicas
# coisas do texto que uma máquina consegue conferir, e são justamente onde a régua foi burlada.


def como_a_tela_mostra(texto, numeros):
    """O texto com os marcadores trocados pelo valor JÁ FORMATADO como a tela o mostra.

    Espelha, de propósito, o `trocar()` do `gerar_estudo_serieb_js.py`: 19.669 vira “19,67” e
    1200 vira “1.200”. Medir pelo `str()` cru do Python contaria caracteres que o leitor não vê
    e reprovaria (ou absolveria) uma conclusão pelo motivo errado. Se aquele formatador mudar,
    este tem de mudar junto — é a mesma régua medida duas vezes."""
    def troca(m):
        chave = m.group(1)
        if chave not in numeros:
            return m.group(0)
        v = numeros[chave]
        if isinstance(v, float):
            return f"{v:.2f}".rstrip("0").rstrip(".").replace(".", ",")
        if isinstance(v, int):
            return f"{v:,}".replace(",", ".")
        return str(v)
    return re.sub(r"\{([A-Za-z_][A-Za-z0-9_]*)\}", troca, texto or "")


def frases_de(texto):
    """As frases do texto. O ponto de um número já foi embora na formatação acima (vira vírgula),
    então cortar em [.!?] seguido de espaço ou fim não parte “19,67” no meio."""
    return [f for f in re.split(r"(?<=[.!?])\s+", (texto or "").strip()) if f]


def publicadas(parte):
    """As conclusões que a régua do texto alcança.

    Conclusão `removida` fica de fora: a manchete dela é o registro riscado do que saiu do estudo
    (“~~…~~”), não uma afirmação publicada. Reescrevê-la para caber em 14 palavras apagaria a
    memória de por que ela caiu, que é o contrário do que o portão existe para proteger."""
    return [c for c in parte.conclusoes if (c.get("status") or "rascunho") != "removida"]


MANCHETE_MAX_PALAVRAS = 14
VIMOS_MAX_CARACTERES = 280
VIMOS_MAX_FRASES = 3
# O dois-pontos e o travessão são o jeito mecânico de conferir “uma oração”: das 48 manchetes
# longas de 20/09, quase toda grudava duas frases com um deles. A máquina não lê oração; lê a
# emenda.
RE_EMENDA_MANCHETE = re.compile(r"[:\u2014\u2013]")


def regra_10(parte, contexto):
    titulo = "A manchete cabe em 14 palavras, numa oração só"
    problemas = []
    for c in publicadas(parte):
        cid = c.get("id") or "?"
        texto = como_a_tela_mostra(c.get("manchete"), parte.numeros)
        palavras = len(texto.split())
        if palavras > MANCHETE_MAX_PALAVRAS:
            problemas.append(f"{cid} · manchete com {palavras} palavras "
                             f"(o teto é {MANCHETE_MAX_PALAVRAS}): “{texto}”")
        emendas = sorted({m.group(0) for m in RE_EMENDA_MANCHETE.finditer(texto)})
        if emendas:
            problemas.append(f"{cid} · manchete emendada por “{'”, “'.join(emendas)}”: duas "
                             f"orações onde a régua pede uma — “{texto}”")
    if problemas:
        return Achado(10, titulo, REPROVA,
                      f"{plural(len(problemas), 'manchete não cabe', 'manchetes não cabem')} "
                      "na régua de 10 segundos", problemas)
    quantas = len(publicadas(parte))
    riscadas = len(parte.conclusoes) - quantas
    ev = [f"{riscadas} conclusão removida fora da conta (manchete riscada)"] if riscadas else []
    return Achado(10, titulo, PASSA,
                  f"{plural(quantas, 'manchete cabe', 'manchetes cabem')} em "
                  f"{MANCHETE_MAX_PALAVRAS} palavras, sem dois-pontos e sem travessão", ev)


def regra_11(parte, contexto):
    titulo = f"O que vimos cabe em {VIMOS_MAX_CARACTERES} caracteres e em {VIMOS_MAX_FRASES} frases"
    problemas = []
    for c in publicadas(parte):
        cid = c.get("id") or "?"
        texto = como_a_tela_mostra(c.get("o_que_vimos"), parte.numeros)
        n = len(texto)
        if n > VIMOS_MAX_CARACTERES:
            problemas.append(f"{cid} · o_que_vimos com {n} caracteres na tela "
                             f"(o teto é {VIMOS_MAX_CARACTERES}): “{texto[:110]}…”")
        fr = len(frases_de(texto))
        if fr > VIMOS_MAX_FRASES:
            problemas.append(f"{cid} · o_que_vimos em {fr} frases (o teto é "
                             f"{VIMOS_MAX_FRASES}): cortar em frases curtas não é encurtar")
    if problemas:
        return Achado(11, titulo, REPROVA,
                      f"{plural(len(problemas), 'medida do texto estourou', 'medidas do texto estouraram')}"
                      " a régua dos 2 minutos", problemas)
    quantas = len(publicadas(parte))
    maior = max([len(como_a_tela_mostra(c.get("o_que_vimos"), parte.numeros))
                 for c in publicadas(parte)] or [0])
    return Achado(11, titulo, PASSA,
                  f"{plural(quantas, 'o que vimos cabe', 'textos de o que vimos cabem')} na régua",
                  [f"o maior tem {maior} caracteres na tela"])


# ----------------------------------------------------------------------------------------------
# Rodar
# ----------------------------------------------------------------------------------------------
REGRAS = [regra_1, regra_2, regra_3, regra_4, regra_5, regra_6, regra_7, regra_9,
          regra_10, regra_11]


def conferir(pid, contexto):
    parte = Parte(pid)
    if parte.problemas:
        # Sem um <ID>.json íntegro não há o que conferir — e "não há o que conferir" nunca pode
        # virar "tudo conferido". Arquivo truncado, vazio, com o topo errado ou trocado por uma
        # pasta passava nas onze regras por falta de conteúdo.
        achados = [Achado(0, "A parte existe, é legível e tem a forma certa", REPROVA,
                          f"{plural(len(parte.problemas), 'defeito de forma', 'defeitos de forma')}"
                          " no arquivo da parte: as outras regras não rodaram",
                          parte.problemas)]
        achados.append(contexto["registro"])
        return parte, achados, False
    achados = [f(parte, contexto) for f in REGRAS]
    achados.append(contexto["registro"])          # regra 8, do estudo inteiro
    achados.sort(key=lambda a: a.regra)
    aceita = not any(a.veredito == REPROVA for a in achados)
    return parte, achados, aceita


def imprimir(pid, achados, aceita):
    marca = "ACEITA" if aceita else "RECUSADA"
    print(f"\n{'=' * 94}\n{pid}  ·  {marca}\n{'=' * 94}")
    for a in achados:
        print(f"  regra {a.regra:<2} {a.veredito:<14} {a.titulo}")
        print(f"     └ {a.motivo}")
        for e in a.evidencia:
            print(f"       · {e}")


LIMITACOES = [
    "O portão NÃO executa script nenhum e NÃO abre base nenhuma. Ele confere que o número "
    "publicado é igual ao que a saída do script declara — não que esse número saiu do dado. "
    "Uma saída escrita à mão, com um script de fachada que grave o mesmo arquivo, ainda passa. "
    "Fechar isso exige rodar o script em modo de conferência e comparar, e nenhum script do "
    "estudo aceita isso hoje.",
    "Regras 1 e 9 dependem de um resultados/<ID>_numeros.json que NENHUM script grava hoje: elas "
    "reprovam por ausência, que é o comportamento certo, mas até o gerador existir o portão não "
    "distingue “o número está errado” de “o número não é conferível”.",
    "Regra 5 lê o import pela árvore sintática, então docstring e comentário não enganam mais — "
    "mas ela não prova que o teste publicado veio do _metodo.py, só que o módulo foi importado. "
    "Script que importa e reimplementa ao lado sai como REVISAR, não como reprovado.",
    "Regra 2 amarra a conclusão ao indicador pelo NOME que o texto usa. Conclusão que não nomeia "
    "indicador nenhum fica em REVISAR quando a parte tem indicador reprovado — o portão não "
    "adivinha qual frase se apoia em qual linha.",
    "Regra 3 emparelha os cortes pelas colunas do CSV e relata o que não emparelhou; ela não sabe "
    "se as duas linhas mediram de fato a mesma coisa quando as colunas de identidade divergem.",
    "Regra 4 confere que o trecho citado aparece no arquivo, em qualquer lugar do texto — não que "
    "ele sustente a conclusão.",
    "Regra 7 usa a unidade declarada no CSV e, quando não há, a do mapa UNIDADE_INFERIDA no topo "
    "deste arquivo: duas partes que descrevem a mesma medida com unidades escritas de formas "
    "diferentes não colidem.",
    "Regra 8 confere sentinela, existência do gerador e coerência com os <ID>.json; ela não "
    "regenera o registro para comparar palavra por palavra.",
    "A regra 3 aceita a declaração `sem_testes` do topo do <ID>.json e, com ela, sai como NÃO "
    "APLICÁVEL. O que o portão confere é a COERÊNCIA da declaração — selo firme ou provável, e "
    "texto que alega teste, derrubam-na. Ele não abre o script para provar que ali não há "
    "comparação nenhuma: isso continua sendo leitura humana.",
    "Regras 10 e 11 medem TAMANHO, não conteúdo. Elas provam que a manchete cabe em 14 palavras "
    "e que o que vimos cabe em 280 caracteres — não que a ressalva do texto longo sobreviveu ao "
    "corte. Texto que encolheu jogando fora o “mas só sem os times de fronteira” passa nas duas. "
    "O que protege disso é a regra 3 e o gráfico de dois cortes, não a régua do tamanho.",
]


def main(argv):
    pedidas = [a.upper() for a in argv if not a.startswith("-")]
    como_json = "--json" in argv
    if "--ajuda" in argv or "-h" in argv or "--help" in argv:
        print(__doc__)
        return 0
    desconhecidas = [p for p in pedidas if p not in PARTES]
    if desconhecidas:
        print(f"parte desconhecida: {', '.join(desconhecidas)}\nas 22: {' '.join(PARTES)}", file=sys.stderr)
        return 1
    alvo = pedidas or PARTES

    avisos = []
    divergentes, tem_porta_global = partes_com_porta_divergente()
    indice, inferidas = indice_de_indicadores()
    robustez = json_ou_nada(RESULTADOS / "_robustez_19_09.json")
    digitados = {}
    blocos = robustez.get("partes") if isinstance(robustez, dict) else None
    if robustez is not None and not isinstance(blocos, dict):
        # Um defeito no arquivo de conferência do próprio portão não pode impedir o portão de dar
        # veredito: ele vira aviso, não exceção.
        avisos.append("resultados/_robustez_19_09.json não traz `partes` como objeto: a conferência "
                      "cruzada dos números digitados à mão ficou de fora desta rodada.")
        blocos = {}
    for pid, bloco in (blocos or {}).items():
        if isinstance(bloco, dict) and isinstance(bloco.get("digitados_a_mao"), list):
            digitados[pid] = bloco["digitados_a_mao"]
    contexto = {"divergentes": divergentes, "indice": indice, "unidades_inferidas": inferidas,
                "digitados_a_mao": digitados, "registro": conferir_registro()}

    saida, recusadas = {}, []
    for pid in alvo:
        parte, achados, aceita = conferir(pid, contexto)
        saida[pid] = {"aceita": aceita, "regras": [a.como_dict() for a in achados]}
        if not aceita:
            recusadas.append(pid)
        if not como_json:
            imprimir(pid, achados, aceita)

    por_regra = {}
    for pid, r in saida.items():
        for a in r["regras"]:
            por_regra.setdefault(a["regra"], {}).setdefault(a["veredito"], []).append(pid)

    limitacoes = list(LIMITACOES) + avisos
    if not tem_porta_global:
        limitacoes.append("Não consegui ler resultados/_porta_temporal.json: a regra 2 tratou "
                          "toda porta como ausente.")

    if como_json:
        print(json.dumps({"partes": saida,
                          "aceitas": [p for p in alvo if saida[p]["aceita"]],
                          "recusadas": recusadas,
                          "por_regra": por_regra,
                          "limitacoes": limitacoes}, ensure_ascii=False, indent=1))
    else:
        print(f"\n{'=' * 94}\nRESUMO  ·  {len(alvo) - len(recusadas)} de {len(alvo)} aceitas\n{'=' * 94}")
        for r in sorted(por_regra):
            linha = "  ".join(f"{v}:{len(ps)}" for v, ps in sorted(por_regra[r].items()))
            print(f"  regra {r}  {linha}")
        if recusadas:
            print("\n  recusadas: " + " ".join(recusadas))
        print("\nO que o portão ainda NÃO consegue provar:")
        for l in limitacoes:
            print(f"  · {l}")
    return 1 if recusadas else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
