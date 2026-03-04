import { Dimensions, View, Text, ScrollView } from "react-native";
import {
  VictoryChart,
  VictoryTooltip,
  VictoryAxis,
  VictoryArea,
  VictoryLine,
  VictoryScatter,
} from "victory-native";
import { getPaceLabel } from "@/utils/util";

const screenWidth = Dimensions.get("window").width;
const CHART_WIDTH = screenWidth - 60;

// 颜色配置
const COLORS = {
  pace: "#6366f1", // 配速 - 靛蓝色
  altitude: "#10b981", // 海拔 - 绿色
  altitudeFill: "#10b98140", // 海拔填充 - 半透明
};

interface RunDetailChartsProps {
  paceTrend: { distance: number; pace: number }[];
  altitudeProfile: { distance: number; altitude: number }[];
  colorScheme: "light" | "dark";
  t: (key: string) => string;
}

// 创建图表主题
function createChartTheme(isDark: boolean) {
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  return {
    axis: {
      style: {
        axis: { stroke: axisColor, strokeWidth: 0 },
        tickLabels: {
          fontSize: 11,
          padding: 5,
          fill: axisColor,
        },
        grid: {
          stroke: isDark ? "#334155" : "#e2e8f0",
          strokeDasharray: "4, 4",
          strokeWidth: 0.5,
        },
      },
    },
    tooltip: {
      renderInPortal: false,
    },
  };
}

