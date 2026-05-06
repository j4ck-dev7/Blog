# blog

[![Node.js](https://img.shields.io/badge/Node.js-v22.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-brightgreen)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-5.x-red)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Um projeto backend de um blog, com autenticação JWT, cache com Redis (cache-aside), sistema de artigos, assinaturas com Stripe, comentários, curtidas, pesquisa por tags e paginação.  
Desenvolvida com **Node.js + Express + Mongoose + MongoDB + Prisma + PostgreSQL** e testada com **Insomnia/Postman** e **Testes unitários com Jest**.

## 🚀 Funcionalidades

### Usuário
- `POST   /signUp` → Registro
- `GET    /get/url/Oauth/signUp` → Obter URL de registro com OAuth2 (Google)
- `GET    /Oauth/signUp` → Callback de registro via OAuth2 (Google)
- `POST   /signIn` → Login (retorna cookie HttpOnly `userAuth` com JWT)
- `GET    /get/url/Oauth/signIn` → Obter URL de login com OAuth2 (Google)
- `GET    /Oauth/signIn` → Callback de login via OAuth2 (Google)
- `GET    /verify-email?token=...` → Verificar email (token de verificação)
- `GET    /articles?page=1&limit=5` → Listar artigos com paginação
- `GET    /articles/tag?tag=tag&page=1&limit=5` → Buscar artigos por tag
- `GET    /articles/search?search=busca&page=1&limit=5` → Buscar artigos por texto
- `GET    /article/:slug` → Carregar artigo por slug
- `GET    /likes` → Listar artigos curtidos pelo usuário
- `GET    /subscribe` → Iniciar fluxo de assinatura (Stripe)
- `POST   /article/:slug/like` → Curtir artigo
- `DELETE /article/:slug/like/:likeId` → Remover curtida
- `POST   /article/:slug/comment` → Comentar artigo
- `PUT    /article/:slug/comment/:commentId` → Editar comentário
- `DELETE /article/:slug/comment/:commentId` → Deletar comentário

### Recursos técnicos
- Autenticação via **JWT + cookie HttpOnly**  
- **Cache-aside** com Redis (artigos e buscas)  
- Validação com **express-validator**  
- Proteção de rotas (middlewares `auth`, `credentialsAuth`, `planValidation`, `authInteractions`)
- Limitação de taxa (rate limiting) com **express-rate-limit** e armazenamento das chaves no Redis via **rate-limit-redis**
- Paginação   
- Invalidação automática de cache após alterações
- Planos de assinaturas usando Stripe
- Testes unitários com Jest
- Oauth2 com o Google (login/registro)
- Envio de emails com **Nodemailer** via OAuth2 (Gmail)

## 📦 Tecnologias

| Tecnologia         | Versão  | Uso                          |
|--------------------|---------|------------------------------|
| Node.js            | 22.21.1 | Runtime                      |
| Express            | 5.1.0   | Framework web                |
| Mongoose           | 8.16.4  | ODM MongoDB                  |
| MongoDB            | 6.18.0  | Banco de dados NoSQL         |
| Prisma             | 5.9.0   | ORM PostgreSQL               |
| PostgreSQL         | 16.11   | Banco de dados SQL           |
| Redis              | 5.9.0   | Cache (cache-aside)          |
| Jsonwebtoken       | 9.0.2   | JWT                          |
| Cookie-parser      | 1.4.7   | Leitura de cookies           |
| Express-validator  | 7.2.1   | Validação de entrada         |
| Bcryptjs           | 3.0.4   | Hash de senhas               |
| Slugify            | 1.6.6   | Geração de slugs             |
| Stripe             | 20.0.0  | Gateway de pagamentos        |
| Jest               | 30.2.0  | Testes unitários             |
| Google-auth-library| 10.5.0  | Oauth2                       |
| Nodemailer         | 8.0.7   | Envio de emails (OAuth2/Gmail)|
| express-rate-limit | 8.5.0   | Rate limiting (middleware)   |
| rate-limit-redis   | 4.3.1   | Redis store para rate limiter|

## ⚙️ Instalação

```bash
# Clone o repositório
git clone https://github.com/j4ck-dev7/blog-API.git
cd blog-API

# Instale as dependências
npm install
```

## Variáveis de ambiente (.env)
```env
PORT=5000
MONGO_CONNECT=mongodb+srv://username:password@cluster1.78fk80s.mongodb.net/blogapi?retryWrites=true&w=majority&appName=Cluster1
SECRET=SuaChaveSuperSecretaAqui!
REDIS_URL=redis://localhost:6379
```
Use Redis Cloud (gratuito) e MongoDB Atlas (free tier)
 
 ### Variáveis adicionais para envio de emails (Nodemailer + OAuth2 Gmail)
 ```env
 SMTP_USER=seu-email@gmail.com
 GOOGLE_CLIENT_ID=SEU_CLIENT_ID_GOOGLE
 GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET_GOOGLE
 GOOGLE_REFRESH_TOKEN=SEU_REFRESH_TOKEN_GOOGLE
 ```
 O arquivo `src/config/nodemailer.js` utiliza essas variáveis (`SMTP_USER`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`).

## 🏃‍♂️ Executando 
```bash
# Inicie o servidor
node server.js

#A API estará disponível em http://localhost:5000/api/
```

## 🔐 Autenticação
1. Registro (cria usuário)
	```http
	POST http://localhost:5000/signUp
	Content-Type: application/json
   
	{
	  "name": "Seu Nome",
	  "email": "usuario@exemplo.com",
	  "password": "senha123",
	}
	```

2. Login
	```http
	POST http://localhost:5000/signIn
	Content-Type: application/json

	{
	  "email": "usuario@exemplo.com",
	  "password": "senha123"
	}
	```
	Em caso de sucesso a API retorna um cookie HttpOnly chamado `userAuth` contendo o JWT.

3. Verificação de email
	- A API expõe `GET /verify-email?token=...` para confirmar o email após registro.

4. Rotas protegidas
	- Todas as rotas que exigem autenticação retornam `401` quando não há o cookie `userAuth`.

## 📋 Exemplos de Requisições
Listar artigos (público/autenticado)
```http
GET /articles?page=1&limit=5
```
Resposta:
```json
{
  "message": "Articles obtained",
  "articles": [ /* ... */ ],
  "pagination": { /* ... */ }
}
```

Curtir artigo
```http
POST /article/:slug/like
Cookie: userAuth=...
```

Comentar artigo
```http
POST /article/:slug/comment
Cookie: userAuth=...
Content-Type: application/json
{
  "content": "Ótimo artigo!"
}
```

Listar artigos (user)
```http
GET /user/articles?page=1&limit=5
```
Resposta:
```json
	"message": "Articles obtained",
	"data": {
		"articles": [
			{
				"title": "PHP, Laravel, Orthogonality",
				"author": "admin",
				"plan": "intermediate",
				"createdIn": "18/11/2025, 16:12"
			},
			{
				"title": "PHP, Laravel, Jwt",
				"author": "admin",
				"plan": "premium",
				"createdIn": "18/11/2025, 16:09"
			},
			{
				"title": "Node.js e TypeScript com Fastify",
				"author": "admin",
				"plan": "premium",
				"createdIn": "18/11/2025, 09:38"
			},
			{
				"title": "Node.js e TypeScript com Redis Cache",
				"author": "admin",
				"plan": "basic",
				"createdIn": "18/11/2025, 09:12"
			},
			{
				"title": "Node.js com Redis Cache",
				"author": "admin",
				"plan": "free",
				"createdIn": "18/11/2025, 09:10"
			}
		],
		"pagination": {
			"total": 5,
			"pages": 1,
			"currentPage": 1,
			"limit": 5,
			"hasNext": false,
			"hasPrev": false
		}
	}
```

Buscar por tag (user)
```http
GET /user/articles?page=1&limit=5&tag=nodejs
```

Curtir artigo (user)
```http
GET /user/article/673f2e1c9d5a2c1f8e9d4a2b/like
```
O id é do artigo

Carregar artigo (user)
```http
GET /user/article/nodejs-com-redis-cache
```
Alguns artigos são inacessíveis por causa dos planos de assinatura

## ⚡ Cache Redis
- Primeira request → MongoDB → salva no Redis
- Próximas → direto do Redis
- Cache invalidado automaticamente ao criar/editar/excluir artigo
  
## 📝 Assinatura com Stripe
Assinar um plano:
```http
POST http://localhost:5000/api/user/subscribe
   Content-Type: application/json
   
   {
     "subscription": "plano"
   }
```

Resposta:
```json
{
	"url": "https://checkout.stripe.com/c/pay/cs_test_"
}
```
Ao clicar na url retornada, uma página da stripe será carregada, use 4242 4242 4242 4242 no número do cartão enquanto os outros campos pode pôr qualquer coisa.
Quando o pagamento for efetuado basta logar novamente na api para que o plano funcione.

## 📋 Testes Unitários
Os testes unitários foram aplicados nas seguintes camadas e módulos:
| Módulo                 | Service | Controller | Tipos de Teste                 |
|------------------------|---------|------------|--------------------------------|  
| **Usuário (Login)**    | ✅      | ✅         | Sucesso, Erro, Autenticação    |
| **Usuário (Register)** | ✅      | ✅         | Sucesso, Erro, Validação       |
| **Artigos**            | ✅      | ✅         | Sucesso, Erro, Validação       |
| **Comentários**        | ✅      | ✅         | Sucesso, Erro, Validação       |
| **Likes**              | ✅      | ✅         | Sucesso, Erro, Validação       |

### Como rodar os testes

Os testes unitários usam Jest com módulos ESM. Execute:

```bash
# Instale dependências (uma vez)
npm install

# Rode a suíte de testes
npm test
```

Observação: o script `test` do `package.json` já invoca o Node com a flag necessária para suportar módulos ESM no Jest.

Observação sobre OAuth2:
- Os fluxos OAuth2 utilizados pelo projeto (Google) são mockados nos testes unitários, portanto não é necessário configurar credenciais do Google para executar a suíte de testes.

## 📧 Nodemailer + OAuth2 (Gmail) — obtenção do Refresh Token

O projeto usa `nodemailer` com OAuth2 para envio de e-mails (ex.: verificação de conta). As credenciais esperadas estão listadas acima (`SMTP_USER`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`).

Passo a passo para obter o `GOOGLE_REFRESH_TOKEN` (resumido):

1. Acesse o Google Cloud Console (https://console.cloud.google.com/) e crie um novo projeto (ou use um existente).
2. Habilite a API "Gmail API" no projeto.
3. Configure a tela de consentimento OAuth (OAuth consent screen): preencha nome do aplicativo, e-mails de suporte e adicione os escopos necessários, por exemplo: `https://mail.google.com/` (escopo completo de envio de e-mail) ou `https://www.googleapis.com/auth/gmail.send`.
4. Crie credenciais do tipo "OAuth 2.0 Client ID". Para simplicidade, escolha o tipo "Desktop app" (ou "Web application" se preferir). Copie o `Client ID` e `Client Secret`.
5. Abra o OAuth 2.0 Playground (https://developers.google.com/oauthplayground/).
	- Clique no ícone de engrenagem no canto superior direito e marque "Use your own OAuth credentials". Cole o `Client ID` e `Client Secret` e salve.
	- Na coluna "Step 1" cole o escopo `https://mail.google.com/` (ou `https://www.googleapis.com/auth/gmail.send`) e clique em "Authorize APIs".
	- Faça login com a conta Gmail que será usada como `SMTP_USER` e conceda as permissões.
	- Em "Step 2" clique em "Exchange authorization code for tokens". O Playground retornará um `Access token` e um `Refresh token`.
6. Copie o valor do `Refresh token` e adicione ao seu arquivo `.env` como `GOOGLE_REFRESH_TOKEN`.

Observação: se optar por criar credenciais do tipo "Web application", adicione `https://developers.google.com/oauthplayground` como Redirect URI nas credenciais.

Exemplo `.env` completo (trecho relevante):
```env
PORT=5000
SMTP_USER=seu-email@gmail.com
GOOGLE_CLIENT_ID=SEU_CLIENT_ID_GOOGLE
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET_GOOGLE
GOOGLE_REFRESH_TOKEN=SEU_REFRESH_TOKEN_GOOGLE
```

No código a configuração do transporte está em `src/config/nodemailer.js` e já faz uso dessas variáveis.

## 🏗️ Estrutura de Testes

### Camada de Service
A camada de Service contém a lógica de negócio da aplicação. Os testes irão validar:

- **Casos de Sucesso**: Operações executadas corretamente
- **Casos de Erro**: Tratamento de exceções e erros esperados
- **Validações**: Regras de negócio e constraints

### Camada de Controller
A camada de Controller gerencia as requisições HTTP. Os testes irão validar:

- **Respostas Bem-Sucedidas**: Status 200, 201, etc.
- **Erros HTTP**: Status 400, 401, 403, 404, 500, etc.
- **Autenticação e Autorização**: Validação de tokens e permissões
- **Validação de Entrada**: Dados malformados ou inválidos

## 🤝 Contribuindo
- Fork
- Crie sua branch: git checkout -b feature/nova-funcao
- Commit: git commit -m 'feat: adiciona nova função'
- Push e abra um PR

## 📄 Licença
Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✉️ Contato
- **Nome**: Jackson
- **Email**: j4ckson7dev@gmail.com
- **LinkedIn**: [Jackson](https://www.linkedin.com/in/jackson-de-ara%C3%BAjo-568b6b398/)
- **GitHub**: [j4ck-dev7](https://github.com/j4ck-dev7)
