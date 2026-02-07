import { Share } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { RunRecord, TrackPoint } from "@/types/runType";
import dayjs from "dayjs";

/**
 * 导出跑步数据为 JSON 格式
 */
export async function exportRunAsJSON(
  runData: RunRecord,
  trackPoints: TrackPoint[]
): Promise<void> {
  try {
    const exportData = {
      version: "1.0",
      exportTime: new Date().toISOString(),
      run: {
        id: runData.id,
        title: runData.title || "户外跑步",
        note: runData.note || "",
        startTime: runData.startTime,
        endTime: runData.endTime,
        distance: runData.distance,
        distanceKm: (runData.distance / 1000).toFixed(2),
        time: runData.time,
        timeFormatted: formatDuration(runData.time),
        pace: runData.pace,
        paceFormatted: formatPace(runData.pace),
        energy: runData.energy,
      },
      trackPoints: trackPoints.map((point, index) => ({
        index: index + 1,
        latitude: point.lat,
        longitude: point.lng,
        heading: point.heading,
        timestamp: point.timestamp,
        timeFormatted: dayjs(point.timestamp).format("YYYY-MM-DD HH:mm:ss"),
      })),
      stats: {
        totalPoints: trackPoints.length,
        startPoint: trackPoints.length > 0 ? {
          lat: trackPoints[0].lat,
          lng: trackPoints[0].lng,
        } : null,
        endPoint: trackPoints.length > 0 ? {
          lat: trackPoints[trackPoints.length - 1].lat,
          lng: trackPoints[trackPoints.length - 1].lng,
        } : null,
      },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const fileName = `run_${runData.id}_${dayjs(runData.startTime).format("YYYYMMDD_HHmmss")}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // 写入文件
    await FileSystem.writeAsStringAsync(filePath, jsonString);

    // 分享文件
    await Share.share({
      title: `跑步记录 - ${exportData.run.title}`,
      message: `跑步数据导出\n距离: ${exportData.run.distanceKm} km\n时间: ${exportData.run.timeFormatted}`,
      url: filePath,
    });

    // 分享完成后删除临时文件
    try {
      await FileSystem.deleteAsync(filePath);
    } catch {
      // 忽略删除错误
    }
  } catch (error) {
    console.error("导出 JSON 失败:", error);
    throw error;
  }
}

/**
 * 导出跑步数据为 GPX 格式（通用的 GPS 交换格式）
 */
export async function exportRunAsGPX(
  runData: RunRecord,
  trackPoints: TrackPoint[]
): Promise<void> {
  try {
    const title = runData.title || "户外跑步";
    const description = runData.note || "";
    const startTime = dayjs(runData.startTime).toISOString();

    // 生成 GPX 轨迹点
    const trackPointsXML = trackPoints
      .map((point) => {
        const time = dayjs(point.timestamp).toISOString();
        return `      <trkpt lat="${point.lat}" lon="${point.lng}">
        <time>${time}</time>
        ${point.heading ? `<course>${point.heading}</course>` : ""}
      </trkpt>`;
      })
      .join("\n");

    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="SimRun App" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(title)}</name>
    <desc>${escapeXml(description)}</desc>
    <time>${startTime}</time>
  </metadata>
  <trk>
    <name>${escapeXml(title)}</name>
    <desc>${escapeXml(description)}</desc>
    <trkseg>
${trackPointsXML}
    </trkseg>
  </trk>
</gpx>`;

    const fileName = `run_${runData.id}_${dayjs(runData.startTime).format("YYYYMMDD_HHmmss")}.gpx`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // 写入文件
    await FileSystem.writeAsStringAsync(filePath, gpxContent);

    // 分享文件
    await Share.share({
      title: `跑步记录 - ${title}`,
      message: `GPX 轨迹文件\n距离: ${(runData.distance / 1000).toFixed(2)} km\n时间: ${formatDuration(runData.time)}`,
      url: filePath,
    });

    // 分享完成后删除临时文件
    try {
      await FileSystem.deleteAsync(filePath);
    } catch {
      // 忽略删除错误
    }
  } catch (error) {
    console.error("导出 GPX 失败:", error);
    throw error;
  }
}

/**
 * 导出跑步数据为 CSV 格式
 */
export async function exportRunAsCSV(
  runData: RunRecord,
  trackPoints: TrackPoint[]
): Promise<void> {
  try {
    // CSV 头部
    const headers = ["index", "latitude", "longitude", "heading", "timestamp", "timeFormatted"];

    // CSV 数据行
    const rows = trackPoints.map((point, index) => [
      index + 1,
      point.lat,
      point.lng,
      point.heading || "",
      point.timestamp,
      dayjs(point.timestamp).format("YYYY-MM-DD HH:mm:ss"),
    ]);

    // 组合 CSV 内容
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const fileName = `run_${runData.id}_${dayjs(runData.startTime).format("YYYYMMDD_HHmmss")}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // 写入文件
    await FileSystem.writeAsStringAsync(filePath, csvContent);

    // 分享文件
    await Share.share({
      title: `跑步记录 - ${runData.title || "户外跑步"}`,
      message: `CSV 轨迹数据\n距离: ${(runData.distance / 1000).toFixed(2)} km\n时间: ${formatDuration(runData.time)}`,
      url: filePath,
    });

    // 分享完成后删除临时文件
    try {
      await FileSystem.deleteAsync(filePath);
    } catch {
      // 忽略删除错误
    }
  } catch (error) {
    console.error("导出 CSV 失败:", error);
    throw error;
  }
}

/**
 * 格式化时长（秒 -> HH:MM:SS）
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 格式化配速（秒/公里 -> MM'SS"/km）
 */
function formatPace(pace: number): string {
  if (!pace || pace <= 0) return "--'--\"";
  const minutes = Math.floor(pace / 60);
  const seconds = Math.floor(pace % 60);
  return `${minutes}'${seconds.toString().padStart(2, "0")}"`;
}

/**
 * 转义 XML 特殊字符
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * 导出格式选项
 */
export const ExportFormats = [
  { key: "json", label: "JSON (完整数据)", icon: "code-json" },
  { key: "gpx", label: "GPX (轨迹文件)", icon: "map-marker-path" },
  { key: "csv", label: "CSV (表格数据)", icon: "file-delimited" },
] as const;

export type ExportFormat = (typeof ExportFormats)[number]["key"];
