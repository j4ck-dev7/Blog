import express from 'express';

import {webhook} from '../controllers/webhook.js';

const router = express.Router();

router.post('/stripe', express.raw({ type: 'application/json' }), webhook);

export default router