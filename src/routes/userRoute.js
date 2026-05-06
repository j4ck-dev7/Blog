import express from 'express';

import { signIn, signUp, signUpWithOauth, signInWithOauth, getSignInGoogleUrl, getSignUpGoogleUrl, verifyUser } from '../controllers/userController.js';
import { like, DeleteLike, allLikes } from '../controllers/likeController.js';
import { comment, removeComment, EditComment } from '../controllers/commentController.js';
import { allArticles, loadArticle, findArticleByTag, searchArticles } from '../controllers/articleController.js';
import { subscribe } from '../controllers/subscription.js';
import * as rateLimit from '../middlewares/rateLimit.js';
import * as slowDown from '../middlewares/slowDown.js';

import { signUpValidator } from '../middlewares/signUpValidation.js';
import { loginValidate } from '../middlewares/loginValidate.js'; 
import { postValidate } from '../middlewares/postValidation.js';   
import { auth } from '../middlewares/authorization.js';
import { planValidation } from '../middlewares/planValidation.js';
import { credentialsAuth } from '../middlewares/credentialsAuth.js';
import { searchValidation } from '../middlewares/searchValidation.js';
import { authInteractions } from '../middlewares/authorizationInteractions.js';

const router = express.Router();

router.get('/likes', slowDown.allLikesSlowDown, rateLimit.likesLimit,auth, authInteractions, allLikes);
router.get('/articles', slowDown.articlesSlowDown, rateLimit.articlesLimit, auth, allArticles);
router.get('/articles/tag', slowDown.findArticlesByTagSlowDown, rateLimit.articlesFindByTagLimit, auth, findArticleByTag);
router.get('/article/:slug', slowDown.findArticleBySlugSlowDown, rateLimit.articleFindBySlugLimit, auth, credentialsAuth, planValidation, loadArticle);
router.get('/articles/search', slowDown.findArticlesBySearchSlowDown, rateLimit.articlesFindBySearchLimit, auth, searchValidation, searchArticles);
router.get('/get/url/Oauth/signIn', slowDown.Oauth2UrlSlowDown, rateLimit.Oauth2UrlLimit, getSignInGoogleUrl);
router.get('/get/url/Oauth/signUp', slowDown.Oauth2UrlSlowDown, rateLimit.Oauth2UrlLimit, getSignUpGoogleUrl);
router.get('/Oauth/signIn', slowDown.Oauth2SlowDown, rateLimit.Oauth2AuthenticationLimit, signInWithOauth);
router.get('/Oauth/signUp', slowDown.Oauth2SlowDown, rateLimit.Oauth2AuthenticationLimit, signUpWithOauth);
router.get('/verify-email', slowDown.verifyEmailSlowDown, rateLimit.verifyEmailLimit, verifyUser);
router.get('/subscribe', slowDown.subscriptionSlowDown, rateLimit.subscribeLimit, auth, subscribe);

router.post('/signIn', slowDown.authenticationSlowDown, rateLimit.autenticacaoLimit, loginValidate, signIn);
router.post('/signUp', slowDown.createUserSlowDown, rateLimit.autenticacaoLimit, signUpValidator, signUp);
router.post('/article/:slug/like', slowDown.addLikeSlowDown, rateLimit.addLikeLimit, auth, authInteractions, credentialsAuth, planValidation, like);
router.post('/article/:slug/comment', slowDown.addCommentSlowDown, rateLimit.addCommentLimit, auth, authInteractions, credentialsAuth, planValidation, postValidate, comment);

router.put('/article/:slug/comment/:commentId', slowDown.editCommentSlowDown, rateLimit.editCommentLimit, auth, authInteractions, credentialsAuth, planValidation, postValidate, EditComment);

router.delete('/article/:slug/like/:likeId', slowDown.deleteLikeSlowDown, rateLimit.deleteLikeLimit, auth, authInteractions, credentialsAuth, planValidation, DeleteLike);
router.delete('/article/:slug/comment/:commentId', slowDown.deleteCommentSlowDown, rateLimit.deleteCommentLimit, auth, authInteractions, credentialsAuth, planValidation, removeComment);

export default router;