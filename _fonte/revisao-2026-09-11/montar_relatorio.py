# -*- coding: utf-8 -*-
"""Monta a pagina do relatorio no sistema de design que o artefato ja tem."""
import io, os, re, html

SCR = os.path.dirname(os.path.abspath(__file__))
MD = io.open(os.path.join(SCR, 'relatorio_acentuado.md'), encoding='utf-8').read()
# As duas linhas em italico antes da secao 1 repetem a abertura desenhada da pagina
# (data, base, contagem de agentes). Ficariam duplicadas logo abaixo dela.
MD = MD[MD.index('## 1.'):]

# ---------------- inline ----------------
def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'`([^`]+)`', lambda m: '<code>' + m.group(1) + '</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', lambda m: '<b>' + m.group(1) + '</b>', t)
    t = re.sub(r'(?<![*\w])\*([^*]+)\*(?!\w)', lambda m: '<i>' + m.group(1) + '</i>', t)
    return t

VERD = [('CONFIRMA', 'ok'), ('AJUSTA', 'med'), ('DERRUBA', 'al'), ('ABSORVIDA', 'med')]

def celula(txt, i, cab, tabela_notas):
    c = inline(txt)
    bruto = txt.strip()
    if tabela_notas and i < len(cab) and cab[i] in ('Rigor', 'Clareza', 'Organiz.') and re.fullmatch(r'[1-5]', bruto):
        return '<td><span class="n n%s">%s</span></td>' % (bruto, bruto)
    for palavra, cls in VERD:
        if palavra in bruto.upper():
            return '<td class="%s">%s</td>' % ({'ok': 's', 'med': 'c', 'al': 'al'}[cls], c)
    return '<td>%s</td>' % c

def tabela(linhas):
    cab = [c.strip() for c in linhas[0].strip().strip('|').split('|')]
    corpo = linhas[2:]
    notas = 'Rigor' in cab
    out = ['<div class="scroll"><table><thead><tr>' +
           ''.join('<th>%s</th>' % inline(c) for c in cab) + '</tr></thead><tbody>']
    for l in corpo:
        cs = [c.strip() for c in l.strip().strip('|').split('|')]
        out.append('<tr>' + ''.join(celula(c, i, cab, notas) for i, c in enumerate(cs)) + '</tr>')
    out.append('</tbody></table></div>')
    return '\n'.join(out)

# ---------------- bloco a bloco ----------------
corpo, nav, secao = [], [], 0
linhas = MD.split('\n')
i = 0
buf_lista, tipo_lista = [], None

def fecha_lista():
    global buf_lista, tipo_lista
    if buf_lista:
        corpo.append('<%s>%s</%s>' % (tipo_lista, ''.join('<li>%s</li>' % x for x in buf_lista), tipo_lista))
        buf_lista, tipo_lista = [], None

while i < len(linhas):
    l = linhas[i]
    s = l.strip()
    if s.startswith('|'):
        fecha_lista()
        bloco = []
        while i < len(linhas) and linhas[i].strip().startswith('|'):
            bloco.append(linhas[i]); i += 1
        if len(bloco) >= 2: corpo.append(tabela(bloco))
        continue
    if s.startswith('## '):
        fecha_lista(); secao += 1
        titulo = re.sub(r'^\d+\.\s*', '', s[3:]).strip()
        corpo.append('<hr class="rule">' if secao > 1 else '')
        corpo.append('<h2 id="r%d"><span class="num">%02d</span>%s</h2>' % (secao, secao, inline(titulo)))
        rot = re.sub(r'\*\*?|`', '', titulo)   # o indice nao mostra marcacao de markdown
        nav.append('<a href="#r%d"><span class="n">%02d</span>%s</a>' % (secao, secao, html.escape(rot)))
    elif s.startswith('### '):
        fecha_lista(); corpo.append('<h3>%s</h3>' % inline(s[4:]))
    elif s.startswith('#### '):
        fecha_lista(); corpo.append('<h4>%s</h4>' % inline(s[5:]))
    elif s.startswith('# '):
        pass
    elif re.match(r'^[-*] ', s):
        if tipo_lista == 'ol': fecha_lista()
        tipo_lista = 'ul'; buf_lista.append(inline(s[2:]))
    elif re.match(r'^\d+\. ', s):
        if tipo_lista == 'ul': fecha_lista()
        tipo_lista = 'ol'; buf_lista.append(inline(re.sub(r'^\d+\.\s*', '', s)))
    elif s.startswith('---'):
        fecha_lista()
    elif not s:
        fecha_lista()
    else:
        fecha_lista()
        cls = ' class="lead"' if s.startswith('*') and s.endswith('*') and len(s) > 60 else ''
        corpo.append('<p%s>%s</p>' % (cls, inline(s)))
    i += 1
fecha_lista()

io.open(os.path.join(SCR, 'corpo.html'), 'w', encoding='utf-8').write('\n'.join(x for x in corpo if x))
io.open(os.path.join(SCR, 'nav.html'), 'w', encoding='utf-8').write('\n  '.join(nav))
print('corpo: %.0f KB · %d seções' % (os.path.getsize(os.path.join(SCR, 'corpo.html')) / 1024, secao))
