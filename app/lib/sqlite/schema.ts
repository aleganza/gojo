export const schema = `
CREATE TABLE IF NOT EXISTS products (
  barcode TEXT PRIMARY KEY NOT NULL,
  raw_json TEXT NOT NULL,

  fetched_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_fetched_at
  ON products (fetched_at);
`;
