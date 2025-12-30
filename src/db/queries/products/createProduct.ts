import { db } from "../../../config/database";
import { ProductSchema } from "../../schemas";
import type { Product, ProductInsert } from "../../schemas";

/**
 * Create a new product
 */
export async function createProduct(product: ProductInsert): Promise<Product> {
    const id = product.id ?? crypto.randomUUID();
    const productWithId = { ...product, id };

    const validated = ProductSchema.parse(productWithId);

    await db.execute({
        sql: `INSERT INTO products 
              (id, code, description, provider, purchasePrice, salePrice, stock, metadata, createdAt) 
              VALUES (:id, :code, :description, :provider, :purchasePrice, :salePrice, :stock, :metadata, :createdAt)`,
        args: {
            id: validated.id,
            code: validated.code,
            description: validated.description,
            provider: validated.provider,
            purchasePrice: validated.purchasePrice,
            salePrice: validated.salePrice,
            stock: validated.stock,
            metadata: validated.metadata,
            createdAt: validated.createdAt,
        },
    });

    return validated;
}
