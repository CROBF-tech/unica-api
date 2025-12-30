import { z } from "zod";

// ============================================
// Product Schema
// ============================================
export const ProductSchema = z.object({
    id: z.uuid(),
    code: z.string(),
    description: z.string(),
    provider: z.string(),
    purchasePrice: z.coerce.number(),
    salePrice: z.coerce.number(),
    stock: z.coerce.number().int(),
    metadata: z.string().default("{}"),
    createdAt: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductInsert = Omit<Product, "id"> & { id?: string };
export type ProductUpdate = Partial<Omit<Product, "id">> & { id: string };

// ============================================
// Purchased Product Schema (productos_comprados)
// ============================================
export const PurchasedProductSchema = z.object({
    id: z.uuid(),
    productId: z.uuid(),
    productCode: z.string(),
    productDescription: z.string(),
    productProvider: z.string(),
    purchasePrice: z.coerce.number(),
    quantity: z.coerce.number().int(),
    purchasedAt: z.string(),
});

export type PurchasedProduct = z.infer<typeof PurchasedProductSchema>;
export type PurchasedProductInsert = PurchasedProduct;
export type PurchasedProductUpdate = Partial<Omit<PurchasedProduct, "id">> & { id: string };

// ============================================
// Sold Product Schema (productos_vendidos)
// ============================================
export const SoldProductSchema = z.object({
    id: z.uuid(),
    productId: z.uuid(),
    productCode: z.string(),
    productDescription: z.string(),
    productProvider: z.string(),
    purchasePrice: z.coerce.number(),
    salePrice: z.coerce.number(),
    soldAt: z.string(),
    soldBy: z.string(),
    isReturned: z.preprocess((val) => Boolean(val), z.boolean()),
    returnedAt: z.string().nullable(),
    details: z.string().nullable().default(null),
});

export type SoldProduct = z.infer<typeof SoldProductSchema>;
export type SoldProductInsert = Omit<SoldProduct, "isReturned" | "returnedAt"> & {
    isReturned?: boolean;
    returnedAt?: string | null;
};
export type SoldProductUpdate = Partial<Pick<SoldProduct, "isReturned" | "returnedAt">> & { id: string };

// ============================================
// Config Schema
// ============================================
export const ConfigSchema = z.object({
    id: z.coerce.number().int(),
    key: z.string(),
    value: z.string(),
});

export type Config = z.infer<typeof ConfigSchema>;
export type ConfigInsert = Omit<Config, "id">;
export type ConfigUpdate = Config;

// ============================================
// Pagination Types
// ============================================
export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
    data: T[];
    count: number;
    page: number;
    totalPages: number;
}
