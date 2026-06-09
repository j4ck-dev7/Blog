/**
 * @swagger
 * components:
 *   schemas:
 *     Like:
 *       items:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             example: "cuid123"
 *             description: ID do like (CUID)
 *           articleSlug:
 *             type: string
 *             example: "artigo-slug"
 *             description: Slug do artigo que recebeu o like
 *       required:
 *         - id
 *         - articleSlug
 *     Error:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 400
 *           description: Código de status HTTP do erro
 *         message:
 *           type: string
 *           example: "Mensagem de erro"
 *           description: Mensagem de erro
 *       required:
 *         - statusCode
 *         - message
 */

const schemas = {};
export default schemas;