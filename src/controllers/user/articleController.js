import { GetAllArticles, LoadArticleBySlug, SearchForArticles, FindArticlesByTag } from "../../services/articleService.js";

export const allArticles = async (req, res) => {
    try {
      const pageNum = req.query.page;
      const limitNum = req.query.limit;

      const data = await GetAllArticles(pageNum, limitNum)

      res.status(200).json({ 
        message: 'Articles obtained', 
        articles: data.articles, 
        pagination: data.pagination
      });
    } catch (error) {
      if(error.message === 'Articles not found'){
        return res.status(404).json({ message: 'Articles not found' });
      }

      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
}

export const loadArticle = async (req, res) => {
    const { slug } = req.params;

    try {
      const data = await LoadArticleBySlug(slug);

      res.status(200).json({ 
        message: 'Article loaded', 
        article: data
      });

    }catch (error) {
      if(error.message === 'Article not found'){
        return res.status(404).json({ message: 'Article not found' });
      }

      console.error('Error loading article', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
};

export const findArticleByTag = async (req, res) => {
    try {
      const tags = req.query.tag;
      const pageNum = req.query.page;
      const limitNum = req.query.limit;

      const data = await FindArticlesByTag(tags, pageNum, limitNum);

      res.status(200).json({ 
        message: 'Articles obtained', 
        articles: data.articles, 
        pagination: data.pagination
      });
    } catch (error) {
      if(error.message === 'Articles not found'){
        return res.status(404).json({ message: 'Articles not found' });
      }

      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    };
};

export const searchArticles = async (req, res) => {
  try {
    const search = req.query.search; // Termo de busca, para APIs REST geralmente é passado via query params, sendo a melhor opção.
    const pageNum = req.query.page;
    const limitNum = req.query.limit;

    const data = await SearchForArticles(search, pageNum, limitNum);

    res.status(200).json({
      message: 'Search results', 
      articles: data.articles,
      pagination: data.pagination
    })
  } catch (error) {
    if(error.message === 'Articles not found'){
      return res.status(404).json({ message: 'Articles not found' });
    }

    console.error('Error searching articles', error);
    return res.status(500).json({ message: 'Internal server error' });
  }  
}