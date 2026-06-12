import { GetAllArticles, LoadArticleBySlug, SearchForArticles, FindArticlesByTag } from "../services/articleService.js";
import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';

export const allArticles = async (req, res) => {
    try {
      const pageNum = req.query.page;
      const limitNum = req.query.limit;

      const data = await GetAllArticles(pageNum, limitNum)

      res.status(200).json({ 
        message: 'Articles obtained', 
        articles: data.articles, 
        pagination: data.pagination
      });
      logger.info('Artigos obtidos', getRequestMeta(req));
    } catch (error) {
      if(error.message === 'Articles not found'){
        logger.warn('Artigos não encontrados', getRequestMeta(req, { error: error.message }));
        return res.status(404).json({ message: 'Articles not found' });
      }

      logger.error('Erro ao obter artigos', { ...getRequestMeta(req), error: error.message, stack: error.stack });
      res.status(500).json({ message: 'Internal server error' });
    }
}

export const loadArticle = async (req, res) => {
    const { slug } = req.params;

    try {
      const data = await LoadArticleBySlug(slug);

      res.status(200).json({ 
        message: 'Article loaded', 
        article: data
      });
      logger.info('Artigo carregado', getRequestMeta(req));

    }catch (error) {
      if(error.message === 'Article not found'){
        logger.warn('Artigo não encontrado', getRequestMeta(req, { error: error.message }));
        return res.status(404).json({ message: 'Article not found' });
      }

      logger.error('Erro ao carregar artigo', { ...getRequestMeta(req), error: error.message, stack: error.stack });
      return res.status(500).json({ message: 'Internal server error' });
    }
};

export const findArticleByTag = async (req, res) => {
    try {
      const tags = req.query.tag;
      const pageNum = req.query.page;
      const limitNum = req.query.limit;

      const data = await FindArticlesByTag(tags, pageNum, limitNum);

      res.status(200).json({ 
        message: 'Articles obtained', 
        articles: data.articles, 
        pagination: data.pagination
      });
      logger.info('Artigos obtidos por tag', getRequestMeta(req));
    } catch (error) {
      if(error.message === 'Articles not found'){
        logger.warn('Artigos por tag não encontrados', getRequestMeta(req, { error: error.message }));
        return res.status(404).json({ message: 'Articles not found' });
      }

      logger.error('Erro ao buscar artigos por tag', { ...getRequestMeta(req), error: error.message, stack: error.stack });
      return res.status(500).json({ message: 'Internal server error' });
    };
};

export const searchArticles = async (req, res) => {
  try {
    const search = req.query.search;
    const pageNum = req.query.page;
    const limitNum = req.query.limit;

    const data = await SearchForArticles(search, pageNum, limitNum);

    res.status(200).json({
      message: 'Search results', 
      articles: data.articles,
      pagination: data.pagination
    })
    logger.info('Resultados de busca retornados', getRequestMeta(req));
  } catch (error) {
    if(error.message === 'Articles not found'){
      logger.warn('Busca não retornou artigos', getRequestMeta(req, { error: error.message }));
      return res.status(404).json({ message: 'Articles not found' });
    }

    logger.error('Erro ao pesquisar artigos', { ...getRequestMeta(req), error: error.message, stack: error.stack });
    return res.status(500).json({ message: 'Internal server error' });
  }  
};

export const renderMainPage = async (req, res) => {
  try {
    const pageNum = req.query.page || 1;
    const limitNum = req.query.limit;

    const data = await GetAllArticles(pageNum, limitNum);

    const user = req.user || null;

    res.render('main', {
      articles: data.articles,
      pagination: data.pagination,
      user: user
    });
    logger.info('Página principal renderizada', getRequestMeta(req));
  } catch (error) {
    if(error.message === 'Articles not found'){
      logger.warn('Artigos não encontrados para renderizar página principal', getRequestMeta(req, { error: error.message }));
      return res.status(404).render('main', {
        articles: [],
        pagination: null,
        user: null,
        error: 'Articles not found'
      });
    }

    logger.error('Erro ao renderizar página principal', { ...getRequestMeta(req), error: error.message, stack: error.stack });
    return res.status(500).render('main', {
      articles: [],
      pagination: null,
      user: null,
      error: 'Internal server error'
    });
  }
};