import { SQLiteDatabase } from "expo-sqlite";

export async function initializeSQLite(db: SQLiteDatabase) {
  console.log("🚀 初始化数据库...");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      distance REAL,
      time INTEGER,
      pace REAL,
      energy INTEGER
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS track_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER,
      lat REAL,
      lng REAL,
      heading REAL,
      timestamp INTEGER,
      FOREIGN KEY (run_id) REFERENCES runs (id)
    );
  `);
}
