import {
  allArticles,
  findArticleBySlug,
  searchArticles,
  searchArticlesCount,
  incrementArticleViews,
  countArticles,
} from "../repositories/articleRepository.js";
import { getCommentsBySlug } from "../repositories/commentRepository.js";
import client from "../config/redis.js";
import { logger } from "../config/logger.js";
import { updateCounterService } from "../utils/updateConterService.js";
import { isValidCuid } from "../utils/isValidCuid.js";

const MAX_LIMIT = 100;

function sanitizePagination(rawSkip, rawLimit) {
  const skipVal = rawSkip === undefined || rawSkip === null ? 0 : rawSkip;
  const limitVal = rawLimit === undefined || rawLimit === null ? 20 : rawLimit;

  if (typeof skipVal !== "number" && typeof skipVal !== "string") {
    throw new Error("skip must be a number or numeric string");
  }
  if (typeof limitVal !== "number" && typeof limitVal !== "string") {
    throw new Error("limit must be a number or numeric string");
  }

  const skip = Number.isFinite(Number(skipVal))
    ? Math.max(0, Math.floor(Number(skipVal)))
    : 0;
  let limit = Number.isFinite(Number(limitVal))
    ? Math.max(1, Math.floor(Number(limitVal)))
    : 20;
  limit = Math.min(limit, MAX_LIMIT);
  return { skip, limit };
}

function sanitizeString(input, maxLen = 200) {
  if (input == null) return "";
  const s = String(input);
  return s.trim().slice(0, maxLen);
}

function sanitizeTextSearch(input, maxLen = 200) {
  if (input == null) return "";
  const s = String(input).trim().slice(0, maxLen);

  // Prevent ReDoS: reject queries with too many special regex characters
  const specialChars = (s.match(/[*+?\\^$|()[\]{}]/g) || []).length;
  if (specialChars > 5) {
    logger.warn("sanitizeTextSearch: too many special characters", {
      count: specialChars,
    });
    throw new Error("Query contains too many special characters");
  }

  // Escape MongoDB/regex special characters
  return s.replace(/[\\"]/g, "\\$&");
}

export const GetAllArticles = async (page, limit) => {
  try {
    const pageNum = Math.max(1, parseInt(page));
    const rawLimit = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * rawLimit;

    const { skip: validSkip, limit: validLimit } = sanitizePagination(
      skip,
      rawLimit,
    );
    const CACHE_TTL = 300; // Tempo de vida do cache em segundos (5 minutos)

    logger.info("GetAllArticles called", {
      page,
      limit,
      pageNum,
      validSkip,
      validLimit,
    });

    const cacheKey = `articles:page:${pageNum}:limit:${validLimit}`;
    const cached = await client.get(cacheKey);

    if (cached) {
      const data = JSON.parse(cached);
      logger.info("GetAllArticles cache hit", { pageNum, validLimit });
      return data;
    }

    const [totalResult, articlesResult] = await Promise.all([
      countArticles(),
      allArticles(validSkip, validLimit),
    ]);

    const total = totalResult?.data?.count ?? 0;
    const articles = articlesResult?.data?.articles ?? [];

    if (!articles.length) {
      logger.warn("GetAllArticles - Articles not found", {
        pageNum,
        validLimit,
      });
      throw new Error("Articles not found");
    }

    const totalPages = Math.ceil(total / validLimit);
    const pagination = {
      total,
      pages: totalPages,
      currentPage: pageNum,
      limit: validLimit,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    };

    const data = {
      articles,
      pagination,
    };

    await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));
    logger.info("GetAllArticles - fetched from DB and cached", {
      pageNum,
      validLimit,
      total,
    });

    return data;
  } catch (error) {
    logger.error("GetAllArticles error", {
      error: error.message,
      stack: error.stack,
      page,
      limit,
    });
    throw error;
  }
};

export const LoadArticleBySlug = async (slug, id) => {
  try {
    const sanitizedSlug = sanitizeString(slug);
    if (!sanitizedSlug) {
      logger.warn("LoadArticleBySlug - Slug cannot be empty", { slug });
      throw new Error("Slug cannot be empty");
    }

    logger.info("LoadArticleBySlug called", { slug: sanitizedSlug });

    const articleResult = await findArticleBySlug(sanitizedSlug);
    const article = articleResult?.data?.article;
    if (!article) {
      logger.warn("LoadArticleBySlug - Article not found", {
        slug: sanitizedSlug,
      });
      throw new Error("Article not found");
    }

    const commentResult = await getCommentsBySlug(sanitizedSlug);
    const comment = commentResult?.data?.comments ?? [];

    if (!id || !isValidCuid(id)) {
      logger.warn("LoadArticleBySlug - Invalid user ID format", { id });
      throw new Error("Invalid Id");
    }

    await updateCounterService(sanitizedSlug, (s) => incrementArticleViews(s));
    logger.info("LoadArticleBySlug - views incremented", {
      slug: sanitizedSlug,
    });

    logger.info("LoadArticleBySlug - success", {
      slug: sanitizedSlug,
      id,
    });
    return {
      article,
      comment,
    };
  } catch (error) {
    logger.error("LoadArticleBySlug error", {
      slug,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const SearchForArticles = async (query, page, limit) => {
  try {
    const sanitizedQuery = sanitizeTextSearch(query);
    if (!sanitizedQuery) throw new Error("Search query cannot be empty");

    const pageNum = Math.max(1, parseInt(page));
    const rawLimit = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * rawLimit;
    const { skip: validSkip, limit: validLimit } = sanitizePagination(
      skip,
      rawLimit,
    );

    logger.info("SearchForArticles called", {
      query: sanitizedQuery,
      pageNum,
      validSkip,
      validLimit,
    });

    const [totalResult, articlesResult] = await Promise.all([
      searchArticlesCount(sanitizedQuery),
      searchArticles(sanitizedQuery, validSkip, validLimit),
    ]);

    const total = totalResult?.data?.count ?? 0;
    const articles = articlesResult?.data?.articles ?? [];

    if (!articles.length) {
      logger.warn("SearchForArticles - Articles not found", {
        query: sanitizedQuery,
        pageNum,
        validLimit,
      });
      throw new Error("Articles not found");
    }

    const totalPages = Math.ceil(total / validLimit);
    const pagination = {
      total,
      pages: totalPages,
      currentPage: pageNum,
      limit: validLimit,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    };

    logger.info("SearchForArticles - success", {
      query: sanitizedQuery,
      pageNum,
      validLimit,
      total,
    });
    return {
      articles,
      pagination,
    };
  } catch (error) {
    logger.error("SearchForArticles error", {
      query,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};
