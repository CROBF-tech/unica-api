import { db } from "../../../config/database";
import { ProductSchema } from "../../schemas";
import type { Product } from "../../schemas";
import { parseRow } from "../../utils";

/**
 * Find a product by ID
 */
export async function findProductById(id: string): Promise<Product | null> {
    const result = await db.execute({
        sql: "SELECT * FROM products WHERE id = :id",
        args: { id },
    });

    if (result.rows.length === 0) {
        return null;
    }

    return parseRow(ProductSchema, result.rows[0], "product");
}
