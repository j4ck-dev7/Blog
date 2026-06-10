import express from 'express';

import { webhook } from '../controllers/webhook.js';
import { sensitiveRateLimit } from '../middlewares/rateLimit.js';
import { sensitiveSlowDown } from '../middlewares/slowDown.js';

const router = express.Router();

/**
 * @swagger
 * /api/webhooks/stripe:
 *   patch:
 *     summary: Webhook do Stripe
 *     description: 
 *       Endpoint para receber eventos do webhook do Stripe.
 *       Processa eventos de checkout completado para atualizar assinaturas.
 *       Possui limitação de taxa e delay de requisição sensíveis.
 *       **Nota**: Esta rota é interna e não deve ser chamada diretamente por clientes.
 *     tags:
 *       - Webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Evento do Stripe
 *     responses:
 *       200:
 *         description: Webhook processado com sucesso
 *       400:
 *         description: Requisição inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request"
 *       429:
 *         description: Muitas solicitações (Rate Limit excedido).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Muitas solicitações. Por favor, tente novamente mais tarde."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *     x-rate-limit:
 *       max_requests: 10
 *       window: 60s
 *       note: "Limites aplicados pelos middlewares sensitiveSlowDown e sensitiveRateLimit"
 */
router.patch('/stripe', sensitiveSlowDown('stripeWebhook'), sensitiveRateLimit('stripeWebhook'), express.raw({ type: 'application/json' }), webhook);

export default router;
