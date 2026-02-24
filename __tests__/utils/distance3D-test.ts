import {
  getDistance3D,
  calculateTotalDistance3D,
  calculateElevationGain,
  Point3D,
} from "../../utils/location/distance3D";
import olympicParkData from "../fixtures/coordinates/beijing_olympic_park.json";
import mountainClimbData from "../fixtures/coordinates/mountain_climb.json";
import flatRoadData from "../fixtures/coordinates/flat_road.json";

// 辅助函数：将 JSON 数据转换为 Point3D 格式
function convertToPoint3D(data: typeof olympicParkData): Point3D[] {
  return data.points.map((p: any) => ({
    latitude: p.lat,
    longitude: p.lng,
    altitude: p.altitude,
  }));
}

describe("getDistance3D", () => {
  it("应正确计算平面距离（无海拔变化）", () => {
    const point1: Point3D = { latitude: 40.0, longitude: 116.0, altitude: 50 };
    const point2: Point3D = {
      latitude: 40.0,
      longitude: 116.001,
      altitude: 50,
    };

    const distance = getDistance3D(point1, point2);

    // 水平距离约 89m，无海拔变化，3D距离应等于平面距离
    expect(distance).toBeGreaterThan(85);
    expect(distance).toBeLessThan(95);
  });

  it("应正确计算3D距离（有海拔变化）", () => {
    const points = convertToPoint3D(mountainClimbData as any);
    const totalDistance = calculateTotalDistance3D(points);

    // 期望：约 1414.21m（1000m水平 + 1000m海拔）
    expect(totalDistance).toBeCloseTo(1414.21, -1);
  });

  it("平路场景 - 3D距离应等于平面距离", () => {
    const points = convertToPoint3D(flatRoadData as any);
    const totalDistance = calculateTotalDistance3D(points);

    // 期望：约 1000m
    expect(totalDistance).toBeCloseTo(1000, -1);
  });

  it("应处理海拔缺失的情况", () => {
    const point1: Point3D = { latitude: 40.0, longitude: 116.0 };
    const point2: Point3D = { latitude: 40.0, longitude: 116.001 };

    const distance = getDistance3D(point1, point2);

    // 应退化为平面距离计算
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(100);
  });

  it("应处理NaN海拔值", () => {
    const point1: Point3D = {
      latitude: 40.0,
      longitude: 116.0,
      altitude: NaN,
    };
    const point2: Point3D = {
      latitude: 40.0,
      longitude: 116.001,
      altitude: 50,
    };

    const distance = getDistance3D(point1, point2);

    // 应退化为平面距离
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(100);
  });

  it("应处理相同坐标点", () => {
    const point: Point3D = {
      latitude: 40.014,
      longitude: 116.391,
      altitude: 50,
    };

    const distance = getDistance3D(point, point);

    expect(distance).toBe(0);
  });
});

describe("calculateTotalDistance3D", () => {
  it("应计算奥林匹克森林公园轨迹总距离", () => {
    const points = convertToPoint3D(olympicParkData as any);
    const totalDistance = calculateTotalDistance3D(points);

    // 期望：约 5020m（5.02km），允许 2% 误差
    expect(totalDistance).toBeGreaterThan(4900);
    expect(totalDistance).toBeLessThan(5150);
  });

  it("应计算爬山场景总距离", () => {
    const points = convertToPoint3D(mountainClimbData as any);
    const totalDistance = calculateTotalDistance3D(points);

    // 11个点，10段距离，每段理论值 141.42m
    // 总计约 1414.21m
    expect(totalDistance).toBeCloseTo(1414.21, -1);
  });

  it("少于2个点应返回0", () => {
    expect(calculateTotalDistance3D([])).toBe(0);
    expect(calculateTotalDistance3D([{ latitude: 40, longitude: 116 }])).toBe(
      0,
    );
  });

  it("应过滤异常距离（原地漂移 < 0.5m）", () => {
    const points: Point3D[] = [
      { latitude: 40.0, longitude: 116.0, altitude: 50 },
      { latitude: 40.0000001, longitude: 116.0, altitude: 50 }, // 漂移 < 0.5m
      { latitude: 40.0, longitude: 116.001, altitude: 50 }, // 正常移动
    ];

    const totalDistance = calculateTotalDistance3D(points, {
      filterOutliers: true,
    });

    // 应只计算最后一段距离，约 89m
    expect(totalDistance).toBeGreaterThan(80);
    expect(totalDistance).toBeLessThan(100);
  });

  it("应过滤异常距离（GPS跳变）", () => {
    const points: Point3D[] = [
      { latitude: 40.0, longitude: 116.0, altitude: 50 },
      { latitude: 40.01, longitude: 116.0, altitude: 50 }, // 跳变约 1113m，被过滤
      { latitude: 40.0082, longitude: 116.0, altitude: 50 }, // 正常移动约 180m（从40.01回退）
    ];

    const totalDistance = calculateTotalDistance3D(points, {
      filterOutliers: true,
      maxDistance: 200, // 设置最大距离阈值
    });

    // 应只计算最后一段距离（约 180m）
    expect(totalDistance).toBeGreaterThan(150);
    expect(totalDistance).toBeLessThan(200);
  });
});

