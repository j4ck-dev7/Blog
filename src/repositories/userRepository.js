import { prisma } from '../lib/prisma.js'

export const findUserByEmail = async (email) => {
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

export const verifyUserExistsByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: {
            email
        },
        select: {
            email: true
        }
    })
}

export const createUser = async (name, email, password) => {
    return await prisma.user.create({
        data: {
            email,
            name,
            password
        } 
    })
}

export const updateUserSubscription = async (userId, plan) => {
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
    return await prisma.user.update({
        where: { email: email },
        data: {
            subscriptionExpiresAt: null,
            subscriptionPlan: 'FREE'
        }
    });
}

export const getUserByIdVerifyCredentials = async (userId) => {
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