import { db } from "../../../config/database";
import { SoldProductSchema } from "../../schemas";
import type { SoldProduct } from "../../schemas";
import { parseRows } from "../../utils";
import { transformSoldProductRow } from "./helpers";

/**
 * Find all sales for a specific product
 */
export async function findSalesByProductId(productId: string): Promise<SoldProduct[]> {
    const result = await db.execute({
        sql: "SELECT * FROM productos_vendidos WHERE productId = :productId ORDER BY soldAt DESC",
        args: { productId },
    });

    const transformedRows = result.rows.map(transformSoldProductRow);
    return parseRows(SoldProductSchema, transformedRows, "sold product");
}
