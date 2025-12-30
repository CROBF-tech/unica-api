import { db } from "../../../config/database";
import { UserSchema } from "../../schemas";
import type { User } from "../../schemas";
import { parseRows } from "../../utils";

/**
 * Find all users by role
 */
export async function findUsersByRole(role: string): Promise<User[]> {
    const result = await db.execute({
        sql: "SELECT * FROM users WHERE role = :role ORDER BY username ASC",
        args: { role },
    });

    return parseRows(UserSchema, result.rows, "user");
}
