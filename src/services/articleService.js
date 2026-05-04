import { allArticles, findArticleBySlug, findArticlesByTag, countArticlesByTag, searchArticles, searchArticlesCount, incrementArticleViews, countArticles } from "../repositories/articleRepository.js";
import { getCommentsBySlug } from "../repositories/commentRepository.js";
import client from "../config/redis.js";
import { logger } from '../config/logger.js';

export const GetAllArticles = async (page, limit) => {
    try {
        const skip = (page - 1) * limit;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
        const CACHE_TTL = 300; // Tempo de vida do cache em segundos (5 minutos)

        logger.info('GetAllArticles called', { page, limit, pageNum, limitNum });

        const cacheKey = `articles:page:${pageNum}:limit:${limitNum}`;
        const cached = await client.get(cacheKey);

        if (cached) {
            const data = JSON.parse(cached);
            logger.info('GetAllArticles cache hit', { pageNum, limitNum });
            return data; // Se o cache existir ele retorna para o cliente, o tempo de resposta pode ser menor que 100ms
        }

        const [total, articles] = await Promise.all([
            countArticles(),
            allArticles(skip, limitNum)
        ]);

        if (!articles.length) {
            logger.warn('GetAllArticles - Articles not found', { pageNum, limitNum });
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

        await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
        logger.info('GetAllArticles - fetched from DB and cached', { pageNum, limitNum, total });

        return data;
    } catch (error) {
        logger.error('GetAllArticles error', { error: error.message, stack: error.stack, page, limit });
        throw error;
    }
}

export const LoadArticleBySlug = async (slug) => {
    try {
        logger.info('LoadArticleBySlug called', { slug });

        const [article, comment] = await Promise.all([
            findArticleBySlug(slug),
            getCommentsBySlug(slug)
        ]);

        if (!article) {
            logger.warn('LoadArticleBySlug - Article not found', { slug });
            throw new Error('Article not found');
        }

        const data = {
            article,
            comment
        };

        await incrementArticleViews(slug);
        logger.info('LoadArticleBySlug - views incremented', { slug });

        return data;
    } catch (error) {
        logger.error('LoadArticleBySlug error', { slug, error: error.message, stack: error.stack });
        throw error;
    }
}

export const FindArticlesByTag = async (tag, page, limit) => {
    try {
        const skip = (page - 1) * limit;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(20, Math.max(1, parseInt(limit)));

        logger.info('FindArticlesByTag called', { tag, pageNum, limitNum });

        const [total, articles] = await Promise.all([
            countArticlesByTag(tag),
            findArticlesByTag(tag, skip, limitNum)
        ]);

        if (!articles.length) {
            logger.warn('FindArticlesByTag - Articles not found', { tag, pageNum, limitNum });
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

        logger.info('FindArticlesByTag - success', { tag, pageNum, limitNum, total });
        return data;
    } catch (error) {
        logger.error('FindArticlesByTag error', { tag, error: error.message, stack: error.stack });
        throw error;
    }
}

export const SearchForArticles = async (query, page, limit) => {
    try {
        const skip = (page - 1) * limit;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(20, Math.max(1, parseInt(limit)));

        logger.info('SearchForArticles called', { query, pageNum, limitNum });

        const [total, articles] = await Promise.all([
            searchArticlesCount(query),
            searchArticles(query, skip, limitNum)
        ]);

        if (!articles.length) {
            logger.warn('SearchForArticles - Articles not found', { query, pageNum, limitNum });
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

        logger.info('SearchForArticles - success', { query, pageNum, limitNum, total });
        return {
            articles,
            pagination
        };
    } catch (error) {
        logger.error('SearchForArticles error', { query, error: error.message, stack: error.stack });
        throw error;
    }
}