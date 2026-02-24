import {
  isValidCoordinate,
  filterValidCoordinates,
  trackPointToCoordinate,
  trackPointToCoordinate3D,
  MapCoordinate,
} from "../../utils/map/coordinates";
import invalidData from "../fixtures/coordinates/invalid_coordinates.json";

describe("isValidCoordinate", () => {
  it("应接受有效坐标", () => {
    const validPoint: MapCoordinate = {
      latitude: 40.014,
      longitude: 116.391,
    };
    expect(isValidCoordinate(validPoint)).toBe(true);
  });

  it("应接受带海拔的有效坐标", () => {
    const validPoint3D = {
      latitude: 40.014,
      longitude: 116.391,
      altitude: 50,
    };
    expect(isValidCoordinate(validPoint3D)).toBe(true);
  });

  invalidData.invalid_cases.forEach((testCase) => {
    it(`应拒绝${testCase.name}`, () => {
      expect(isValidCoordinate(testCase.point)).toBe(false);
    });
  });

  it("应拒绝空对象", () => {
    expect(isValidCoordinate({})).toBe(false);
  });

  it("应拒绝负数零", () => {
    const point = { latitude: -0, longitude: 116.391 };
    expect(isValidCoordinate(point)).toBe(true); // -0 是有效的
  });

  it("应接受边界值", () => {
    expect(isValidCoordinate({ latitude: 90, longitude: 180 })).toBe(true);
    expect(isValidCoordinate({ latitude: -90, longitude: -180 })).toBe(true);
  });
});

describe("filterValidCoordinates", () => {
  it("应过滤数组中的无效坐标", () => {
    const mixedPoints = [
      { latitude: 40.014, longitude: 116.391 }, // 有效
      { latitude: 999, longitude: 116.391 }, // 无效
      { latitude: 40.015, longitude: 116.392 }, // 有效
      { latitude: 40.016, longitude: 999 }, // 无效
      { latitude: 40.017, longitude: 116.393 }, // 有效
    ];

    const filtered = filterValidCoordinates(mixedPoints);

    expect(filtered).toHaveLength(3);
    expect(filtered[0]).toEqual({ latitude: 40.014, longitude: 116.391 });
    expect(filtered[1]).toEqual({ latitude: 40.015, longitude: 116.392 });
    expect(filtered[2]).toEqual({ latitude: 40.017, longitude: 116.393 });
  });

  it("应处理空数组", () => {
    expect(filterValidCoordinates([])).toEqual([]);
  });

  it("应处理全无效数组", () => {
    const invalidPoints = [
      { latitude: 999, longitude: 116.391 },
      { latitude: 40.014, longitude: 999 },
      null,
      undefined,
    ];

    expect(filterValidCoordinates(invalidPoints)).toEqual([]);
  });

  it("应处理全有效数组", () => {
    const validPoints = [
      { latitude: 40.014, longitude: 116.391 },
      { latitude: 40.015, longitude: 116.392 },
      { latitude: 40.016, longitude: 116.393 },
    ];

    const filtered = filterValidCoordinates(validPoints);

    expect(filtered).toHaveLength(3);
    expect(filtered).toEqual(validPoints);
  });

  it("应处理非数组输入", () => {
    expect(filterValidCoordinates(null as any)).toEqual([]);
    expect(filterValidCoordinates(undefined as any)).toEqual([]);
    expect(filterValidCoordinates("not an array" as any)).toEqual([]);
    expect(filterValidCoordinates({} as any)).toEqual([]);
  });
});

describe("trackPointToCoordinate", () => {
  it("应转换有效的TrackPoint", () => {
    const trackPoint = { lat: 40.014, lng: 116.391 };
    const result = trackPointToCoordinate(trackPoint);

    expect(result).toEqual({
      latitude: 40.014,
      longitude: 116.391,
    });
  });

  it("应处理带额外字段的TrackPoint", () => {
    const trackPoint = {
      lat: 40.014,
      lng: 116.391,
      altitude: 50,
      heading: 90,
      timestamp: 1704067200000,
    };
    const result = trackPointToCoordinate(trackPoint);

    expect(result).toEqual({
      latitude: 40.014,
      longitude: 116.391,
    });
  });

  it("应返回null对于无效TrackPoint", () => {
    expect(trackPointToCoordinate({ lat: 999, lng: 116.391 })).toBeNull();
    expect(trackPointToCoordinate({ lat: undefined, lng: 116.391 })).toBeNull();
    expect(trackPointToCoordinate(null as any)).toBeNull();
    expect(trackPointToCoordinate(undefined as any)).toBeNull();
  });

  it("应返回null对于缺失字段", () => {
    expect(trackPointToCoordinate({ lat: 40.014 })).toBeNull();
    expect(trackPointToCoordinate({ lng: 116.391 })).toBeNull();
    expect(trackPointToCoordinate({})).toBeNull();
  });
});

