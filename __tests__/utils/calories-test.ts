import {
  calculateCaloriesACSM,
  calculateCaloriesSimplified,
  calculateCaloriesMET,
  calculatePace,
  paceToMET,
} from "../../utils/calories";

describe("ACSM 卡路里计算", () => {
  describe("calculateCaloriesACSM - 基础场景", () => {
    it("应正确计算平路跑步（坡度=0）", () => {
      // 70kg 用户，30 分钟，5000 米，平路
      const calories = calculateCaloriesACSM({
        distanceMeters: 5000,
        timeSeconds: 30 * 60, // 30 分钟
        weightKg: 70,
        elevationGainMeters: 0,
      });

      // 速度: 5000/30 = 166.67 m/min
      // VO2 = 0.2 * 166.67 + 0.9 * 166.67 * 0 + 3.5 = 33.33 + 0 + 3.5 = 36.83
      // 卡路里 = 36.83 * 70 / 1000 * 5 * 30 = 387
      expect(calories).toBeGreaterThan(370);
      expect(calories).toBeLessThan(400);
    });

    it("应正确计算带坡度的跑步", () => {
      // 70kg 用户，30 分钟，5000 米，爬升 50 米（坡度 1%）
      const calories = calculateCaloriesACSM({
        distanceMeters: 5000,
        timeSeconds: 30 * 60,
        weightKg: 70,
        elevationGainMeters: 50, // 1% 坡度
      });

      // 坡度会增加额外消耗
      // VO2 = 0.2 * 166.67 + 0.9 * 166.67 * 0.01 + 3.5
      //     = 33.33 + 1.5 + 3.5 = 38.33
      // 卡路里 = 38.33 * 70 / 1000 * 5 * 30 = 402
      expect(calories).toBeGreaterThan(390);
      expect(calories).toBeLessThan(420);
    });

    it("体重越大消耗越多", () => {
      const timeSeconds = 30 * 60;
      const distanceMeters = 5000;

      const calories70kg = calculateCaloriesACSM({
        distanceMeters,
        timeSeconds,
        weightKg: 70,
        elevationGainMeters: 0,
      });

      const calories80kg = calculateCaloriesACSM({
        distanceMeters,
        timeSeconds,
        weightKg: 80,
        elevationGainMeters: 0,
      });

      // 80kg 应该比 70kg 消耗更多
      expect(calories80kg).toBeGreaterThan(calories70kg);
      // 比例应该是 80/70 ≈ 1.14
      const ratio = calories80kg / calories70kg;
      expect(ratio).toBeCloseTo(80 / 70, 0);
    });

    it("时间越长消耗越多", () => {
      const distanceMeters = 5000;
      const weightKg = 70;

      const calories30min = calculateCaloriesACSM({
        distanceMeters,
        timeSeconds: 30 * 60,
        weightKg,
        elevationGainMeters: 0,
      });

      const calories60min = calculateCaloriesACSM({
        distanceMeters: 10000, // 2倍距离保持速度一致
        timeSeconds: 60 * 60,
        weightKg,
        elevationGainMeters: 0,
      });

      // 60 分钟应该是 30 分钟的约 2 倍
      expect(calories60min).toBeGreaterThan(calories30min * 1.8);
      expect(calories60min).toBeLessThan(calories30min * 2.2);
    });
  });

  describe("calculateCaloriesACSM - 坡度场景", () => {
    it("上坡应该比平路消耗更多", () => {
      const params = {
        distanceMeters: 5000,
        timeSeconds: 30 * 60,
        weightKg: 70,
      };

      const flatCalories = calculateCaloriesACSM({
        ...params,
        elevationGainMeters: 0,
      });

      const uphillCalories = calculateCaloriesACSM({
        ...params,
        elevationGainMeters: 100, // 2% 坡度
      });

      expect(uphillCalories).toBeGreaterThan(flatCalories);
    });

    it("陡峭上坡消耗显著增加", () => {
      const params = {
        distanceMeters: 5000,
        timeSeconds: 30 * 60,
        weightKg: 70,
      };

      const flat = calculateCaloriesACSM({ ...params, elevationGainMeters: 0 });
      const gentle = calculateCaloriesACSM({
        ...params,
        elevationGainMeters: 50,
      }); // 1%
      const steep = calculateCaloriesACSM({
        ...params,
        elevationGainMeters: 250,
      }); // 5%

      // 坡度越陡消耗越多
      expect(steep).toBeGreaterThan(gentle);
      expect(gentle).toBeGreaterThan(flat);
    });

    it("下坡按平路计算（不计算能量回收）", () => {
      // 下坡时 elevationGain 为 0（我们只累加爬升，不计算下降）
      const params = {
        distanceMeters: 5000,
        timeSeconds: 30 * 60,
        weightKg: 70,
      };

      const flat = calculateCaloriesACSM({ ...params, elevationGainMeters: 0 });

      // 下坡场景（下降 50 米，但 elevationGain 仍为 0）
      const downhill = calculateCaloriesACSM({
        ...params,
        elevationGainMeters: 0,
      });

      expect(downhill).toBe(flat);
    });
  });

  describe("calculateCaloriesACSM - 边界条件", () => {
    it("时间=0 时应返回 0", () => {
      const calories = calculateCaloriesACSM({
        distanceMeters: 5000,
        timeSeconds: 0,
        weightKg: 70,
        elevationGainMeters: 0,
      });
      expect(calories).toBe(0);
    });

    it("体重=0 时应返回 0", () => {
      const calories = calculateCaloriesACSM({
        distanceMeters: 5000,
        timeSeconds: 30 * 60,
        weightKg: 0,
        elevationGainMeters: 0,
      });
      expect(calories).toBe(0);
    });

    it("负体重应返回 0", () => {
      const calories = calculateCaloriesACSM({
        distanceMeters: 5000,
        timeSeconds: 30 * 60,
        weightKg: -70,
        elevationGainMeters: 0,
      });
      expect(calories).toBe(0);
    });

    it("距离=0 但时间>0 时应返回基础代谢消耗", () => {
      // 原地不动，只有基础代谢
      const calories = calculateCaloriesACSM({
        distanceMeters: 0,
        timeSeconds: 30 * 60,
        weightKg: 70,
        elevationGainMeters: 0,
      });

      // 只有基础代谢: VO2 = 3.5（速度为0，只有基础代谢）
      // 卡路里 = 3.5 * 70 / 1000 * 5 * 30 = 36.75
      expect(calories).toBeGreaterThan(30);
      expect(calories).toBeLessThan(45);
    });

    it("所有参数为 0 时应返回 0", () => {
      const calories = calculateCaloriesACSM({
        distanceMeters: 0,
        timeSeconds: 0,
        weightKg: 0,
        elevationGainMeters: 0,
      });
      expect(calories).toBe(0);
    });
  });

  describe("calculateCaloriesSimplified - 简化版", () => {
    it("应等同于 ACSM 公式 elevationGain=0 的情况", () => {
      const params = {
        distanceMeters: 5000,
        timeSeconds: 30 * 60,
        weightKg: 70,
      };

      const simplified = calculateCaloriesSimplified(
        params.distanceMeters,
        params.timeSeconds,
        params.weightKg,
      );

      const acsm = calculateCaloriesACSM({
        ...params,
        elevationGainMeters: 0,
      });

      expect(simplified).toBe(acsm);
    });
  });
});

