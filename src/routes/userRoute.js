import express from 'express';

import { signIn, signUp, signUpWithOauth, signInWithOauth, getSignInGoogleUrl, getSignUpGoogleUrl, verifyUser } from '../controllers/userController.js';
import { like, DeleteLike, allLikes } from '../controllers/likeController.js';
import { comment, removeComment, EditComment } from '../controllers/commentController.js';
import { allArticles, loadArticle, findArticleByTag, searchArticles, renderMainPage } from '../controllers/articleController.js';
import { subscribe } from '../controllers/subscription.js';
import { signInSchema, signInErrorMap } from '../validators/signIn.validation.js';
import { signUpSchema, signUpErrorMap } from '../validators/signUp.validation.js';
import { commentSchema, commentErrorMap } from '../validators/comment.validation.js';

import { lightRateLimit, heavyRateLimit, sensitiveRateLimit } from '../middlewares/rateLimit.js';
import { lightSlowDown, heavySlowDown, sensitiveSlowDown } from '../middlewares/slowDown.js';
import { validate } from '../middlewares/validation.js';
import { auth } from '../middlewares/authorization.js';
import { authInteractions } from '../middlewares/authorizationInteractions.js';

const router = express.Router();

/**
 * @swagger
 * /likes:
 *   get:
 *     summary: Retorna uma lista de todos os likes do usuário autenticado
 *     description: 
 *       Recupera os registros de likes realizados pelo usuário.
 *       Esta rota está protegida por autenticação via Cookie, possui limitação de taxa (rate limiting) e delay de requisição exponencial (slow down).
 *     tags:
 *       - Likes
 *     security: 
 *      - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de likes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Like'
 *       401:
 *         description: Não autorizado. Cookie de autenticação inválido ou ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso proibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *               example:
 *                 message:
 *                   type: string
 *                   example: "Muitas solicitações. Por favor, tente novamente mais tarde."
 *       500:
 *         description: Erro interno do servidor
 *     x-rate-limit:
 *       max_requests: 30
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares lightSlowDown e lightRateLimit"
 */
router.get('/likes', lightSlowDown('likes'), lightRateLimit('likes'), auth, authInteractions, allLikes);

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Retorna uma lista paginada de todos os artigos
 *     description: 
 *       Recupera todos os artigos com paginação. Esta rota está protegida por autenticação via Cookie, mas está disponível para usuários com qualquer nível de assinatura, 
 *       incluindo usuários sem assinaturas (free) e sem autenticação.
 *       possui limitação de taxa (rate limiting) e delay de requisição exponencial (slow down).
 *     tags:
 *       - Articles
 *     security: 
 *      - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *           description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *           description: Quantidade de itens por página
 *     responses:
 *       200:
 *         description: Lista de artigos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArticlesResponse'
 *       401:
 *         description: Não autorizado. Cookie de autenticação inválido ou ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso proibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Artigos não encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Articles not found"
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 30
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares lightSlowDown e lightRateLimit"
 */
router.get('/articles', lightSlowDown('articles'), lightRateLimit('articles'), auth, allArticles);

/**
 * @swagger
 * /articles/tag:
 *   get:
 *     summary: Retorna artigos filtrados por tag
 *     description: 
 *       Recupera artigos que possuem a tag especificada, com paginação.
 *       Esta rota está protegida por autenticação via Cookie, mas está disponível para usuários com qualquer nível de assinatura, 
 *       incluindo usuários sem assinaturas (free) e sem autenticação.possui limitação de taxa e delay de requisição.
 *     tags:
 *       - Articles
 *     security: 
 *      - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *           example: "javascript"
 *           description: Tag para filtrar os artigos
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *           description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *           description: Quantidade de itens por página
 *     responses:
 *       200:
 *         description: Lista de artigos filtrados por tag retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArticlesResponse'
 *       401:
 *         description: Não autorizado. Cookie de autenticação inválido ou ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso proibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Artigos não encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Articles not found"
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 30
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares lightSlowDown e lightRateLimit"
 */
router.get('/articles/tag', lightSlowDown('articlesFindByTag'), lightRateLimit('articlesFindByTag'), auth, findArticleByTag);

