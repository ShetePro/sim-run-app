import { useSQLiteContext } from "expo-sqlite";
import { RunRecord, TrackPoint } from "@/types/runType";

export function useRunDB() {
  const db = useSQLiteContext();

  // 添加跑步记录 + 轨迹
  const addRun = async (run: RunRecord) => {
    const { lastInsertRowId } = await db.runAsync(
      `INSERT INTO runs (startTime, endTime, distance, time, pace, energy) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        run.startTime || null,
        run.endTime || null,
        run.distance,
        run.time,
        run.pace,
        run.energy,
      ],
    );
    await updateRunTrackPoints(lastInsertRowId, run.points || []);
    return lastInsertRowId;
  };

  const updateRun = async (run: RunRecord) => {
    if (!run.id) throw new Error("Run ID is required for update.");
    await db.runAsync(
      `UPDATE runs SET endTime = ?, distance = ?, time = ?, pace = ?, energy = ? WHERE id = ?`,
      [
        run.endTime || null,
        run.distance,
        run.time,
        run.pace,
        run.energy,
        run.id,
      ],
    );
    await updateRunTrackPoints(run.id, run.points || []);
  };

  const getRuns = async (): Promise<RunRecord[]> => {
    return await db.getAllAsync("SELECT * FROM runs ORDER BY id DESC");
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

  const updateRunTrackPoints = async (runId: number, points: TrackPoint[]) => {
    if (points?.length) {
      // 用事务批量写入，提高性能
      await db.execAsync("BEGIN TRANSACTION");
      try {
        for (const p of points) {
          await db.runAsync(
            `INSERT INTO track_points (run_id, lat, lng, heading, timestamp)
             VALUES (?, ?, ?, ?, ?)`,
            [runId, p.lat, p.lng, p.heading, p.timestamp],
          );
        }
        await db.execAsync("COMMIT");
      } catch (err) {
        await db.execAsync("ROLLBACK");
        throw err;
      }
    }
  };

  return { addRun, getRuns, getTrackPoints, deleteRun, updateRun };
}
