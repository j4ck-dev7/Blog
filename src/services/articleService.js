import { allArticles, findArticleBySlug, findArticlesByTag, countArticlesByTag, searchArticles, searchArticlesCount, incrementArticleViews } from "../repositories/articleRepository.js";
import { getCommentsBySlug } from "../repositories/commentRepository.js";
import client from "../config/redis.js";
import { countArticles } from "../repositories/articleRepository.js";
import { formatArticles } from "../utills/formatArticles.js";
import { formatDateTime } from '../utills/formatarDataHora.js';
import { relativeTime } from "../utills/tempoRelativo.js";

export const GetAllArticles = async (page, limit) => {
    const skip = (page - 1) * limit;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
    const CACHE_TTL = 300; // Tempo de vida do cache em segundos (5 minutos)

    const cacheKey = `articles:page:${pageNum}:limit:${limitNum}`;
    const cached = await client.get(cacheKey);

    if(cached){
        const data = JSON.parse(cached);
        return data; // Se o cache existir ele retorna para o cliente, o tempo de resposta pode ser menor que 100ms
    }

    const [total, articlesData] = await Promise.all([
        countArticles(),
        allArticles(skip, limitNum)
    ]);

    if(!articlesData.length){
        throw new Error('Articles not found');
    }

    const articles = formatArticles(articlesData);

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

    return data;
}

export const LoadArticleBySlug = async (slug) => {
    const [article, comment] = await Promise.all([
        findArticleBySlug(slug),
        getCommentsBySlug(slug)
    ])

    if(!article){
        throw new Error('Article not found');
    }

    const articleLoad = {
        title: article.title,
        author: article.author,
        content: article.content,
        likes: article.likeCount,
        tags: article.tags,
        createIn: formatDateTime(article.creationDate)
    };

    const commentsFormatted = comment.map(c => ({
        userName: c.userName,
        post: c.post,
        creationDate: relativeTime(c.creationDate)
    }));

    const data = {
        articleLoad,
        comments: commentsFormatted || 0
    }

    await incrementArticleViews(slug);

    return data;
}

export const FindArticlesByTag = async (tag, page, limit) => {
    const skip = (page - 1) * limit;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));

    const [total, articlesData] = await Promise.all([
        countArticlesByTag(tag),
        findArticlesByTag(tag, skip, limitNum)
    ]);

    if(!articlesData.length){
        throw new Error('Articles not found');
    }

    const articles = formatArticles(articlesData);

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

    return data;
}

export const SearchForArticles = async (query, page, limit) => {
    const skip = (page - 1) * limit;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));

    const [total, articlesData] = await Promise.all([
        searchArticlesCount(query),
        searchArticles(query, skip, limitNum)
    ]);

    if(!articlesData.length){
        throw new Error('Articles not found');
    }
    
    const articles = formatArticles(articlesData);  
    const totalPages = Math.ceil(total / limitNum);
    const pagination = {
        total,
        pages: totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
    };

    return {
        articles,
        pagination
    };
}