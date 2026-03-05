import { Logger } from "@/lib/logger/logger";
import { getDB } from "@/lib/sqlite/db";

export async function getProduct(
  barcode: string,
): Promise<{ raw: any; addedAt: Date } | null> {
  try {
    const row = await (
      await getDB()
    ).getFirstAsync<{
      barcode: string;
      raw_json: string;
      fetched_at: number;
      updated_at: number;
    }>(
      `SELECT barcode, raw_json, fetched_at, updated_at
     FROM products
     WHERE barcode = ?`,
      barcode,
    );

    if (!row) return null;

    return {
      raw: JSON.parse(row.raw_json),
      addedAt: new Date(row.fetched_at),
    };
  } catch (error) {
    Logger.error(error);
    return null;
  }
}

export async function upsertProduct(barcode: string, data: any): Promise<void> {
  try {
    const now = Date.now();
    await (
      await getDB()
    ).runAsync(
      `
    INSERT INTO products (barcode, raw_json, fetched_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(barcode) DO UPDATE SET
      raw_json = excluded.raw_json,
      fetched_at = excluded.fetched_at,
      updated_at = excluded.updated_at
    `,
      barcode,
      JSON.stringify(data),
      now,
      now,
    );
  } catch (error) {
    Logger.error(error);
  }
}

export async function deleteProduct(barcode: string): Promise<boolean> {
  try {
    const result = await (
      await getDB()
    ).runAsync(`DELETE FROM products WHERE barcode = ?`, barcode);

    return result.changes > 0;
  } catch (error) {
    Logger.error(error);
    return false;
  }
}

export async function getAllProductsChronologically(): Promise<
  { raw: any; addedAt: Date }[]
> {
  try {
    const rows = await (
      await getDB()
    ).getAllAsync<{
      barcode: string;
      raw_json: string;
      fetched_at: number;
      updated_at: number;
    }>(
      `SELECT barcode, raw_json, fetched_at, updated_at
       FROM products
       ORDER BY fetched_at DESC`,
    );

    return rows.map((row) => ({
      raw: JSON.parse(row.raw_json),
      addedAt: new Date(row.fetched_at),
    }));
  } catch (error) {
    Logger.error(error);
    return [];
  }
}
