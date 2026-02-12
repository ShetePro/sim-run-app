import { RunRecord, TrackPoint } from "@/types/runType";

/**
 * 演示数据 - 北京奥林匹克森林公园跑步路径
 * 用于 App Store 截图展示
 */

// 奥林匹克森林公园南园中心坐标（大致）
const PARK_CENTER = {
  lat: 40.014,
  lng: 116.391,
};

/**
 * 生成圆形跑道路径点
 * 模拟奥林匹克森林公园的 5km 跑道
 */
function generateCircularPath(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  pointsCount: number,
  startTime: number,
): TrackPoint[] {
  const points: TrackPoint[] = [];
  const earthRadius = 6371000; // 地球半径（米）

  for (let i = 0; i <= pointsCount; i++) {
    const angle = (i / pointsCount) * 2 * Math.PI;
    // 计算偏移（转换为弧度）
    const latOffset =
      ((radiusKm * 1000 * Math.cos(angle)) / earthRadius) * (180 / Math.PI);
    const lngOffset =
      ((radiusKm * 1000 * Math.sin(angle)) /
        (earthRadius * Math.cos((centerLat * Math.PI) / 180))) *
      (180 / Math.PI);

    const lat = centerLat + latOffset;
    const lng = centerLng + lngOffset;

    // 计算 heading（方向）
    const heading = ((angle * 180) / Math.PI + 90) % 360;

    // 时间戳（每 3-5 秒一个点）
    const timestamp = startTime + i * (4000 + Math.random() * 2000);

    points.push({
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      heading: Math.round(heading),
      timestamp: Math.round(timestamp),
    });
  }

  return points;
}

/**
 * 生成往返直线路径
 * 模拟滨江或直线跑道
 */
function generateOutAndBackPath(
  startLat: number,
  startLng: number,
  distanceKm: number,
  bearing: number,
  pointsCount: number,
  startTime: number,
): TrackPoint[] {
  const points: TrackPoint[] = [];
  const earthRadius = 6371000;
  const halfDistance = (distanceKm * 1000) / 2;

  // 去程
  for (let i = 0; i <= pointsCount / 2; i++) {
    const progress = i / (pointsCount / 2);
    const distance = progress * halfDistance;

    const latOffset =
      ((distance * Math.cos((bearing * Math.PI) / 180)) / earthRadius) *
      (180 / Math.PI);
    const lngOffset =
      ((distance * Math.sin((bearing * Math.PI) / 180)) /
        (earthRadius * Math.cos((startLat * Math.PI) / 180))) *
      (180 / Math.PI);

    const lat = startLat + latOffset;
    const lng = startLng + lngOffset;

    points.push({
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      heading: bearing,
      timestamp: Math.round(startTime + i * 5000),
    });
  }

  // 返程
  const returnBearing = (bearing + 180) % 360;
  const endPoint = points[points.length - 1];

  for (let i = 1; i <= pointsCount / 2; i++) {
    const progress = i / (pointsCount / 2);
    const distance = progress * halfDistance;

    const latOffset =
      ((distance * Math.cos((returnBearing * Math.PI) / 180)) / earthRadius) *
      (180 / Math.PI);
    const lngOffset =
      ((distance * Math.sin((returnBearing * Math.PI) / 180)) /
        (earthRadius * Math.cos((endPoint.lat * Math.PI) / 180))) *
      (180 / Math.PI);

    const lat = endPoint.lat + latOffset;
    const lng = endPoint.lng + lngOffset;

    points.push({
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      heading: returnBearing,
      timestamp: Math.round(
        startTime + (pointsCount / 2 + i) * 5000 + Math.random() * 2000,
      ),
    });
  }

  return points;
}

/**
 * 生成折线路径（城市街道风格）
 */
function generateZigzagPath(
  startLat: number,
  startLng: number,
  segments: { distance: number; bearing: number }[],
  pointsPerSegment: number,
  startTime: number,
): TrackPoint[] {
  const points: TrackPoint[] = [];
  const earthRadius = 6371000;
  let currentLat = startLat;
  let currentLng = startLng;
  let currentTime = startTime;

  for (const segment of segments) {
    for (let i = 1; i <= pointsPerSegment; i++) {
      const progress = i / pointsPerSegment;
      const distance = progress * segment.distance * 1000;

      const latOffset =
        ((distance * Math.cos((segment.bearing * Math.PI) / 180)) /
          earthRadius) *
        (180 / Math.PI);
      const lngOffset =
        ((distance * Math.sin((segment.bearing * Math.PI) / 180)) /
          (earthRadius * Math.cos((currentLat * Math.PI) / 180))) *
        (180 / Math.PI);

      const lat = currentLat + latOffset;
      const lng = currentLng + lngOffset;

      points.push({
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        heading: segment.bearing,
        timestamp: Math.round(currentTime + i * 4000),
      });
    }

    // 更新起点为当前段的终点
    const lastPoint = points[points.length - 1];
    currentLat = lastPoint.lat;
    currentLng = lastPoint.lng;
    currentTime = lastPoint.timestamp;
  }

  return points;
}

