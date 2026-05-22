import express from 'express';

import { webhook } from '../controllers/webhook.js';
import { sensitiveRateLimit } from '../middlewares/rateLimit.js';
import { sensitiveSlowDown } from '../middlewares/slowDown.js';

const router = express.Router();

router.patch('/stripe', sensitiveSlowDown('stripeWebhook'), sensitiveRateLimit('stripeWebhook'), express.raw({ type: 'application/json' }), webhook);

export default router;
