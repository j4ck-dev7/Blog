import Article from '../../models/Article.js';
import client from '../../config/redis.js';
import { prisma } from '../../lib/prisma.js';

import { formatDateTime } from '../../utills/formatarDataHora.js';
import { relativeTime } from '../../utills/tempoRelativo.js';
import { isValidObjectId } from '../../utills/isValidObjectId.js';

const CACHE_TTL = 30;

export const allArticles = async (req, res) => {
    try {
      const pageNum = Math.max(1, parseInt(req.query.page)); // Paginação com skip e limit, necessário outra alternativa de paginação para grandes volumes de dados
      const limitNum = Math.min(20, Math.max(1, parseInt(req.query.limit)));
      const skip = (pageNum -1) * limitNum; // Skip é ineficiente para grandes volumes de dados

      const cacheKey = `articles:page:${pageNum}:limit:${limitNum}` // Chave única para identificação no redis
      const cached = await client.get(cacheKey); // Busca o cache com a chave sendo 
      if(cached){
        return res.status(200).json(JSON.parse(cached)); // Se o cache existir ele retorna para o cliente, o tempo de resposta pode ser menor que 100ms
      }

      // Como o Promise.all() executa em paralelo cada operação, é necessário tomar cuidado pois cada operação é independente, ou seja se uma falhar as proximas vão ser executadas, exemplo em uma inserção de dados em um documento separado
      // que depois de inserido o dado um campo de um outro documento terá que ser incrementado, se a inserção falhar, a incrementação ainda será executada sendo um bug. Seu uso é apenas para leitura ou sem efeitos colaterais
      const [total, articlesData] = await Promise.all([ 
        Article.estimatedDocumentCount(), 
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

    try {
      const article = await Article.findOne({ slug })
        .select('-__v -content._id -slug -viewsCount -commentCount')
        .lean()

      const articleLoad = {
        title: article.title,
        author: article.author,
        content: article.content,
        likes: article.likeCount,
        tags: article.tags,
        createIn: formatDateTime(article.creationDate)
      };

      await Article.updateOne({slug}, { $inc: { viewsCount: 1 } }) // Quando o artigo é carregado, incrementa 1 no contador de visualizações
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
      const limitNum = Math.min(20, Math.max(1, parseInt(req.query.limit)));
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

export const searchArticles = async (req, res) => {
  try {
    const search = req.query.search; // Termo de busca, para APIs REST geralmente é passado via query params, sendo a melhor opção.
    const pageNum = Math.max(1, parseInt(req.query.page));
    const limitNum = Math.min(20, Math.max(1, parseInt(req.query.limit)));
    const skip = (pageNum -1) * limitNum;

    const articlesFind = await Article.find({
      $text: { $search: search } // Busca textual conforme o índice criado no modelo do artigo
    }, {
      score: { $meta: "textScore" } // O score serve para ordenar os resultados conforme a relevância da busca
    })
      .sort({ score: { $meta: "textScore" } }).sort({ creationDate: -1 })
      .skip(skip) // Skip é problemática, ao chegar em uma determinada página ex: 100, o tempo de resposta da consulta até o banco de dados e o seu retorno pode chegar á 3000ms
      .limit(limitNum)
      .select('-_id -__v -content') // Seleciona | oculta campos do documento
      .lean() // Necessário em consultas, converte os documentos em objetos JavaScript

    if(!articlesFind.length) return res.status(400).json({ message: 'Articles not found' })

    const articles = articlesFind.map(a => ({
      title: a.title,
      banner: a.banner,
      tags: a.tags,
      plan: a.planRole,
      createdIn: formatDateTime(a.creationDate),
      likeCount: a.likeCount || 0,
      commentCount: a.commentCount || 0,
      viewsCount: a.viewsCount || 0
    }));

    res.status(200).json({
      message: 'Search results', 
      articles      
    })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    console.error('Error searching articles', error);
  }  
}