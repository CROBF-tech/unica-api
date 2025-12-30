import { db } from "../../libs/database";
import { ProductFilters, ProductRepository, ProductDTO } from "../base/ProductRepository";
import type { PaginatedResult, PaginationOptions } from "../../libs/types";
import { z } from "zod";

// Zod schema for product validation
const ProductSchema = z.object({
    id: z.string(),
    code: z.string(),
    description: z.string(),
    provider: z.string(),
    purchasePrice: z.number(),
    salePrice: z.number(),
    stock: z.number(),
    metadata: z.string(),
    createdAt: z.string()
});

export class TursoProductRepository implements ProductRepository {
    async getStockZeroProducts(): Promise<ProductDTO[]> {
        try {
            const result = await db.execute({
                sql: "SELECT * FROM products WHERE stock = 0",
                args: {},
            });

            return result.rows.map((row: any): ProductDTO => {
                const parsed = ProductSchema.safeParse(row);
                if (!parsed.success) {
                    throw new Error(`Invalid product data: ${parsed.error.message}`);
                }
                return parsed.data as ProductDTO;
            });
        } catch (error: any) {
            throw error;
        }
    }

    async findAll(
        filters: ProductFilters,
        pagination: PaginationOptions
    ): Promise<PaginatedResult<ProductDTO>> {
        try {
            let sql = `SELECT * FROM products WHERE 1=1`;
            const params: Record<string, any> = {};

            if (filters.code && filters.code.length > 0) {
                sql += ` AND LOWER(code) LIKE LOWER(:code)`;
                params.code = `%${filters.code}%`;
            }

            if (filters.stock) {
                sql += ` AND stock = :stock`;
                params.stock = filters.stock;
            }

            if (filters.description && filters.description.length > 0) {
                sql += ` AND LOWER(description) LIKE LOWER(:description)`;
                params.description = `%${filters.description}%`;
            }

            if (filters.provider && filters.provider.length > 0) {
                sql += ` AND LOWER(provider) LIKE LOWER(:provider)`;
                params.provider = `%${filters.provider}%`;
            }

            if (filters.minPrice !== undefined) {
                sql += ` AND salePrice >= :minPrice`;
                params.minPrice = filters.minPrice;
            }

            if (filters.maxPrice !== undefined) {
                sql += ` AND salePrice <= :maxPrice`;
                params.maxPrice = filters.maxPrice;
            }

            if (filters.minPurchasePrice !== undefined) {
                sql += ` AND purchasePrice >= :minPurchasePrice`;
                params.minPurchasePrice = filters.minPurchasePrice;
            }

            if (filters.maxPurchasePrice !== undefined) {
                sql += ` AND purchasePrice <= :maxPurchasePrice`;
                params.maxPurchasePrice = filters.maxPurchasePrice;
            }

            if (filters.startDate && filters.startDate.length > 0) {
                const [day, month, year] = filters.startDate.split("/");
                const formattedStartDate = `${day}/${month}/${year}`;
                sql += ` AND createdAt >= :startDate`;
                params.startDate = formattedStartDate;
            }

            if (filters.endDate && filters.endDate.length > 0) {
                const [day, month, year] = filters.endDate.split("/");
                const formattedEndDate = `${day}/${month}/${year}`;
                sql += ` AND createdAt <= :endDate`;
                params.endDate = formattedEndDate;
            }

            // Contar total de productos que cumplen el filtro
            const productsCount = (
                await db.execute({
                    sql: sql.replace("*", "COUNT(*)"),
                    args: params,
                })
            ).rows[0]["COUNT(*)"] as number;

            // Paginación
            const limit = pagination.limit;
            const page = pagination.page;
            const offset = (page - 1) * limit;

            const limit_sql = `
    ORDER BY 
      SUBSTR(code, 1, INSTR(code, '-') - 1) ASC,
      CAST(SUBSTR(code, INSTR(code, '-') + 1) AS INTEGER) ASC
    LIMIT :limit OFFSET :offset
  `;
            params.limit = limit;
            params.offset = offset;

            const products = await db.execute({
                sql: sql + limit_sql,
                args: params,
            });

            // Mapear y validar los resultados con Zod
            const productsList: ProductDTO[] = products.rows.map((row: any): ProductDTO => {
                const parsed = ProductSchema.safeParse(row);
                if (!parsed.success) {
                    throw new Error(`Invalid product data: ${parsed.error.message}`);
                }
                return parsed.data as ProductDTO;
            });

            const result = {
                data: productsList,
                count: products.rows.length,
                page,
                totalPages: Math.ceil(productsCount / limit),
            };

            return result;
        } catch (error: any) {
            throw error;
        }
    }

