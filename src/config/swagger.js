import swagger from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog",
      version: "1.0.0",
      description: "A simple Blog",
      // [SECURITY FIX - V17] Email removido da documentação pública
      contact: {
        name: "Blog API",
      },
    },
  },
  servers: [
    {
      // [SECURITY FIX - V18] URL usa variável de ambiente
      url: process.env.BASE_URL || "http://localhost:5000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "userAuth",
        description:
          'Autenticação via cookie. Envie o cookie "userAuth" com o token de autenticação para acessar as rotas protegidas.',
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
  apis: ["./src/routes/*.js", "./src/utils/schemasSwagger.js"],
};

const swaggerSpec = swagger(options);
export default swaggerSpec;
