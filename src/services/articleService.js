import { allArticles, findArticleBySlug, findArticlesByTag, countArticlesByTag, searchArticles, searchArticlesCount, incrementArticleViews, countArticles } from "../repositories/articleRepository.js";
import { getCommentsBySlug } from "../repositories/commentRepository.js";
import client from "../config/redis.js";

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

    const [total, articles] = await Promise.all([
        countArticles(),
        allArticles(skip, limitNum)
    ]);

    if(!articles.length){
        throw new Error('Articles not found');
    }

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

    console.log(data);
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

    const data = {
        article,
        comment
    }

    await incrementArticleViews(slug);

    return data;
}

export const FindArticlesByTag = async (tag, page, limit) => {
    const skip = (page - 1) * limit;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));

    const [total, articles] = await Promise.all([
        countArticlesByTag(tag),
        findArticlesByTag(tag, skip, limitNum)
    ]);

    if(!articles.length){
        throw new Error('Articles not found');
    }

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

    const [total, articles] = await Promise.all([
        searchArticlesCount(query),
        searchArticles(query, skip, limitNum)
    ]);

    if(!articles.length){
        throw new Error('Articles not found');
    }
    
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