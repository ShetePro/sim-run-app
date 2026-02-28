import { useSQLiteContext } from "expo-sqlite";
import { RunRecord, TrackPoint } from "@/types/runType";
import dayjs from "dayjs";

export function useRunDB() {
  const db = useSQLiteContext();

  // 添加跑步记录 + 轨迹
  const addRun = async (run: RunRecord) => {
    const { lastInsertRowId } = await db.runAsync(
      `INSERT INTO runs (startTime, endTime, distance, time, pace, energy, steps, elevationGain) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        run.startTime || null,
        run.endTime || null,
        run.distance,
        run.time,
        run.pace,
        run.energy,
        run.steps || 0,
        run.elevationGain || 0,
      ],
    );
    await updateRunTrackPoints(lastInsertRowId, run.points || []);
    return lastInsertRowId;
  };

  const updateRun = async (
    run: Partial<RunRecord> & { title?: string; note?: string },
  ) => {
    if (!run.id) throw new Error("Run ID is required for update.");

    // 构建动态更新语句
    const updates: string[] = [];
    const values: any[] = [];

    if (run.endTime !== undefined) {
      updates.push("endTime = ?");
      values.push(run.endTime);
    }
    if (run.distance !== undefined) {
      updates.push("distance = ?");
      values.push(run.distance);
    }
    if (run.time !== undefined) {
      updates.push("time = ?");
      values.push(run.time);
    }
    if (run.pace !== undefined) {
      updates.push("pace = ?");
      values.push(run.pace);
    }
    if (run.energy !== undefined) {
      updates.push("energy = ?");
      values.push(run.energy);
    }
    if (run.isFinish !== undefined) {
      updates.push("isFinish = ?");
      values.push(run.isFinish);
    }
    if (run.title !== undefined) {
      updates.push("title = ?");
      values.push(run.title);
    }
    if (run.note !== undefined) {
      updates.push("note = ?");
      values.push(run.note);
    }
    if (run.steps !== undefined) {
      updates.push("steps = ?");
      values.push(run.steps);
    }
    if (run.elevationGain !== undefined) {
      updates.push("elevationGain = ?");
      values.push(run.elevationGain);
    }

    if (updates.length > 0) {
      values.push(run.id);
      await db.runAsync(
        `UPDATE runs SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );
    }

    // 处理轨迹点更新
    if (run.points && run.points.length > 0) {
      if (run.points.length === 1) {
        // 只新增1个点：使用增量插入（性能优化）
        await addTrackPoint(run.id, run.points[0]);
      } else {
        // 多个点：全量更新（用于初始加载或恢复）
        await updateRunTrackPoints(run.id, run.points);
      }
    }
  };

  const getRuns = async (): Promise<RunRecord[]> => {
    return await db.getAllAsync("SELECT * FROM runs ORDER BY id DESC");
  };

  // 根据 ID 获取单个跑步记录
  const getRunById = async (runId: number): Promise<RunRecord | null> => {
    return await db.getFirstAsync("SELECT * FROM runs WHERE id = ?", [runId]);
  };

  const getTrackPoints = async (runId: number): Promise<TrackPoint[]> => {
    return await db.getAllAsync("SELECT * FROM track_points WHERE run_id = ?", [
      runId,
    ]);
  };

  const deleteRun = async (runId: number) => {
    await db.execAsync("BEGIN TRANSACTION");
    await db.runAsync("DELETE FROM track_points WHERE run_id = ?", [runId]);
    await db.runAsync("DELETE FROM runs WHERE id = ?", [runId]);
    await db.execAsync("COMMIT");
  };

  // 添加单个轨迹点（用于实时更新，避免全量重写）
  const addTrackPoint = async (runId: number, point: TrackPoint) => {
    await db.runAsync(
      `INSERT INTO track_points (run_id, latitude, longitude, altitude, heading, timestamp, steps)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        runId,
        point.latitude,
        point.longitude,
        point.altitude ?? null,
        point.heading,
        point.timestamp,
        point.steps ?? null,
      ],
    );
  };

  const updateRunTrackPoints = async (runId: number, points: TrackPoint[]) => {
    if (points?.length) {
      // 用事务批量写入，提高性能
      await db.execAsync("BEGIN TRANSACTION");
      try {
        for (const p of points) {
          await db.runAsync(
            `INSERT INTO track_points (run_id, latitude, longitude, altitude, heading, timestamp, steps)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              runId,
              p.latitude,
              p.longitude,
              p.altitude ?? null,
              p.heading,
              p.timestamp,
              p.steps ?? null,
            ],
          );
        }
        await db.execAsync("COMMIT");
      } catch (err) {
        await db.execAsync("ROLLBACK");
        throw err;
      }
    }
  };

  // get today's run data
  const getTodayRunData = async (): Promise<RunRecord[]> => {
    const todayDateString = dayjs().format("YYYY-MM-DD");
    const startTime = new Date(`${todayDateString} 00:00:00`).getTime();
    return await db.getAllAsync("SELECT * FROM runs WHERE endTime > ?;", [
      startTime,
    ]);
  };

  const getRunLifeCount = async () => {
    const runs = await getRuns();
    const totalTime = await db.getFirstAsync<{ ["SUM(time)"]: number }>(
      "SELECT SUM(time) FROM runs;",
    );
    const totalDistance = await db.getFirstAsync<{ ["SUM(distance)"]: number }>(
      "SELECT SUM(distance) FROM runs;",
    );
    return {
      totalRuns: runs.length,
      totalHours: (totalTime?.["SUM(time)"] || 0) / 3600,
      totalDistance: (totalDistance?.["SUM(distance)"] || 0) / 1000,
    };
  };

  return {
    addRun,
    getRuns,
    getRunById,
    getTrackPoints,
    deleteRun,
    updateRun,
    getTodayRunData,
    getRunLifeCount,
  };
}
