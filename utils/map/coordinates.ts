/**
 * 地图坐标验证工具
 * 用于过滤无效的地图坐标，防止 iOS 原生层崩溃
 */

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

/**
 * 验证单个坐标是否有效
 * @param coord 坐标对象
 * @returns 是否有效
 */
export function isValidCoordinate(coord: any): coord is MapCoordinate {
  if (!coord || typeof coord !== "object") {
    return false;
  }

  const { latitude, longitude } = coord;

  // 检查是否为有效数字
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    isNaN(latitude) ||
    isNaN(longitude)
  ) {
    return false;
  }

  // 检查经纬度范围
  // 纬度范围: -90 到 90
  // 经度范围: -180 到 180
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return false;
  }

  return true;
}

/**
 * 过滤坐标数组，只保留有效坐标
 * @param coordinates 坐标数组
 * @returns 过滤后的有效坐标数组
 */
export function filterValidCoordinates(coordinates: any[]): MapCoordinate[] {
  if (!Array.isArray(coordinates)) {
    return [];
  }

  return coordinates.filter(isValidCoordinate);
}

/**
 * 安全地转换 TrackPoint 到 MapCoordinate
 * 用于将数据库中的轨迹点转换为地图坐标
 * @param trackPoint 数据库轨迹点
 * @returns MapCoordinate 或 null
 */
export function trackPointToCoordinate(trackPoint: {
  lat?: number;
  lng?: number;
  [key: string]: any;
}): MapCoordinate | null {
  if (!trackPoint) {
    return null;
  }

  const coord = {
    latitude: trackPoint.latitude,
    longitude: trackPoint.longitude,
  };

  return isValidCoordinate(coord) ? coord : null;
}

/**
 * 批量转换 TrackPoint 数组
 * @param trackPoints 轨迹点数组
 * @returns 有效的 MapCoordinate 数组
 */
export function trackPointsToCoordinates(
  trackPoints: Array<{ lat?: number; lng?: number }>,
): MapCoordinate[] {
  if (!Array.isArray(trackPoints)) {
    return [];
  }

  return trackPoints
    .map(trackPointToCoordinate)
    .filter((coord): coord is MapCoordinate => coord !== null);
}

/**
 * 转换 TrackPoint 到带海拔的 3D 坐标
 * 用于 3D 距离计算
 * @param trackPoint 数据库轨迹点
 * @returns 带海拔的坐标对象 或 null
 */
export function trackPointToCoordinate3D(trackPoint: {
  lat?: number;
  lng?: number;
  altitude?: number;
  [key: string]: any;
}): { latitude: number; longitude: number; altitude?: number } | null {
  if (!trackPoint) {
    return null;
  }

  const coord = {
    latitude: trackPoint.latitude,
    longitude: trackPoint.longitude,
    altitude: trackPoint.altitude,
  };

  return isValidCoordinate(coord) ? coord : null;
}
