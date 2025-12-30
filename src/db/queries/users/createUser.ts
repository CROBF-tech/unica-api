import { db } from "../../../config/database";
import type { User, UserInsert } from "../../schemas";

/**
 * Create a new user
 */
export async function createUser(user: UserInsert): Promise<User> {
    const result = await db.execute({
        sql: `INSERT INTO users (username, password, role) VALUES (:username, :password, :role) RETURNING id`,
        args: {
            username: user.username,
            password: user.password,
            role: user.role,
        },
    });

    const row = result.rows[0];
    if (!row || typeof row.id !== "number") {
        throw new Error("Failed to create user: no ID returned");
    }

    return {
        id: row.id,
        username: user.username,
        password: user.password,
        role: user.role,
    };
}
