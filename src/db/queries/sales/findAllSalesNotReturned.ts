import { db } from "../../../config/database";
import { SoldProductSchema } from "../../schemas";
import type { SoldProduct } from "../../schemas";
import { parseRows } from "../../utils";
import { transformSoldProductRow } from "./helpers";

/**
 * Find all sold products that are not returned
 */
export async function findAllSalesNotReturned(): Promise<SoldProduct[]> {
    const result = await db.execute(
        "SELECT * FROM productos_vendidos WHERE isReturned = 0 ORDER BY soldAt DESC"
    );

    const transformedRows = result.rows.map(transformSoldProductRow);
    return parseRows(SoldProductSchema, transformedRows, "sold product");
}
