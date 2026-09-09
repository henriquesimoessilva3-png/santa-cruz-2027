# Publicar na web

O app está no repositório **privado** `henriquesimoessilva3-png/santa-cruz-2027`.
Falta ligar a hospedagem — são 5 minutos, e só você precisa fazer (envolve criar
conta e digitar a senha de acesso).

## Por que Render, e não GitHub Pages

Você quis **grupos compartilhados** entre as pessoas: quando você salva um grupo, o
preparador abre e vê o mesmo. Isso exige um servidor gravando em disco — o GitHub
Pages só serve arquivos, sem backend. O Render roda o Flask como está aqui.

## Passo a passo

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

## Como funciona o acesso

Senha única, via HTTP Basic Auth. Quem tem a senha entra; quem não tem, não passa
da porta. Para tirar o acesso de alguém, troque a senha no painel do Render
(Environment → `SC_SENHA` → Save) — o app reinicia sozinho em ~1 min.

Se um dia quiser **login por e-mail** em vez de senha compartilhada (cada pessoa
recebe um código no e-mail dela, e você controla a lista), dá para trocar por
Cloudflare Access — mas exige um domínio próprio apontado para o Cloudflare.

## O plano gratuito

- **Dorme** depois de 15 min sem uso: a primeira abertura do dia leva ~50 s. Depois
  disso fica rápido. O plano pago ($7/mês) não dorme.
- **512 MB de memória**: por isso as bases são servidas como arquivo e os
  indicadores foram divididos por posição — o servidor não carrega nada na memória.
- **1 GB de disco** para os grupos salvos, que sobrevivem a cada nova publicação.

## Publicar uma alteração

```bash
cd ~/projetos/santa-cruz-2027
git add -A && git commit -m "o que mudou" && git push
```

O Render detecta o push e republica sozinho.

## Atualizar a base de jogadores

Quando sair um período novo do ranking:

```bash
cd ~/projetos/santa-cruz-2027
PY=/Library/Frameworks/Python.framework/Versions/3.13/bin/python3
$PY preparar_base.py set26     # cadastro + notas + físico
$PY preparar_kpis.py set26     # indicadores da ficha
$PY dividir_kpis.py            # quebra por posição (é o que a web usa)
git add -A && git commit -m "base set26" && git push
```

## O que fica exposto

O app carrega dados de **Wyscout, SkillCorner e TransferRoom** (serviços licenciados)
e mostra o **planejamento salarial** do clube. Por isso o repositório é privado e o
app pede senha. Vale tratar o link e a senha como informação interna.
