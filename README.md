# NW Doces&Salgados — Site + Painel de Estoque

## Estrutura do projeto
```
index.html          → a loja (o que o cliente vê)
admin.html           → o painel de estoque (protegido por senha)
products-data.js     → catálogo, categorias e preços (editado por você direto no código)
api/stock.js         → lê e grava o estoque no banco de dados
api/verify-password.js → confere a senha do painel
package.json         → dependência do banco de dados (Vercel KV)
```

## Passo a passo para publicar no Vercel

### 1. Subir o projeto para o GitHub
Crie um repositório novo no GitHub e envie todos esses arquivos para ele
(pode arrastar e soltar pela interface do GitHub, ou usar `git push`).

### 2. Importar no Vercel
No painel do Vercel: **Add New → Project** → selecione o repositório.
Não precisa mudar nenhuma configuração de build — o Vercel detecta
sozinho as páginas HTML e a pasta `api/`.

### 3. Criar o banco de dados (Vercel KV)
Dentro do projeto no Vercel: aba **Storage** → **Create Database** →
escolha **KV** (tem plano gratuito). Depois de criado, clique em
**Connect Project** e conecte ao seu projeto — isso já cria sozinho as
variáveis de ambiente que o código precisa (`KV_REST_API_URL` e
`KV_REST_API_TOKEN`). Você não precisa copiar nada manualmente.

### 4. Definir a senha do painel
Aba **Settings → Environment Variables** do projeto → adicione:
- **Name:** `ADMIN_PASSWORD`
- **Value:** a senha que você quiser usar para entrar no painel

### 5. Fazer o deploy
Aba **Deployments** → **Redeploy** (ou simplesmente faça um novo
`git push` — o Vercel publica automaticamente a cada envio).

### 6. Acessar
- Loja: `https://seu-projeto.vercel.app/`
- Painel: `https://seu-projeto.vercel.app/admin.html`

## O que você edita e onde

| O que mudar                          | Onde                          | Precisa de deploy novo? |
|---------------------------------------|--------------------------------|--------------------------|
| Quantidade em estoque                 | Painel (`/admin.html`)         | Não — salva na hora      |
| Preços, sabores novos, nº do WhatsApp | Arquivo `products-data.js`     | Sim — editar e enviar pro GitHub |
| Senha do painel                       | Vercel → Environment Variables | Sim — mas é rápido       |

## Observações importantes
- Um sabor que você deixa **em branco** no painel fica com **estoque
  ilimitado** — ele só passa a ser controlado quando você digita um
  número (mesmo que seja 0).
- Se o banco de dados ficar fora do ar por algum motivo, a loja
  continua funcionando normalmente mostrando tudo como disponível —
  ela nunca trava por causa do estoque.
- A senha fica salva só durante a aba aberta (`sessionStorage`); ao
  fechar o navegador, ela é pedida de novo.