export function RunDetailCharts({
  paceTrend,
  altitudeProfile,
  colorScheme,
  t,
}: RunDetailChartsProps) {
  const isDark = colorScheme === "dark";
  const theme = createChartTheme(isDark);

  // 计算 Y 轴标签宽度
  // 配速使用 getPaceLabel 格式（如 "4'10""），估算最大宽度约 45
  const paceLabelWidth = 45;
  const maxAltitude = Math.max(...altitudeProfile.map((d) => d.altitude), 100);
  const altitudeLabelWidth = maxAltitude.toString().length * 8 + 10;

  // 计算配速趋势图 X 轴刻度（每公里一个刻度）
  const maxPaceDistance =
    paceTrend.length > 0 ? Math.max(...paceTrend.map((d) => d.distance)) : 0;
  const paceTickValues = Array.from(
    { length: Math.floor(maxPaceDistance) },
    (_, i) => i + 1,
  );

  // 动态计算配速趋势图宽度（避免刻度挤压）
  const paceChartWidth = Math.max(
    CHART_WIDTH,
    paceTrend.length * 50, // 每个数据点至少50px宽度
  );

  // 计算Y轴刻度（按最长时间5等分，向上取整到5的倍数）
  const maxPaceSeconds =
    paceTrend.length > 0 ? Math.max(...paceTrend.map((d) => d.pace)) : 0;
  const maxPaceMinutes = Math.ceil(maxPaceSeconds / 60);
  // 向上取整到最近的5的倍数
  const yAxisMaxMinutes = Math.ceil(maxPaceMinutes / 5) * 5;
  // 生成5等分的刻度值（转换为秒）
  const yAxisTickValues = [
    yAxisMaxMinutes * 60,
    (yAxisMaxMinutes * 60 * 4) / 5,
    (yAxisMaxMinutes * 60 * 3) / 5,
    (yAxisMaxMinutes * 60 * 2) / 5,
    (yAxisMaxMinutes * 60) / 5,
    0,
  ];

  const hasAnyData = paceTrend.length > 0 || altitudeProfile.length > 0;

  if (!hasAnyData) {
    return (
      <View className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
          {t("run.charts")}
        </Text>
        <View className="py-8 items-center">
          <Text className="text-sm text-slate-400 dark:text-slate-500">
            {t("run.noChartData")}
          </Text>
          <Text className="text-xs text-slate-300 dark:text-slate-600 mt-1">
            {t("run.noChartDataDesc")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
      <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
        {t("run.charts")}
      </Text>

      {/* 配速趋势图 */}
      {paceTrend.length > 0 && (
        <View className="mb-6 bg-white dark:bg-slate-800 rounded-2xl pt-2 pb-2">
          <Text className="text-xs text-slate-500 dark:text-slate-400 mb-2 px-4">
            {t("run.paceTrend")}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <VictoryChart
              width={paceChartWidth}
              height={200}
              padding={{ top: 10, bottom: 30, left: paceLabelWidth, right: 20 }}
              domainPadding={{ x: 20 }}
            >
              <VictoryAxis
                style={theme.axis.style}
                tickValues={paceTickValues}
                tickFormat={(tick: number) => tick.toString()}
              />
              <VictoryAxis
                dependentAxis
                style={theme.axis.style}
                tickValues={yAxisTickValues}
                tickFormat={(tick: number) => `${Math.round(tick / 60)}'`}
                domain={{ y: [0, yAxisMaxMinutes * 60] }}
              />

              {/* 折线 - 直线连接，无填充 */}
              <VictoryLine
                data={paceTrend}
                x="distance"
                y="pace"
                domain={{ y: [0, yAxisMaxMinutes * 60] }}
                style={{
                  data: {
                    stroke: COLORS.pace,
                    strokeWidth: 3,
                  },
                }}
              />

              {/* 数据点圆点 */}
              <VictoryScatter
                data={paceTrend}
                x="distance"
                y="pace"
                size={5}
                labels={({ datum }: any) => getPaceLabel(datum.pace)}
                labelComponent={
                  <VictoryTooltip
                    renderInPortal={theme.tooltip.renderInPortal}
                    constrainToVisibleArea={true}
                    flyoutStyle={{
                      fill: isDark ? "#1e293b" : "white",
                      stroke: COLORS.pace,
                    }}
                    style={{ fill: isDark ? "white" : "#334155" }}
                  />
                }
                style={{
                  data: {
                    fill: COLORS.pace,
                    stroke: "white",
                    strokeWidth: 2,
                  },
                }}
              />
            </VictoryChart>
          </ScrollView>
        </View>
      )}

      {/* 海拔剖面图 */}
      {altitudeProfile.length > 0 && (
        <View className="mb-6 bg-white dark:bg-slate-800 rounded-2xl pt-2 pb-2">
          <Text className="text-xs text-slate-500 dark:text-slate-400 mb-2 px-4">
            {t("run.altitudeProfile")}
          </Text>
          <VictoryChart
            width={CHART_WIDTH}
            height={180}
            padding={{
              top: 10,
              bottom: 30,
              left: altitudeLabelWidth,
              right: 20,
            }}
          >
            <VictoryAxis
              style={theme.axis.style}
              tickFormat={(tick: number) => Math.round(tick)}
            />
            <VictoryAxis
              dependentAxis
              style={theme.axis.style}
              tickFormat={(tick: number) => Math.round(tick)}
            />

            {/* 填充区域 */}
            <VictoryArea
              data={altitudeProfile}
              x="distance"
              y="altitude"
              labels={({ datum }: any) => `${Math.round(datum.altitude)}m`}
              labelComponent={
                <VictoryTooltip
                  renderInPortal={theme.tooltip.renderInPortal}
                  constrainToVisibleArea={true}
                  flyoutStyle={{
                    fill: isDark ? "#1e293b" : "white",
                    stroke: COLORS.altitude,
                  }}
                  style={{ fill: isDark ? "white" : "#334155" }}
                />
              }
              interpolation="catmullRom"
              style={{
                data: {
                  fill: COLORS.altitudeFill,
                  stroke: "transparent",
                },
              }}
            />

            {/* 线条 */}
            <VictoryLine
              data={altitudeProfile}
              x="distance"
              y="altitude"
              interpolation="catmullRom"
              style={{
                data: {
                  stroke: COLORS.altitude,
                  strokeWidth: 3,
                },
              }}
            />
          </VictoryChart>
        </View>
      )}
    </View>
  );
}

export default RunDetailCharts;
