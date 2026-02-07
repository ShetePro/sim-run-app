import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { secondFormatHours, dateFormat } from "@/utils/util";

interface RunRecord {
  id: number;
  distance: number;
  time: number;
  pace: number;
  startTime: number;
  points?: { lat: number; lng: number }[];
}

interface RecentActivityItemProps {
  record: RunRecord;
  onPress?: () => void;
  index?: number;
}

/**
 * 最近活动列表项组件
 * 显示在首页的最近跑步记录
 */
export function RecentActivityItem({
  record,
  onPress,
  index = 0,
}: RecentActivityItemProps) {
  const { t } = useTranslation();

  // 格式化距离
  const formatDistance = (distance: number) => {
    if (!distance) return "0.00";
    return (distance / 1000).toFixed(2);
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t("common.today") + " " + date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return t("common.yesterday") + " " + date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    } else {
      return dateFormat(timestamp);
    }
  };

  // 渐变色数组
  const gradients = [
    ["#6366F1", "#8B5CF6"], // 靛紫
    ["#3B82F6", "#06B6D4"], // 蓝青
    ["#10B981", "#14B8A6"], // 绿青
  ];

  const colors = gradients[index % gradients.length];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row items-center bg-white dark:bg-slate-800 rounded-2xl p-4 mb-3 shadow-sm"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* 左侧：渐变色块显示距离 */}
      <View
        className="w-16 h-16 rounded-xl items-center justify-center mr-4"
        style={{
          backgroundColor: colors[0],
        }}
      >
        <Text className="text-white font-bold text-lg">
          {formatDistance(record.distance)}
        </Text>
        <Text className="text-white/80 text-xs">km</Text>
      </View>

      {/* 中间：信息 */}
      <View className="flex-1">
        <Text className="text-slate-800 dark:text-white font-semibold text-base mb-1">
          {formatDate(record.startTime)}
        </Text>
        <View className="flex-row items-center">
          <View className="flex-row items-center mr-4">
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text className="text-slate-500 dark:text-slate-400 text-sm ml-1">
              {secondFormatHours(record.time)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="speedometer-outline" size={14} color="#6B7280" />
            <Text className="text-slate-500 dark:text-slate-400 text-sm ml-1">
              {record.pace ? secondFormatHours(record.pace) : "--"}
            </Text>
          </View>
        </View>
      </View>

      {/* 右侧：箭头 */}
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export default RecentActivityItem;