describe("calculateElevationGain", () => {
  it("应计算爬山场景的累计爬升", () => {
    const points = convertToPoint3D(mountainClimbData as any);
    const { ascent, descent } = calculateElevationGain(points);

    // 从0到1000m，累计爬升应为1000m
    expect(ascent).toBeCloseTo(1000, -1);
    expect(descent).toBe(0);
  });

  it("应计算下山场景的累计下降", () => {
    const points: Point3D[] = [
      { latitude: 40.0, longitude: 116.0, altitude: 1000 },
      { latitude: 40.001, longitude: 116.0, altitude: 900 },
      { latitude: 40.002, longitude: 116.0, altitude: 800 },
    ];

    const { ascent, descent } = calculateElevationGain(points);

    expect(ascent).toBe(0);
    expect(descent).toBe(200);
  });

  it("应处理混合爬升和下降", () => {
    const points: Point3D[] = [
      { latitude: 40.0, longitude: 116.0, altitude: 100 },
      { latitude: 40.001, longitude: 116.0, altitude: 200 }, // 爬升100m
      { latitude: 40.002, longitude: 116.0, altitude: 150 }, // 下降50m
      { latitude: 40.003, longitude: 116.0, altitude: 250 }, // 爬升100m
    ];

    const { ascent, descent } = calculateElevationGain(points);

    expect(ascent).toBe(200);
    expect(descent).toBe(50);
  });

  it("少于2个点应返回0", () => {
    expect(calculateElevationGain([])).toEqual({ ascent: 0, descent: 0 });
    expect(calculateElevationGain([{ latitude: 40, longitude: 116 }])).toEqual({
      ascent: 0,
      descent: 0,
    });
  });

  it("应处理缺失海拔数据", () => {
    const points: Point3D[] = [
      { latitude: 40.0, longitude: 116.0, altitude: 100 },
      { latitude: 40.001, longitude: 116.0 }, // 无海拔 - 跳过
      { latitude: 40.002, longitude: 116.0, altitude: 200 },
    ];

    const { ascent, descent } = calculateElevationGain(points);

    // 中间点无海拔，无法计算第一段和第二段之间的海拔差
    // 只能从第二段（无海拔）到第三段（200m）计算，但第二段无海拔，所以无法计算
    // 因此总爬升为0
    expect(ascent).toBe(0);
    expect(descent).toBe(0);
  });

  it("应处理NaN海拔值", () => {
    const points: Point3D[] = [
      { latitude: 40.0, longitude: 116.0, altitude: 100 },
      { latitude: 40.001, longitude: 116.0, altitude: NaN }, // NaN - 跳过
      { latitude: 40.002, longitude: 116.0, altitude: 200 },
    ];

    const { ascent, descent } = calculateElevationGain(points);

    // 中间点NaN，无法计算海拔差
    expect(ascent).toBe(0);
    expect(descent).toBe(0);
  });
});

describe("实际场景测试", () => {
  it("奥林匹克森林公园 - 验证海拔变化", () => {
    const points = convertToPoint3D(olympicParkData as any);
    const { ascent, descent } = calculateElevationGain(points);

    // 公园相对平坦，海拔变化应在 20m 以内
    expect(ascent).toBeLessThan(20);
    expect(descent).toBeLessThan(20);
  });

  it("奥林匹克森林公园 - 验证总距离精度", () => {
    const points = convertToPoint3D(olympicParkData as any);
    const totalDistance = calculateTotalDistance3D(points);

    // 实际约 5.02km，误差应小于 2%
    const expectedDistance = 5020;
    const errorRate =
      Math.abs(totalDistance - expectedDistance) / expectedDistance;

    expect(errorRate).toBeLessThan(0.02);
  });
});
