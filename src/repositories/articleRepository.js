import Article from "../models/Article.js";
import { logger } from '../config/logger.js';

const normalizeArticle = (a) => {
    if (!a) return null;
    return {
        id: a._id ? a._id.toString() : undefined,
        title: a.title,
        summary: a.summary,
        slug: a.slug,
        creationDate: a.creationDate,
        tags: a.tags,
        author: a.author,
        content: a.content,
        viewsCount: a.viewsCount,
        likeCount: a.likeCount,
        commentCount: a.commentCount,
        planRole: a.planRole
    };
};

const normalizeArticleListItem = (a) => {
    if (!a) return null;
    return {
        id: a._id ? a._id.toString() : undefined,
        title: a.title,
        summary: a.summary,
        slug: a.slug,
        creationDate: a.creationDate,
        tags: a.tags,
        author: a.author
    };
};

export const allArticles = async (skip, limit) => {
    logger.debug('allArticles called', { skip, limit });
    try {
        const articles = await Article.find({})
            .sort({ creationDate: -1 })
            .skip(skip)
            .limit(limit)
            .select('title summary slug creationDate tags author')
            .lean();
        const mapped = (articles || []).map(normalizeArticleListItem);
        return { success: true, data: { articles: mapped } };
    } catch (err) {
        logger.error('allArticles error', { err, skip, limit });
        throw err;
    }
};

export const findArticlesByTag = async (tag, skip, limit) => {
    logger.debug('findArticlesByTag called', { tag, skip, limit });
    try {
        const articles = await Article.find({ tags: tag })
            .sort({ creationDate: -1 })
            .skip(skip)
            .limit(limit)
            .select('title slug creationDate author')
            .lean();
        const mapped = (articles || []).map(normalizeArticleListItem);
        return { success: true, data: { articles: mapped } };
    } catch (err) {
        logger.error('findArticlesByTag error', { err, tag, skip, limit });
        throw err;
    }
};

export const searchArticles = async (query, skip, limit) => {
    logger.debug('searchArticles called', { query, skip, limit });
    try {
        const articles = await Article.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(limit)
            .select('title summary slug creationDate')
            .lean();
        const mapped = (articles || []).map(normalizeArticleListItem);
        return { success: true, data: { articles: mapped } };
    } catch (err) {
        logger.error('searchArticles error', { err, query, skip, limit });
        throw err;
    }
};

export const findArticleBySlug = async (slug) => {
    logger.debug('findArticleBySlug called', { slug });
    try {
        const article = await Article.findOne({ slug })
            .select('title author creationDate tags content')
            .lean();
        return { success: true, data: { article: normalizeArticle(article) } };
    } catch (err) {
        logger.error('findArticleBySlug error', { err, slug });
        throw err;
    }
};

export const articleExistsBySlug = async (slug) => {
    logger.debug('articleExistsBySlug called', { slug });
    try {
        const article = await Article.findOne({ slug }).select('_id').lean();
        return { success: true, data: { article: article ? { id: article._id ? article._id.toString() : undefined } : null } };
    } catch (err) {
        logger.error('articleExistsBySlug error', { err, slug });
        throw err;
    }
};

export const findArticleBySlugWithPlanRole = async (slug) => {
    logger.debug('findArticleBySlugWithPlanRole called', { slug });
    try {
        const article = await Article.findOne({ slug })
            .select('planRole')
            .lean();
        return { success: true, data: { article: article ? { planRole: article.planRole } : null } };
    } catch (err) {
        logger.error('findArticleBySlugWithPlanRole error', { err, slug });
        throw err;
    }
};

export const incrementArticleViews = async (slug) => {
    logger.debug('incrementArticleViews called', { slug });
    try {
        const article = await Article.findOneAndUpdate({ slug }, { $inc: { viewsCount: 1 } }, { new: true }).lean();
        return { success: true, data: { article: normalizeArticle(article) } };
    } catch (err) {
        logger.error('incrementArticleViews error', { err, slug });
        throw err;
    }
};

export const decrementArticleCommentCount = async (slug) => {
    logger.debug('decrementArticleCommentCount called', { slug });
    try {
        const article = await Article.findOneAndUpdate({ slug }, { $inc: { commentCount: -1 } }, { new: true }).lean();
        return { success: true, data: { article: normalizeArticle(article) } };
    } catch (err) {
        logger.error('decrementArticleCommentCount error', { err, slug });
        throw err;
    }
};

export const incrementArticleLikeCount = async (slug) => {
    logger.debug('incrementArticleLikeCount called', { slug });
    try {
        const article = await Article.findOneAndUpdate({ slug }, { $inc: { likeCount: 1 } }, { new: true }).lean();
        return { success: true, data: { article: normalizeArticle(article) } };
    } catch (err) {
        logger.error('incrementArticleLikeCount error', { err, slug });
        throw err;
    }
};

export const decrementArticleLikeCount = async (slug) => {
    logger.debug('decrementArticleLikeCount called', { slug });
    try {
        const article = await Article.findOneAndUpdate({ slug }, { $inc: { likeCount: -1 } }, { new: true }).lean();
        return { success: true, data: { article: normalizeArticle(article) } };
    } catch (err) {
        logger.error('decrementArticleLikeCount error', { err, slug });
        throw err;
    }
};

export const incrementArticleCommentCount = async (slug) => {
    logger.debug('incrementArticleCommentCount called', { slug });
    try {
        const article = await Article.findOneAndUpdate({ slug }, { $inc: { commentCount: 1 } }, { new: true }).lean();
        return { success: true, data: { article: normalizeArticle(article) } };
    } catch (err) {
        logger.error('incrementArticleCommentCount error', { err, slug });
        throw err;
    }
};

export const searchArticlesCount = async (query) => {
    logger.debug('searchArticlesCount called', { query });
    try {
        const count = await Article.countDocuments({ $text: { $search: query } });
        return { success: true, data: { count } };
    } catch (err) {
        logger.error('searchArticlesCount error', { err, query });
        throw err;
    }
};

export const verifyArticleExists = async (slug) => {
    logger.debug('verifyArticleExists called', { slug });
    try {
        const article = await Article.findOne({ slug }).select('_id').lean();
        return { success: true, data: { article: article ? { id: article._id ? article._id.toString() : undefined } : null } };
    } catch (err) {
        logger.error('verifyArticleExists error', { err, slug });
        throw err;
    }
};

export const countArticles = async () => {
    logger.debug('countArticles called');
    try {
        const count = await Article.estimatedDocumentCount();
        return { success: true, data: { count } };
    } catch (err) {
        logger.error('countArticles error', { err });
        throw err;
    }
};

export const countArticlesByTag = async (tag) => {
    logger.debug('countArticlesByTag called', { tag });
    try {
        const count = await Article.countDocuments({ tags: tag });
        return { success: true, data: { count } };
    } catch (err) {
        logger.error('countArticlesByTag error', { err, tag });
        throw err;
    }
};