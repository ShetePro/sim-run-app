/**
 * 3D 距离计算工具
 * 考虑海拔高度的实际距离计算
 */

import { getDistance } from "geolib";

export interface Point3D {
  latitude: number;
  longitude: number;
  altitude?: number;
}

/**
 * 计算两点之间的 3D 距离
 * 结合水平距离和海拔变化
 * @param point1 起点 {latitude, longitude, altitude}
 * @param point2 终点 {latitude, longitude, altitude}
 * @returns 3D 实际距离（米）
 */
export function getDistance3D(point1: Point3D, point2: Point3D): number {
  // 计算水平距离（使用 Haversine 公式）
  const horizontalDistance = getDistance(
    { latitude: point1.latitude, longitude: point1.longitude },
    { latitude: point2.latitude, longitude: point2.longitude },
    0.01, // 精度设置为厘米级
  );

  // 如果没有海拔数据，返回平面距离
  if (
    point1.altitude === undefined ||
    point2.altitude === undefined ||
    isNaN(point1.altitude) ||
    isNaN(point2.altitude)
  ) {
    return horizontalDistance;
  }

  // 计算海拔变化
  const altitudeChange = point2.altitude - point1.altitude;

  // 使用勾股定理计算 3D 距离
  // distance = √(horizontal² + altitude²)
  const distance3D = Math.sqrt(
    Math.pow(horizontalDistance, 2) + Math.pow(altitudeChange, 2),
  );

  return distance3D;
}

/**
 * 批量计算轨迹的总 3D 距离
 * @param points 轨迹点数组
 * @returns 总距离（米）
 */
export function calculateTotalDistance3D(points: Point3D[]): number {
  if (points.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  for (let i = 1; i < points.length; i++) {
    const delta = getDistance3D(points[i - 1], points[i]);

    // 运动过滤：排除异常数据
    // 跑步者 1秒钟位移通常在 0.5m-15m 之间
    if (delta > 0.5 && delta < 15) {
      totalDistance += delta;
    }
  }

  return totalDistance;
}

/**
 * 计算累计爬升/下降
 * @param points 轨迹点数组
 * @returns {ascent: 爬升高度, descent: 下降高度}
 */
export function calculateElevationGain(points: Point3D[]): {
  ascent: number;
  descent: number;
} {
  if (points.length < 2) {
    return { ascent: 0, descent: 0 };
  }

  let ascent = 0;
  let descent = 0;

  for (let i = 1; i < points.length; i++) {
    const prevAltitude = points[i - 1].altitude;
    const currAltitude = points[i].altitude;

    if (
      prevAltitude !== undefined &&
      currAltitude !== undefined &&
      !isNaN(prevAltitude) &&
      !isNaN(currAltitude)
    ) {
      const diff = currAltitude - prevAltitude;
      if (diff > 0) {
        ascent += diff;
      } else {
        descent += Math.abs(diff);
      }
    }
  }

  return { ascent, descent };
}
