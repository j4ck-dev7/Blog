import { logger } from '../config/logger.js'

export const updateCounterService = async (slug, counterFn) => {
    try {
        if (!slug) {
            logger.warn('updateCounterService - missing slug');
            throw new Error('Invalid slug');
        }

        logger.debug('updateCounterService called', { slug });
        
        const res = await counterFn(slug);
        if (res == null) {
            throw new Error('Update operation failed');
        }
        // Se acknowledged existe e é false, erro
        if ('acknowledged' in res && res.acknowledged === false) {
            throw new Error('Update operation failed');
        }
        if (res.modifiedCount === 0) {
            logger.warn('updateCounterService: no documents modified', { slug });
        }
        return res;
    } catch (err) {
        logger.error('updateCounterService error', { error: err.message, slug, stack: err.stack });
        throw err;
    }
}