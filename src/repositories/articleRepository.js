import Article from "../models/Article.js";
import { logger } from '../config/logger.js';

export const allArticles = async (skip, limit) => {
    logger.debug('allArticles called', { skip, limit });
    return await Article.find({})
        .sort({ creationDate: -1 })
        .skip(skip)
        .limit(limit)
        .select('-_id -__v -content')
        .lean();
};

export const findArticlesByTag = async (tag, skip, limit) => {
    logger.debug('findArticlesByTag called', { tag, skip, limit });
    return await Article.find({ tags: tag })
        .sort({ creationDate: -1 })
        .skip(skip)
        .limit(limit)
        .select('-_id -__v -content')
        .lean()
};

export const searchArticles = async (query, skip, limit) => {
    logger.debug('searchArticles called', { query, skip, limit });
    return await Article.find({ 
        $text: { $search: query }
    }, {
        score: { $meta: "textScore" }
    })
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit)
        .select('-_id -__v -content')
        .lean();
};

export const findArticleBySlug = async (slug) => {
    logger.debug('findArticleBySlug called', { slug });
    return await Article.findOne({ slug })
        .select('-__v -content._id -slug -viewsCount -commentCount')
        .lean()
};

export const findArticleBySlugWithPlanRole = async (slug) => {
    logger.debug('findArticleBySlugWithPlanRole called', { slug });
    return await Article.findOne({ slug })
        .select('planRole')
        .lean()
}

export const incrementArticleViews = async (slug) => {
    logger.debug('incrementArticleViews called', { slug });
    return await Article.updateOne({ slug }, { $inc: { viewsCount: 1 } });
};

export const decrementArticleCommentCount = async (slug) => {
    logger.debug('decrementArticleCommentCount called', { slug });
    return await Article.updateOne({ slug }, { $inc: { commentCount: -1 } });
};

export const incrementArticleLikeCount = async (slug) => {
    logger.debug('incrementArticleLikeCount called', { slug });
    return await Article.updateOne({ slug }, { $inc: { likeCount: 1 } });
};

export const decrementArticleLikeCount = async (slug) => {
    logger.debug('decrementArticleLikeCount called', { slug });
    return await Article.updateOne({ slug }, { $inc: { likeCount: -1 } });
};

export const incrementArticleCommentCount = async (slug) => {
    logger.debug('incrementArticleCommentCount called', { slug });
    return await Article.updateOne({ slug }, { $inc: { commentCount: 1 } });
};

export const searchArticlesCount = async (query) => {
    logger.debug('searchArticlesCount called', { query });
    return await Article.estimatedDocumentCount({ 
        $text: { $search: query }
    });
}

export const verifyArticleExists = async (slug) => {    
    logger.debug('verifyArticleExists called', { slug });
    return await Article.findOne({ slug }).select('_id').lean();
}

export const countArticles = async () => {
    logger.debug('countArticles called');
    return await Article.estimatedDocumentCount();
};

export const countArticlesByTag = async (tag) => {
    logger.debug('countArticlesByTag called', { tag });
    return await Article.estimatedDocumentCount({ tags: tag });
};