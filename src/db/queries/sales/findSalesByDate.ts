import type { InArgs } from "@libsql/client";
import { db } from "../../../config/database";
import { SoldProductSchema } from "../../schemas";
import type { SoldProduct } from "../../schemas";
import { parseRows } from "../../utils";
import { transformSoldProductRow } from "./helpers";

/**
 * Find sales by date (prefix match on soldAt)
 */
export async function findSalesByDate(
    date: string,
    includeReturned: boolean = false
): Promise<SoldProduct[]> {
    let sql = "SELECT * FROM productos_vendidos WHERE soldAt LIKE :datePrefix";
    const params: Record<string, string | number> = { datePrefix: `${date}%` };

    if (!includeReturned) {
        sql += " AND isReturned = 0";
    }

    sql += " ORDER BY soldAt DESC";

    const result = await db.execute({ sql, args: params as InArgs });

    const transformedRows = result.rows.map(transformSoldProductRow);
    return parseRows(SoldProductSchema, transformedRows, "sold product");
}
