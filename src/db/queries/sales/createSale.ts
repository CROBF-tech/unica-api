import { db } from "../../../config/database";
import { SoldProductSchema } from "../../schemas";
import type { SoldProduct, SoldProductInsert } from "../../schemas";

/**
 * Create a new sale record
 */
export async function createSale(sale: SoldProductInsert): Promise<SoldProduct> {
    const saleData = {
        ...sale,
        isReturned: sale.isReturned ?? false,
        returnedAt: sale.returnedAt ?? null,
    };

    const validated = SoldProductSchema.parse(saleData);

    await db.execute({
        sql: `INSERT INTO productos_vendidos 
              (id, productId, productCode, productDescription, productProvider, purchasePrice, salePrice, soldAt, soldBy, isReturned, returnedAt, details)
              VALUES (:id, :productId, :productCode, :productDescription, :productProvider, :purchasePrice, :salePrice, :soldAt, :soldBy, :isReturned, :returnedAt, :details)`,
        args: {
            id: validated.id,
            productId: validated.productId,
            productCode: validated.productCode,
            productDescription: validated.productDescription,
            productProvider: validated.productProvider,
            purchasePrice: validated.purchasePrice,
            salePrice: validated.salePrice,
            soldAt: validated.soldAt,
            soldBy: validated.soldBy,
            isReturned: validated.isReturned ? 1 : 0,
            returnedAt: validated.returnedAt,
            details: validated.details,
        },
    });

    return validated;
}
