/**
 * ACSM 卡路里计算公式（美国运动医学会）
 *
 * 公式原理：
 * VO2 = (0.2 × S) + (0.9 × S × G) + 3.5
 * 卡路里 = (VO2 × 体重 / 1000) × 5 × 时间(小时)
 *
 * 其中：
 * - VO2: 相对摄氧量 (ml·kg⁻¹·min⁻¹)
 * - S (Speed): 速度 (米/分钟)
 * - G (Grade): 坡度 (小数，如 5% = 0.05)
 * - 3.5: 基础代谢 (1 MET)
 * - 5: 每升氧气产生的热量 (千卡)
 */

export interface CalorieCalculationParams {
  /** 距离（米） */
  distanceMeters: number;
  /** 时间（秒） */
  timeSeconds: number;
  /** 体重（千克） */
  weightKg: number;
  /** 海拔爬升（米），可选，默认0 */
  elevationGainMeters?: number;
}

/**
 * 使用 ACSM 公式计算卡路里消耗
 *
 * @param params 计算参数
 * @returns 消耗的卡路里（整数）
 */
export function calculateCaloriesACSM({
  distanceMeters,
  timeSeconds,
  weightKg,
  elevationGainMeters = 0,
}: CalorieCalculationParams): number {
  // 参数验证
  if (timeSeconds <= 0 || weightKg <= 0 || distanceMeters < 0) {
    return 0;
  }

  // 时间转换为分钟和小时
  const timeMinutes = timeSeconds / 60;
  const timeHours = timeMinutes / 60;

  // 计算速度 (米/分钟)
  const speed = distanceMeters / timeMinutes;

  // 计算坡度（小数）
  // 如果距离为0但海拔有变化，则坡度为0（避免除零错误）
  const grade = distanceMeters > 0 ? elevationGainMeters / distanceMeters : 0;

  // ACSM 公式计算 VO2
  // 水平分量: 0.2 × S
  // 垂直分量: 0.9 × S × G（上坡额外消耗，下坡按平路算）
  // 基础代谢: 3.5
  const vo2 = 0.2 * speed + 0.9 * speed * Math.max(0, grade) + 3.5;

  // 转换为卡路里
  // (VO2 × 体重 / 1000) 将 VO2 转换为每分钟消耗的氧气升数
  // × 5 转换为卡路里（每升氧气产生 5 千卡）
  // × 时间(分钟) 得到总消耗
  const calories = Math.round(((vo2 * weightKg) / 1000) * 5 * timeMinutes);

  return calories;
}

/**
 * 简化版 ACSM 公式（不含坡度）
 * 用于实时显示，无需海拔数据
 *
 * @param distanceMeters 距离（米）
 * @param timeSeconds 时间（秒）
 * @param weightKg 体重（千克）
 * @returns 消耗的卡路里（整数）
 */
export function calculateCaloriesSimplified(
  distanceMeters: number,
  timeSeconds: number,
  weightKg: number,
): number {
  return calculateCaloriesACSM({
    distanceMeters,
    timeSeconds,
    weightKg,
    elevationGainMeters: 0,
  });
}

/**
 * 计算配速（分钟/公里）
 *
 * @param timeSeconds 时间（秒）
 * @param distanceMeters 距离（米）
 * @returns 配速（分钟/公里），如果距离为0则返回0
 */
export function calculatePace(
  timeSeconds: number,
  distanceMeters: number,
): number {
  if (distanceMeters <= 0) return 0;
  const timeMinutes = timeSeconds / 60;
  const distanceKm = distanceMeters / 1000;
  return timeMinutes / distanceKm;
}

/**
 * 将配速转换为 MET 值（用于参考对比）
 *
 * @param paceMinPerKm 配速（分钟/公里）
 * @returns MET 值
 */
export function paceToMET(paceMinPerKm: number): number {
  if (paceMinPerKm <= 0) return 0;

  // 根据配速返回 MET 值
  // 参考: https://sites.google.com/site/compendiumofphysicalactivities/
  if (paceMinPerKm > 12) return 4; // 慢走
  if (paceMinPerKm > 9) return 6; // 快走
  if (paceMinPerKm > 7) return 8; // 慢跑
  if (paceMinPerKm > 6) return 10; // 中速跑
  return 12; // 快跑
}

/**
 * 使用传统 MET 值法计算卡路里（用于对比测试）
 *
 * @param timeSeconds 时间（秒）
 * @param paceMinPerKm 配速（分钟/公里）
 * @param weightKg 体重（千克）
 * @returns 消耗的卡路里（整数）
 */
export function calculateCaloriesMET(
  timeSeconds: number,
  paceMinPerKm: number,
  weightKg: number,
): number {
  const met = paceToMET(paceMinPerKm);
  const timeHours = timeSeconds / 3600;
  return Math.round(met * weightKg * timeHours);
}