describe("MET 值计算（对比测试）", () => {
  describe("paceToMET", () => {
    it("应正确转换配速到 MET 值", () => {
      expect(paceToMET(15)).toBe(4); // 慢走
      expect(paceToMET(10)).toBe(6); // 快走
      expect(paceToMET(8)).toBe(8); // 慢跑
      expect(paceToMET(6.5)).toBe(10); // 中速跑
      expect(paceToMET(5)).toBe(12); // 快跑
    });

    it("配速=0 时应返回 0", () => {
      expect(paceToMET(0)).toBe(0);
    });

    it("负配速应返回 0", () => {
      expect(paceToMET(-5)).toBe(0);
    });
  });

  describe("ACSM vs MET 对比", () => {
    it("平路场景：ACSM 和 MET 结果应接近", () => {
      const timeSeconds = 30 * 60;
      const distanceMeters = 5000;
      const weightKg = 70;

      const pace = calculatePace(timeSeconds, distanceMeters); // 6 min/km
      const metCalories = calculateCaloriesMET(timeSeconds, pace, weightKg);

      const acsmCalories = calculateCaloriesACSM({
        distanceMeters,
        timeSeconds,
        weightKg,
        elevationGainMeters: 0,
      });

      // 两者差异应在 20% 以内（ACSM 更精确）
      const diff = Math.abs(acsmCalories - metCalories);
      const diffPercent = diff / metCalories;
      expect(diffPercent).toBeLessThan(0.2);
    });

    it("有坡度时：ACSM 应比 MET 计算更多（MET 不考虑坡度）", () => {
      const timeSeconds = 30 * 60;
      const distanceMeters = 5000;
      const weightKg = 70;

      const pace = calculatePace(timeSeconds, distanceMeters);
      const metCalories = calculateCaloriesMET(timeSeconds, pace, weightKg);

      const acsmCalories = calculateCaloriesACSM({
        distanceMeters,
        timeSeconds,
        weightKg,
        elevationGainMeters: 250, // 5% 坡度，更明显的差异
      });

      // ACSM 应该更多，因为它考虑了坡度（5%坡度会产生明显差异）
      expect(acsmCalories).toBeGreaterThan(metCalories);
    });
  });
});

