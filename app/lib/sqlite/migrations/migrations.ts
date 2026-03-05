import { getDB } from '../db';
import { schema } from '../schema';

export async function migrateProductDb() {
  await (await getDB()).execAsync(schema);
}
