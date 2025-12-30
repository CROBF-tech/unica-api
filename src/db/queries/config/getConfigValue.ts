import { findConfigByKey } from "./findConfigByKey";

/**
 * Get a config value by key, with optional default
 */
export async function getConfigValue(key: string, defaultValue: string = ""): Promise<string> {
    const config = await findConfigByKey(key);
    return config ? config.value : defaultValue;
}