describe("实际场景测试", () => {
  it("5km 平路跑（30分钟）", () => {
    const calories = calculateCaloriesACSM({
      distanceMeters: 5000,
      timeSeconds: 30 * 60,
      weightKg: 70,
      elevationGainMeters: 0,
    });

    // 参考值：约 380-400 千卡（5km，30分钟，配速6:00）
    expect(calories).toBeGreaterThan(370);
    expect(calories).toBeLessThan(410);
  });

  it("5km 山路跑（有爬升）", () => {
    const calories = calculateCaloriesACSM({
      distanceMeters: 5000,
      timeSeconds: 35 * 60, // 山路慢一点
      weightKg: 70,
      elevationGainMeters: 150, // 150 米爬升（3% 坡度）
    });

    // 有爬升应该消耗更多
    expect(calories).toBeGreaterThan(350);
  });

  it("10km 马拉松配速跑", () => {
    const calories = calculateCaloriesACSM({
      distanceMeters: 10000,
      timeSeconds: 60 * 60, // 6 min/km 配速
      weightKg: 70,
      elevationGainMeters: 20, // 几乎平路
    });

    // 10km 约消耗 770-800 千卡
    expect(calories).toBeGreaterThan(760);
    expect(calories).toBeLessThan(810);
  });

  it("爬山场景（大幅度爬升）", () => {
    const calories = calculateCaloriesACSM({
      distanceMeters: 3000, // 3km
      timeSeconds: 45 * 60, // 45 分钟（很慢）
      weightKg: 70,
      elevationGainMeters: 300, // 100 米爬升（10% 坡度很陡）
    });

    // 陡峭爬升消耗很大（实际约 360 千卡）
    expect(calories).toBeGreaterThan(340);
  });

  it("不同体重对比：80kg vs 60kg", () => {
    const params = {
      distanceMeters: 5000,
      timeSeconds: 30 * 60,
      elevationGainMeters: 0,
    };

    const calories80kg = calculateCaloriesACSM({
      ...params,
      weightKg: 80,
    });

    const calories60kg = calculateCaloriesACSM({
      ...params,
      weightKg: 60,
    });

    // 80kg 比 60kg 消耗多 33% 左右
    expect(calories80kg / calories60kg).toBeCloseTo(80 / 60, 0);
  });
});

describe("calculatePace", () => {
  it("应正确计算配速", () => {
    // 5km / 30min = 6 min/km
    const pace = calculatePace(30 * 60, 5000);
    expect(pace).toBeCloseTo(6, 1);
  });

  it("距离=0 时应返回 0", () => {
    const pace = calculatePace(30 * 60, 0);
    expect(pace).toBe(0);
  });

  it("距离<0 时应返回 0", () => {
    const pace = calculatePace(30 * 60, -1000);
    expect(pace).toBe(0);
  });

  it("时间=0 时应返回 0", () => {
    const pace = calculatePace(0, 5000);
    expect(pace).toBe(0);
  });
});
