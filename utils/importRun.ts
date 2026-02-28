import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { RunRecord, TrackPoint } from "@/types/runType";
import dayjs from "dayjs";

/**
 * 支持的导入文件类型
 */
export type ImportFileType = "json" | "gpx";

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean;
  message: string;
  recordsImported?: number;
  data?: {
    run: Partial<RunRecord>;
    trackPoints: TrackPoint[];
  };
}

/**
 * 解析 JSON 格式的跑步数据
 */
function parseJSONImport(content: string): {
  run: Partial<RunRecord>;
  trackPoints: TrackPoint[];
} | null {
  try {
    const data = JSON.parse(content);

    // 验证基本结构
    if (!data.run || !data.trackPoints) {
      return null;
    }

    const run: Partial<RunRecord> = {
      title: data.run.title || "导入的跑步记录",
      note: data.run.note || "",
      startTime: data.run.startTime || Date.now(),
      endTime: data.run.endTime || Date.now(),
      distance: data.run.distance || 0,
      time: data.run.time || 0,
      pace: data.run.pace || 0,
      energy: data.run.energy || 0,
      isFinish: 1,
    };

    const trackPoints: TrackPoint[] = data.trackPoints.map((point: any) => ({
      latitude: point.latitude || point.lat,
      longitude: point.longitude || point.lon || point.lng,
      heading: point.heading || 0,
      timestamp: point.timestamp || Date.now(),
    }));

    return { run, trackPoints };
  } catch (error) {
    console.error("解析 JSON 失败:", error);
    return null;
  }
}

/**
 * 解析 GPX 格式的跑步数据
 */
function parseGPXImport(content: string): {
  run: Partial<RunRecord>;
  trackPoints: TrackPoint[];
} | null {
  try {
    // 提取轨迹点
    const trkptRegex = /<trkpt[^>]+lat="([^"]+)"[^>]+lon="([^"]+)"[^>]*>/g;
    const timeRegex = /<time>([^<]+)<\/time>/;
    const trackPoints: TrackPoint[] = [];

    let match;
    while ((match = trkptRegex.exec(content)) !== null) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);

      // 尝试提取时间（在<trkpt>标签后的<time>标签）
      const remainingContent = content.substring(match.index + match[0].length);
      const timeMatch = remainingContent.match(timeRegex);
      const timestamp = timeMatch ? dayjs(timeMatch[1]).valueOf() : Date.now();

      trackPoints.push({
        latitude: lat,
        longitude: lon,
        heading: 0,
        timestamp,
      });
    }

    if (trackPoints.length === 0) {
      return null;
    }

    // 计算距离（简化版：使用第一个和最后一个点的直线距离）
    const startPoint = trackPoints[0];
    const endPoint = trackPoints[trackPoints.length - 1];
    const startTime = trackPoints[0].timestamp;
    const endTime = trackPoints[trackPoints.length - 1].timestamp;

    // 从 GPX 元数据提取标题
    const nameMatch = content.match(/<name>([^<]+)<\/name>/);
    const title = nameMatch ? nameMatch[1] : "导入的跑步记录";

    const run: Partial<RunRecord> = {
      title,
      note: "从 GPX 文件导入",
      startTime,
      endTime,
      distance: 0, // 实际距离需要更复杂的计算
      time: Math.floor((endTime - startTime) / 1000),
      pace: 0,
      energy: 0,
      isFinish: 1,
    };

    return { run, trackPoints };
  } catch (error) {
    console.error("解析 GPX 失败:", error);
    return null;
  }
}

/**
 * 从文件导入跑步数据
 * 返回解析后的数据，由调用方保存到数据库
 */
export async function importRunFromFile(): Promise<ImportResult> {
  try {
    // 选择文件
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "application/gpx+xml", "text/xml"],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return { success: false, message: "用户取消了选择" };
    }

    const file = result.assets[0];
    const fileName = file.name.toLowerCase();

    // 读取文件内容
    const content = await FileSystem.readAsStringAsync(file.uri);

    // 根据文件类型解析
    let parsedData: {
      run: Partial<RunRecord>;
      trackPoints: TrackPoint[];
    } | null = null;

    if (fileName.endsWith(".json")) {
      parsedData = parseJSONImport(content);
    } else if (fileName.endsWith(".gpx")) {
      parsedData = parseGPXImport(content);
    }

    if (!parsedData) {
      return { success: false, message: "无法解析文件格式" };
    }

    return {
      success: true,
      message: `成功解析 "${parsedData.run.title}"`,
      recordsImported: 1,
      data: parsedData,
    };
  } catch (error) {
    console.error("导入失败:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "导入失败",
    };
  }
}
