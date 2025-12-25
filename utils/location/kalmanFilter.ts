// KalmanService.ts

export class IndustrialKalmanFilter {
  // 状态向量 [lat, lon, vLat, vLon]
  private x = new Float64Array(4);
  // 4x4 协方差矩阵 P (平铺为 16 个元素的数组)
  private p = new Float64Array(16);

  private lastTimestamp = 0;
  private isInitialized = false;

  // --- 调优参数 ---
  private readonly sigmaA = 0.00002; // 过程噪声强度（加速度的不确定性）
  private readonly minR = 0.00001; // 基础测量噪声

  constructor() {
    // 初始化 P 矩阵为单位阵（初始不确定性）
    for (let i = 0; i < 16; i += 5) this.p[i] = 1.0;
  }

  public process(
    rawLat: number,
    rawLon: number,
    accuracy: number,
    timestamp: number,
  ) {
    if (!this.isInitialized) {
      this.x[0] = rawLat;
      this.x[1] = rawLon;
      this.lastTimestamp = timestamp;
      this.isInitialized = true;
      return { latitude: rawLat, longitude: rawLon };
    }

    const dt = (timestamp - this.lastTimestamp) / 1000.0;
    if (dt <= 0) return { latitude: this.x[0], longitude: this.x[1] };

    // --- 1. 预测 (Predict) ---
    // x = A * x
    this.x[0] += this.x[2] * dt;
    this.x[1] += this.x[3] * dt;

    // P = A * P * A' + Q
    // 这里简化了 A*P*A' 的矩阵乘法展开，以提升 JS 性能
    const dt2 = dt * dt;
    const dt3 = dt2 * dt;
    const dt4 = dt3 * dt;

    // Q 矩阵：加速度噪声注入
    const qBase = this.sigmaA * this.sigmaA;
    const q11 = (qBase * dt4) / 4;
    const q12 = (qBase * dt3) / 2;
    const q22 = qBase * dt2;

    // 更新协方差矩阵 P (部分展开运算)
    this.p[0] += dt * (this.p[8] + this.p[2]) + dt2 * this.p[10] + q11;
    this.p[1] += dt * (this.p[9] + this.p[3]) + dt2 * this.p[11];
    this.p[2] += dt * this.p[10] + q12;
    this.p[3] += dt * this.p[11];

    this.p[5] += dt * (this.p[13] + this.p[7]) + dt2 * this.p[15] + q11;
    this.p[10] += q22;
    this.p[15] += q22;

    // --- 2. 更新 (Update) ---
    // 测量噪声 R (基于经纬度比例转换)
    const R = Math.pow(accuracy / 111319.0, 2) + this.minR;

    // 计算卡尔曼增益 K = P * H' * (H * P * H' + R)^-1
    // 这里的 H 是观测矩阵 [1, 0, 0, 0; 0, 1, 0, 0]
    const kLat = this.p[0] / (this.p[0] + R);
    const kLon = this.p[5] / (this.p[5] + R);

    // 修正状态向量 x = x + K * (z - x)
    this.x[0] += kLat * (rawLat - this.x[0]);
    this.x[1] += kLon * (rawLon - this.x[1]);

    // 修正速度 (隐含在 P 矩阵的关联中)
    this.x[2] += (this.p[8] / (this.p[0] + R)) * (rawLat - this.x[0]);
    this.x[3] += (this.p[13] / (this.p[5] + R)) * (rawLon - this.x[1]);

    // 更新协方差 P = (I - K*H) * P
    this.p[0] *= 1 - kLat;
    this.p[5] *= 1 - kLon;

    this.lastTimestamp = timestamp;

    return {
      latitude: this.x[0],
      longitude: this.x[1],
    };
  }
}
