import { prisma } from '../lib/prisma.js';
import { logger } from '../config/logger.js';

export const findUserByEmail = async (email) => {
    logger.debug('findUserByEmail called', { email });
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                name: true,
                email: true,
                password: true,
                id: true,
                subscriptionExpiresAt: true,
                subscriptionPlan: true,
                isEmailVerified: true
            }
        });
        return { success: true, data: { user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
            subscriptionPlan: user.subscriptionPlan,
            isEmailVerified: user.isEmailVerified
        } : null } };
    } catch (err) {
        logger.error('findUserByEmail error', { err, email });
        throw err;
    }
};

export const findUserBySub = async (sub) => {
    logger.debug('findUserBySub called', { sub });
    try {
        const user = await prisma.user.findUnique({
            where: { sub },
            select: {
                name: true,
                email: true,
                password: true,
                id: true,
                subscriptionExpiresAt: true,
                subscriptionPlan: true
            }
        });
        return { success: true, data: { user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            password: user.password,
            subscriptionExpiresAt: user.subscriptionExpiresAt,
            subscriptionPlan: user.subscriptionPlan
        } : null } };
    } catch (err) {
        logger.error('findUserBySub error', { err, sub });
        throw err;
    }
};

export const verifyUserExistsByEmail = async (email) => {
    logger.debug('verifyUserExistsByEmail called', { email });
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { email: true }
        });
        return { success: true, data: { user: user ? { email: user.email } : null } };
    } catch (err) {
        logger.error('verifyUserExistsByEmail error', { err, email });
        throw err;
    }
};

export const verifyUserExistsBySub = async (sub) => {
    logger.debug('verifyUserExistsBySub called', { sub });
    try {
        const user = await prisma.user.findUnique({
            where: { sub },
            select: { sub: true }
        });
        return { success: true, data: { user: user ? { sub: user.sub } : null } };
    } catch (err) {
        logger.error('verifyUserExistsBySub error', { err, sub });
        throw err;
    }
};

export const createUser = async (name, email, password) => {
    logger.info('createUser called', { email, name });
    try {
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password,
                authenticationType: 'local'
            }
        });
        return { success: true, data: { user: {
            id: user.id,
            name: user.name,
            email: user.email,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionExpiresAt: user.subscriptionExpiresAt
        } } };
    } catch (err) {
        logger.error('createUser error', { err, email, name });
        throw err;
    }
};

export const createUserWithOauth = async (name, email, sub) => {
    logger.info('createUserWithOauth called', { email, sub });
    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                sub,
                authenticationType: 'google'
            }
        });
        return { success: true, data: { user: {
            id: user.id,
            name: user.name,
            email: user.email,
            sub: user.sub
        } } };
    } catch (err) {
        logger.error('createUserWithOauth error', { err, email, sub });
        throw err;
    }
};

export const findUserByIdForAccessArticles = async (userId, requiredPlan) => {
    logger.info('findUserByIdForAccessArticles called', { userId, requiredPlan });
    try {
        const result = await prisma.$transaction(async (tx) => {
            const current = await tx.user.findUniqueOrThrow({
                where: { id: userId },
                select: {
                    subscriptionPlan: true,
                    subscriptionExpiresAt: true
                }
            });

            if (current.subscriptionExpiresAt && current.subscriptionExpiresAt < new Date()) {
                logger.info('User subscription expired, downgrading to free', { userId });

                await tx.user.update({
                    where: { id: userId },
                    data: {
                        subscriptionPlan: 'free',
                        subscriptionExpiresAt: null
                    }
                });

                return {
                    hasAccess: false,
                    reason: 'expired'
                };
            }

            const planWeight = {
                free: 0,
                basic: 1,
                intermediate: 2,
                premium: 3
            };

            const userWeight = planWeight[current.subscriptionPlan] ?? 0;
            const requiredWeight = planWeight[requiredPlan] ?? 0;

            if (userWeight < requiredWeight) {
                logger.warn('User plan does not grant access', {
                    userId,
                    userPlan: current.subscriptionPlan,
                    requiredPlan
                });
                return {
                    hasAccess: false,
                    reason: 'upgrade_needed'
                };
            }

            return { hasAccess: true };
        });

        return { success: true, data: result };
    } catch (err) {
        logger.error('findUserByIdForAccessArticles error', { err, userId, requiredPlan });
        throw err;
    }
};

export const updateUserSubscription = async (userId, plan) => {
    logger.info('updateUserSubscription called', { userId, plan });
    try {
        const result = await prisma.$transaction(async (tx) => {
            const current = await tx.user.findUniqueOrThrow({
                where: { id: userId },
                select: { subscriptionPlan: true }
            });

            if (current.subscriptionPlan === plan) {
                logger.warn('updateUserSubscription - user already subscribed to this plan', { userId, plan });
                return {
                    hasSubscribe: false,
                    reason: 'already_subscribed'
                };
            }

            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    subscriptionPlan: plan,
                    subscriptionExpiresAt: new Date(Date.now() + 120_000)
                },
                select: { id: true }
            });

            logger.info('updateUserSubscription success', { id: userId, plan });
            return updatedUser;
        });

        return { success: true, data: result };
    } catch (err) {
        logger.error('updateUserSubscription error', { err, userId, plan });
        throw err;
    }
};

export const downgradeUserSubscription = async (email) => {
    logger.info('downgradeUserSubscription called', { email });
    try {
        await prisma.user.update({
            where: { email },
            data: {
                subscriptionExpiresAt: null,
                subscriptionPlan: 'free'
            }
        });
        return { success: true };
    } catch (err) {
        logger.error('downgradeUserSubscription error', { err, email });
        throw err;
    }
};

export const findUserById = async (id) => {
    logger.debug('findUserById called', { id });
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { name: true }
        });
        return { success: true, data: { user: user ? { name: user.name } : null } };
    } catch (err) {
        logger.error('findUserById error', { err, id });
        throw err;
    }
};

export const changeUserStatusActive = async (id) => {
    logger.info('changeUserStatusActive called', { id });
    try {
        await prisma.user.update({
            where: { id },
            data: {
                status: 'active',
                isEmailVerified: true
            }
        });
        return { success: true };
    } catch (err) {
        logger.error('changeUserStatusActive error', { err, id });
        throw err;
    }
};

export const verifyUserIsVerifiedAndExists = async (userId) => {
    logger.debug('verifyUserIsVerifiedAndExists called', { userId });
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isEmailVerified: true }
        });
        return { success: true, data: { user: user ? { isEmailVerified: user.isEmailVerified } : null } };
    } catch (err) {
        logger.error('verifyUserIsVerifiedAndExists error', { err, userId });
        throw err;
    }
};