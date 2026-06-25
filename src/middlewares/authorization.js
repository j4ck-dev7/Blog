import jwt from "jsonwebtoken";
import { logger } from "../config/logger.js";
import { getRequestMeta } from "../config/requestMeta.js";
import { verifyUserIsVerifiedAndExists } from "../repositories/userRepository.js";
import { isValidCuid } from "../utils/isValidCuid.js";

// [SECURITY FIX - V3/V7/V10] Corrigido middleware de autorização:
// - Removido set de cookie "freeAccess" para anônimos (bypass de autenticação)
// - Corrigida lógica de verificação de CUID (antes tentava acessar cookie._id sendo string)
// - Adicionado sameSite: "strict" em cookies
// - Decodificar JWT ANTES de validar CUID para extrair o _id corretamente

export const auth = async (req, res, next) => {
  try {
    const cookie = req.cookies.userAuth;

    // Usuário não autenticado - acesso livre (exceto rotas protegidas)
    if (!cookie || cookie === "freeAccess") {
      req.user = { _id: "freeAccess" };
      logger.info("Acesso anônimo concedido (freeAccess)", getRequestMeta(req));
      return next();
    }

    // Decodificar JWT para extrair o userId
    let decoded;
    try {
      decoded = jwt.verify(cookie, process.env.SECRET);
    } catch (e) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = decoded._id || decoded.id;
    if (!userId || !isValidCuid(userId)) {
      logger.warn(
        "Formato de id inválido",
        getRequestMeta(req, { id: userId }),
      );
      return res.status(400).json({ message: "Invalid id format" });
    }

    const userVerify = await verifyUserIsVerifiedAndExists(userId);
    if (!userVerify?.data?.user) {
      return res.status(403).json({ message: "User not found" });
    }

    if (!userVerify.data.user.isEmailVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    req.user = decoded;

    logger.info(
      "Token verificado com sucesso",
      getRequestMeta(req, { userId: userId }),
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
