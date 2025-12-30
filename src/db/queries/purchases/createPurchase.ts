import { db } from "../../../config/database";
import { PurchasedProductSchema } from "../../schemas";
import type { PurchasedProduct, PurchasedProductInsert } from "../../schemas";

/**
 * Create a new purchase record
 */
export async function createPurchase(purchase: PurchasedProductInsert): Promise<PurchasedProduct> {
    const validated = PurchasedProductSchema.parse(purchase);

    await db.execute({
        sql: `INSERT INTO productos_comprados 
              (id, productId, productCode, productDescription, productProvider, purchasePrice, quantity, purchasedAt)
              VALUES (:id, :productId, :productCode, :productDescription, :productProvider, :purchasePrice, :quantity, :purchasedAt)`,
        args: {
            id: validated.id,
            productId: validated.productId,
            productCode: validated.productCode,
            productDescription: validated.productDescription,
            productProvider: validated.productProvider,
            purchasePrice: validated.purchasePrice,
            quantity: validated.quantity,
            purchasedAt: validated.purchasedAt,
        },
    });

    return validated;
}