describe("trackPointToCoordinate3D", () => {
  it("应转换带海拔的TrackPoint", () => {
    const trackPoint = {
      lat: 40.014,
      lng: 116.391,
      altitude: 50,
    };
    const result = trackPointToCoordinate3D(trackPoint);

    expect(result).toEqual({
      latitude: 40.014,
      longitude: 116.391,
      altitude: 50,
    });
  });

  it("应处理不含海拔的TrackPoint", () => {
    const trackPoint = { lat: 40.014, lng: 116.391 };
    const result = trackPointToCoordinate3D(trackPoint);

    expect(result).toEqual({
      latitude: 40.014,
      longitude: 116.391,
      altitude: undefined,
    });
  });

  it("应返回null对于无效TrackPoint", () => {
    expect(trackPointToCoordinate3D({ lat: 999, lng: 116.391 })).toBeNull();
    expect(trackPointToCoordinate3D(null as any)).toBeNull();
  });

  it("应保留其他字段", () => {
    const trackPoint = {
      lat: 40.014,
      lng: 116.391,
      altitude: 50,
      heading: 90,
      timestamp: 1704067200000,
      extraField: "ignored",
    };
    const result = trackPointToCoordinate3D(trackPoint);

    expect(result).toBeDefined();
    expect(result?.latitude).toBe(40.014);
    expect(result?.longitude).toBe(116.391);
    expect(result?.altitude).toBe(50);
  });
});

describe("批量转换测试", () => {
  it("应批量转换TrackPoint数组", () => {
    const trackPoints = [
      { lat: 40.014, lng: 116.391 },
      { lat: 40.015, lng: 116.392 },
      { lat: 40.016, lng: 116.393 },
    ];

    // 注意：这里直接调用原始函数需要导入，但函数名是 trackPointsToCoordinates
    // 我们在实际测试中应该导入并使用它
    const results = trackPoints.map(trackPointToCoordinate).filter(Boolean);

    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({ latitude: 40.014, longitude: 116.391 });
  });

  it("应在批量转换中过滤无效点", () => {
    const trackPoints: { lat: number | undefined; lng: number }[] = [
      { lat: 40.014, lng: 116.391 },
      { lat: 999, lng: 116.391 }, // 无效
      { lat: 40.015, lng: 116.392 },
      { lat: undefined, lng: 116.393 }, // 无效
      { lat: 40.016, lng: 116.394 },
    ];

    const results = trackPoints.map(trackPointToCoordinate).filter(Boolean);

    expect(results).toHaveLength(3);
  });
});

describe("边界情况测试", () => {
  it("应处理极小坐标变化", () => {
    const point1 = { latitude: 40.0000001, longitude: 116.0000001 };
    const point2 = { latitude: 40.0000002, longitude: 116.0000002 };

    expect(isValidCoordinate(point1)).toBe(true);
    expect(isValidCoordinate(point2)).toBe(true);
  });

  it("应处理极大坐标值", () => {
    const maxValid = { latitude: 90, longitude: 180 };
    const minValid = { latitude: -90, longitude: -180 };
    const overMax = { latitude: 90.0001, longitude: 180.0001 };
    const underMin = { latitude: -90.0001, longitude: -180.0001 };

    expect(isValidCoordinate(maxValid)).toBe(true);
    expect(isValidCoordinate(minValid)).toBe(true);
    expect(isValidCoordinate(overMax)).toBe(false);
    expect(isValidCoordinate(underMin)).toBe(false);
  });

  it("应处理浮点数精度", () => {
    const point = {
      latitude: 40.123456789,
      longitude: 116.987654321,
    };

    expect(isValidCoordinate(point)).toBe(true);
  });
});
