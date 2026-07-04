import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { logger } from "../config/logger.js";

const connectionString = `${process.env.POSTGRES_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma }; // É desta maneira que exportamos o prisma para ser usado em outras partes da aplicação
