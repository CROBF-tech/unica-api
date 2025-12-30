import { db } from "../../../config/database";
import { ConfigSchema } from "../../schemas";
import type { Config } from "../../schemas";
import { parseRows } from "../../utils";

/**
 * Get all config items
 */
export async function findAllConfig(): Promise<Config[]> {
    const result = await db.execute({
        sql: "SELECT * FROM config ORDER BY key ASC",
        args: [],
    });

    return parseRows(ConfigSchema, result.rows, "config");
}
