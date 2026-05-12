import { prisma } from '../lib/prisma.js'
import { logger } from '../config/logger.js';

export const findUserByEmail = async (email) => {
    logger.debug('findUserByEmail called', { email });
    return await prisma.user.findUnique({
        where: {
            email
        },
        select: { // Trazer do documento apenas campos necessários 
            name: true,
            email: true,
            password: true,
            id: true,
            subscriptionExpiresAt: true,
            subscriptionPlan: true,
            isEmailVerified: true
        }
    })
};

export const findUserBySub = async (sub) => {
    logger.debug('findUserBySub called', { sub });
    return await prisma.user.findUnique({
        where: {
            sub
        },
        select: {
            name: true,
            email: true,
            password: true,
            id: true,
            subscriptionExpiresAt: true,
            subscriptionPlan: true
        }
    })
}

export const verifyUserExistsByEmail = async (email) => {
    logger.debug('verifyUserExistsByEmail called', { email });
    return await prisma.user.findUnique({
        where: {
            email
        },
        select: {
            email: true
        }
    })
}

export const verifyUserExistsBySub = async (sub) => {
    logger.debug('verifyUserExistsBySub called', { sub });
    return await prisma.user.findUnique({
        where: {
            sub
        },
        select: {
            sub: true
        }
    })
}

export const createUser = async (name, email, password) => {
    logger.info('createUser called', { email, name });
    return await prisma.user.create({
        data: {
            email,
            name,
            password,
            authenticationType: 'local'
        } 
    })
}

export const createUserWithOauth = async (name, email, sub) => {
    logger.info('createUserWithOauth called', { email, sub });
    return await prisma.user.create({
        data: {
            name,
            email, 
            sub,
            authenticationType: 'google'
        }
    })
}

export const updateUserSubscription = async (userId, plan) => {
    logger.info('updateUserSubscription called', { userId, plan });
    return await prisma.$transaction(async (tx) => {
        const current = await tx.user.findUniqueOrThrow({
            where: {
                id: userId
            },
            select: {
                subscriptionPlan: true
            }
        });
        
        if (current.subscriptionPlan === plan) {
            logger.warn('updateUserSubscription - user already subscribed to this plan', { userId, plan });
            throw new Error('User already subscribed to this plan');
        }

        const updatedUser = await tx.user.update({
            where: {
                id: userId
            },
            data: {
                subscriptionPlan: plan,
                subscriptionExpiresAt: new Date(Date.now() + 120_000)
            },
            select: {
                id: true
            }
        });

        logger.info('updateUserSubscription success', { id: userId, plan });
        return updatedUser;
    })
}

export const downgradeUserSubscription = async (email) => {
    logger.info('downgradeUserSubscription called', { email });
    return await prisma.user.update({
        where: { email: email },
        data: {
            subscriptionExpiresAt: null,
            subscriptionPlan: 'free'
        },
        select: {

        }
    });
}

export const findUserById = async (id) => {
    logger.debug('findUserById called', { id });
    return await prisma.user.findUnique({
        where: {
            id
        },
        select: {
            id: true,
        }
    });
}

export const changeUserStatusActive = async (id) => {
    logger.info('changeUserStatusActive called', { id });
    return await prisma.user.update({
        where: {
            id
        },
        data: {
            status: 'active',
            isEmailVerified: true
        },
        select: {
            
        }
    })
}

export const verifyUserIsVerifiedAndExists = async (userId) => {
    logger.debug('verifyUserIsVerifiedAndExists called', { userId });
    return await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            isEmailVerified: true
        }
    });
}