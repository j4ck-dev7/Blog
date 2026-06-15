import {
  GetAllArticles,
  LoadArticleBySlug,
  SearchForArticles,
} from "../services/articleService.js";
import { logger } from "../config/logger.js";
import { getRequestMeta } from "../config/requestMeta.js";

export const allArticles = async (req, res) => {
  try {
    const pageNum = req.query.page;
    const limitNum = req.query.limit;

    const data = await GetAllArticles(pageNum, limitNum);

    res.status(200).json({
      message: "Articles obtained",
      articles: data.articles,
      pagination: data.pagination,
    });
    logger.info("Artigos obtidos", getRequestMeta(req));
  } catch (error) {
    if (error.message === "Articles not found") {
      logger.warn(
        "Artigos não encontrados",
        getRequestMeta(req, { error: error.message }),
      );
      return res.status(404).json({ message: "Articles not found" });
    }

    logger.error("Erro ao obter artigos", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loadArticle = async (req, res) => {
  const { slug } = req.params;

  try {
    const data = await LoadArticleBySlug(slug);

    res.status(200).json({
      message: "Article loaded",
      article: data,
    });
    logger.info("Artigo carregado", getRequestMeta(req));
  } catch (error) {
    if (error.message === "Article not found") {
      logger.warn(
        "Artigo não encontrado",
        getRequestMeta(req, { error: error.message }),
      );
      return res.status(404).json({ message: "Article not found" });
    }

    logger.error("Erro ao carregar artigo", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const searchArticles = async (req, res) => {
  try {
    const search = req.query.search;
    const pageNum = req.query.page;
    const limitNum = req.query.limit;

    const data = await SearchForArticles(search, pageNum, limitNum);

    res.status(200).json({
      message: "Search results",
      articles: data.articles,
      pagination: data.pagination,
    });
    logger.info("Resultados de busca retornados", getRequestMeta(req));
  } catch (error) {
    if (error.message === "Articles not found") {
      logger.warn(
        "Busca não retornou artigos",
        getRequestMeta(req, { error: error.message }),
      );
      return res.status(404).json({ message: "Articles not found" });
    }

    logger.error("Erro ao pesquisar artigos", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const renderMainPage = async (req, res) => {
  try {
    const pageNum = req.query.page || 1;
    const limitNum = req.query.limit;

    const data = await GetAllArticles(pageNum, limitNum);

    const user = req.user || null;

    res.render("main", {
      articles: data.articles,
      pagination: data.pagination,
      user: user,
    });
    logger.info("Página principal renderizada", getRequestMeta(req));
  } catch (error) {
    if (error.message === "Articles not found") {
      logger.warn(
        "Artigos não encontrados para renderizar página principal",
        getRequestMeta(req, { error: error.message }),
      );
      return res.status(404).render("main", {
        articles: [],
        pagination: null,
        user: null,
        error: "Articles not found",
      });
    }

    logger.error("Erro ao renderizar página principal", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).render("main", {
      articles: [],
      pagination: null,
      user: null,
      error: "Internal server error",
    });
  }
};

export const renderArticlePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const user = req.user || null;
    const userId = user ? user.id : null;

    const data = await LoadArticleBySlug(slug, userId);

    if (!data || !data.article) {
      logger.warn(
        "Artigo não encontrado para renderizar página",
        getRequestMeta(req, { slug }),
      );
      return res.status(404).render("main", {
        articles: [],
        pagination: null,
        user: user,
        error: "Article not found",
      });
    }

    // LoadArticleBySlug já retorna os comentários
    const comments = data.comment || [];

    res.render("article", {
      article: data.article,
      comments: comments,
      user: user,
    });
    logger.info("Página de artigo renderizada", getRequestMeta(req));
  } catch (error) {
    logger.error("Erro ao renderizar página de artigo", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).render("article", {
      article: null,
      comments: [],
      user: null,
      error: "Internal server error",
    });
  }
};

export const renderSearchPage = async (req, res) => {
  try {
    const query = req.query.q || "";
    const pageNum = req.query.page || 1;
    const limitNum = req.query.limit;
    const user = req.user || null;

    const data = await SearchForArticles(query, pageNum, limitNum);

    res.render("search", {
      articles: data.articles,
      pagination: data.pagination,
      query: query,
      user: user,
    });
    logger.info("Página de busca renderizada", getRequestMeta(req));
  } catch (error) {
    if (error.message === "Articles not found") {
      logger.warn(
        "Nenhum artigo encontrado para a busca",
        getRequestMeta(req, { query: req.query.q, error: error.message }),
      );
      return res.status(404).render("search", {
        articles: [],
        pagination: null,
        query: req.query.q || "",
        user: null,
        error: "Articles not found",
      });
    }

    logger.error("Erro ao renderizar página de busca", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).render("search", {
      articles: [],
      pagination: null,
      query: req.query.q || "",
      user: null,
      error: "Internal server error",
    });
  }
};
