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