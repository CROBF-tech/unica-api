import { db } from "../../../config/database";
import { findPurchaseById } from "./findPurchaseById";

/**
 * Delete a purchase by ID
 */
export async function deletePurchase(id: string): Promise<boolean> {
    const existing = await findPurchaseById(id);
    if (!existing) {
        return false;
    }

    await db.execute({
        sql: "DELETE FROM productos_comprados WHERE id = :id",
        args: { id },
    });

    return true;
}
