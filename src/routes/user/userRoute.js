import express from 'express';

import { signIn, signUp } from '../../controllers/user/userController.js';
import { like, DeleteLike, allLikes } from '../../controllers/user/likeController.js';
import { comment, removeComment, EditComment } from '../../controllers/user/commentController.js';
import { allArticles, loadArticle, findArticleByTag, searchArticles } from '../../controllers/user/articleController.js';
import { subscribe } from '../../controllers/user/subscription.js';

import { signUpValidator } from '../../middlewares/user/signUpValidation.js';
import { loginValidate } from '../../middlewares/universal/loginValidate.js'; 
import { postValidate } from '../../middlewares/user/postValidation.js';   
import { auth } from '../../middlewares/user/authorization.js';
import { planValidation } from '../../middlewares/user/planValidation.js';
import { credentialsAuth } from '../../middlewares/user/credentialsAuth.js';
import { searchValidation } from '../../middlewares/user/searchValidation.js';

const router = express.Router();

router.get('/likes', auth, allLikes);
router.get('/articles', auth, allArticles);
router.get('/articles/tag', auth, findArticleByTag);
router.get('/article/:slug', auth, credentialsAuth, planValidation, loadArticle);
router.get('/articles/search', auth, searchValidation, searchArticles);

router.post('/signIn', loginValidate, signIn);
router.post('/signUp', signUpValidator, signUp);
router.post('/article/:slug/like', auth, credentialsAuth, planValidation, like);
router.post('/article/:slug/comment', auth, credentialsAuth, planValidation, postValidate, comment);
router.post('/subscribe', auth, subscribe);

router.put('/article/:slug/comment/:commentId', auth, credentialsAuth, planValidation, postValidate, EditComment);

router.delete('/article/:slug/like/:likeId', auth, credentialsAuth, planValidation, DeleteLike);
router.delete('/article/:slug/comment/:commentId', auth, credentialsAuth, planValidation, removeComment);

export default router;