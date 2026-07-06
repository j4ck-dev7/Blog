import "dotenv/config";
import app from "./src/app.js";
import { connect } from "./src/config/db.js";
import { logger } from "./src/config/logger.js";

const PORT = process.env.PORT;
app.listen(PORT, () => {
  connect();
  logger.info(`Server is running on port ${PORT}`);
});

// Caso use alguma biblioteca que utilize typescript, como prisma, é necessário adicionar script de inicialização:
// "start": "node --loader ts-node/esm server.js" no package.json. Isso porque o node não entende typescript nativamente
// Então é necessário isso para compilar o typescript em javascript na hora da execução.
