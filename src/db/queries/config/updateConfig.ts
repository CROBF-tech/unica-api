import { db } from "../../../config/database";
import type { Config, ConfigUpdate } from "../../schemas";
import { findConfigById } from "./findConfigById";

/**
 * Update an existing config item
 */
export async function updateConfig(config: ConfigUpdate): Promise<Config | null> {
    const existing = await findConfigById(config.id);
    if (!existing) {
        return null;
    }

    await db.execute({
        sql: "UPDATE config SET key = :key, value = :value WHERE id = :id",
        args: {
            id: config.id,
            key: config.key,
            value: config.value,
        },
    });

    return config;
}
