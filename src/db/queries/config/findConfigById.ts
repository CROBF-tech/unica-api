import { db } from "../../../config/database";
import { ConfigSchema } from "../../schemas";
import type { Config } from "../../schemas";
import { parseRow } from "../../utils";

/**
 * Find a config item by ID
 */
export async function findConfigById(id: number): Promise<Config | null> {
    const result = await db.execute({
        sql: "SELECT * FROM config WHERE id = :id",
        args: { id },
    });

    if (result.rows.length === 0) {
        return null;
    }

    return parseRow(ConfigSchema, result.rows[0], "config");
}
