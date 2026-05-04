import express from 'express';

import { signIn, signUp, signUpWithOauth, signInWithOauth, getSignInGoogleUrl, getSignUpGoogleUrl } from '../controllers/userController.js';
import { like, DeleteLike, allLikes } from '../controllers/likeController.js';
import { comment, removeComment, EditComment } from '../controllers/commentController.js';
import { allArticles, loadArticle, findArticleByTag, searchArticles } from '../controllers/articleController.js';
import { subscribe } from '../controllers/subscription.js';

import { signUpValidator } from '../middlewares/signUpValidation.js';
import { loginValidate } from '../middlewares/loginValidate.js'; 
import { postValidate } from '../middlewares/postValidation.js';   
import { auth } from '../middlewares/authorization.js';
import { planValidation } from '../middlewares/planValidation.js';
import { credentialsAuth } from '../middlewares/credentialsAuth.js';
import { searchValidation } from '../middlewares/searchValidation.js';
import { authInteractions } from '../middlewares/authorizationInteractions.js';

const router = express.Router();

router.get('likes', auth, authInteractions, allLikes);
router.get('articles', auth, allArticles);
router.get('articles/tag', auth, findArticleByTag);
router.get('article/:slug', auth, credentialsAuth, planValidation, loadArticle);
router.get('articles/search', auth, searchValidation, searchArticles);
router.get('get/url/Oauth/signIn', getSignInGoogleUrl);
router.get('get/url/Oauth/signUp', getSignUpGoogleUrl);
router.get('Oauth/signIn', signInWithOauth);
router.get('Oauth/signUp', signUpWithOauth);

router.post('signIn', loginValidate, signIn);
router.post('signUp', signUpValidator, signUp);
router.post('article/:slug/like', auth, authInteractions, credentialsAuth, planValidation, like);
router.post('article/:slug/comment', auth, authInteractions, credentialsAuth, planValidation, postValidate, comment);
router.post('subscribe', auth, subscribe);

router.put('article/:slug/comment/:commentId', auth, authInteractions, credentialsAuth, planValidation, postValidate, EditComment);

router.delete('article/:slug/like/:likeId', auth, authInteractions, credentialsAuth, planValidation, DeleteLike);
router.delete('article/:slug/comment/:commentId', auth, authInteractions, credentialsAuth, planValidation, removeComment);

export default router;