// 计算跑步统计数据
function calculateRunStats(
  distance: number,
  paceSecondsPerKm: number,
): { time: number; pace: number; energy: number; steps: number } {
  const distanceKm = distance / 1000;
  const timeSeconds = Math.round(distanceKm * paceSecondsPerKm);
  const energy = Math.round(distanceKm * 65); // 约 65 kcal/km
  const steps = Math.round(distanceKm * 1300); // 假设平均步长 0.77 米，1km 约 1300 步

  return {
    time: timeSeconds,
    pace: paceSecondsPerKm,
    energy,
    steps,
  };
}

/**
 * 获取今日的开始时间戳（凌晨 00:00:00）
 */
function getTodayStartTime(): number {
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    6,
    0,
    0,
  );
  return today.getTime();
}

// ============================================
// 演示跑步记录数据
// ============================================

export const demoRunRecords: RunRecord[] = [
  // 记录 1: 今天的晨跑 - 5km 环园跑
  (() => {
    const todayStart = getTodayStartTime();
    const startTime = todayStart + 3600000 * 2; // 今天早晨 6:00 + 2小时 = 8:00
    const distance = 5020; // 5.02 km
    const stats = calculateRunStats(distance, 340); // 5'40"/km
    const points = generateCircularPath(
      PARK_CENTER.lat,
      PARK_CENTER.lng,
      0.8, // 半径 0.8km
      180, // 180 个点
      startTime,
    );

    return {
      id: 1,
      distance,
      time: stats.time,
      pace: stats.pace,
      energy: stats.energy,
      isFinish: 1,
      points,
      startTime,
      endTime: startTime + stats.time * 1000,
      title: "晨跑 - 奥森南园",
      note: "今天状态不错，空气很好",
      steps: stats.steps,
    };
  })(),

  // 记录 2: 昨天 - 10km 长距离
  (() => {
    const todayStart = getTodayStartTime();
    const startTime = todayStart - 86400000 + 3600000 * 18; // 昨天 18:00
    const distance = 10250; // 10.25 km
    const stats = calculateRunStats(distance, 360); // 6'00"/km
    const points = generateCircularPath(
      PARK_CENTER.lat,
      PARK_CENTER.lng,
      0.8,
      360, // 更多点
      startTime,
    );
    // 跑两圈
    points.push(
      ...generateCircularPath(
        PARK_CENTER.lat,
        PARK_CENTER.lng,
        0.8,
        180,
        startTime + stats.time * 500,
      ),
    );

    return {
      id: 2,
      distance,
      time: stats.time,
      pace: stats.pace,
      energy: stats.energy,
      isFinish: 1,
      points,
      startTime,
      endTime: startTime + stats.time * 1000,
      title: "长距离训练",
      note: "挑战了 10km，后半程有点吃力",
      steps: stats.steps,
    };
  })(),

  // 记录 3: 3天前 - 滨江往返 8km
  (() => {
    const todayStart = getTodayStartTime();
    const startTime = todayStart - 86400000 * 3 + 3600000 * 19; // 3天前 19:00
    const distance = 8050; // 8.05 km
    const stats = calculateRunStats(distance, 330); // 5'30"/km
    const points = generateOutAndBackPath(
      40.012,
      116.395,
      8,
      90, // 向东
      160,
      startTime,
    );

    return {
      id: 3,
      distance,
      time: stats.time,
      pace: stats.pace,
      energy: stats.energy,
      isFinish: 1,
      points,
      startTime,
      endTime: startTime + stats.time * 1000,
      title: "滨江夜跑",
      note: "夜景很美，配速稳定",
      steps: stats.steps,
    };
  })(),

  // 记录 4: 5天前 - 城市街道 6km
  (() => {
    const todayStart = getTodayStartTime();
    const startTime = todayStart - 86400000 * 5 + 3600000 * 17; // 5天前 17:00
    const distance = 6120; // 6.12 km
    const stats = calculateRunStats(distance, 350); // 5'50"/km
    const points = generateZigzagPath(
      40.016,
      116.385,
      [
        { distance: 1.5, bearing: 0 }, // 向北
        { distance: 1.0, bearing: 90 }, // 向东
        { distance: 1.5, bearing: 180 }, // 向南
        { distance: 1.0, bearing: 270 }, // 向西
        { distance: 1.12, bearing: 45 }, // 向东北回起点
      ],
      25,
      startTime,
    );

    return {
      id: 4,
      distance,
      time: stats.time,
      pace: stats.pace,
      energy: stats.energy,
      isFinish: 1,
      points,
      startTime,
      endTime: startTime + stats.time * 1000,
      title: "城市探索跑",
      note: "探索了新路线，红绿灯有点多",
      steps: stats.steps,
    };
  })(),

  // 记录 5: 7天前 - 轻松慢跑 3km
  (() => {
    const todayStart = getTodayStartTime();
    const startTime = todayStart - 86400000 * 7 + 3600000 * 7; // 7天前 7:00
    const distance = 3150; // 3.15 km
    const stats = calculateRunStats(distance, 390); // 6'30"/km
    const points = generateCircularPath(
      PARK_CENTER.lat,
      PARK_CENTER.lng,
      0.5, // 小圈
      120,
      startTime,
    );

    return {
      id: 5,
      distance,
      time: stats.time,
      pace: stats.pace,
      energy: stats.energy,
      isFinish: 1,
      points,
      startTime,
      endTime: startTime + stats.time * 1000,
      title: "轻松恢复跑",
      note: "昨天跑了长距离，今天放松一下",
      steps: stats.steps,
    };
  })(),

  // 记录 6: 10天前 - 间歇训练 4km
  (() => {
    const todayStart = getTodayStartTime();
    const startTime = todayStart - 86400000 * 10 + 3600000 * 6; // 10天前 6:00
    const distance = 4080; // 4.08 km
    const stats = calculateRunStats(distance, 310); // 5'10"/km（较快）
    const points = generateOutAndBackPath(
      40.014,
      116.388,
      4,
      180, // 向南
      100,
      startTime,
    );

    return {
      id: 6,
      distance,
      time: stats.time,
      pace: stats.pace,
      energy: stats.energy,
      isFinish: 1,
      points,
      startTime,
      endTime: startTime + stats.time * 1000,
      title: "间歇训练",
      note: "400m 快跑 + 200m 慢跑 x 8 组",
      steps: stats.steps,
    };
  })(),

  // 记录 7: 14天前 - 长距离 12km
  (() => {
    const todayStart = getTodayStartTime();
    const startTime = todayStart - 86400000 * 14 + 3600000 * 8; // 14天前 8:00
    const distance = 12180; // 12.18 km
    const stats = calculateRunStats(distance, 365); // 6'05"/km
    // 组合路径：公园 + 滨江
    const parkPoints = generateCircularPath(
      PARK_CENTER.lat,
      PARK_CENTER.lng,
      0.8,
      200,
      startTime,
    );
    const riverPoints = generateOutAndBackPath(
      PARK_CENTER.lat,
      PARK_CENTER.lng,
      4,
      45,
      80,
      startTime + 2000000,
    );
    const points = [...parkPoints, ...riverPoints];

    return {
      id: 7,
      distance,
      time: stats.time,
      pace: stats.pace,
      energy: stats.energy,
      isFinish: 1,
      points,
      startTime,
      endTime: startTime + stats.time * 1000,
      title: "周末长距离",
      note: "挑战了个人最远距离！",
      steps: stats.steps,
    };
  })(),

  // 记录 8: 21天前 - 基础训练 5km
  (() => {
    const todayStart = getTodayStartTime();
    const startTime = todayStart - 86400000 * 21 + 3600000 * 18; // 21天前 18:00
    const distance = 5100; // 5.10 km
    const stats = calculateRunStats(distance, 355); // 5'55"/km
    const points = generateCircularPath(
      PARK_CENTER.lat,
      PARK_CENTER.lng,
      0.8,
      180,
      startTime,
    );

    return {
      id: 8,
      distance,
      time: stats.time,
      pace: stats.pace,
      energy: stats.energy,
      isFinish: 1,
      points,
      startTime,
      endTime: startTime + stats.time * 1000,
      title: "基础训练",
      note: "配速很稳，心率控制不错",
      steps: stats.steps,
    };
  })(),
];

/**
 * 获取今日演示数据
 */
export function getDemoTodayData() {
  const todayRun = demoRunRecords[0]; // 第一条记录是今天的
  return {
    distance: todayRun.distance / 1000, // km
    duration: todayRun.time, // seconds
    pace: todayRun.pace, // seconds/km
    calories: todayRun.energy,
    steps: Math.round(todayRun.distance * 1.3), // 估算步数
  };
}

/**
 * 获取生涯统计演示数据
 */
export function getDemoLifeStats() {
  const totalDistance = demoRunRecords.reduce(
    (sum, run) => sum + run.distance,
    0,
  );
  const totalRuns = demoRunRecords.length;
  const totalHours =
    demoRunRecords.reduce((sum, run) => sum + run.time, 0) / 3600;

  return {
    totalDistance: Number((totalDistance / 1000).toFixed(1)), // km
    totalRuns,
    totalHours: Number(totalHours.toFixed(1)),
  };
}
