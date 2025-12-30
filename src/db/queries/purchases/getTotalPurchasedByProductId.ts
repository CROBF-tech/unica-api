import { db } from "../../../config/database";

/**
 * Get total quantity purchased for a specific product
 */
export async function getTotalPurchasedByProductId(productId: string): Promise<number> {
    const result = await db.execute({
        sql: "SELECT SUM(quantity) as total FROM productos_comprados WHERE productId = :productId",
        args: { productId },
    });

    return (result.rows[0]?.total as number) || 0;
}
