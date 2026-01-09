import { formatDateTime } from './formatarDataHora.js';

export const formatArticles  = (articles) => {
    return articles.map(a => ({
        title: a.title,
        banner: a.banner,
        tags: a.tags,
        plan: a.planRole,
        createdIn: formatDateTime(a.creationDate),
        likeCount: a.likeCount || 0,
        commentCount: a.commentCount || 0,
        viewsCount: a.viewsCount || 0
    }));
}

export const loadArticleFormated = (article) => {
    return article.map(a => ({
        title: a.title,
        author: a.author,
        content: a.content,
        likes: a.likeCount,
        tags: a.tags,
        createIn: formatDateTime(a.creationDate)
    }))
}