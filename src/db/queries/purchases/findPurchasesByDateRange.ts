import { db } from "../../../config/database";
import { PurchasedProductSchema } from "../../schemas";
import type { PurchasedProduct } from "../../schemas";
import { parseRows } from "../../utils";

/**
 * Get purchases within a date range
 */
export async function findPurchasesByDateRange(
    startDate: string,
    endDate: string
): Promise<PurchasedProduct[]> {
    const result = await db.execute({
        sql: "SELECT * FROM productos_comprados WHERE purchasedAt >= :startDate AND purchasedAt <= :endDate ORDER BY purchasedAt DESC",
        args: { startDate, endDate },
    });

    return parseRows(PurchasedProductSchema, result.rows, "purchase");
}
