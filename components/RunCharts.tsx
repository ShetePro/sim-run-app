import React from "react";
import { View, Text, Dimensions } from "react-native";
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
} from "victory-native";

interface RunChartsProps {
  paceTrend: { x: number; y: number }[];
  altitudeProfile: { x: number; y: number }[];
  lapPaces: { km: number; pace: number; time: number }[];
  colorScheme: "light" | "dark";
  t: (key: string) => string;
}

export function RunCharts({
  paceTrend,
  altitudeProfile,
  lapPaces,
  colorScheme,
  t,
}: RunChartsProps) {
  const isDark = colorScheme === "dark";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const chartWidth = Dimensions.get("window").width - 60;

  // 如果没有数据，不显示
  if (
    paceTrend.length === 0 &&
    altitudeProfile.length === 0 &&
    lapPaces.length === 0
  ) {
    return null;
  }

  return (
    <View className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
      <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
        {t("run.charts") || "数据图表"}
      </Text>

      {/* 配速趋势折线图 */}
      {paceTrend.length > 0 && (
        <View className="mb-6">
          <Text className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {t("run.paceTrend") || "配速趋势"}
          </Text>
          <VictoryChart
            theme={VictoryTheme.material}
            width={chartWidth}
            height={200}
            padding={{ left: 50, right: 30, top: 20, bottom: 40 }}
          >
            <VictoryAxis
              label={t("run.distance") || "距离 (km)"}
              style={{
                axisLabel: { fontSize: 10, padding: 30, fill: axisColor },
                tickLabels: { fontSize: 10, fill: axisColor },
                grid: { stroke: gridColor },
              }}
            />
            <VictoryAxis
              dependentAxis
              label={t("run.pace") || "配速 (s/km)"}
              style={{
                axisLabel: { fontSize: 10, padding: 40, fill: axisColor },
                tickLabels: { fontSize: 10, fill: axisColor },
                grid: { stroke: gridColor },
              }}
            />
            <VictoryLine
              data={paceTrend}
              style={{
                data: { stroke: "#6366f1", strokeWidth: 2 },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
            />
          </VictoryChart>
        </View>
      )}

      {/* 海拔剖面面积图 */}
      {altitudeProfile.length > 0 && (
        <View className="mb-6">
          <Text className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {t("run.altitudeProfile") || "海拔剖面"}
          </Text>
          <VictoryChart
            theme={VictoryTheme.material}
            width={chartWidth}
            height={180}
            padding={{ left: 50, right: 30, top: 20, bottom: 40 }}
          >
            <VictoryAxis
              label={t("run.distance") || "距离 (km)"}
              style={{
                axisLabel: { fontSize: 10, padding: 30, fill: axisColor },
                tickLabels: { fontSize: 10, fill: axisColor },
                grid: { stroke: gridColor },
              }}
            />
            <VictoryAxis
              dependentAxis
              label={t("run.altitude") || "海拔 (m)"}
              style={{
                axisLabel: { fontSize: 10, padding: 40, fill: axisColor },
                tickLabels: { fontSize: 10, fill: axisColor },
                grid: { stroke: gridColor },
              }}
            />
            <VictoryArea
              data={altitudeProfile}
              style={{
                data: {
                  fill: "#10b981",
                  fillOpacity: 0.3,
                  stroke: "#10b981",
                  strokeWidth: 2,
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
            />
          </VictoryChart>
        </View>
      )}

      {/* 分段配速柱状图 */}
      {lapPaces.length > 0 && (
        <View>
          <Text className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            {t("run.lapPaceChart") || "分段配速对比"}
          </Text>
          <VictoryChart
            theme={VictoryTheme.material}
            width={chartWidth}
            height={200}
            padding={{ left: 60, right: 30, top: 20, bottom: 60 }}
            domainPadding={{ x: 20 }}
          >
            <VictoryAxis
              label={t("run.km") || "公里"}
              style={{
                axisLabel: { fontSize: 10, padding: 40, fill: axisColor },
                tickLabels: { fontSize: 10, fill: axisColor },
                grid: { stroke: "transparent" },
              }}
            />
            <VictoryAxis
              dependentAxis
              label={t("run.pace") || "配速 (s/km)"}
              style={{
                axisLabel: { fontSize: 10, padding: 45, fill: axisColor },
                tickLabels: { fontSize: 10, fill: axisColor },
                grid: { stroke: gridColor },
              }}
            />
            <VictoryBar
              data={lapPaces.map((lap, idx) => ({
                x: `${lap.km}km`,
                y: lap.pace,
                fill: idx % 2 === 0 ? "#6366f1" : "#8b5cf6",
              }))}
              style={{
                data: { fill: ({ datum }: any) => datum.fill },
              }}
              animate={{
                duration: 500,
                onLoad: { duration: 300 },
              }}
            />
          </VictoryChart>
        </View>
      )}
    </View>
  );
}

export default RunCharts;
