import { db } from "../../libs/database";
import { SoldProductRepository, SoldProductDTO } from "../base/SoldProductRepository";
import { z } from "zod";

// Zod schema for sold product validation
const SoldProductSchema = z.object({
    id: z.string(),
    productId: z.string(),
    productCode: z.string(),
    productDescription: z.string(),
    productProvider: z.string(),
    purchasePrice: z.number(),
    salePrice: z.number(),
    soldAt: z.string(),
    soldBy: z.string(),
    isReturned: z.boolean(),
    returnedAt: z.string().nullable(),
    details: z.string()
});

// Type derived from Zod schema for internal use
type ValidatedSoldProduct = z.infer<typeof SoldProductSchema>;

export class TursoSoldProductRepository implements SoldProductRepository {
    async save(soldProduct: SoldProductDTO & any): Promise<void> {
        const validatedData = SoldProductSchema.parse(soldProduct);

        await db.execute({
            sql: `
        INSERT INTO productos_vendidos 
        (id, productId, productCode, productDescription, productProvider, purchasePrice, salePrice, soldAt, soldBy, isReturned, returnedAt, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            args: [
                validatedData.id,
                validatedData.productId,
                validatedData.productCode,
                validatedData.productDescription,
                validatedData.productProvider,
                validatedData.purchasePrice,
                validatedData.salePrice,
                validatedData.soldAt,
                validatedData.soldBy,
                validatedData.isReturned ? 1 : 0,
                validatedData.returnedAt,
                validatedData.details,
            ],
        });
    }

    async update(soldProduct: SoldProductDTO & any): Promise<void> {
        const validatedData = SoldProductSchema.parse(soldProduct);

        await db.execute({
            sql: `
        UPDATE productos_vendidos 
        SET isReturned = ?, returnedAt = ?
        WHERE id = ?
      `,
            args: [
                validatedData.isReturned ? 1 : 0,
                validatedData.returnedAt,
                validatedData.id,
            ],
        });
    }

    async findById(id: string): Promise<SoldProductDTO | null> {
        const result = await db.execute({
            sql: "SELECT * FROM productos_vendidos WHERE id = ?",
            args: [id],
        });

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        const rowData = {
            ...row,
            isReturned: Boolean(row.isReturned),
            returnedAt: row.returnedAt as string | null,
            details: row.details as string || ""
        };

        const parsed = SoldProductSchema.safeParse(rowData);
        if (!parsed.success) {
            throw new Error(`Invalid sold product data: ${parsed.error.message}`);
        }
        return parsed.data as SoldProductDTO;
    }

    async findByProductId(productId: string): Promise<SoldProductDTO[]> {
        const result = await db.execute({
            sql: "SELECT * FROM productos_vendidos WHERE productId = ? ORDER BY soldAt DESC",
            args: [productId],
        });

        return result.rows.map((row): SoldProductDTO => {
            const rowData = {
                ...row,
                isReturned: Boolean(row.isReturned),
                returnedAt: row.returnedAt as string | null,
                details: row.details as string || ""
            };

            const parsed = SoldProductSchema.safeParse(rowData);
            if (!parsed.success) {
                throw new Error(`Invalid sold product data: ${parsed.error.message}`);
            }
            return parsed.data as SoldProductDTO;
        });
    }

    async findByProductIdNotReturned(productId: string): Promise<SoldProductDTO[]> {
        const result = await db.execute({
            sql: "SELECT * FROM productos_vendidos WHERE productId = ? AND isReturned = 0 ORDER BY soldAt DESC",
            args: [productId],
        });

        return result.rows.map((row): SoldProductDTO => {
            const rowData = {
                ...row,
                isReturned: Boolean(row.isReturned),
                returnedAt: row.returnedAt as string | null,
                details: row.details as string || ""
            };

            const parsed = SoldProductSchema.safeParse(rowData);
            if (!parsed.success) {
                throw new Error(`Invalid sold product data: ${parsed.error.message}`);
            }
            return parsed.data as SoldProductDTO;
        });
    }

    async findAll(): Promise<SoldProductDTO[]> {
        const result = await db.execute(
            "SELECT * FROM productos_vendidos ORDER BY soldAt DESC"
        );

        return result.rows.map((row): SoldProductDTO => {
            const rowData = {
                ...row,
                isReturned: Boolean(row.isReturned),
                returnedAt: row.returnedAt as string | null,
                details: row.details as string || ""
            };

            const parsed = SoldProductSchema.safeParse(rowData);
            if (!parsed.success) {
                throw new Error(`Invalid sold product data: ${parsed.error.message}`);
            }
            return parsed.data as SoldProductDTO;
        });
    }

    async findAllNotReturned(): Promise<SoldProductDTO[]> {
        const result = await db.execute(
            "SELECT * FROM productos_vendidos WHERE isReturned = 0 ORDER BY soldAt DESC"
        );

        return result.rows.map((row): SoldProductDTO => {
            const rowData = {
                ...row,
                isReturned: Boolean(row.isReturned),
                returnedAt: row.returnedAt as string | null,
                details: row.details as string || ""
            };

            const parsed = SoldProductSchema.safeParse(rowData);
            if (!parsed.success) {
                throw new Error(`Invalid sold product data: ${parsed.error.message}`);
            }
            return parsed.data as SoldProductDTO;
        });
    }

    async findAllReturned(): Promise<SoldProductDTO[]> {
        const result = await db.execute(
            "SELECT * FROM productos_vendidos WHERE isReturned = 1 ORDER BY soldAt DESC"
        );

        return result.rows.map((row): SoldProductDTO => {
            const rowData = {
                ...row,
                isReturned: Boolean(row.isReturned),
                returnedAt: row.returnedAt as string | null,
                details: row.details as string || ""
            };

            const parsed = SoldProductSchema.safeParse(rowData);
            if (!parsed.success) {
                throw new Error(`Invalid sold product data: ${parsed.error.message}`);
            }
            return parsed.data as SoldProductDTO;
        });
    }

    async findBySoldDate(date: string, includeReturned: boolean = false): Promise<SoldProductDTO[]> {
        // Buscamos por prefijo en el campo soldAt. Ejemplo: '2025-11-15' -> todas las filas cuya soldAt comience con '2025-11-15'
        let sql = "SELECT * FROM productos_vendidos WHERE soldAt LIKE ? || '%' ";
        const args: any[] = [date];

        // Si no queremos incluir devueltos, filtramos isReturned = 0
        if (!includeReturned) {
            sql += "AND isReturned = 0 ";
        }

        sql += "ORDER BY soldAt DESC";

        const result = await db.execute({ sql, args });

        return result.rows.map((row): SoldProductDTO => {
            const rowData = {
                ...row,
                isReturned: Boolean(row.isReturned),
                returnedAt: row.returnedAt as string | null,
                details: row.details as string || ""
            };

            const parsed = SoldProductSchema.safeParse(rowData);
            if (!parsed.success) {
                throw new Error(`Invalid sold product data: ${parsed.error.message}`);
            }
            return parsed.data as SoldProductDTO;
        });
    }

    async delete(id: string): Promise<void> {
        await db.execute({
            sql: "DELETE FROM productos_vendidos WHERE id = ?",
            args: [id],
        });
    }

    async deleteAll(): Promise<void> {
        // Calcular la fecha de hace 3 meses
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        // Obtener todos los productos vendidos usando el método existente
        const soldProducts = await this.findAll();

        // Filtrar productos con más de 3 meses de antigüedad
        const idsToDelete: string[] = [];

        for (const soldProduct of soldProducts) {
            if (this.isOlderThanThreeMonths(soldProduct.soldAt, threeMonthsAgo)) {
                idsToDelete.push(soldProduct.id);
            }
        }

        // Eliminar los productos vendidos que tienen más de 3 meses
        if (idsToDelete.length > 0) {
            const placeholders = idsToDelete.map(() => '?').join(',');
            await db.execute({
                sql: `DELETE FROM productos_vendidos WHERE id IN (${placeholders})`,
                args: idsToDelete
            });
        }
    }

    private isOlderThanThreeMonths(soldAtString: string, threeMonthsAgo: Date): boolean {
        // Convertir el formato DD/MM/YYYY HH:MM a Date
        const [datePart, timePart] = soldAtString.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);

        const soldDate = new Date(year, month - 1, day, hours, minutes);

        return soldDate < threeMonthsAgo;
    }
}