/**
 * @swagger
 * /article/{slug}:
 *   get:
 *     summary: Carrega um artigo pelo slug
 *     description: 
 *       Recupera um artigo específico pelo seu slug, junto com seus comentários.
 *       Esta rota está protegida por autenticação via Cookie, mas está disponível para usuários com qualquer nível de assinatura, 
 *       incluindo usuários sem assinaturas (free) e sem autenticação, desde que tenha a assinatura necessária. possui limitação de taxa e delay de requisição.
 *     tags:
 *       - Articles
 *     security: 
 *      - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "titulo-do-artigo"
 *           description: Slug do artigo a ser carregado
 *     responses:
 *       200:
 *         description: Artigo carregado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArticleWithCommentsResponse'
 *       401:
 *         description: Não autorizado. Cookie de autenticação inválido ou ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso proibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Artigo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Article not found"
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 30
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares lightSlowDown e lightRateLimit"
 */
router.get('/article/:slug', lightSlowDown('articleBySlug'), lightRateLimit('articleBySlug'), auth, loadArticle);

/**
 * @swagger
 * /articles/search:
 *   get:
 *     summary: Busca artigos por termo
 *     description: 
 *       Realiza busca textual em artigos com paginação.
 *       Esta rota está protegida por autenticação via Cookie, mas está disponível para usuários com qualquer nível de assinatura, 
 *       incluindo usuários sem assinaturas (free) e sem autenticação. possui limitação de taxa e delay de requisição.
 *     tags:
 *       - Articles
 *     security: 
 *      - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *           example: "javascript"
 *           description: Termo de busca
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *           description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *           description: Quantidade de itens por página
 *     responses:
 *       200:
 *         description: Resultados da busca retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Search results"
 *                 articles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ArticleListItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Não autorizado. Cookie de autenticação inválido ou ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso proibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Artigos não encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Articles not found"
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 30
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares lightSlowDown e lightRateLimit"
 */
router.get('/articles/search', lightSlowDown('articlesFindBySearch'), lightRateLimit('articlesFindBySearch'), auth, searchArticles);
/**
 * @swagger
 * /get/url/Oauth/signIn:
 *   get:
 *     summary: Obtém URL para login via Google OAuth
 *     description: 
 *       Retorna a URL de autenticação do Google para login via OAuth 2.0.
 *       Possui limitação de taxa e delay de requisição sensíveis.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: URL de login obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UrlResponse'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 10
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares sensitiveSlowDown e sensitiveRateLimit"
 */
router.get('/get/url/Oauth/signIn', sensitiveSlowDown('oauth2Url'), sensitiveRateLimit('oauth2Url'), getSignInGoogleUrl);

/**
 * @swagger
 * /get/url/Oauth/signUp:
 *   get:
 *     summary: Obtém URL para cadastro via Google OAuth
 *     description: 
 *       Retorna a URL de autenticação do Google para cadastro via OAuth 2.0.
 *       Possui limitação de taxa e delay de requisição sensíveis.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: URL de cadastro obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UrlResponse'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 10
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares sensitiveSlowDown e sensitiveRateLimit"
 */
router.get('/get/url/Oauth/signUp', sensitiveSlowDown('oauth2Url'), sensitiveRateLimit('oauth2Url'), getSignUpGoogleUrl);

/**
 * @swagger
 * /Oauth/signIn:
 *   get:
 *     summary: Realiza login via Google OAuth
 *     description: 
 *       Realiza o login do usuário utilizando o código de autorização do Google OAuth 2.0.
 *       Possui limitação de taxa e delay de requisição sensíveis.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           example: "4/0AX4XfWi..."
 *           description: Código de autorização do Google OAuth
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *         headers:
 *           Set-Cookie:
 *             description: Cookie de autenticação userAuth é definido
 *             schema:
 *               type: string
 *       401:
 *         description: Conta não encontrada ou erro de autenticação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 10
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares sensitiveSlowDown e sensitiveRateLimit"
 */
router.get('/Oauth/signIn', sensitiveSlowDown('oauth2'), sensitiveRateLimit('oauth2'), signInWithOauth);

/**
 * @swagger
 * /Oauth/signUp:
 *   get:
 *     summary: Realiza cadastro via Google OAuth
 *     description: 
 *       Realiza o cadastro do usuário utilizando o código de autorização do Google OAuth 2.0.
 *       Possui limitação de taxa e delay de requisição sensíveis.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *           example: "4/0AX4XfWi..."
 *           description: Código de autorização do Google OAuth
 *     responses:
 *       201:
 *         description: Cadastro realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *         headers:
 *           Set-Cookie:
 *             description: Cookie de autenticação userAuth é definido
 *             schema:
 *               type: string
 *       401:
 *         description: Usuário já existe ou erro de autenticação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 10
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares sensitiveSlowDown e sensitiveRateLimit"
 */
