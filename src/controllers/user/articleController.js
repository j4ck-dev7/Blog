import Article from '../../models/Article.js';
import Comment from '../../models/Comment.js';
import Like from '../../models/Like.js';
import client from '../../config/redis.js';
import User from '../../models/User.js';

import { formatDateTime } from '../../utills/formatarDataHora.js';
import { relativeTime } from '../../utills/tempoRelativo.js';
import { isValidObjectId } from '../../utills/isValidObjectId.js';

const CACHE_TTL = 30;

export const allArticles = async (req, res) => {
    try {
      const pageNum = Math.max(1, parseInt(req.query.page));
      const limitNum = Math.min(5, Math.max(1, parseInt(req.query.limit)));
      const skip = (pageNum -1) * limitNum;

      const cacheKey = `articles:page:${pageNum}:limit:${limitNum}`
      const cached = await client.get(cacheKey);
      if(cached){
        return res.status(200).json(JSON.parse(cached));
      }

      const [total, articlesData] = await Promise.all([
        Article.countDocuments(),
        Article.find()
          .sort({ creationDate: -1 })
          .skip(skip)
          .limit(limitNum)
          .select('-_id -__v -content')
          .lean()
      ]);

      if(!articlesData.length) return res.status(400).json({ message: 'Articles not found' })

      const articles = articlesData.map(a => ({
        title: a.title,
        banner: a.banner,
        tags: a.tags,
        plan: a.planRole,
        createdIn: formatDateTime(a.creationDate),
        likeCount: a.likeCount || 0,
        commentCount: a.commentCount || 0,
        viewsCount: a.viewsCount || 0
      }));

      const totalPages = Math.ceil(total / limitNum);
      const pagination = {
        total,
        pages: totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      };

      const data = {
        articles,
        pagination
      };

      await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(data))

      res.status(200).json({ 
        message: 'Articles obtained', 
        data
      });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error(error);
    }
}

export const loadArticle = async (req, res) => {
    const { slug } = req.params;
    const planWeight = {
      free: 0,
      basic: 1,
      intermediate: 2,
      premium: 3
    }

    try {
      const data = await Article.findOne({ slug })
        .select('-__v -conteudo._id -slug -viewsCount -commentCount')
        .lean()
      
      const userComments = await Comment.find({ article: data._id})
        .select('-_id -article -__v +isEdited ')
        .sort({ createdAt: -1 })
        .populate({
          path: 'user',
          select: '-_id -__v -password -role -email -subscription -role'
        })
        .limit(20)
        .lean();

      if (!data) {
        return res.status(404).json({ message: 'Article not found' });
      }

      const now = new Date();

      const planUser = planWeight[req.user.subscription.plan];
      const planExpires = new Date(req.user.subscription.expiresAt);
      const planArticle = planWeight[data.planRole];

      if(planUser < planArticle) return res.status(403).json({
        message: 'Access denied: Upgrade your subscription to access this article'
      });

      if(null && now > planExpires) {
        await User.findByIdAndUpdate(req.user._id, {
          'subscription.plan': 'free',
          'subscription.expiresAt': null,
        });

        return res.status(403).json({ message: 'Access denied: Renew your subscription' });
      };

      const articleId = data._id;
      if (!isValidObjectId(articleId)) {
        return res.status(400).json({ 
          message: 'ID inválido' 
        });
      };

      const articleLoad = {
        title: data.title,
        author: data.author,
        content: data.content,
        likes: data.likeCount,
        tags: data.tags,
        createIn: formatDateTime(data.creationDate)
      };

      const comment = userComments.map(c => ({
        content: c.post,
        user: c.user,
        createdIn: relativeTime(c.creationDate),
        edited: c.isEdited
      }));

      await Article.updateOne({slug}, { $inc: { viewsCount: 1 } })

      res.status(200).json({
        article: {
          articleLoad,
        },           
        comments: comment
      });

    }catch (error) {
      console.error('Error loading article', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
};

export const findArticleByTag = async (req, res) => {
      const tags = req.query.tag;

      const pageNum = Math.max(1, parseInt(req.query.page));
      const limitNum = Math.min(5, Math.max(1, parseInt(req.query.limit)));
      const skip = (pageNum -1) * limitNum;

      const cacheKey = `articles:tag:${tags}:page:${pageNum}:limit:${limitNum}`

    try {
      const cached = await client.get(cacheKey);
      if(cached){
        return res.status(200).json(JSON.parse(cached));
      }

      const [total, articlesData] = await Promise.all([
        Article.countDocuments({tags}),
        Article.find({tags})
          .sort({ dataCriação: -1 })
          .skip(skip)
          .limit(limitNum)
          .select('-_id -conteudo -__v')
          .lean()
      ]);

      if(!articlesData.length) return res.status(400).json({ message: 'Articles not found' })

      const articles = articlesData.map(a => ({
        title: a.title,
        banner: a.banner,
        tags: a.tags,
        plan: a.planRole,
        createdIn: formatDateTime(a.creationDate),
        likeCount: a.likeCount || 0,
        commentCount: a.commentCount || 0,
        viewsCount: a.viewsCount || 0
      }));

      const totalPages = Math.ceil(total / limitNum);
      const pagination = {
        total,
        pages: totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      };

      const data = {
        articles,
        pagination
      };

      await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));

      res.status(200).json({ 
        message: 'Articles obtained', 
        data
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    };
};