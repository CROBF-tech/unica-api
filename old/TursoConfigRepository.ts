import { db } from "../../libs/database";
import { ConfigItem, ConfigRepository } from "../base/ConfigRepository";
import { z } from "zod";

const schema = z.object({
  id: z.coerce.number(),
  key: z.string(),
  value: z.string()
});

export class TursoConfigRepository implements ConfigRepository {
  async getAll(): Promise<ConfigItem[]> {

    const result = await db.execute({
      sql: "SELECT * FROM config ORDER BY key ASC",
      args: [],
    });

    return result.rows.map(row => {
      const parsed = schema.safeParse(row);
      if (!parsed.success) {
        throw new Error(`Invalid config data: ${parsed.error.message}`);
      }
      return parsed.data as ConfigItem;
    });
  }

  async findById(id: number): Promise<ConfigItem | null> {
    const result = await db.execute({
      sql: "SELECT * FROM config WHERE id = :id",
      args: { id },
    });

    if (result.rows.length === 0) {
      return null;
    }

    const parsed = schema.safeParse(result.rows[0]);
    if (!parsed.success) {
      throw new Error(`Invalid config data: ${parsed.error.message}`);
    }
    return parsed.data as ConfigItem;
  }

  async findByKey(key: string): Promise<ConfigItem | null> {
    const result = await db.execute({
      sql: "SELECT * FROM config WHERE key = :key",
      args: { key },
    });

    if (result.rows.length === 0) {
      return null;
    }

    const parsed = schema.safeParse(result.rows[0]);
    if (!parsed.success) {
      throw new Error(`Invalid config data: ${parsed.error.message}`);
    }
    return parsed.data as ConfigItem;
  }

  async save(configItem: Omit<ConfigItem, "id">): Promise<ConfigItem> {
    const sql = `
      INSERT INTO config 
      (key, value) 
      VALUES (:key, :value)
      RETURNING id
    `;

    const result = await db.execute({
      sql,
      args: {
        key: configItem.key,
        value: configItem.value,
      },
    });

    const id = result.rows[0].id as number;

    return {
      id,
      key: configItem.key,
      value: configItem.value,
    };
  }

  async update(configItem: ConfigItem): Promise<ConfigItem | null> {
    const checkResult = await db.execute({
      sql: "SELECT id FROM config WHERE id = :id",
      args: { id: configItem.id },
    });

    if (checkResult.rows.length === 0) {
      return null;
    }

    await db.execute({
      sql: "UPDATE config SET key = :key, value = :value WHERE id = :id",
      args: {
        id: configItem.id,
        key: configItem.key,
        value: configItem.value,
      },
    });

    return configItem;
  }

  async delete(id: number): Promise<boolean> {
    const checkResult = await db.execute({
      sql: "SELECT id FROM config WHERE id = :id",
      args: { id },
    });

    if (checkResult.rows.length === 0) {
      return false;
    }

    await db.execute({
      sql: "DELETE FROM config WHERE id = :id",
      args: { id },
    });

    return true;
  }

  async deleteByKey(key: string): Promise<boolean> {
    const checkResult = await db.execute({
      sql: "SELECT id FROM config WHERE key = :key",
      args: { key },
    });

    if (checkResult.rows.length === 0) {
      return false;
    }

    await db.execute({
      sql: "DELETE FROM config WHERE key = :key",
      args: { key },
    });

    return true;
  }

  async upsertByKey(key: string, value: string): Promise<ConfigItem> {
    const existingConfig = await this.findByKey(key);

    if (existingConfig) {
      // Update if exists
      existingConfig.value = value;
      await this.update(existingConfig);
      return existingConfig;
    } else {
      // Insert if doesn't exist
      return this.save({ key, value });
    }
  }

  async getValue(key: string, defaultValue?: string): Promise<string> {
    const config = await this.findByKey(key);

    if (config) {
      return config.value;
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    return "";
  }
}
