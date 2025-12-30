import { db } from "../../../config/database";
import { UserSchema } from "../../schemas";
import type { User } from "../../schemas";
import { parseRows } from "../../utils";

/**
 * Get all users
 */
export async function findAllUsers(): Promise<User[]> {
    const result = await db.execute({
        sql: "SELECT * FROM users ORDER BY username ASC",
        args: [],
    });

    return parseRows(UserSchema, result.rows, "user");
}
