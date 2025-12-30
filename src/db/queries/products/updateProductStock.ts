import { db } from "../../../config/database";

/**
 * Update product stock
 */
export async function updateProductStock(id: string, stock: number): Promise<boolean> {
    const result = await db.execute({
        sql: "UPDATE products SET stock = :stock WHERE id = :id",
        args: { id, stock },
    });

    return result.rowsAffected > 0;
}
