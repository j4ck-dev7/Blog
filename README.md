# blog

[![Node.js](https://img.shields.io/badge/Node.js-v22.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-brightgreen)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-5.x-red)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Um projeto backend de um blog, com autenticação JWT, cache com Redis (cache-aside), sistema de artigos, assinatuas com Stripe, comentários, curtidas, pesquisa por tags e paginação.  
Desenvolvida com **Node.js + Express + Mongoose + MongoDB + Prisma + PostgreSQL** e testada com **Insomnia/Postman** e **Testes unitários com Jest**.

## 🚀 Funcionalidades

### Admin (gerenciamento de conteúdo)
- `POST   /admin/signIn` → Login
- `POST   /admin/addArticle` → Criar artigo  
- `PUT    /admin/editArticle` → Editar artigo  
- `DELETE /admin/delArticle` → Excluir artigo  

### Usuário
- `POST   api/user/signUp` → Registro  
- `POST   api/user/signIn` → Login (retorna cookie HttpOnly com JWT)  
- `GET    api/user/articles?page=1&limit=5` → Listar artigos com paginação
- `GET    api/user/articles/tag?tag=tag&page=1&limit=5` → Busca de artigos por tag 
- `GET    api/user/articles/search?search=busca&page=1&limit=5` → Busca de artigos por texto 
- `GET    api/user/article/:slug` → Página do artigo  
- `POST   api/user/article/:slug/comment` → Comentar  
- `PUT    api/user/article/:slug/editComment/:commentId` → Editar comentário  
- `DELETE api/user/article/:slug/delComment/:commentId` → Deletar comentário  
- `POST   api/user/article/:slug/like` → Curtir artigo  
- `DELETE api/user/article/:slug/delLike/:likeId` → Remover curtida  
- `GET    api/user/likes` → Listar todos os artigos curtidos
- `POST   api/subscribe` → Assina um plano basic, intermediate ou premium

### Recursos técnicos
- Autenticação via **JWT + cookie HttpOnly**  
- **Cache-aside** com Redis (artigos e buscas)  
- Validação com **express-validator**  
- Proteção de rotas admin e user (middleware `authAdmin | userAuth`)
- Paginação   
- Invalidação automática de cache após alterações
- Planos de assinaturas usando stripe
- Testes unitários

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

## 🏃‍♂️ Executando 
```bash
# Inicie o servidor
node server.js

#A API estará disponível em http://localhost:5000/api/
```

## 🔐 Autenticação
1. Criar admin
   ```http
   POST http://localhost:5000/api/user/signUp
   Content-Type: application/json
   
   {
     "name": "Admin",
     "email": "admin@blog.com",
     "password": "admin123",
   }
   ```
   Atenção: Para que o user vire usuário é necessário que modifique o valor do campo role para 'admin' no banco de dados.

2. Login
   ```http
   POST http/localhost:5000/api/admin/signIn
   ```
   Retorna cookie: adminAuth=eyJhbGciOiJIUzI1NiIsIn...

3. Todas as rotas protegidas exigem o cookie
   Sem cookie → 401 Access denied

## 📋 Exemplos de Requisições
Criar artigo (admin)
```json
POST /admin/addArticle
{
	"title":"PHP, Laravel, Orthogonality",
	"author":"admin",
	"banner":"assets/banner/img.png",
	"tags":["php", "laravel", "orthogonality"],
	"planRoles": "intermediate",
	"content":[
		{
			"type":"paragraph",
			"value":"Primeiro paragrafo"
		},
		{
			"type":"paragraph",
			"value":"Segundo paragrafo"
		},
		{
			"type":"image",
			"url":"assets/img/img.png",
			"legend":"Legenda da imagem",
			"alt":"Imagem.png"
		}
	]
}
```
Resposta:
```json
{
	"message": "Article created successfully",
	"article": {
		"title": "PHP, Laravel, Orthogonality",
		"slug": "php-laravel-orthogonality",
		"author": "admin",
		"content": [
			{
				"type": "paragraph",
				"value": "Primeiro paragrafo"
			},
			{
				"type": "paragraph",
				"value": "Segundo paragrafo"
			},
			{
				"type": "image",
				"url": "assets/img/img.png",
				"legend": "Legenda da imagem",
				"alt": "Imagem.png"
			}
		],
		"banner": "assets/banner/img.png",
		"tags": [
			"php",
			"laravel",
			"orthogonality"
		],
		"planRoles": "intermediate",
		"_id": "691cc504c5327f68d49516f8",
		"creationDate": "2025-11-18T19:12:04.094Z",
		"__v": 0
	}
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
| **Usuário (Login)**    | ✅      |            | Sucesso, Erro, Autenticação    |
| **Usuário (Register)** | ✅      |            | Sucesso, Erro, Validação       |
| **Artigos**            |         |            | Sucesso, Erro, Validação       |
| **Comentários**        |         |            | Sucesso, Erro, Validação       |
| **Likes**              |         |            | Sucesso, Erro, Validação       |

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
