# Blog API - Backend com SSR

[![Node.js](https://img.shields.io/badge/Node.js-v22.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-blue)](https://expressjs.com/)
[![EJS](https://img.shields.io/badge/EJS-6.0-orange)](https://ejs.co/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-brightgreen)](https://www.mongodb.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-blue)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-lightgrey)](https://www.prisma.io/)
[![Mongoose](https://img.shields.io/badge/Mongoose-8.16-green)](https://mongoosejs.com/)
[![Redis](https://img.shields.io/badge/Redis-5.x-red)](https://redis.io/)
[![Stripe](https://img.shields.io/badge/Stripe-20.0-purple)](https://stripe.com/)
[![Jest](https://img.shields.io/badge/Jest-30.2-red)](https://jestjs.io/)
[![Swagger](https://img.shields.io/badge/Swagger-6.3-green)](https://swagger.io/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

API backend de blog com **Server-Side Rendering (SSR)** utilizando **Node.js + Express + TypeScript + EJS**, suporte a dois bancos de dados (**MongoDB** e **PostgreSQL**), autenticação JWT, cache com Redis, sistema de artigos, assinaturas com Stripe, comentários, curtidas, pesquisa por tags, paginação e documentação Swagger.

## 🚀 Funcionalidades

### Autenticação & Usuários
- `POST /app/signUp` → Registro de usuário
- `POST /app/signIn` → Login (retorna cookie HttpOnly `userAuth` com JWT)
- `GET /app/get/url/Oauth/signUp` → Obter URL de registro com OAuth2 (Google)
- `GET /app/Oauth/signUp` → Callback de registro via OAuth2 (Google)
- `GET /app/get/url/Oauth/signIn` → Obter URL de login com OAuth2 (Google)
- `GET /app/Oauth/signIn` → Callback de login via OAuth2 (Google)
- `GET /app/verify-email?token=...` → Verificar email

### Artigos
- `GET /app/articles?page=1&limit=5` → Listar artigos públicos (paginação)
- `GET /app/articles/tag?tag=nome&page=1&limit=5` → Buscar artigos por tag
- `GET /app/articles/search?search=termo&page=1&limit=5` → Buscar artigos por texto
- `GET /app/article/:slug` → Carregar artigo público por slug
- `GET /app/user/articles?page=1&limit=5` → Listar artigos do usuário (autenticado)
- `GET /app/user/article/:slug` → Carregar artigo do usuário

### Interações
- `GET /app/likes` → Listar artigos curtidos pelo usuário
- `POST /app/article/:slug/like` → Curtir artigo
- `DELETE /app/article/:slug/like/:likeId` → Remover curtida
- `POST /app/article/:slug/comment` → Comentar artigo
- `PUT /app/article/:slug/comment/:commentId` → Editar comentário
- `DELETE /app/article/:slug/comment/:commentId` → Deletar comentário

### Assinaturas (Stripe)
- `POST /app/user/subscribe` → Iniciar fluxo de assinatura

### SSR - Páginas Renderizadas
- `GET /app/login` → Página de login (EJS)
- `GET /app/register` → Página de registro (EJS)
- `GET /app/` → Página principal (EJS)
- `GET /app/article/:slug` → Página de artigo (EJS)
- `GET /app/search?search=termo` → Página de busca (EJS)

### Webhooks
- `POST /api/webhooks` → Webhook do Stripe

## ⚡ Recursos Técnicos

- **Autenticação**: JWT + cookie HttpOnly + OAuth2 (Google)
- **Cache**: Cache-aside com Redis (artigos e buscas)
- **Validação**: express-validator + Zod + Joi
- **Segurança**: Helmet (CSP, HSTS, XSS, Clickjacking) + express-rate-limit + express-slow-down
- **Logs**: Winston (logs estruturados com metadados de request)
- **Bancos de Dados**: MongoDB (Mongoose) + PostgreSQL (Prisma)
- **SSR**: EJS templates com renderização server-side
- **Pagamentos**: Integração completa com Stripe (assinaturas)
- **Emails**: Nodemailer + OAuth2 (Gmail)
- **API Documentation**: Swagger UI auto-gerado
- **Invalidação de Cache**: Automática após alterações em artigos

## 📦 Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 22.x | Runtime |
| Express | 5.1.0 | Framework web |
| EJS | 6.0.1 | Template Engine (SSR) |
| MongoDB | 6.18.0 | Banco de dados NoSQL |
| Mongoose | 8.16.4 | ODM MongoDB |
| PostgreSQL | 16.x | Banco de dados SQL |
| Prisma | 7.2.0 | ORM PostgreSQL |
| Redis | 5.9.0 | Cache (cache-aside) |
| Jsonwebtoken | 9.0.2 | JWT |
| Cookie-parser | 1.4.7 | Leitura de cookies |
| Express-validator | 7.2.1 | Validação de entrada |
| Zod | 4.4.3 | Validação de schemas |
| Joi | 18.2.1 | Validação de dados |
| Bcryptjs | 3.0.2 | Hash de senhas |
| Stripe | 20.0.0 | Gateway de pagamentos |
| Helmet | 8.1.0 | Segurança HTTP |
| Winston | 3.19.0 | Logging |
| Swagger-jsdoc | 6.3.0 | Documentação API |
| Swagger-ui-express | 5.0.1 | Interface Swagger |
| Express-rate-limit | 8.5.0 | Rate limiting |
| Express-slow-down | 3.1.0 | Slow down middleware |
| Rate-limit-redis | 4.3.1 | Redis store para rate limiter |
| Nodemailer | 8.0.7 | Envio de emails |
| Google-auth-library | 10.5.0 | OAuth2 Google |
| Slugify | 1.6.6 | Geração de slugs |
| Crypto-js | 4.2.0 | Criptografia |
| @paralleldrive/cuid2 | 3.3.0 | Geração de IDs |
| Dotenv | 17.2.1 | Variáveis de ambiente |
| Jest | 30.2.0 | Testes unitários |

## ⚙️ Instalação

```bash
# Clone o repositório
git clone https://github.com/j4ck-dev7/Blog-API.git
cd Blog-API

# Instale as dependências
npm install
```

## Variáveis de Ambiente (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (Mongoose)
MONGO_CONNECT=mongodb+srv://username:password@cluster1.78fk80s.mongodb.net/blogapi?retryWrites=true&w=majority

# PostgreSQL (Prisma)
DATABASE_URL=postgresql://user:password@localhost:5432/blogapi?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# JWT & Security
SECRET=SuaChaveSuperSecretaAqui

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google OAuth2
GOOGLE_CLIENT_ID=SEU_CLIENT_ID
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET

# Nodemailer (Gmail OAuth2)
SMTP_USER=seu-email@gmail.com
GOOGLE_REFRESH_TOKEN=SEU_REFRESH_TOKEN
```

> **Nota**: Para produção, utilize Redis Cloud e MongoDB Atlas (free tier disponível).

## 🏃‍♂️ Executando

```bash
# Inicie o servidor (modo desenvolvimento)
npm run start

# A API estará disponível em http://localhost:5000/
# Swagger UI: http://localhost:5000/api-docs
# Página SSR: http://localhost:5000/app/
```

## 🔐 Autenticação

### 1. Registro
```http
POST http://localhost:5000/app/signUp
Content-Type: application/json

{
  "name": "Seu Nome",
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### 2. Login
```http
POST http://localhost:5000/app/signIn
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```
> Em caso de sucesso, retorna cookie HttpOnly `userAuth` com JWT.

### 3. Verificação de Email
- A API expõe `GET /app/verify-email?token=...` para confirmar email.

### 4. OAuth2 (Google)
- Registro: `GET /app/get/url/Oauth/signUp` → `GET /app/Oauth/signUp`
- Login: `GET /app/get/url/Oauth/signIn` → `GET /app/Oauth/signIn`

### 5. Rotas Protegidas
- Todas as rotas autenticadas retornam `401` sem cookie `userAuth`.
- Middlewares: `auth`, `authInteractions` para validação de plano.

## 📄 Endpoints Principais

### Artigos Públicos
```http
GET /app/articles?page=1&limit=5
```

### Busca por Texto
```http
GET /app/articles/search?search=typescript&page=1&limit=5
```

### Curtir Artigo (Autenticado)
```http
POST /app/article/nodejs-com-redis-cache/like
Cookie: userAuth=...
```

### Comentar Artigo (Autenticado)
```http
POST /app/article/nodejs-com-redis-cache/comment
Cookie: userAuth=...
Content-Type: application/json

{
  "content": "Ótimo artigo!"
}
```

## ⚡ Cache Redis (Cache-Aside)
- Primeira request → MongoDB → salva no Redis
- Próximas → direto do Redis
- Cache invalidado automaticamente ao criar/editar/excluir artigo

## 💳 Assinatura com Stripe

### Assinar Plano
```http
POST http://localhost:5000/app/user/subscribe
Content-Type: application/json

{
  "subscription": "premium"
}
```

**Resposta**:
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

> Use o cartão de teste: `4242 4242 4242 4242` (qualquer data, CVV e CEP).
> Após pagamento, faça login novamente para ativação do plano.

## 🧪 Testes Unitários (Jest)

Testes aplicados em:
| Módulo | Service | Controller | Tipos de Teste |
|--------|---------|------------|----------------|
| Usuário (Login) | ✅ | ✅ | Sucesso, Erro, Autenticação |
| Usuário (Register) | ✅ | ✅ | Sucesso, Erro, Validação |
| Artigos | ✅ | ✅ | Sucesso, Erro, Validação |
| Comentários | ✅ | ✅ | Sucesso, Erro, Validação |
| Likes | ✅ | ✅ | Sucesso, Erro, Validação |

### Como rodar os testes

Os testes unitários usam Jest com módulos ESM. Execute:

```bash
# Instale dependências (uma vez)
npm install

# Rode a suíte de testes
npm test
```

> **Nota**: OAuth2 é mockado nos testes. Não é necessário configurar credenciais do Google.

## 📧 Nodemailer + OAuth2 (Gmail)

O projeto usa Nodemailer com OAuth2 para envio de emails (verificação de conta).

**Como obter GOOGLE_REFRESH_TOKEN**:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Habilite a API "Gmail API"
3. Configure a tela de consentimento OAuth
4. Crie credenciais "OAuth 2.0 Client ID" (tipo Desktop App)
5. Use [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/):
   - Cole o Client ID e Client Secret
   - Autorize com o escopo `https://mail.google.com/`
   - Troque o código por tokens
   - Copie o Refresh Token

> **Nota**: Adicione `https://developers.google.com/oauthplayground` como Redirect URI se usar "Web application".

A configuração do transporte está em `src/config/nodemailer.js`.

## 📁 Estrutura do Projeto

```
Blog-API/
├── src/
│   ├── config/           # Configurações (db, redis, stripe, nodemailer, swagger, logger)
│   ├── controllers/      # Controladores de rota
│   ├── middlewares/      # Middlewares (auth, rateLimit, slowDown, logger)
│   ├── models/           # Modelos Mongoose
│   ├── repositories/     # Repositórios de dados
│   ├── routes/           # Rotas Express
│   ├── services/         # Lógica de negócio
│   ├── templates/        # Templates EJS (SSR)
│   │   ├── partials/     # Componentes reutilizáveis
│   │   ├── article.ejs
│   │   ├── login.ejs
│   │   ├── main.ejs
│   │   ├── register.ejs
│   │   └── search.ejs
│   ├── utils/            # Utilitários
│   └── validators/       # Validação de dados
├── public/              # Arquivos estáticos
│   ├── css/
│   ├── images/
│   └── js/
├── prisma/              # Configuração Prisma
├── tests/               # Testes unitários
├── package.json
├── server.js            # Entry point
└── README.md
```

## 🤝 Contribuindo
- Fork
- Crie sua branch: git checkout -b feature/nova-funcao
- Commit: git commit -m 'feat: adiciona nova função'
- Push e abra um PR

## 📄 Licença
Este projeto está licenciado sob a **ISC License** - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✉️ Contato
- **Nome**: Jackson
- **Email**: j4ckson7dev@gmail.com
- **LinkedIn**: [Jackson](https://www.linkedin.com/in/jackson-de-ara%C3%BAjo-568b6b398/)
- **GitHub**: [j4ck-dev7](https://github.com/j4ck-dev7)
- **Projeto**: [Blog-API](https://github.com/j4ck-dev7/Blog-API)
