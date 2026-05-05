import express from 'express';

import { webhook } from '../controllers/webhook.js';
import { webhookStripeLimit } from '../middlewares/rateLimit.js';

const router = express.Router();

router.patch('/stripe', webhookStripeLimit, express.raw({ type: 'application/json' }), webhook);

export default router