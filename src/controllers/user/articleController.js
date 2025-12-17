import Article from '../../models/Article.js';
import client from '../../config/redis.js';
import { prisma } from '../../lib/prisma.js';

import { formatDateTime } from '../../utills/formatarDataHora.js';
import { relativeTime } from '../../utills/tempoRelativo.js';
import { isValidObjectId } from '../../utills/isValidObjectId.js';

const CACHE_TTL = 30;

export const allArticles = async (req, res) => {
    try {
      const pageNum = Math.max(1, parseInt(req.query.page));
      const limitNum = Math.min(20, Math.max(1, parseInt(req.query.limit)));
      const skip = (pageNum -1) * limitNum;

      const cacheKey = `articles:page:${pageNum}:limit:${limitNum}` // Chave única para identificação no redis
      const cached = await client.get(cacheKey); // Busca o cache com a chave sendo 
      if(cached){
        return res.status(200).json(JSON.parse(cached)); // Se o cache existir ele retorna para o cliente, o tempo de resposta pode ser menor que 100ms
      }

      const [total, articlesData] = await Promise.all([
        Article.countDocuments(), 
        Article.find()
          .sort({ creationDate: -1 })
          .skip(skip) // Skip é problemática, ao chegar em uma determinada página ex: 100, o tempo de resposta da consulta até o banco de dados e o seu retorno pode chegar á 3000ms
          .limit(limitNum)
          .select('-_id -__v -content') // Seleciona | oculta campos do documento
          .lean() // Necessário em consultas, converte os documentos em objetos JavaScript
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

      await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(data)) // Quando não há cache ou foi expirado, é salvo no redis. Para salvar é necessário a chave, tempo de expiração e os dados convertidos para string

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
      FREE: 0,
      BASIC: 1,
      INTERMEDIATE: 2,
      PREMIUM: 3
    }

    try {
      const data = await Article.findOne({ slug })
        .select('-__v -conteudo._id -slug -viewsCount -commentCount')
        .lean()

      if (!data) {
        return res.status(404).json({ message: 'Article not found' });
      }

      const articleLoad = {
        title: data.title,
        author: data.author,
        content: data.content,
        likes: data.likeCount,
        tags: data.tags,
        createIn: formatDateTime(data.creationDate)
      };

      const planArticle = planWeight[data.planRole];
      if(planArticle === 0 || data.planRole === 'FREE'){
        await Article.updateOne({slug}, { $inc: { viewsCount: 1 } })

        return res.status(200).json({
          message: 'Article obtained',
          articleLoad
        })
      }

      const now = new Date();
      const planUser = planWeight[req.user.subscriptionPlan]

      if(req.user.subscriptionExpire){
        const planExpires = new Date(req.user.subscriptionExpire)

        if(now > planExpires){
          await prisma.user.update({
            where: { email: req.user.email },
            data: {
              subscriptionExpiresAt: null,
              subscriptionPlan: 'FREE'
            }
          });

          return res.status(403).json({
            message: 'Access denied: Your subscription has expired. Please renew to access premium content'
          })
        }
      }
      
      if(planUser < planArticle) {
        return res.status(403).json({
          message: 'Access denied: Upgrade your subscription to access this article'
        });
      }

      await Article.updateOne({slug}, { $inc: { viewsCount: 1 } })
      res.status(200).json({
        article: {
          articleLoad,
        }
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