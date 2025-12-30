import { db } from "../../../config/database";
import { PurchasedProductSchema } from "../../schemas";
import type { PurchasedProduct, PurchasedProductUpdate } from "../../schemas";
import { findPurchaseById } from "./findPurchaseById";

/**
 * Update an existing purchase record
 */
export async function updatePurchase(purchase: PurchasedProductUpdate): Promise<PurchasedProduct | null> {
    const existing = await findPurchaseById(purchase.id);
    if (!existing) {
        return null;
    }

    const merged = { ...existing, ...purchase };
    const validated = PurchasedProductSchema.parse(merged);

    await db.execute({
        sql: `UPDATE productos_comprados
              SET productId = :productId,
                  productCode = :productCode,
                  productDescription = :productDescription,
                  productProvider = :productProvider,
                  purchasePrice = :purchasePrice,
                  quantity = :quantity
              WHERE id = :id`,
        args: {
            id: validated.id,
            productId: validated.productId,
            productCode: validated.productCode,
            productDescription: validated.productDescription,
            productProvider: validated.productProvider,
            purchasePrice: validated.purchasePrice,
            quantity: validated.quantity,
        },
    });

    return validated;
}
