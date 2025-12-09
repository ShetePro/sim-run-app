import { Dimensions, View } from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryTooltip,
  VictoryAxis
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
export default function RunBarChart() {
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
    <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 items-center">
      <VictoryChart
        width={CHART_WIDTH}
        height={200}
        padding={{ top: 0, bottom: 20, left: 30, right: 10 }}
        domainPadding={{ x: 20 }}
        theme={VictoryTheme.material} // 使用默认主题或 customTheme
      >
        {/* X 轴 */}
        <VictoryAxis
          style={customTheme.axis.style}
          tickValues={WEEKLY_DATA.map((d) => d.day)}
          // 确保刻度值是 x 键的域
          tickFormat={WEEKLY_DATA.map((d) => d.day)}
        />
        {/* Y 轴 (带网格线，但隐藏轴线) */}
        <VictoryAxis
          dependentAxis
          style={{ ...customTheme.axis.style, grid: { stroke: "transparent" } }} // 隐藏 Y 轴网格线
          // domain={[0, 15]} // 可选：设置 Y 轴域
        />

        <VictoryBar
          data={WEEKLY_DATA}
          x="day"
          y="distance"
          style={{
            data: {
              fill: ({ datum }) =>
                datum.distance > 0
                  ? primaryColor
                  : isDark
                    ? "#334155"
                    : "#e2e8f0",
              width: 20,
            },
          }}
          // 启用交互性，Tooltip 内容为 distance
          labels={({ datum }) =>
            datum.distance > 0 ? `${datum.distance} km` : ""
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
        />
      </VictoryChart>
    </View>
  );
}
