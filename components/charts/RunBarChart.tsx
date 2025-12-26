import { Dimensions, ScrollView, useColorScheme, View } from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryTooltip,
  VictoryAxis,
} from "victory-native";
const screenWidth = Dimensions.get("window").width;
const CHART_WIDTH = screenWidth - 60;
const primaryColor = "#6366f1";
export default function RunBarChart({
  chartData,
  axisX,
  type = "isoWeek",
}: {
  chartData?: any[];
  axisX?: string[];
  type: "isoWeek" | "month" | "year";
}) {
  const theme = useColorScheme();
  const isDark = theme === "dark";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const maxY = Math.max(...(chartData || []).map((d) => d.distance), 1);
  let labelWidth = maxY.toString().length * 8 + 10;
  if (labelWidth < 30) labelWidth = 30;
  const customTheme = {
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

  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      <View className="bg-white dark:bg-slate-800 rounded-2xl  items-center">
        <VictoryChart
          width={type === "month" ? CHART_WIDTH + 200 : CHART_WIDTH}
          height={200}
          padding={{ top: 10, bottom: 20, left: labelWidth, right: 10 }}
          domainPadding={{ x: 20 }}
          theme={VictoryTheme.material} // 使用默认主题或 customTheme
        >
          <VictoryAxis
            style={customTheme.axis.style}
            minDomain={1}
            tickValues={axisX}
            tickFormat={axisX}
          />
          <VictoryAxis
            dependentAxis
            style={{
              ...customTheme.axis.style,
              grid: { stroke: "transparent" },
            }} // 隐藏 Y 轴网格线
          />

          <VictoryBar
            data={chartData}
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
                width: type === "month" ? 10 : 20,
                minHeight: 10,
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
    </ScrollView>
  );
}
