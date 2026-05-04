import mongoose from "mongoose";
import { logger } from './logger.js';

export const connect = async () => {(
    await mongoose.connect(process.env.MONGO_CONNECT).then(
        () => logger.info('Mongo connected'),
        (error) => logger.error('Erro na conexão Mongo', { error: error?.message || error, stack: error?.stack })
    )
)}