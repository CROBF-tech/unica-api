/**
 * Helper to transform row data for sold products
 */
export function transformSoldProductRow(row: Record<string, unknown>): Record<string, unknown> {
    return {
        ...row,
        isReturned: Boolean(row.isReturned),
        returnedAt: row.returnedAt as string | null,
        details: (row.details as string) || null,
    };
}
