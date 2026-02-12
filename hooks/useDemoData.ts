import { useCallback } from "react";
import { useRunDB } from "./useSQLite";
import { demoRunRecords } from "@/utils/demoData";
import { RunRecord } from "@/types/runType";

/**
 * 演示数据加载 Hook
 * 用于 App Store 截图展示
 */
export function useDemoData() {
  const { addRun, getRuns, deleteRun, updateRun } = useRunDB();

  /**
   * 加载演示数据到数据库
   */
  const loadDemoData = useCallback(async () => {
    try {
      // 加载每条演示记录（允许重复加载，每次都会添加新记录）
      let loadedCount = 0;
      for (const run of demoRunRecords) {
        // 删除 id，让数据库自动生成
        const { id, ...runWithoutId } = run;
        const newId = await addRun(runWithoutId);

        // 如果演示数据有 steps，更新记录以存储 steps（用于首页计算）
        if (run.steps && newId) {
          await updateRun({
            id: newId,
            title: run.title,
            note: run.note,
          });
        }
        loadedCount++;
      }

      return {
        success: true,
        message: `成功加载 ${loadedCount} 条演示跑步记录`,
        count: loadedCount,
      };
    } catch (error) {
      console.error("加载演示数据失败:", error);
      return {
        success: false,
        message: "加载演示数据失败",
        count: 0,
        error,
      };
    }
  }, [addRun, updateRun]);

  /**
   * 清空演示数据（基于固定ID范围或标题匹配）
   */
  const clearDemoData = useCallback(async () => {
    try {
      const existingRuns = await getRuns();
      const demoTitles = demoRunRecords.map((r) => r.title).filter(Boolean);

      let deletedCount = 0;
      for (const run of existingRuns) {
        // 通过标题匹配演示数据
        if (run.title && demoTitles.includes(run.title)) {
          await deleteRun(run.id!);
          deletedCount++;
        }
      }

      return {
        success: true,
        message: `已清空 ${deletedCount} 条演示数据`,
        count: deletedCount,
      };
    } catch (error) {
      console.error("清空演示数据失败:", error);
      return {
        success: false,
        message: "清空演示数据失败",
        count: 0,
        error,
      };
    }
  }, [deleteRun, getRuns]);

  /**
   * 检查是否已加载演示数据
   */
  const checkDemoData = useCallback(async () => {
    try {
      const existingRuns = await getRuns();
      const demoTitles = demoRunRecords.map((r) => r.title).filter(Boolean);
      const hasDemoData = existingRuns.some(
        (run: RunRecord) => run.title && demoTitles.includes(run.title),
      );

      return hasDemoData;
    } catch (error) {
      return false;
    }
  }, [getRuns]);

  return {
    loadDemoData,
    clearDemoData,
    checkDemoData,
  };
}
