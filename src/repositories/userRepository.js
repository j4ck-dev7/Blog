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
            subscriptionPlan: true
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
    return await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            subscriptionPlan: plan,
            subscriptionExpiresAt: new Date(Date.now() + 120_000)
        }
    })
}

export const downgradeUserSubscription = async (email) => {
    logger.info('downgradeUserSubscription called', { email });
    return await prisma.user.update({
        where: { email: email },
        data: {
            subscriptionExpiresAt: null,
            subscriptionPlan: 'FREE'
        }
    });
}

export const getUserByIdVerifyCredentials = async (userId) => {
    logger.debug('getUserByIdVerifyCredentials called', { userId });
    return await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            email: true,
            subscriptionPlan: true,
            subscriptionExpiresAt: true,
            name: true
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
            email: true,
            isEmailVerified: true,
            id: true,
            name: true,
            subscriptionPlan: true,
            subscriptionExpiresAt: true,
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
        }
    })
}

export const verifyIfUserIsActive = async (userId) => {
    logger.debug('verifyIfUserIsActive called', { userId });
    return await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            status: true
        }
    });
}