import Article from "../models/Article.js";
import { logger } from '../config/logger.js';

export const allArticles = async (skip, limit) => {
    logger.debug('allArticles called', { skip, limit });
    try {
        return await Article.find({})
            .sort({ creationDate: -1 })
            .skip(skip)
            .limit(limit)
            .select('title summary slug creationDate tags author')
            .lean();
    } catch (err) {
        logger.error('allArticles error', { err, skip, limit });
        throw err;
    }
};

export const findArticlesByTag = async (tag, skip, limit) => {
    logger.debug('findArticlesByTag called', { tag, skip, limit });
    try {
        return await Article.find({ tags: tag })
            .sort({ creationDate: -1 })
            .skip(skip)
            .limit(limit)
            .select('title slug creationDate author')
            .lean();
    } catch (err) {
        logger.error('findArticlesByTag error', { err, tag, skip, limit });
        throw err;
    }
};

export const searchArticles = async (query, skip, limit) => {
    logger.debug('searchArticles called', { query, skip, limit });
    try {
        return await Article.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip)
            .limit(limit)
            .select('title summary slug creationDate')
            .lean();
    } catch (err) {
        logger.error('searchArticles error', { err, query, skip, limit });
        throw err;
    }
};

export const findArticleBySlug = async (slug) => {
    logger.debug('findArticleBySlug called', { slug });
    try {
        return await Article.findOne({ slug })
            .select('title author creationDate tags -content')
            .lean();
    } catch (err) {
        logger.error('findArticleBySlug error', { err, slug });
        throw err;
    }
};

export const findArticleContentBySlug = async (slug) => {
    logger.debug('findArticleContentBySlug called', { slug });
    try {
        const result = await Article.findOne({ slug })
            .select('content')
            .lean();
        return result ? result.content : null;
    } catch (err) {
        logger.error('findArticleContentBySlug error', { err, slug });
        throw err;
    }
};

export const findArticleBySlugWithPlanRole = async (slug) => {
    logger.debug('findArticleBySlugWithPlanRole called', { slug });
    try {
        return await Article.findOne({ slug })
            .select('planRole')
            .lean();
    } catch (err) {
        logger.error('findArticleBySlugWithPlanRole error', { err, slug });
        throw err;
    }
};

export const incrementArticleViews = async (slug) => {
    logger.debug('incrementArticleViews called', { slug });
    try {
        return await Article.findOneAndUpdate({ slug }, { $inc: { viewsCount: 1 } });
    } catch (err) {
        logger.error('incrementArticleViews error', { err, slug });
        throw err;
    }
};

export const decrementArticleCommentCount = async (slug) => {
    logger.debug('decrementArticleCommentCount called', { slug });
    try {
        return await Article.findOneAndUpdate({ slug }, { $inc: { commentCount: -1 } });
    } catch (err) {
        logger.error('decrementArticleCommentCount error', { err, slug });
        throw err;
    }
};

export const incrementArticleLikeCount = async (slug) => {
    logger.debug('incrementArticleLikeCount called', { slug });
    try {
        return await Article.findOneAndUpdate({ slug }, { $inc: { likeCount: 1 } });
    } catch (err) {
        logger.error('incrementArticleLikeCount error', { err, slug });
        throw err;
    }
};

export const decrementArticleLikeCount = async (slug) => {
    logger.debug('decrementArticleLikeCount called', { slug });
    try {
        return await Article.findOneAndUpdate({ slug }, { $inc: { likeCount: -1 } });
    } catch (err) {
        logger.error('decrementArticleLikeCount error', { err, slug });
        throw err;
    }
};

export const incrementArticleCommentCount = async (slug) => {
    logger.debug('incrementArticleCommentCount called', { slug });
    try {
        return await Article.findOneAndUpdate({ slug }, { $inc: { commentCount: 1 } });
    } catch (err) {
        logger.error('incrementArticleCommentCount error', { err, slug });
        throw err;
    }
};

export const searchArticlesCount = async (query) => {
    logger.debug('searchArticlesCount called', { query });
    try {
        return await Article.countDocuments({ $text: { $search: query } });
    } catch (err) {
        logger.error('searchArticlesCount error', { err, query });
        throw err;
    }
};

export const verifyArticleExists = async (slug) => {
    logger.debug('verifyArticleExists called', { slug });
    try {
        return await Article.findOne({ slug }).select('_id').lean();
    } catch (err) {
        logger.error('verifyArticleExists error', { err, slug });
        throw err;
    }
};

export const countArticles = async () => {
    logger.debug('countArticles called');
    try {
        return await Article.estimatedDocumentCount();
    } catch (err) {
        logger.error('countArticles error', { err });
        throw err;
    }
};

export const countArticlesByTag = async (tag) => {
    logger.debug('countArticlesByTag called', { tag });
    try {
        return await Article.countDocuments({ tags: tag });
    } catch (err) {
        logger.error('countArticlesByTag error', { err, tag });
        throw err;
    }
};