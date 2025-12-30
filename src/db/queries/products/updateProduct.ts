import { db } from "../../../config/database";
import { ProductSchema } from "../../schemas";
import type { Product, ProductUpdate } from "../../schemas";
import { findProductById } from "./findProductById";

/**
 * Update an existing product
 */
export async function updateProduct(product: ProductUpdate): Promise<Product | null> {
    const existing = await findProductById(product.id);
    if (!existing) {
        return null;
    }

    const merged = { ...existing, ...product };
    const validated = ProductSchema.parse(merged);

    const updateFields = Object.keys(product)
        .filter((key) => key !== "id")
        .map((key) => `${key} = :${key}`)
        .join(", ");

    if (updateFields.length === 0) {
        return validated;
    }

    await db.execute({
        sql: `UPDATE products SET ${updateFields} WHERE id = :id`,
        args: validated,
    });

    return validated;
}
