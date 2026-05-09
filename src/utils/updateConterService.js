import { logger } from '../config/logger.js'

export const updateCounterService = async (slug, counterFn) => {
    if (!slug) throw new Error('Invalid slug');
    logger.debug('updateCounterService called', { slug });
    try {
        const res = await counterFn(slug);
        if (!res) {
            logger.error('updateCounterService: no result returned', { slug });
            throw new Error('Update operation failed');
        }
        // Se acknowledged existe e é false, erro
        if ('acknowledged' in res && res.acknowledged === false) {
            logger.error('updateCounterService: update not acknowledged', { slug, res });
            throw new Error('Update operation failed');
        }
        if (res.modifiedCount === 0) {
            logger.warn('updateCounterService: no documents modified', { slug });
        }
        return res;
    } catch (err) {
        logger.error('updateCounterService error', { err, slug });
        throw err;
    }
}