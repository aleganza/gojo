import { migrateProductDb } from './migrations';

// TODO:
export async function runMigrations() {
  await migrateProductDb();
}
