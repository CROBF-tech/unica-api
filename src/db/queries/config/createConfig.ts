import { db } from "../../../config/database";
import type { Config, ConfigInsert } from "../../schemas";

/**
 * Create a new config item
 */
export async function createConfig(config: ConfigInsert): Promise<Config> {
    const result = await db.execute({
        sql: `INSERT INTO config (key, value) VALUES (:key, :value) RETURNING id`,
        args: {
            key: config.key,
            value: config.value,
        },
    });

    const row = result.rows[0];
    if (!row || typeof row.id !== "number") {
        throw new Error("Failed to create config: no ID returned");
    }

    return {
        id: row.id,
        key: config.key,
        value: config.value,
    };
}
