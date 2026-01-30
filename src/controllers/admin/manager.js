// import slugify from 'slugify';
// import client from '../../config/redis.js';
// import { isValidObjectId } from '../../utills/isValidObjectId.js';

// import Article from '../../models/Article.js';

// export const addArticle = async (req, res) => {
//     try {
//         const { content, title, author, tags, planRole, banner } = req.body;
//         const slug = slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });

//         const article = new Article({
//             title,
//             slug,
//             author,
//             content,
//             tags,
//             planRole,
//             banner
//         });    
//         await article.save();

//         await client.del(`articles:page:1:limit:5`); // Ao adicionar mais um artigo, é necessário deletar a primeira página do cache para que o novo artigo seja retornado em uma nova consulta na primeira página

//         res.status(201).json({ message: 'Article created successfully', article });
//     } catch (error) {
//         res.status(500).json({ message: 'Internal server error' });
//         console.error('Error adding an article', error);
//     };
// };

// export const editArticle = async (req, res) => {
//     const articleId = req.params.articleId;

//     try {
//         if (!isValidObjectId(articleId)) {
//             return res.status(400).json({ 
//                 message: 'ID inválido' 
//             });
//         }

//         const data = { ...req.body };

//         if(data.title){
//             data.slug = slugify(titulo, { 
//                 lower: true,
//                 strict: true,
//                 remove: /[*+~.()'"!:@]/g
//             });
//         };

//         const artigoEdit = await Article.findByIdAndUpdate(
//             articleId,
//             { $set: data}, 
//             { new: true, runValidators: true } 
//         );

//         if (!artigoEdit) {
//             return res.status(404).json({ error: 'Article not found' });
//         };

//         await client.del(`articles:page:1:limit:5`);

//         res.status(200).json({
//             message: 'Article edited successfully',
//             data
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Internal server error'});
//         console.error('Error editing article', error);
//     };
// };

// export const deleteArticle = async (req, res) => {
//     const articleId = req.params.articleId
//     try {
//         if (!isValidObjectId(articleId)) {
//             return res.status(400).json({ 
//                 message: 'ID inválido' 
//             });
//         }

//         const db = await Article.findByIdAndDelete(articleId);
//         if(!db) return res.status(404).json({ message: 'The article does not exist' });
            
//         res.status(204).json({ message: 'Article successfully deleted' });
//     } catch (error) {
//         res.status(500).json({ message: 'Internal server error' });
//         console.log('Error deleting article', error);
//     };
// };