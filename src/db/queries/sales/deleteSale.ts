import { db } from "../../../config/database";

/**
 * Delete a sale by ID
 */
export async function deleteSale(id: string): Promise<boolean> {
    await db.execute({
        sql: "DELETE FROM productos_vendidos WHERE id = :id",
        args: { id },
    });

    return true;
}
