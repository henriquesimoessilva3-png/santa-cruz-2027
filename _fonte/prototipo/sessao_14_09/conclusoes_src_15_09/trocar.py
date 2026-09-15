# trocar.py - troca, num módulo de tema, o bloco C.append(conc(...)) de uma conclusão pelo texto de novos/<ID>.py
# (o bloco vai de 'C.append(conc(' com id="ID" até o '))' que fecha, antes do próximo C.append ou do fim do arquivo)
import re, sys, os
def trocar(modulo, cid, novo, depois_de=None):
    t = open(modulo, encoding="utf-8").read()
    blocos = [m.start() for m in re.finditer(r'^C\.append\(conc\(\n', t, re.M)]
    fim_arq = len(t)
    def faixa(i):
        ini = blocos[i]; fim = blocos[i + 1] if i + 1 < len(blocos) else fim_arq
        return ini, fim
    alvo = None
    for i in range(len(blocos)):
        ini, fim = faixa(i)
        if re.search(r'^\s+id="%s",' % re.escape(depois_de or cid), t[ini:fim], re.M):
            alvo = (ini, fim)
    if alvo is None:
        raise SystemExit(f"{modulo}: bloco {depois_de or cid} não encontrado")
    ini, fim = alvo
    novo = novo.rstrip() + "\n\n"
    t = t[:fim] + novo + t[fim:] if depois_de else t[:ini] + novo + t[fim:]
    open(modulo, "w", encoding="utf-8").write(t)
if __name__ == "__main__":
    modulo, cid = sys.argv[1], sys.argv[2]
    depois = sys.argv[3] if len(sys.argv) > 3 else None
    trocar(modulo, cid, open(os.path.join("novos", cid + ".py"), encoding="utf-8").read(), depois)
    print("ok", modulo, cid, depois or "")
