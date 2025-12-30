import { db } from "../../../config/database";
import { PurchasedProductSchema } from "../../schemas";
import type { PurchasedProduct } from "../../schemas";
import { parseRow } from "../../utils";

/**
 * Find a purchase by ID
 */
export async function findPurchaseById(id: string): Promise<PurchasedProduct | null> {
    const result = await db.execute({
        sql: "SELECT * FROM productos_comprados WHERE id = :id",
        args: { id },
    });

    if (result.rows.length === 0) {
        return null;
    }

    return parseRow(PurchasedProductSchema, result.rows[0], "purchase");
}
