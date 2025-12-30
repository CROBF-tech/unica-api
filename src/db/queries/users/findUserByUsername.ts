import { db } from "../../../config/database";
import { UserSchema } from "../../schemas";
import type { User } from "../../schemas";
import { parseRow } from "../../utils";

/**
 * Find a user by username
 */
export async function findUserByUsername(username: string): Promise<User | null> {
    const result = await db.execute({
        sql: "SELECT * FROM users WHERE username = :username",
        args: { username },
    });

    if (result.rows.length === 0) {
        return null;
    }

    return parseRow(UserSchema, result.rows[0], "user");
}
