import { Dimensions, View } from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryTooltip,
  VictoryAxis,
  VictoryVoronoiContainer,
  VictoryArea,
  VictoryLine,
  VictoryLabel,
} from "victory-native";
const screenWidth = Dimensions.get("window").width;
const CHART_WIDTH = screenWidth - 60;
const WEEKLY_DATA = [
  {
    day: "周一",
    date: "2025-12-01",
    distance: 5.2,
    calories: 320,
    pace: 5.5,
    index: 1,
  },
  {
    day: "周二",
    date: "2025-12-02",
    distance: 0,
    calories: 0,
    pace: 0,
    index: 2,
  },
  {
    day: "周三",
    date: "2025-12-03",
    distance: 7.1,
    calories: 450,
    pace: 5.2,
    index: 3,
  },
  {
    day: "周四",
    date: "2025-12-04",
    distance: 4.5,
    calories: 280,
    pace: 6.0,
    index: 4,
  },
  {
    day: "周五",
    date: "2025-12-05",
    distance: 10.0,
    calories: 680,
    pace: 5.1,
    index: 5,
  },
  {
    day: "周六",
    date: "2025-12-06",
    distance: 3.0,
    calories: 190,
    pace: 6.5,
    index: 6,
  },
  {
    day: "周日",
    date: "2025-12-07",
    distance: 12.5,
    calories: 810,
    pace: 4.5,
    index: 7,
  },
];
const primaryColor = "#6366f1"; // 每日跑量颜色
const secondaryColor = "#f97316"; // 卡路里消耗颜色
export default function KcalChart() {
  // const theme = useColorScheme();
  const isDark = false;
  const axisColor = isDark ? "#94a3b8" : "#64748b";
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
      // 确保 Tooltip 的渲染模式适用于 Native
      renderInPortal: false,
    },
  };
  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl pt-2 pb-2  tems-center">
      <VictoryChart
        width={CHART_WIDTH}
        height={200}
        padding={{ top:10, bottom: 20, left: 30, right: 20 }}
      >
        {/* X 轴 */}
        <VictoryAxis
          style={customTheme.axis.style}
          tickValues={WEEKLY_DATA.map((d) => d.day)}
        />
        {/* Y 轴 (带网格线) */}
        <VictoryAxis
          dependentAxis
          style={customTheme.axis.style}
          tickFormat={(t) => Math.round(t / 100) * 100} // Y 轴刻度显示为整百
        />

        {/* 1. 曲线填充区域 */}
        <VictoryArea
          data={WEEKLY_DATA}
          x="day"
          y="calories"
          labels={({ datum }) =>
            datum.calories > 0 ? `${datum.calories} km` : ""
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
          data={WEEKLY_DATA}
          x="day"
          y="calories"
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
          data={WEEKLY_DATA}
          x="day"
          y="calories"

          style={{
            data: {
              fill: "transparent",
              stroke: "transparent",
            },
          }}
        />
      </VictoryChart>
    </View>
  );
}
