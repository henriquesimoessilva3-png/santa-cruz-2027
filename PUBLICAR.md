# Publicar na web

Há **três caminhos**. Hoje o primeiro está ligado, o segundo está pronto no código e
esperando você criar o projeto, e o terceiro nunca foi usado.

| | No ar hoje | Pages + Firebase | Render |
|---|---|---|---|
| Onde | GitHub Pages | o mesmo Pages | Render |
| Acesso ao site | **público** | público | senha única (`SC_SENHA`) |
| Grupos salvos | no navegador de cada um | **na nuvem, todos veem** | no disco, todos veem |
| Quem mexe nos grupos | quem abrir | só os e-mails liberados | quem tem a senha |
| O servidor dorme? | não há servidor | não há servidor | sim, ~50 s para acordar |
| Excel | fora | fora | funciona |
| Falta | — | criar o projeto e colar a config | criar a conta |

**Por que Firebase e não Render, para o que você pediu.** O pedido era "toda vez que
salvar na web, ficar disponível para todos". Os dois resolvem isso. O Firebase ganha em
dois pontos: o site continua onde está, e nada dorme — no plano gratuito do Render a
primeira abertura do dia leva quase um minuto. O Render ganha num ponto só: o Excel volta,
porque é o Python que monta o arquivo.

## Ligar o Firebase (o que falta para "salvar = todos veem")

**Projeto separado, de propósito.** Não use o `ranking-botafogo`: é outro clube, e aquele
projeto grava **sem login nenhum** (não há uma chamada de autenticação em todo o Portal
Ranking), o que só funciona com as regras abertas. Fechar as regras de lá derrubaria as
estrelas do Ranking na hora, sem erro na tela. Projeto novo nasce trancado e não encosta
no Botafogo.

1. **Criar o projeto** em https://console.firebase.google.com — "Adicionar projeto",
   nome à sua escolha (ex.: `santa-cruz-2027`). Pode recusar o Google Analytics.
2. **Criar o banco**: Build → Firestore Database → Criar banco de dados. Escolha
   **produção** (começa fechado, que é o que queremos) e a região `southamerica-east1`.
3. **Ligar o login**: Build → Authentication → Começar → **Google** → ativar → Salvar.
4. **Publicar as regras**: Firestore Database → Regras. Apague o que estiver lá, cole o
   conteúdo de [`firestore.rules`](firestore.rules) e publique. **Antes de publicar**,
   acrescente na lista o e-mail de cada pessoa que vai poder ver e mexer nos grupos.
5. **Pegar a config**: ⚙ Configurações do projeto → Seus apps → ícone `</>` (Web) →
   registrar o app (sem Hosting) → o console mostra um bloco `firebaseConfig`.
6. **Colar a config** em [`dados/firebase.json`](dados/firebase.json), nos campos que já
   estão lá vazios. Depois rode `python3 publicar_site.py --push`.

Enquanto o `projectId` desse arquivo estiver vazio, **o site funciona como hoje** e a
nuvem nem é carregada — não há risco de ligar pela metade.

**A config não é segredo.** Aqueles valores (`apiKey` e companhia) identificam o projeto e
vão no código de qualquer site que use Firebase; é assim por desenho. Quem autoriza são as
regras do passo 4 — é lá que está a segurança, e é por isso que aquele arquivo importa
tanto. Nunca coloque neste repositório, que é **público**, uma chave de serviço (o JSON de
`service account`): essa sim é segredo, e não é necessária aqui.

### Como fica na tela

Na barra das abas aparece **Entrar para compartilhar**. Sem entrar, o site é o de hoje e
o aviso diz "salva só neste navegador". Entrando com o Google, o aviso vira "salvando para
todos", surge no seletor o bloco **Compartilhados (todos veem)**, e o Salvar grava na
nuvem. Excluir um grupo compartilhado pergunta com todas as letras que ele some **para
todos**.

Se o seu e-mail não estiver nas regras, o login funciona mas aparece **⚠ sem acesso** — é
o passo 4 que faltou.

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
