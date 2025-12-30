import { db } from "../../../config/database";
import { SoldProductSchema } from "../../schemas";
import type { SoldProduct, SoldProductUpdate } from "../../schemas";
import { findSaleById } from "./findSaleById";

/**
 * Update a sale (typically for marking as returned)
 */
export async function updateSale(sale: SoldProductUpdate): Promise<SoldProduct | null> {
    const existing = await findSaleById(sale.id);
    if (!existing) {
        return null;
    }

    const merged = { ...existing, ...sale };
    const validated = SoldProductSchema.parse(merged);

    await db.execute({
        sql: `UPDATE productos_vendidos 
              SET isReturned = :isReturned, returnedAt = :returnedAt
              WHERE id = :id`,
        args: {
            id: validated.id,
            isReturned: validated.isReturned ? 1 : 0,
            returnedAt: validated.returnedAt,
        },
    });

    return validated;
}
