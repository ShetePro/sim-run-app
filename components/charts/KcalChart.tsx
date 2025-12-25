import { Dimensions, ScrollView, View } from "react-native";
import {
  VictoryChart,
  VictoryTooltip,
  VictoryAxis,
  VictoryArea,
  VictoryLine,
} from "victory-native";
const screenWidth = Dimensions.get("window").width;
const CHART_WIDTH = screenWidth - 60;
const primaryColor = "#6366f1"; // 每日跑量颜色
const secondaryColor = "#f97316"; // 卡路里消耗颜色
export default function KcalChart({
  chartData,
  axisX,
  type = "isoWeek",
}: {
  chartData?: any[];
  axisX?: string[];
  type: "isoWeek" | "month" | "year";
}) {
  // const theme = useColorScheme();
  const isDark = false;
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const maxY = Math.max(...(chartData || []).map((d) => d.energy));
  let labelWidth = maxY.toString().length * 8 + 10;
  if (labelWidth < 30) labelWidth = 30;
  const customTheme = {
    axis: {
      style: {
        axis: { stroke: axisColor, strokeWidth: 0 }, // 隐藏轴线本身
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
  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      <View className="bg-white dark:bg-slate-800 rounded-2xl pt-2 pb-2  tems-center">
        <VictoryChart
          width={type === "month" ? CHART_WIDTH + 200 : CHART_WIDTH}
          height={200}
          padding={{ top: 10, bottom: 20, left: labelWidth, right: 20 }}
        >
          {/* X 轴 */}
          <VictoryAxis style={customTheme.axis.style} tickValues={axisX} />
          {/* Y 轴 (带网格线) */}
          <VictoryAxis
            dependentAxis
            style={customTheme.axis.style}
            tickFormat={(t) => Math.round(t / 100) * 100} // Y 轴刻度显示为整百
          />

          {/* 1. 曲线填充区域 */}
          <VictoryArea
            data={chartData}
            x="day"
            y="energy"
            labels={({ datum }) =>
              datum.energy > 0 ? `${datum.energy} km` : ""
            }
            labelComponent={
              <VictoryTooltip
                renderInPortal={customTheme.tooltip.renderInPortal}
                constrainToVisibleArea={true}
                flyoutStyle={{
                  fill: isDark ? "#1e293b" : "white",
                  stroke: primaryColor,
                }}
                style={{ fill: isDark ? "white" : "#334155" }}
              />
            }
            interpolation="catmullRom" // 平滑曲线
            style={{
              data: {
                fill: `${secondaryColor}40`, // 半透明填充
                stroke: "transparent",
              },
            }}
          />

          {/* 2. 曲线线条本身 */}
          <VictoryLine
            data={chartData}
            x="day"
            y="energy"
            interpolation="catmullRom"
            style={{
              data: {
                stroke: secondaryColor,
                strokeWidth: 3,
              },
            }}
          />

          {/* 3. 散点图层（可选，用于增强 Voronoi 交互点击目标） */}
          <VictoryArea
            data={chartData}
            x="day"
            y="energy"
            style={{
              data: {
                fill: "transparent",
                stroke: "transparent",
              },
            }}
          />
        </VictoryChart>
      </View>
    </ScrollView>
  );
}
