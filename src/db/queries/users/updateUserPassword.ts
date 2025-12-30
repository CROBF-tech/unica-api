import { db } from "../../../config/database";

/**
 * Update user password
 */
export async function updateUserPassword(id: number, password: string): Promise<boolean> {
    const result = await db.execute({
        sql: "UPDATE users SET password = :password WHERE id = :id",
        args: { id, password },
    });

    return result.rowsAffected > 0;
}
