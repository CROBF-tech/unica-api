import type { InArgs } from "@libsql/client";
import { db } from "../../../config/database";
import { ProductSchema } from "../../schemas";
import type { Product, PaginationOptions, PaginatedResult } from "../../schemas";
import { parseRows } from "../../utils";

export interface ProductFilters {
    code?: string;
    description?: string;
    provider?: string;
    stock?: number;
    minPrice?: number;
    maxPrice?: number;
    minPurchasePrice?: number;
    maxPurchasePrice?: number;
    startDate?: string;
    endDate?: string;
}

/**
 * Get all products with optional filters and pagination
 */
export async function findAllProducts(
    filters: ProductFilters = {},
    pagination: PaginationOptions
): Promise<PaginatedResult<Product>> {
    let sql = `SELECT * FROM products WHERE 1=1`;
    const params: Record<string, string | number> = {};

    if (filters.code && filters.code.length > 0) {
        sql += ` AND LOWER(code) LIKE LOWER(:code)`;
        params.code = `%${filters.code}%`;
    }

    if (filters.stock !== undefined) {
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
        sql += ` AND createdAt >= :startDate`;
        params.startDate = filters.startDate;
    }

    if (filters.endDate && filters.endDate.length > 0) {
        sql += ` AND createdAt <= :endDate`;
        params.endDate = filters.endDate;
    }

    const countResult = await db.execute({
        sql: sql.replace("*", "COUNT(*) as total"),
        args: params as InArgs,
    });
    const total = (countResult.rows[0]?.total as number) || 0;

    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const paginatedSql = `
        ${sql}
        ORDER BY 
            SUBSTR(code, 1, INSTR(code, '-') - 1) ASC,
            CAST(SUBSTR(code, INSTR(code, '-') + 1) AS INTEGER) ASC
        LIMIT :limit OFFSET :offset
    `;
    params.limit = limit;
    params.offset = offset;

    const result = await db.execute({ sql: paginatedSql, args: params as InArgs });
    const data = parseRows(ProductSchema, result.rows, "product");

    return {
        data,
        count: data.length,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
