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

router.get('/likes', lightSlowDown('likes'), lightRateLimit('likes'), auth, authInteractions, allLikes);
router.get('/articles', lightSlowDown('articles'), lightRateLimit('articles'), auth, allArticles);
router.get('/articles/tag', lightSlowDown('articlesFindByTag'), lightRateLimit('articlesFindByTag'), auth, findArticleByTag);
router.get('/article/:slug', lightSlowDown('articleBySlug'), lightRateLimit('articleBySlug'), auth, credentialsAuth, planValidation, loadArticle);
router.get('/articles/search', lightSlowDown('articlesFindBySearch'), lightRateLimit('articlesFindBySearch'), auth, searchValidation, searchArticles);
router.get('/get/url/Oauth/signIn', sensitiveSlowDown('oauth2Url'), sensitiveRateLimit('oauth2Url'), getSignInGoogleUrl);
router.get('/get/url/Oauth/signUp', sensitiveSlowDown('oauth2Url'), sensitiveRateLimit('oauth2Url'), getSignUpGoogleUrl);
router.get('/Oauth/signIn', sensitiveSlowDown('oauth2'), sensitiveRateLimit('oauth2'), signInWithOauth);
router.get('/Oauth/signUp', sensitiveSlowDown('oauth2'), sensitiveRateLimit('oauth2'), signUpWithOauth);
router.get('/verify-email', sensitiveSlowDown('verifyEmail'), sensitiveRateLimit('verifyEmail'), verifyUser);
router.get('/subscribe', sensitiveSlowDown('subscribe'), sensitiveRateLimit('subscribe'), auth, subscriptionValidation, subscribe);

router.post('/signIn', heavySlowDown('authentication'), heavyRateLimit('authentication'), validate(signInSchema, signInErrorMap), signIn);
router.post('/signUp', heavySlowDown('authentication'), heavyRateLimit('authentication'), validate(signUpSchema, signUpErrorMap), signUp);
router.post('/article/:slug/like', heavySlowDown('addLike'), heavyRateLimit('addLike'), auth, authInteractions, credentialsAuth, planValidation, like);
router.post('/article/:slug/comment', heavySlowDown('addComment'), heavyRateLimit('addComment'), auth, authInteractions, credentialsAuth, planValidation, validate(commentSchema, commentErrorMap), comment);

router.put('/article/:slug/comment/:commentId', heavySlowDown('editComment'), heavyRateLimit('editComment'), auth, authInteractions, credentialsAuth, planValidation, validate(commentSchema, commentErrorMap), EditComment);

router.delete('/article/:slug/like/:likeId', heavySlowDown('deleteLike'), heavyRateLimit('deleteLike'), auth, authInteractions, credentialsAuth, planValidation, DeleteLike);
router.delete('/article/:slug/comment/:commentId', heavySlowDown('deleteComment'), heavyRateLimit('deleteComment'), auth, authInteractions, credentialsAuth, planValidation, removeComment);

export default router;
