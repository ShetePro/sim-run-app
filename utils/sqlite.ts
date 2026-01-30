import { SQLiteDatabase } from "expo-sqlite";

export async function initializeSQLite(db: SQLiteDatabase) {
  console.log("🚀 初始化数据库...");
  
  // 创建跑步记录表（如果不存在）
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startTime INTEGER,
      endTime INTEGER,
      distance REAL,
      time INTEGER,
      pace REAL,
      energy INTEGER,
      isFinish INTEGER,
      title TEXT,
      note TEXT
    );
  `);

  // 创建轨迹点表
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

  // 迁移：为旧表添加新字段（如果不存在）
  await migrateTable(db);
  
  console.log("✅ 数据库初始化完成");
}

// 表结构迁移
async function migrateTable(db: SQLiteDatabase) {
  try {
    // 检查并添加 title 字段
    const titleColumn = await db.getAllAsync(
      "PRAGMA table_info(runs)"
    );
    const columns = titleColumn as Array<{ name: string }>;
    const hasTitle = columns.some(col => col.name === "title");
    const hasNote = columns.some(col => col.name === "note");
    
    if (!hasTitle) {
      await db.execAsync("ALTER TABLE runs ADD COLUMN title TEXT;");
      console.log("✅ 添加 title 字段");
    }
    
    if (!hasNote) {
      await db.execAsync("ALTER TABLE runs ADD COLUMN note TEXT;");
      console.log("✅ 添加 note 字段");
    }
  } catch (error) {
    console.error("迁移失败:", error);
  }
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
