import { db } from "../../../config/database";
import { ProductSchema } from "../../schemas";
import type { Product } from "../../schemas";
import { parseRows } from "../../utils";

/**
 * Get all products with zero stock
 */
export async function findProductsWithZeroStock(): Promise<Product[]> {
    const result = await db.execute({
        sql: "SELECT * FROM products WHERE stock = 0",
        args: {},
    });

    return parseRows(ProductSchema, result.rows, "product");
}
