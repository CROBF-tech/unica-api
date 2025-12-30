import { db } from "../../../config/database";
import { ConfigSchema } from "../../schemas";
import type { Config } from "../../schemas";
import { parseRow } from "../../utils";

/**
 * Find a config item by key
 */
export async function findConfigByKey(key: string): Promise<Config | null> {
    const result = await db.execute({
        sql: "SELECT * FROM config WHERE key = :key",
        args: { key },
    });

    if (result.rows.length === 0) {
        return null;
    }

    return parseRow(ConfigSchema, result.rows[0], "config");
}
