import type { InArgs } from "@libsql/client";
import { db } from "../../../config/database";
import { PurchasedProductSchema } from "../../schemas";
import type { PurchasedProduct, PaginationOptions, PaginatedResult } from "../../schemas";
import { parseRows } from "../../utils";

export interface PurchaseFilters {
    productCode?: string;
    productDescription?: string;
    productProvider?: string;
    minPrice?: number;
    maxPrice?: number;
    minQuantity?: number;
    maxQuantity?: number;
    startDate?: string;
    endDate?: string;
}

/**
 * Get all purchases with optional filters and pagination
 */
export async function findAllPurchases(
    filters: PurchaseFilters = {},
    pagination: PaginationOptions
): Promise<PaginatedResult<PurchasedProduct>> {
    let sql = `SELECT * FROM productos_comprados WHERE 1=1`;
    const params: Record<string, string | number> = {};

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

    const countResult = await db.execute({
        sql: sql.replace("*", "COUNT(*) as total"),
        args: params as InArgs,
    });
    const total = (countResult.rows[0]?.total as number) || 0;

    const { page, limit } = pagination;
    const offset = page * limit;

    const paginatedSql = `${sql} ORDER BY purchasedAt DESC LIMIT :limit OFFSET :offset`;
    params.limit = limit;
    params.offset = offset;

    const result = await db.execute({ sql: paginatedSql, args: params as InArgs });
    const data = parseRows(PurchasedProductSchema, result.rows, "purchase");

    return {
        data,
        count: data.length,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