router.get('/Oauth/signUp', sensitiveSlowDown('oauth2'), sensitiveRateLimit('oauth2'), signUpWithOauth);

/**
 * @swagger
 * /verify-email:
 *   get:
 *     summary: Verifica email do usuário
 *     description: 
 *       Verifica o email do usuário utilizando o token de verificação enviado por email.
 *       Possui limitação de taxa e delay de requisição sensíveis.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           description: Token de verificação de email
 *     responses:
 *       200:
 *         description: Email verificado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *         headers:
 *           Set-Cookie:
 *             description: Cookie de autenticação userAuth é definido
 *             schema:
 *               type: string
 *       401:
 *         description: Token ausente, inválido, usuário não encontrado ou email já verificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro ao verificar email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 10
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares sensitiveSlowDown e sensitiveRateLimit"
 */
router.get('/verify-email', sensitiveSlowDown('verifyEmail'), sensitiveRateLimit('verifyEmail'), verifyUser);

/**
 * @swagger
 * /subscribe:
 *   get:
 *     summary: Gera URL para assinatura
 *     description: 
 *       Gera uma URL de checkout do Stripe para assinatura de plano premium.
 *       Esta rota está protegida por autenticação via Cookie, possui limitação de taxa e delay de requisição sensíveis.
 *     tags:
 *       - Subscription
 *     security: 
 *      - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: subscription
 *         required: true
 *         schema:
 *           type: string
 *           enum: [basic, intermediate, premium]
 *           example: "premium"
 *           description: Plano de assinatura desejado
 *     responses:
 *       200:
 *         description: URL de assinatura gerada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UrlResponse'
 *       400:
 *         description: Plano de assinatura inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado. Usuário não autenticado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso proibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 10
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares sensitiveSlowDown e sensitiveRateLimit"
 */
router.get('/subscribe', sensitiveSlowDown('subscribe'), sensitiveRateLimit('subscribe'), auth, subscribe);

/**
 * @swagger
 * /signIn:
 *   post:
 *     summary: Realiza login do usuário
 *     description: 
 *       Autentica o usuário com email e senha, gerando um cookie de autenticação.
 *       Possui validação de entrada, limitação de taxa e delay de requisição pesados.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@example.com"
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "senha123"
 *                 description: Senha do usuário
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *         headers:
 *           Set-Cookie:
 *             description: Cookie de autenticação userAuth é definido
 *             schema:
 *               type: string
 *       400:
 *         description: Erro de validação ou credenciais incorretas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Incorrect email or password"
 *                 attemptsRemaining:
 *                   type: integer
 *                   example: 3
 *                   description: Tentativas restantes antes do bloqueio
 *       401:
 *         description: Email não verificado ou usuário bloqueado por muitas tentativas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 15
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares heavySlowDown e heavyRateLimit"
 */
router.post('/signIn', heavySlowDown('authentication'), heavyRateLimit('authentication'), validate(signInSchema, signInErrorMap), signIn);

/**
 * @swagger
 * /signUp:
 *   post:
 *     summary: Realiza cadastro do usuário
 *     description: 
 *       Registra um novo usuário com nome, email e senha.
 *       Possui validação de entrada, limitação de taxa e delay de requisição pesados.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nome do Usuário"
 *                 description: Nome do usuário
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@example.com"
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "senha123"
 *                 description: Senha do usuário
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Cadastro realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Usuário já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 15
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares heavySlowDown e heavyRateLimit"
 */
router.post('/signUp', heavySlowDown('authentication'), heavyRateLimit('authentication'), validate(signUpSchema, signUpErrorMap), signUp);

/**
 * @swagger
 * /article/{slug}/like:
 *   post:
 *     summary: Adiciona uma curtida a um artigo
 *     description: 
 *       Adiciona uma curtida do usuário autenticado a um artigo.
 *       Esta rota está protegida por autenticação via Cookie, possui limitação de taxa e delay de requisição pesados.
 *     tags:
 *       - Likes
 *     security: 
 *      - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "titulo-do-artigo"
 *           description: Slug do artigo a ser curtido
 *     responses:
 *       201:
 *         description: Curtida adicionada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Você já curtiu este artigo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado. Cookie de autenticação inválido ou ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso proibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 15
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares heavySlowDown e heavyRateLimit"
 */
router.post('/article/:slug/like', heavySlowDown('addLike'), heavyRateLimit('addLike'), auth, authInteractions, like);

