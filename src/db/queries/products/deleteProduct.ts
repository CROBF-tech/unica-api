import { db } from "../../../config/database";
import { findProductById } from "./findProductById";

/**
 * Delete a product by ID
 */
export async function deleteProduct(id: string): Promise<boolean> {
    const existing = await findProductById(id);
    if (!existing) {
        return false;
    }

    await db.execute({
        sql: "DELETE FROM products WHERE id = :id",
        args: { id },
    });

    return true;
}
