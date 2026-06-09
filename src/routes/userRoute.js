import express from 'express';

import { signIn, signUp, signUpWithOauth, signInWithOauth, getSignInGoogleUrl, getSignUpGoogleUrl, verifyUser } from '../controllers/userController.js';
import { like, DeleteLike, allLikes } from '../controllers/likeController.js';
import { comment, removeComment, EditComment } from '../controllers/commentController.js';
import { allArticles, loadArticle, findArticleByTag, searchArticles } from '../controllers/articleController.js';
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
 * /api/likes:
 *   get:
 *     summary: Retorna uma lista de todos os likes do usuário autenticado
 *     description: 
 *       Recupera os registros de likes realizados pelo usuário.
 *       Esta rota está protegida por autenticação via Cookie e possui limitação de taxa (rate limiting).
 *     tags:
 *       - Likes
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de likes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Like'
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
 *               properties:
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
router.get('/articles', lightSlowDown('articles'), lightRateLimit('articles'), auth, allArticles);
router.get('/articles/tag', lightSlowDown('articlesFindByTag'), lightRateLimit('articlesFindByTag'), auth, findArticleByTag);
router.get('/article/:slug', lightSlowDown('articleBySlug'), lightRateLimit('articleBySlug'), auth, loadArticle);
router.get('/articles/search', lightSlowDown('articlesFindBySearch'), lightRateLimit('articlesFindBySearch'), auth, searchArticles);
router.get('/get/url/Oauth/signIn', sensitiveSlowDown('oauth2Url'), sensitiveRateLimit('oauth2Url'), getSignInGoogleUrl);
router.get('/get/url/Oauth/signUp', sensitiveSlowDown('oauth2Url'), sensitiveRateLimit('oauth2Url'), getSignUpGoogleUrl);
router.get('/Oauth/signIn', sensitiveSlowDown('oauth2'), sensitiveRateLimit('oauth2'), signInWithOauth);
router.get('/Oauth/signUp', sensitiveSlowDown('oauth2'), sensitiveRateLimit('oauth2'), signUpWithOauth);
router.get('/verify-email', sensitiveSlowDown('verifyEmail'), sensitiveRateLimit('verifyEmail'), verifyUser);
router.get('/subscribe', sensitiveSlowDown('subscribe'), sensitiveRateLimit('subscribe'), auth, subscribe);

router.post('/signIn', heavySlowDown('authentication'), heavyRateLimit('authentication'), validate(signInSchema, signInErrorMap), signIn);
router.post('/signUp', heavySlowDown('authentication'), heavyRateLimit('authentication'), validate(signUpSchema, signUpErrorMap), signUp);
router.post('/article/:slug/like', heavySlowDown('addLike'), heavyRateLimit('addLike'), auth, authInteractions, like);
router.post('/article/:slug/comment', heavySlowDown('addComment'), heavyRateLimit('addComment'), auth, authInteractions, validate(commentSchema, commentErrorMap), comment);

router.put('/article/:slug/comment/:commentId', heavySlowDown('editComment'), heavyRateLimit('editComment'), auth, authInteractions, validate(commentSchema, commentErrorMap), EditComment);

router.delete('/article/:slug/like/:likeId', heavySlowDown('deleteLike'), heavyRateLimit('deleteLike'), auth, authInteractions, DeleteLike);
router.delete('/article/:slug/comment/:commentId', heavySlowDown('deleteComment'), heavyRateLimit('deleteComment'), auth, authInteractions, removeComment);

export default router;
