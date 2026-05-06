import express from 'express';

import { signIn, signUp, signUpWithOauth, signInWithOauth, getSignInGoogleUrl, getSignUpGoogleUrl, verifyUser } from '../controllers/userController.js';
import { like, DeleteLike, allLikes } from '../controllers/likeController.js';
import { comment, removeComment, EditComment } from '../controllers/commentController.js';
import { allArticles, loadArticle, findArticleByTag, searchArticles } from '../controllers/articleController.js';
import { subscribe } from '../controllers/subscription.js';
import * as rateLimit from '../middlewares/rateLimit.js';

import { signUpValidator } from '../middlewares/signUpValidation.js';
import { loginValidate } from '../middlewares/loginValidate.js'; 
import { postValidate } from '../middlewares/postValidation.js';   
import { auth } from '../middlewares/authorization.js';
import { planValidation } from '../middlewares/planValidation.js';
import { credentialsAuth } from '../middlewares/credentialsAuth.js';
import { searchValidation } from '../middlewares/searchValidation.js';
import { authInteractions } from '../middlewares/authorizationInteractions.js';

const router = express.Router();

router.get('likes', rateLimit.likesLimit,auth, authInteractions, allLikes);
router.get('articles', rateLimit.articlesLimit, auth, allArticles);
router.get('articles/tag', rateLimit.articlesFindByTagLimit, auth, findArticleByTag);
router.get('article/:slug', rateLimit.articleFindBySlugLimit, auth, credentialsAuth, planValidation, loadArticle);
router.get('articles/search', rateLimit.articlesFindBySearchLimit, auth, searchValidation, searchArticles);
router.get('get/url/Oauth/signIn', rateLimit.Oauth2UrlLimit, getSignInGoogleUrl);
router.get('get/url/Oauth/signUp', rateLimit.Oauth2UrlLimit, getSignUpGoogleUrl);
router.get('Oauth/signIn', rateLimit.Oauth2AuthenticationLimit, signInWithOauth);
router.get('Oauth/signUp', rateLimit.Oauth2AuthenticationLimit, signUpWithOauth);
router.get('verify-email', rateLimit.verifyEmailLimit, verifyUser);
router.get('subscribe', rateLimit.subscribeLimit, auth, subscribe);

router.post('signIn', rateLimit.autenticacaoLimit, loginValidate, signIn);
router.post('signUp', rateLimit.autenticacaoLimit, signUpValidator, signUp);
router.post('article/:slug/like', rateLimit.addLikeLimit, auth, authInteractions, credentialsAuth, planValidation, like);
router.post('article/:slug/comment', rateLimit.addCommentLimit, auth, authInteractions, credentialsAuth, planValidation, postValidate, comment);

router.put('article/:slug/comment/:commentId', rateLimit.editCommentLimit, auth, authInteractions, credentialsAuth, planValidation, postValidate, EditComment);

router.delete('article/:slug/like/:likeId', rateLimit.deleteLikeLimit, auth, authInteractions, credentialsAuth, planValidation, DeleteLike);
router.delete('article/:slug/comment/:commentId', rateLimit.deleteCommentLimit, auth, authInteractions, credentialsAuth, planValidation, removeComment);

export default router;