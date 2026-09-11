# Publicar na web

Há **dois caminhos**, e hoje só o primeiro está ligado.

| | No ar hoje | Preparado, nunca usado |
|---|---|---|
| Onde | GitHub Pages | Render |
| Endereço | `henriquesimoessilva3-png.github.io/santa-cruz-2027` | `render.yaml`, falta criar a conta |
| Acesso | **público**, sem senha | senha única (`SC_SENHA`) |
| Grupos salvos | no navegador de cada pessoa | no disco do servidor, iguais para todos |
| Comparativo e Excel | fora (precisam de servidor) | funcionam |

## O que está no ar: GitHub Pages

O repositório `henriquesimoessilva3-png/santa-cruz-2027` é **público**, e o Pages
serve a pasta `docs/` do branch `main`. Quem tem o link entra, sem senha.

Para republicar depois de mexer no app:

```bash
cd ~/Meu\ Drive/6.\ arquivos\ pessoais\ Henrique/Santa\ Cruz
python3 publicar_site.py --push
```

Sem `--push` ele só monta a pasta `docs/`, para você conferir antes de enviar. O
script leva junto os grupos gravados no app local, que viram os modelos de partida
do site — é assim que um grupo "vai para a web". Detalhes na seção "Salvamento de
grupos no site publicado", no `_fonte/CONTEXTO.md`.

## O que fica exposto hoje, e é bom saber

O app carrega dados de **Wyscout, SkillCorner e TransferRoom** (serviços licenciados)
e mostra o **planejamento salarial** do clube. Com o repositório público, tudo isso
baixa sem login, direto pelo endereço do site ou pelo GitHub:

- `dados/jogadores.json` — 40.059 jogadores, 74 campos cada, cerca de 19 MB;
- `dados/kpis/*.json` — os indicadores por posição, cerca de 17 MB;
- `dados/historico.json` — 6,4 MB de histórico;
- `dados/cenarios_publicados.json` — os grupos publicados **com os salários**.

Fora do site fica só o `dados/cenarios.json` do app local, que o `.gitignore`
segura e a rota do Flask recusa servir.

Se isso não for aceitável, são duas mudanças, e **as duas dependem de você**:

1. **Fechar o repositório** — no plano gratuito do GitHub, repositório privado
   desliga o Pages. O site sai do ar junto.
2. **Ir para o Render**, abaixo, que é o caminho com senha.

## O outro caminho: Render, com senha

É o que resolve o que o Pages não dá: **acesso restrito** e **grupos compartilhados**
entre as pessoas. Quando você salva um grupo, o preparador abre e vê o mesmo, porque
há um servidor gravando em disco. Nada disso foi ligado ainda — falta criar a conta,
e só você pode fazer (envolve a senha de acesso). São uns 5 minutos.

1. **Criar conta** em https://render.com — entre com o GitHub (a mesma conta
   `henriquesimoessilva3-png`).
2. **New → Blueprint** e escolha o repositório `santa-cruz-2027`. O Render lê o
   arquivo `render.yaml` e já configura tudo: build, start, disco de 1 GB para os
   grupos salvos e Python 3.13.
3. Ele vai pedir o valor de **`SC_SENHA`** — é a senha de acesso ao app. Escolha uma
   e guarde: qualquer pessoa que abrir o link vai precisar dela.
4. **Apply**. O primeiro build leva uns 3 minutos.
5. O endereço sai como `https://santa-cruz-2027.onrender.com` (ou parecido). Ao
   abrir, o navegador pede usuário e senha — **usuário pode ser qualquer coisa**,
   o que vale é a senha.

Depois de ligado, vale pôr o endereço no card do portal (`hub/hub_santacruz.py`,
chave `web`, que hoje aponta para o Pages).

### Como funciona o acesso

Senha única, via HTTP Basic Auth. Quem tem a senha entra; quem não tem, não passa
da porta. Para tirar o acesso de alguém, troque a senha no painel do Render
(Environment → `SC_SENHA` → Save) — o app reinicia sozinho em ~1 min.

Se um dia quiser **login por e-mail** em vez de senha compartilhada (cada pessoa
recebe um código no e-mail dela, e você controla a lista), dá para trocar por
Cloudflare Access — mas exige um domínio próprio apontado para o Cloudflare.

### O plano gratuito

- **Dorme** depois de 15 min sem uso: a primeira abertura do dia leva ~50 s. Depois
  disso fica rápido. O plano pago ($7/mês) não dorme.
- **512 MB de memória**: por isso as bases são servidas como arquivo e os
  indicadores foram divididos por posição — o servidor não carrega nada na memória.
- **1 GB de disco** para os grupos salvos, que sobrevivem a cada nova publicação.

### Publicar uma alteração no Render

```bash
cd ~/Meu\ Drive/6.\ arquivos\ pessoais\ Henrique/Santa\ Cruz
git add -A && git commit -m "o que mudou" && git push
```

O Render detecta o push e republica sozinho. O Pages também, porque lê o mesmo
branch — mas o site estático só muda de verdade depois de rodar o
`publicar_site.py`, que é quem remonta a pasta `docs/`.

## Atualizar a base de jogadores

Quando sair um período novo do ranking:

```bash
cd ~/Meu\ Drive/6.\ arquivos\ pessoais\ Henrique/Santa\ Cruz
PY=/Library/Frameworks/Python.framework/Versions/3.13/bin/python3
$PY preparar_base.py set26     # cadastro + notas + físico
$PY preparar_kpis.py set26     # indicadores da ficha
$PY dividir_kpis.py            # quebra por posição (é o que a web usa)
$PY publicar_site.py --push    # leva a base nova para o site
```
