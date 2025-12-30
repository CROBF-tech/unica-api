import { db } from "../../../config/database";

/**
 * Get the next available code number for a given prefix
 */
export async function getNextAvailableCodeNumber(prefix: string): Promise<number> {
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
        return 1;
    }

    const row = result.rows[0];
    if (!row || typeof row.code !== "string") {
        return 1;
    }

    const highestCode = row.code;
    const numberPart = highestCode.split("-")[1];
    if (!numberPart) {
        return 1;
    }

    const highestNumber = parseInt(numberPart, 10);

    return isNaN(highestNumber) ? 1 : highestNumber + 1;
}
