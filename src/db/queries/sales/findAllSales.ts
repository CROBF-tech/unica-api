import { db } from "../../../config/database";
import { SoldProductSchema } from "../../schemas";
import type { SoldProduct } from "../../schemas";
import { parseRows } from "../../utils";
import { transformSoldProductRow } from "./helpers";

/**
 * Find all sold products
 */
export async function findAllSales(): Promise<SoldProduct[]> {
    const result = await db.execute(
        "SELECT * FROM productos_vendidos ORDER BY soldAt DESC"
    );

    const transformedRows = result.rows.map(transformSoldProductRow);
    return parseRows(SoldProductSchema, transformedRows, "sold product");
}
