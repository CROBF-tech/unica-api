import type { SoldProduct, SoldProductUpdate } from "../../schemas";
import { updateSale } from "./updateSale";

/**
 * Mark a sale as returned
 */
export async function markSaleAsReturned(id: string, returnedAt: string): Promise<SoldProduct | null> {
    return updateSale({
        id,
        isReturned: true,
        returnedAt,
    });
}
