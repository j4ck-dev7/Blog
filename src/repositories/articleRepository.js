import Article from "../models/Article.js";

export const allArticles = async (skip, limit) => {
  return await Article.find({})
    .sort({ creationDate: -1 })
    .skip(skip)
    .limit(limit)
    .select('-_id -__v -content')
    .lean();
};

export const findArticlesByTag = async (tag, skip, limit) => {
    return await Article.find({ tags: tag })
        .sort({ creationDate: -1 })
        .skip(skip)
        .limit(limit)
        .select('-_id -__v -content')
        .lean()
};

export const searchArticles = async (query, skip, limit) => {
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
    return await Article.findOne({ slug })
        .select('-__v -content._id -slug -viewsCount -commentCount')
        .lean()
};

export const findArticleBySlugWithPlanRole = async (slug) => {
    return await Article.findOne({ slug })
        .select('planRole')
        .lean()
}

export const incrementArticleViews = async (slug) => {
    return await Article.updateOne({ slug }, { $inc: { viewsCount: 1 } });
};

export const decrementArticleCommentCount = async (slug) => {
    return await Article.updateOne({ slug }, { $inc: { commentCount: -1 } });
};

export const incrementArticleLikeCount = async (slug) => {
    return await Article.updateOne({ slug }, { $inc: { likeCount: 1 } });
};

export const decrementArticleLikeCount = async (slug) => {
    return await Article.updateOne({ slug }, { $inc: { likeCount: -1 } });
};

export const incrementArticleCommentCount = async (slug) => {
    return await Article.updateOne({ slug }, { $inc: { commentCount: 1 } });
};

export const searchArticlesCount = async (query) => {
    return await Article.estimatedDocumentCount({ 
        $text: { $search: query }
    });
}

export const verifyArticleExists = async (slug) => {    
    return await Article.findOne({ slug }).select('_id').lean();
}

export const countArticles = async () => {
  return await Article.estimatedDocumentCount();
};

export const countArticlesByTag = async (tag) => {
    return await Article.estimatedDocumentCount({ tags: tag });
};