import { keyof, z } from "zod";
import { config } from "dotenv";
import path from "node:path";

config({
    path: path.resolve(path.join(__dirname, "..", "..", ".env"))
});

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().min(1).max(65535).default(3000),
    TURSO_DATABASE_URL: z.string().nonempty(),
    TURSO_AUTH_TOKEN: z.string().nonempty(),
    JWT_SECRET: z.string().nonempty()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Error en las variables de entorno:");
    console.error(parsedEnv.error.format());
    process.exit(1);
}

export const env = parsedEnv.data;