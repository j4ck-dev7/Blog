import 'dotenv/config';
import express from 'express';
import compression from 'compression'
import cookieParser from 'cookie-parser';

import adminRoute from './src/routes/admin/adminRoute.js';
import userRoute from './src/routes/user/userRoute.js';
import webhookRouter from './src/routes/user/webhookRouter.js';

import { connect } from './src/config/db.js';
import stripe from './src/config/stripe.js';

const app = express();
app.use('/api/webhooks', webhookRouter);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression())
app.use(express.json());

app.use('/api/admin', adminRoute);
app.use('/api/user', userRoute);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    connect(),
    console.log(`Server is running on port ${PORT}`)            
});

// Caso use alguma biblioteca que utilize typescript, como prisma, é necessário adicionar script de inicialização:
// "start": "node --loader ts-node/esm server.js" no package.json. Isso porque o node não entende typescript nativamente
// Então é necessário isso para compilar o typescript em javascript na hora da execução.