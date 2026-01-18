
import initSqlJs from "sql.js";
import { schema } from "./schema.js";

const DB_KEY = "speckit-photo-album-db";
let dbInstance = null;

async function saveDb(db) {
  const data = db.export();
  localStorage.setItem(DB_KEY, JSON.stringify(Array.from(data)));
}

async function loadDb(SQL) {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    const data = new Uint8Array(JSON.parse(raw));
    return new SQL.Database(data);
  }
  return null;
}

export async function getDb() {
  if (dbInstance) return dbInstance;
  const SQL = await initSqlJs({ locateFile: file => `node_modules/sql.js/dist/${file}` });
  dbInstance = await loadDb(SQL);
  if (!dbInstance) {
    dbInstance = new SQL.Database();
    dbInstance.run(schema);
    await saveDb(dbInstance);
  }
  // 保存フック: run/exec/prepareで書き込み時に保存
  const origRun = dbInstance.run.bind(dbInstance);
  dbInstance.run = function(...args) {
    const res = origRun(...args);
    saveDb(dbInstance);
    return res;
  };
  return dbInstance;
}
