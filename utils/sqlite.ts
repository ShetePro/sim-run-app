import { SQLiteDatabase } from "expo-sqlite";

export async function initializeSQLite(db: SQLiteDatabase) {
  console.log("🚀 初始化数据库...");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startTime INTEGER,
      endTime INTEGER,
      distance REAL,
      time INTEGER,
      pace REAL,
      energy INTEGER
      isFinish INTEGER
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
async function dropAllTables(db: SQLiteDatabase) {
  // 获取所有用户定义的表
  const tables: { name: string }[] = await db.getAllAsync(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
  `);

  for (const { name } of tables) {
    await db.execAsync(`DROP TABLE IF EXISTS ${name};`);
    console.log(`🗑 已删除表: ${name}`);
  }

  console.log("✅ 所有表已清空");
}