    async findById(id: string): Promise<ProductDTO | null> {
        const result = await db.execute({
            sql: "SELECT * FROM products WHERE id = :id",
            args: { id },
        });

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        const parsed = ProductSchema.safeParse(row);
        if (!parsed.success) {
            throw new Error(`Invalid product data: ${parsed.error.message}`);
        }
        return parsed.data as ProductDTO;
    }

    async findByCode(code: string): Promise<ProductDTO | null> {
        const result = await db.execute({
            sql: "SELECT * FROM products WHERE code = :code",
            args: { code },
        });

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        const parsed = ProductSchema.safeParse(row);
        if (!parsed.success) {
            throw new Error(`Invalid product data: ${parsed.error.message}`);
        }
        return parsed.data as ProductDTO;
    }

    async save(product: ProductDTO & any): Promise<ProductDTO> {
        const validatedProduct = ProductSchema.parse(product);

        const sql = `
      INSERT INTO products 
      (id, code, description, provider, purchasePrice, salePrice, stock, metadata, createdAt) 
      VALUES (:id, :code, :description, :provider, :purchasePrice, :salePrice, :stock, :metadata, :createdAt)
    `;

        await db.execute({
            sql,
            args: {
                id: validatedProduct.id,
                code: validatedProduct.code,
                description: validatedProduct.description,
                provider: validatedProduct.provider,
                purchasePrice: validatedProduct.purchasePrice,
                salePrice: validatedProduct.salePrice,
                stock: validatedProduct.stock,
                metadata: validatedProduct.metadata ?? "{}",
                createdAt: validatedProduct.createdAt,
            },
        });

        return validatedProduct as ProductDTO;
    }

    async update(product: ProductDTO & any): Promise<ProductDTO | null> {
        const validatedProduct = ProductSchema.parse(product);

        const checkResult = await db.execute({
            sql: "SELECT id FROM products WHERE id = :id",
            args: { id: validatedProduct.id },
        });

        if (checkResult.rows.length === 0) {
            return null;
        }

        const updateFields = Object.keys(validatedProduct)
            .filter((key) => key !== "id") // No actualizar el ID
            .map((key) => `${key} = :${key}`)
            .join(", ");

        const sql = `UPDATE products SET ${updateFields} WHERE id = :id`;

        await db.execute({
            sql,
            args: validatedProduct,
        });

        return validatedProduct as ProductDTO;
    }

    async delete(id: string): Promise<boolean> {
        const checkResult = await db.execute({
            sql: "SELECT id FROM products WHERE id = :id",
            args: { id },
        });

        if (checkResult.rows.length === 0) {
            return false;
        }

        await db.execute({
            sql: "DELETE FROM products WHERE id = :id",
            args: { id },
        });

        return true;
    }

    async getNextAvailableCodeNumber(prefix: string): Promise<number> {
        try {
            const result = await db.execute({
                sql: `SELECT code FROM products 
                      WHERE code LIKE :prefix
                      ORDER BY 
                        SUBSTR(code, 1, INSTR(code, '-') - 1) DESC,
                        CAST(SUBSTR(code, INSTR(code, '-') + 1) AS INTEGER) DESC 
                      LIMIT 1`,
                args: { prefix: `${prefix}-%` },
            });

            if (result.rows.length === 0) {
                return 1; // Si no hay productos con este prefijo, empezar en 1
            }

            // Obtener el código con el número más alto
            const highestCode = result.rows[0].code as string;
            const numberPart = highestCode.split('-')[1];
            const highestNumber = parseInt(numberPart, 10);

            if (isNaN(highestNumber)) {
                return 1; // Si el número no es válido, empezar en 1
            }

            return highestNumber + 1;
        } catch (error: any) {
            throw error;
        }
    }
}
