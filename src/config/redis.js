import { createClient } from "redis";
import { logger } from './logger.js';

export const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.on('error', (err) => logger.error('Redis error', { error: err?.message || err, stack: err?.stack }));
client.on('connect', () => logger.info('Redis connected'));

await client.connect();

export default client;