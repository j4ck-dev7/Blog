import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";

export const findUserByEmail = async (email) => {
  logger.debug("findUserByEmail called", { email });
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        name: true,
        email: true,
        password: true,
        id: true,
        isEmailVerified: true,
      },
    });
    return {
      success: true,
      data: {
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              password: user.password, // Necessário para bcrypt.compare no login
              isEmailVerified: user.isEmailVerified,
            }
          : null,
      },
    };
  } catch (err) {
    logger.error("findUserByEmail error", { err, email });
    throw err;
  }
};

export const findUserBySub = async (sub) => {
  logger.debug("findUserBySub called", { sub });
  try {
    const user = await prisma.user.findUnique({
      where: { sub },
      select: {
        name: true,
        email: true,
        // [SECURITY FIX - V4] password removido - não é necessário para OAuth login
        id: true,
      },
    });
    return {
      success: true,
      data: {
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
            }
          : null,
      },
    };
  } catch (err) {
    logger.error("findUserBySub error", { err, sub });
    throw err;
  }
};

export const verifyUserExistsByEmail = async (email) => {
  logger.debug("verifyUserExistsByEmail called", { email });
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true },
    });
    return {
      success: true,
      data: { user: user ? { email: user.email } : null },
    };
  } catch (err) {
    logger.error("verifyUserExistsByEmail error", { err, email });
    throw err;
  }
};

export const verifyUserExistsBySub = async (sub) => {
  logger.debug("verifyUserExistsBySub called", { sub });
  try {
    const user = await prisma.user.findUnique({
      where: { sub },
      select: { sub: true },
    });
    return { success: true, data: { user: user ? { sub: user.sub } : null } };
  } catch (err) {
    logger.error("verifyUserExistsBySub error", { err, sub });
    throw err;
  }
};

export const createUser = async (name, email, password) => {
  logger.info("createUser called", { email, name });
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password,
        authenticationType: "local",
      },
    });
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    };
  } catch (err) {
    logger.error("createUser error", { err, email, name });
    throw err;
  }
};

export const createUserWithOauth = async (name, email, sub) => {
  logger.info("createUserWithOauth called", { email, sub });
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        sub,
        authenticationType: "google",
      },
    });
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          sub: user.sub,
        },
      },
    };
  } catch (err) {
    logger.error("createUserWithOauth error", { err, email, sub });
    throw err;
  }
};

export const findUserById = async (id) => {
  logger.debug("findUserById called", { id });
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true },
    });
    return {
      success: true,
      data: {
        user: user ? { name: user.name } : null,
      },
    };
  } catch (err) {
    logger.error("findUserById error", { err, id });
    throw err;
  }
};

export const changeUserStatusActive = async (id) => {
  logger.info("changeUserStatusActive called", { id });
  try {
    await prisma.user.update({
      where: { id },
      data: {
        status: "active",
        isEmailVerified: true,
      },
    });
    return { success: true };
  } catch (err) {
    logger.error("changeUserStatusActive error", { err, id });
    throw err;
  }
};

export const verifyUserIsVerifiedAndExists = async (userId) => {
  logger.debug("verifyUserIsVerifiedAndExists called", { userId });
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isEmailVerified: true },
    });
    return {
      success: true,
      data: { user: user ? { isEmailVerified: user.isEmailVerified } : null },
    };
  } catch (err) {
    logger.error("verifyUserIsVerifiedAndExists error", { err, userId });
    throw err;
  }
};
