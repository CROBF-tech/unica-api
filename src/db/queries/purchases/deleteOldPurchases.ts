import { db } from "../../../config/database";
import { PurchasedProductSchema } from "../../schemas";
import { parseDateString } from "../../utils";

/**
 * Delete old purchases (older than specified months)
 */
export async function deleteOldPurchases(monthsOld: number = 6): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);

    const allPurchases = await db.execute(
        "SELECT * FROM productos_comprados ORDER BY purchasedAt DESC"
    );

    const idsToDelete: string[] = [];

    for (const row of allPurchases.rows) {
        const purchase = PurchasedProductSchema.safeParse(row);
        if (!purchase.success) continue;

        const purchaseDate = parseDateString(purchase.data.purchasedAt);
        if (purchaseDate < cutoffDate) {
            idsToDelete.push(purchase.data.id);
        }
    }

    if (idsToDelete.length === 0) {
        return 0;
    }

    const placeholders = idsToDelete.map(() => "?").join(",");
    await db.execute({
        sql: `DELETE FROM productos_comprados WHERE id IN (${placeholders})`,
        args: idsToDelete,
    });

    return idsToDelete.length;
}
