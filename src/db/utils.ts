import { z } from "zod";

/**
 * Parses and validates a single row from the database
 * @throws Error if validation fails
 */
export function parseRow<T extends z.ZodTypeAny>(
    schema: T,
    row: unknown,
    entityName: string
): z.infer<T> {
    const result = schema.safeParse(row);
    if (!result.success) {
        throw new Error(`Invalid ${entityName} data: ${result.error.message}`);
    }
    return result.data;
}

/**
 * Parses and validates multiple rows from the database
 * @throws Error if any row validation fails
 */
export function parseRows<T extends z.ZodTypeAny>(
    schema: T,
    rows: unknown[],
    entityName: string
): z.infer<T>[] {
    return rows.map((row) => parseRow(schema, row, entityName));
}

/**
 * Safely parses a single row, returning null if validation fails
 */
export function safeParseRow<T extends z.ZodTypeAny>(
    schema: T,
    row: unknown
): z.infer<T> | null {
    const result = schema.safeParse(row);
    return result.success ? result.data : null;
}

/**
 * Parses a date string in format "DD/MM/YYYY" or "DD/MM/YYYY HH:mm:ss" to Date object.
 * Time part (HH:mm:ss) is optional.
 */
export function parseDateString(dateString: string): Date {
    const parts = dateString.split(" ");
    const datePart = parts[0] || "";
    const timePart = parts[1] || "00:00:00";

    const dateParts = datePart.split("/").map(Number);
    const day = dateParts[0] || 1;
    const month = dateParts[1] || 1;
    const year = dateParts[2] || 2000;

    const timeParts = timePart.split(":").map(Number);
    const hours = timeParts[0] || 0;
    const minutes = timeParts[1] || 0;
    const seconds = timeParts[2] || 0;

    return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Parses an ISO date string (e.g., "2024-12-30T14:30:00.000Z") to Date object.
 * Used for returnedAt field in productos_vendidos.
 */
export function parseISODateString(dateString: string): Date {
    return new Date(dateString);
}

/**
 * Parses a date string that could be either ISO format or DD/MM/YYYY format.
 * Automatically detects the format.
 */
export function parseAnyDateString(dateString: string): Date {
    // ISO format contains "-" and "T" or starts with 4 digits (year)
    if (dateString.includes("-") || /^\d{4}/.test(dateString)) {
        return parseISODateString(dateString);
    }
    return parseDateString(dateString);
}
