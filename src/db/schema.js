
// SQLite schema migration/init script for sql.js
export const schema = `
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  filePath TEXT NOT NULL,
  thumbnail TEXT,
  date TEXT NOT NULL,
  albumId TEXT,
  metadata TEXT,
  FOREIGN KEY(albumId) REFERENCES albums(id)
);
`;
