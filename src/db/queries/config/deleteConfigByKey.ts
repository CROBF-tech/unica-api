import { db } from "../../../config/database";
import { findConfigByKey } from "./findConfigByKey";

/**
 * Delete a config item by key
 */
export async function deleteConfigByKey(key: string): Promise<boolean> {
    const existing = await findConfigByKey(key);
    if (!existing) {
        return false;
    }

    await db.execute({
        sql: "DELETE FROM config WHERE key = :key",
        args: { key },
    });

    return true;
}
