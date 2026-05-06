import express from 'express';

import { webhook } from '../controllers/webhook.js';
import { webhookStripeLimit } from '../middlewares/rateLimit.js';
import { stripeWebhookSlowDown } from '../middlewares/slowDown.js';

const router = express.Router();

router.patch('/stripe', stripeWebhookSlowDown, webhookStripeLimit, express.raw({ type: 'application/json' }), webhook);

export default router