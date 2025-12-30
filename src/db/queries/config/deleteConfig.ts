import { db } from "../../../config/database";
import { findConfigById } from "./findConfigById";

/**
 * Delete a config item by ID
 */
export async function deleteConfig(id: number): Promise<boolean> {
    const existing = await findConfigById(id);
    if (!existing) {
        return false;
    }

    await db.execute({
        sql: "DELETE FROM config WHERE id = :id",
        args: { id },
    });

    return true;
}
