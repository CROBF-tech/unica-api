import { db } from "../../libs/database";
import { PurchasedProductFilters, PurchasedProductRepository, PurchaseDTO } from "../base/PurchasedProductRepository";
import type { PaginatedResult, PaginationOptions } from "../../libs/types";
import { z } from "zod";

// Zod schema for purchase validation
const PurchaseSchema = z.object({
    id: z.string(),
    productId: z.string(),
    productCode: z.string(),
    productDescription: z.string(),
    productProvider: z.string(),
    purchasePrice: z.number(),
    quantity: z.number(),
    purchasedAt: z.string()
});

// Type derived from Zod schema for internal use
type ValidatedPurchase = z.infer<typeof PurchaseSchema>;

export class TursoPurchasedProductRepository implements PurchasedProductRepository {
    async save(purchasedProduct: PurchaseDTO & any): Promise<void> {
        const validatedData = PurchaseSchema.parse(purchasedProduct);

        await db.execute({
            sql: `
                INSERT INTO productos_comprados 
                (id, productId, productCode, productDescription, productProvider, purchasePrice, quantity, purchasedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
                validatedData.id,
                validatedData.productId,
                validatedData.productCode,
                validatedData.productDescription,
                validatedData.productProvider,
                validatedData.purchasePrice,
                validatedData.quantity,
                validatedData.purchasedAt,
            ],
        });
    }

    async update(purchase: PurchaseDTO): Promise<void> {
        const validatedData = PurchaseSchema.parse(purchase);

        await db.execute({
            sql: `
                UPDATE productos_comprados
                SET 
                    productId = ?,
                    productCode = ?,
                    productDescription = ?,
                    productProvider = ?,
                    purchasePrice = ?,
                    quantity = ?
                WHERE id = ?
            `,
            args: [
                validatedData.productId,
                validatedData.productCode,
                validatedData.productDescription,
                validatedData.productProvider,
                validatedData.purchasePrice,
                validatedData.quantity,
                validatedData.id,
            ],
        });
    }

    async findById(id: string): Promise<PurchaseDTO | null> {
        const result = await db.execute({
            sql: "SELECT * FROM productos_comprados WHERE id = ?",
            args: [id],
        });

        if (result.rows.length === 0) {
            return null;
        }

        const parsed = PurchaseSchema.safeParse(result.rows[0]);
        if (!parsed.success) {
            throw new Error(`Invalid purchase data: ${parsed.error.message}`);
        }
        return parsed.data as PurchaseDTO;
    }

    async findByProductId(productId: string): Promise<PurchaseDTO[]> {
        const result = await db.execute({
            sql: "SELECT * FROM productos_comprados WHERE productId = ? ORDER BY purchasedAt DESC",
            args: [productId],
        });

        return result.rows.map((row): PurchaseDTO => {
            const parsed = PurchaseSchema.safeParse(row);
            if (!parsed.success) {
                throw new Error(`Invalid purchase data: ${parsed.error.message}`);
            }
            return parsed.data as PurchaseDTO;
        });
    }

    async findAll(
        filters: PurchasedProductFilters,
        pagination: PaginationOptions
    ): Promise<PaginatedResult<PurchaseDTO>> {
        let sql = `SELECT * FROM productos_comprados WHERE 1=1`;
        const params: Record<string, any> = {};

        if (filters.productCode && filters.productCode.length > 0) {
            sql += ` AND LOWER(productCode) LIKE LOWER(:productCode)`;
            params.productCode = `%${filters.productCode}%`;
        }

        if (filters.productDescription && filters.productDescription.length > 0) {
            sql += ` AND LOWER(productDescription) LIKE LOWER(:productDescription)`;
            params.productDescription = `%${filters.productDescription}%`;
        }

        if (filters.productProvider && filters.productProvider.length > 0) {
            sql += ` AND LOWER(productProvider) LIKE LOWER(:productProvider)`;
            params.productProvider = `%${filters.productProvider}%`;
        }

        if (filters.minPrice !== undefined) {
            sql += ` AND purchasePrice >= :minPrice`;
            params.minPrice = filters.minPrice;
        }

        if (filters.maxPrice !== undefined) {
            sql += ` AND purchasePrice <= :maxPrice`;
            params.maxPrice = filters.maxPrice;
        }

        if (filters.minQuantity !== undefined) {
            sql += ` AND quantity >= :minQuantity`;
            params.minQuantity = filters.minQuantity;
        }

        if (filters.maxQuantity !== undefined) {
            sql += ` AND quantity <= :maxQuantity`;
            params.maxQuantity = filters.maxQuantity;
        }

        if (filters.startDate && filters.startDate.length > 0) {
            sql += ` AND purchasedAt >= :startDate`;
            params.startDate = filters.startDate;
        }

        if (filters.endDate && filters.endDate.length > 0) {
            sql += ` AND purchasedAt <= :endDate`;
            params.endDate = filters.endDate;
        }

        // Contar total de productos comprados que cumplen el filtro
        const purchasedCount = (
            await db.execute({
                sql: sql.replace("*", "COUNT(*)"),
                args: params,
            })
        ).rows[0]["COUNT(*)"] as number;

        // Paginación
        const limit = pagination.limit;
        const page = pagination.page;
        const offset = page * limit;

        const limitSql = ` ORDER BY purchasedAt DESC LIMIT :limit OFFSET :offset`;
        params.limit = limit;
        params.offset = offset;

        const purchasedProducts = await db.execute({
            sql: sql + limitSql,
            args: params,
        });

        // Mapear y validar los resultados con Zod
        const purchasedProductsList: PurchaseDTO[] = purchasedProducts.rows.map((row: any): PurchaseDTO => {
            const parsed = PurchaseSchema.safeParse(row);
            if (!parsed.success) {
                throw new Error(`Invalid purchase data: ${parsed.error.message}`);
            }
            return parsed.data as PurchaseDTO;
        });

        return {
            data: purchasedProductsList,
            count: purchasedProducts.rows.length,
            page,
            totalPages: Math.ceil(purchasedCount / limit),
        };
    }

    async delete(id: string): Promise<boolean> {
        const checkResult = await db.execute({
            sql: "SELECT id FROM productos_comprados WHERE id = ?",
            args: [id],
        });

        if (checkResult.rows.length === 0) {
            return false;
        }

        await db.execute({
            sql: "DELETE FROM productos_comprados WHERE id = ?",
            args: [id],
        });

        return true;
    }

    async deleteAll(): Promise<void> {
        // Calcular la fecha de hace 6 meses para productos comprados
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Obtener todos los productos comprados
        const allPurchased = await db.execute(
            "SELECT * FROM productos_comprados ORDER BY purchasedAt DESC"
        );

        // Filtrar productos con más de 6 meses de antigüedad
        const idsToDelete: string[] = [];

        for (const row of allPurchased.rows) {
            const parsed = PurchaseSchema.safeParse(row);
            if (!parsed.success) {
                continue; // Skip invalid data
            }

            const purchasedProduct = parsed.data;

            if (this.isOlderThanSixMonths(purchasedProduct.purchasedAt, sixMonthsAgo)) {
                idsToDelete.push(purchasedProduct.id);
            }
        }

        // Eliminar los productos comprados que tienen más de 6 meses
        if (idsToDelete.length > 0) {
            const placeholders = idsToDelete.map(() => '?').join(',');
            await db.execute({
                sql: `DELETE FROM productos_comprados WHERE id IN (${placeholders})`,
                args: idsToDelete
            });
        }
    }

    async getTotalPurchasedByProductId(productId: string): Promise<number> {
        const result = await db.execute({
            sql: "SELECT SUM(quantity) as total FROM productos_comprados WHERE productId = ?",
            args: [productId],
        });

        return (result.rows[0]?.total as number) || 0;
    }

    async getPurchasesByDateRange(startDate: string, endDate: string): Promise<PurchaseDTO[]> {
        const result = await db.execute({
            sql: "SELECT * FROM productos_comprados WHERE purchasedAt >= ? AND purchasedAt <= ? ORDER BY purchasedAt DESC",
            args: [startDate, endDate],
        });

        return result.rows.map((row): PurchaseDTO => {
            const parsed = PurchaseSchema.safeParse(row);
            if (!parsed.success) {
                throw new Error(`Invalid purchase data: ${parsed.error.message}`);
            }
            return parsed.data as PurchaseDTO;
        });
    }

    private isOlderThanSixMonths(purchasedAtString: string, sixMonthsAgo: Date): boolean {
        // Convertir el formato DD/MM/YYYY HH:MM a Date
        const [datePart, timePart] = purchasedAtString.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);

        const purchasedDate = new Date(year, month - 1, day, hours, minutes);

        return purchasedDate < sixMonthsAgo;
    }
}