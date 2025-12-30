import { db } from "../../../config/database";
import { UserSchema } from "../../schemas";
import type { User, UserUpdate } from "../../schemas";
import { findUserById } from "./findUserById";

/**
 * Update an existing user
 */
export async function updateUser(user: UserUpdate): Promise<User | null> {
    const existing = await findUserById(user.id);
    if (!existing) {
        return null;
    }

    const merged = { ...existing, ...user };
    const validated = UserSchema.parse(merged);

    const updateFields: string[] = [];
    const args: Record<string, string | number> = { id: user.id };

    if (user.username !== undefined) {
        updateFields.push("username = :username");
        args.username = user.username;
    }
    if (user.password !== undefined) {
        updateFields.push("password = :password");
        args.password = user.password;
    }
    if (user.role !== undefined) {
        updateFields.push("role = :role");
        args.role = user.role;
    }

    if (updateFields.length === 0) {
        return validated;
    }

    await db.execute({
        sql: `UPDATE users SET ${updateFields.join(", ")} WHERE id = :id`,
        args,
    });

    return validated;
}
