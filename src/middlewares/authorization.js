import jwt from "jsonwebtoken";
import { logger } from "../config/logger.js";
import { getRequestMeta } from "../config/requestMeta.js";
import { verifyUserIsVerifiedAndExists } from "../repositories/userRepository.js";
import { isValidCuid } from "../utils/isValidCuid.js";

export const auth = async (req, res, next) => {
  try {
    const cookie = req.cookies.userAuth;
    if (!cookie) {
      res.cookie("userAuth", "freeAccess", {
        secure: true,
        httpOnly: true,
        expires: new Date(Date.now() + 2 * 3600000),
      });
      req.user = { _id: "freeAccess" }; // Usuário não autenticado, acesso livre. Exeto em rotas protegidas | conteudos premium
      logger.info("Acesso anônimo concedido (freeAccess)", getRequestMeta(req));
      return next();
    }

    if (cookie === "freeAccess") {
      req.user = { _id: "freeAccess" };
      logger.info("Acesso freeAccess detectado", getRequestMeta(req));
      return next();
    }

    const isValid = isValidCuid(cookie._id);
    if (!isValid) {
      logger.warn(
        "Formato de id inválido",
        getRequestMeta(req, { id: cookie._id }),
      );
      return res.status(400).json({ message: "Invalid id format" });
    }

    const userVerifyIfExists = await verifyUserIsVerifiedAndExists(cookie._id);
    if (!userVerifyIfExists)
      return res.status(403).json({ message: "User not found" });

    const userVerify = await verifyUserIsVerifiedAndExists(cookie.id);
    if (!userVerify.isEmailVerified)
      return res.status(403).json({ message: "Email not verified" });

    const userVerified = jwt.verify(cookie, process.env.SECRET);
    req.user = userVerified;

    logger.info(
      "Token verificado com sucesso",
      getRequestMeta(req, { userId: userVerified._id || userVerified.id }),
    );
    next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return res.status(401).json({ message: "Invalid token" });
    }

    logger.error("Erro na autenticação", {
      ...getRequestMeta(req),
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};
