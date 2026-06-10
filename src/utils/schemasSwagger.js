/**
 * @swagger
 * components:
 *   schemas:
 *     Like:
 *       items:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             example: "cuid123"
 *             description: ID do like (CUID)
 *           articleSlug:
 *             type: string
 *             example: "artigo-slug"
 *             description: Slug do artigo que recebeu o like
 *       required:
 *         - id
 *         - articleSlug
 *     Error:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 400
 *           description: Código de status HTTP do erro
 *         message:
 *           type: string
 *           example: "Mensagem de erro"
 *           description: Mensagem de erro
 *       required:
 *         - statusCode
 *         - message
 *     ArticleListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cuid123"
 *           description: ID do artigo (CUID)
 *         title:
 *           type: string
 *           example: "Título do Artigo"
 *           description: Título do artigo
 *         summary:
 *           type: string
 *           example: "Resumo do artigo..."
 *           description: Resumo do artigo
 *         slug:
 *           type: string
 *           example: "titulo-do-artigo"
 *           description: Slug do artigo
 *         creationDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *           description: Data de criação do artigo
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["tag1", "tag2"]
 *           description: Tags do artigo
 *         author:
 *           type: string
 *           example: "Nome do Autor"
 *           description: Autor do artigo
 *       required:
 *         - id
 *         - title
 *         - slug
 *         - creationDate
 *         - author
 *     Article:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cuid123"
 *           description: ID do artigo (CUID)
 *         title:
 *           type: string
 *           example: "Título do Artigo"
 *           description: Título do artigo
 *         summary:
 *           type: string
 *           example: "Resumo do artigo..."
 *           description: Resumo do artigo
 *         slug:
 *           type: string
 *           example: "titulo-do-artigo"
 *           description: Slug do artigo
 *         creationDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *           description: Data de criação do artigo
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["tag1", "tag2"]
 *           description: Tags do artigo
 *         author:
 *           type: string
 *           example: "Nome do Autor"
 *           description: Autor do artigo
 *         content:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [paragraph, image]
 *                 example: "paragraph"
 *                 description: Tipo do conteúdo
 *               value:
 *                 type: string
 *                 example: "Texto do parágrafo..."
 *                 description: Valor do conteúdo (para parágrafos)
 *               url:
 *                 type: string
 *                 example: "https://exemplo.com/imagem.jpg"
 *                 description: URL da imagem (para imagens)
 *               legend:
 *                 type: string
 *                 example: "Legenda da imagem"
 *                 description: Legenda da imagem
 *               alt:
 *                 type: string
 *                 example: "Texto alternativo"
 *                 description: Texto alternativo da imagem
 *           description: Conteúdo do artigo
 *         viewsCount:
 *           type: integer
 *           example: 100
 *           description: Número de visualizações
 *         likeCount:
 *           type: integer
 *           example: 50
 *           description: Número de curtidas
 *         commentCount:
 *           type: integer
 *           example: 20
 *           description: Número de comentários
 *         planRole:
 *           type: string
 *           enum: [free, basic, intermediate, premium]
 *           example: "free"
 *           description: Plano necessário para acessar o artigo
 *       required:
 *         - id
 *         - title
 *         - slug
 *         - creationDate
 *         - author
 *         - content
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cuid123"
 *           description: ID do comentário (CUID)
 *         userId:
 *           type: string
 *           example: "user-cuid123"
 *           description: ID do usuário que fez o comentário
 *         userName:
 *           type: string
 *           example: "Nome do Usuário"
 *           description: Nome do usuário que fez o comentário
 *         post:
 *           type: string
 *           example: "Texto do comentário..."
 *           description: Texto do comentário
 *         creationDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *           description: Data de criação do comentário
 *         articleSlug:
 *           type: string
 *           example: "titulo-do-artigo"
 *           description: Slug do artigo do comentário
 *       required:
 *         - id
 *         - userId
 *         - userName
 *         - post
 *         - creationDate
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 100
 *           description: Total de itens
 *         pages:
 *           type: integer
 *           example: 5
 *           description: Total de páginas
 *         currentPage:
 *           type: integer
 *           example: 1
 *           description: Página atual
 *         limit:
 *           type: integer
 *           example: 20
 *           description: Itens por página
 *         hasNext:
 *           type: boolean
 *           example: true
 *           description: Se há próxima página
 *         hasPrev:
 *           type: boolean
 *           example: false
 *           description: Se há página anterior
 *       required:
 *         - total
 *         - pages
 *         - currentPage
 *         - limit
 *         - hasNext
 *         - hasPrev
 *     ArticlesResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Articles obtained"
 *           description: Mensagem de sucesso
 *         articles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ArticleListItem'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *       required:
 *         - message
 *         - articles
 *         - pagination
 *     ArticleWithCommentsResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Article loaded"
 *           description: Mensagem de sucesso
 *         article:
 *           $ref: '#/components/schemas/Article'
 *         comment:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *       required:
 *         - message
 *         - article
 *         - comment
 *     UrlResponse:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           example: "https://exemplo.com"
 *           description: URL retornada
 *       required:
 *         - url
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Operação realizada com sucesso"
 *           description: Mensagem de sucesso
 *       required:
 *         - message
 */

const schemas = {};
export default schemas;