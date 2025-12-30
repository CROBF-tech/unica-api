import { db } from "../../../config/database";
import { parseDateString } from "../../utils";
import { findAllSales } from "./findAllSales";

/**
 * Delete old sales (older than specified months)
 */
export async function deleteOldSales(monthsOld: number = 3): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);

    const allSales = await findAllSales();

    const idsToDelete: string[] = [];

    for (const sale of allSales) {
        const saleDate = parseDateString(sale.soldAt);
        if (saleDate < cutoffDate) {
            idsToDelete.push(sale.id);
        }
    }

    if (idsToDelete.length === 0) {
        return 0;
    }

    const placeholders = idsToDelete.map(() => "?").join(",");
    await db.execute({
        sql: `DELETE FROM productos_vendidos WHERE id IN (${placeholders})`,
        args: idsToDelete,
    });

    return idsToDelete.length;
}
