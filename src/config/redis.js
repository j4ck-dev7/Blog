import { createClient } from "redis";
import { logger } from './logger.js';

const client = createClient({url: process.env.REDIS_URL});

client.on('error', (err) => logger.error('Redis error', { error: err?.message || err, stack: err?.stack }));
client.on('connect', () => logger.info('Redis connected'));

await client.connect();

export default client;