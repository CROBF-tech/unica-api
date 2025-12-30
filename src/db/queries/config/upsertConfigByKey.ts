import type { Config } from "../../schemas";
import { findConfigByKey } from "./findConfigByKey";
import { createConfig } from "./createConfig";
import { updateConfig } from "./updateConfig";

/**
 * Upsert a config item by key (insert or update)
 */
export async function upsertConfigByKey(key: string, value: string): Promise<Config> {
    const existing = await findConfigByKey(key);

    if (existing) {
        existing.value = value;
        await updateConfig(existing);
        return existing;
    }

    return createConfig({ key, value });
}
