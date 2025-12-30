import { db } from "../../../config/database";
import { findUserById } from "./findUserById";

/**
 * Delete a user by ID
 */
export async function deleteUser(id: number): Promise<boolean> {
    const existing = await findUserById(id);
    if (!existing) {
        return false;
    }

    await db.execute({
        sql: "DELETE FROM users WHERE id = :id",
        args: { id },
    });

    return true;
}
