import { createClient } from "@libsql/client";
import { env } from "./env";

// Crear cliente para la base de datos Turso
export const db = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
});

// Función para inicializar la base de datos
export async function initializeDatabase() {
    try {
        // Crear tabla de productos si no existe
        await db.execute(`SELECT 1;`);

        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
}