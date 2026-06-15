import "dotenv/config";
import fs from "fs";
import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import webhookRouter from "./routes/webhookRouter.js";
import { connect } from "./config/db.js";
import stripe from "./config/stripe.js";
import { logger } from "./config/logger.js";
import { loggerMiddleware } from "./middlewares/loggerMiddleware.js";
import { getRequestMeta } from "./config/requestMeta.js";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.use("/api/webhooks", webhookRouter);

app.set("views", path.join(process.cwd(), "src", "templates"));
app.set("view engine", "ejs");

app.use(express.static(path.join(process.cwd(), "public")));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet()); // Ativa o helmet com suas configurações padrão.
app.use(helmet.frameguard({ action: "deny" })); // Evita clickjacking, isso imped o uso de <iframe> em outro site
app.use(helmet.xssFilter()); // Ativa proteção contro XSS nos navegadores antigos.
app.use(helmet.noSniff()); // Impede que o navegador adivinhe o tipo de arquivo
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true })); // Força o uso de HTTPS por um ano, incluindo subdomínios.
// E também é recomendado usar o contentSecurityPolicy para evitar ataques de XSS
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Carrega recursos apenas do mesmo domínio
      scriptSrc: ["'self'"], // Scripts apenas do mesmo domínio
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"], // CSS da mesma orign, e estilos inline (útil para frameworks como React)
      imgSrc: ["'self'", "data:", "https:"], // Imagens da mesma origem
      connectSrc: ["'self'"], // Requisições (fetch, WebSockets) apenas para a mesma origem
    },
  }),
);
app.use(express.json());
app.use(loggerMiddleware);
app.use((err, req, res, next) => {
  logger.error("Erro na aplicação", err, getRequestMeta(req));
  res.status(500).json({ error: "Erro interno do servidor" });
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    isExplorer: true,
  }),
);
app.use("/app", userRoute);

export default app;
