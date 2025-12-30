import { db } from "../../../config/database";
import { PurchasedProductSchema } from "../../schemas";
import type { PurchasedProduct } from "../../schemas";
import { parseRows } from "../../utils";

/**
 * Find all purchases for a specific product
 */
export async function findPurchasesByProductId(productId: string): Promise<PurchasedProduct[]> {
    const result = await db.execute({
        sql: "SELECT * FROM productos_comprados WHERE productId = :productId ORDER BY purchasedAt DESC",
        args: { productId },
    });

    return parseRows(PurchasedProductSchema, result.rows, "purchase");
}
