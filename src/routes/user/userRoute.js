import express from 'express';

import { signIn } from '../../controllers/user/signIn.js';
import { signUp } from '../../controllers/user/signUp.js';
import { like, removeLike, allLikes } from '../../controllers/user/likeController.js';
import { comment, removeComment, editComment } from '../../controllers/user/commentController.js';
import { allArticles, loadArticle, findArticleByTag } from '../../controllers/user/articleController.js';
import { subscribe } from '../../controllers/user/subscription.js';

import { signUpValidator } from '../../middlewares/user/signUpValidation.js';
import { loginValidate } from '../../middlewares/universal/loginValidate.js'; 
import { postValidate } from '../../middlewares/user/postValidation.js';   
import { auth } from '../../middlewares/user/authorization.js';
import { planValidation } from '../../middlewares/user/planValidation.js';

const router = express.Router();

router.get('/likes', auth, allLikes);
router.get('/articles', auth, allArticles);
router.get('/articles/tag', auth, findArticleByTag);
router.get('/article/:slug', auth, planValidation, loadArticle);

router.post('/signIn', loginValidate, signIn);
router.post('/signUp', signUpValidator, signUp);
router.post('/article/:slug/like', auth, planValidation, like);
router.post('/article/:slug/comment', auth, postValidate, planValidation, comment);
router.post('/subscribe', auth, subscribe);

router.put('/article/comment/:commentId', auth, postValidate, planValidation, editComment);

router.delete('/article/:slug/like/:likeId', auth, planValidation, removeLike);
router.delete('/article/:slug/comment/:commentId', auth, planValidation, removeComment);

export default router;