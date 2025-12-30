import { db } from "../../../config/database";
import { SoldProductSchema } from "../../schemas";
import type { SoldProduct } from "../../schemas";
import { parseRow } from "../../utils";
import { transformSoldProductRow } from "./helpers";

/**
 * Find a sold product by ID
 */
export async function findSaleById(id: string): Promise<SoldProduct | null> {
    const result = await db.execute({
        sql: "SELECT * FROM productos_vendidos WHERE id = :id",
        args: { id },
    });

    if (result.rows.length === 0) {
        return null;
    }

    const transformedRow = transformSoldProductRow(result.rows[0] as Record<string, unknown>);
    return parseRow(SoldProductSchema, transformedRow, "sold product");
}