/**
 * @swagger
 * /article/{slug}/comment:
 *   post:
 *     summary: Adiciona um comentário a um artigo
 *     description: 
 *       Adiciona um comentário do usuário autenticado a um artigo.
 *       Esta rota está protegida por autenticação via Cookie, possui validação de entrada,
 *       limitação de taxa e delay de requisição pesados.
 *     tags:
 *       - Comments
 *     security: 
 *      - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "titulo-do-artigo"
 *           description: Slug do artigo a ser comentado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post:
 *                 type: string
 *                 example: "Este é um ótimo artigo!"
 *                 description: Texto do comentário
 *             required:
 *               - post
 *     responses:
 *       201:
 *         description: Comentário adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Slug inválido, ID inválido ou comentário inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado. Cookie de autenticação inválido ou ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso proibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário ou artigo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 15
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares heavySlowDown e heavyRateLimit"
 */
router.post('/article/:slug/comment', heavySlowDown('addComment'), heavyRateLimit('addComment'), auth, authInteractions, validate(commentSchema, commentErrorMap), comment);

/**
 * @swagger
 * /article/{slug}/comment/{commentId}:
 *   put:
 *     summary: Edita um comentário
 *     description: 
 *       Edita um comentário existente do usuário autenticado.
 *       Esta rota está protegida por autenticação via Cookie, possui validação de entrada,
 *       limitação de taxa e delay de requisição pesados.
 *     tags:
 *       - Comments
 *     security: 
 *      - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "titulo-do-artigo"
 *           description: Slug do artigo do comentário
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           example: "comment-cuid123"
 *           description: ID do comentário a ser editado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post:
 *                 type: string
 *                 example: "Texto do comentário editado"
 *                 description: Novo texto do comentário
 *             required:
 *               - post
 *     responses:
 *       204:
 *         description: Comentário editado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: ID inválido ou comentário inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado. Cookie de autenticação inválido ou ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso proibido ou usuário não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comentário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 15
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares heavySlowDown e heavyRateLimit"
 */
router.put('/article/:slug/comment/:commentId', heavySlowDown('editComment'), heavyRateLimit('editComment'), auth, authInteractions, validate(commentSchema, commentErrorMap), EditComment);

/**
 * @swagger
 * /article/{slug}/like/{likeId}:
 *   delete:
 *     summary: Remove uma curtida de um artigo
 *     description: 
 *       Remove uma curtida do usuário autenticado de um artigo.
 *       Esta rota está protegida por autenticação via Cookie, possui limitação de taxa e delay de requisição pesados.
 *     tags:
 *       - Likes
 *     security: 
 *      - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "titulo-do-artigo"
 *           description: Slug do artigo
 *       - in: path
 *         name: likeId
 *         required: true
 *         schema:
 *           type: string
 *           example: "like-cuid123"
 *           description: ID da curtida a ser removida
 *     responses:
 *       204:
 *         description: Curtida removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: Não autorizado. Cookie de autenticação inválido ou ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso proibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Curtida não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 15
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares heavySlowDown e heavyRateLimit"
 */
router.delete('/article/:slug/like/:likeId', heavySlowDown('deleteLike'), heavyRateLimit('deleteLike'), auth, authInteractions, DeleteLike);

/**
 * @swagger
 * /article/{slug}/comment/{commentId}:
 *   delete:
 *     summary: Remove um comentário
 *     description: 
 *       Remove um comentário do usuário autenticado de um artigo.
 *       Esta rota está protegida por autenticação via Cookie, possui limitação de taxa e delay de requisição pesados.
 *     tags:
 *       - Comments
 *     security: 
 *      - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: "titulo-do-artigo"
 *           description: Slug do artigo
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           example: "comment-cuid123"
 *           description: ID do comentário a ser removido
 *     responses:
 *       204:
 *         description: Comentário removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado. Cookie de autenticação inválido ou ausente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso proibido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comentário ou usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-rate-limit:
 *       max_requests: 15
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares heavySlowDown e heavyRateLimit"
 */
router.delete('/article/:slug/comment/:commentId', heavySlowDown('deleteComment'), heavyRateLimit('deleteComment'), auth, authInteractions, removeComment);

/**
 * @swagger
 * /main:
 *   get:
 *     summary: Renderiza a página principal com artigos
 *     description: 
 *       Renderiza a página principal usando EJS com a lista de artigos.
 *       Esta rota não retorna JSON, mas sim HTML renderizado.
 *     tags:
 *       - SSR
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *           description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *           description: Quantidade de itens por página
 *     responses:
 *       200:
 *         description: Página HTML renderizada com sucesso
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/main', lightSlowDown('main'), lightRateLimit('main'), auth, renderMainPage);

export default router;
