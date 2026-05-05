import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import userRoute from './routes/userRoute.js';
import webhookRouter from './routes/webhookRouter.js';
import { connect } from './config/db.js';
import stripe from './config/stripe.js';
import { logger } from './config/logger.js'
import { loggerMiddleware } from './middlewares/loggerMiddleware.js';
import { getRequestMeta } from './config/requestMeta.js';

const app = express();

app.use('/api/webhooks', webhookRouter);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(loggerMiddleware);
app.use((err, req, res, next) => {
    logger.error('Erro na aplicação', err, getRequestMeta(req));

    res.status(500).json({ error: 'Erro interno do servidor' });
})

app.use('/', userRoute);

export default app;