import React from 'react';
import { View, Text, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DataCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  colorHex: string;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 40 - 15) / 2;

export default function HomeDataCard({ label, value, unit, icon, colorHex }: DataCardProps) {
  const activeColor = colorHex || "#6366f1";

  return (
    <View
      // 1. 【关键】卡片基色：亮色模式下为白色，暗黑模式下为深色
      className="rounded-3xl p-5 mb-4 justify-between overflow-hidden relative shadow-md bg-white dark:bg-slate-800"
      style={{
        width: cardWidth,
        minHeight: 120,
        // iOS 阴影增强立体感
        shadowColor: activeColor,
        shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
        shadowRadius: 10,
        elevation: 2, // Android 阴影（基础）
      }}
    >
      {/* 2. 【关键】背景层：在深色模式下提高透明度 */}
      <View
        // 调整 opacity：亮色模式 10%，暗黑模式 20%
        className="absolute inset-0 opacity-10 dark:opacity-20"
        style={{ backgroundColor: activeColor }}
      />

      {/* 3. 装饰性背景图标：在暗黑模式下也可以看到 */}
      <View className="absolute -right-4 -bottom-4 opacity-10 dark:opacity-5">
        <Ionicons name={icon} size={80} color={activeColor} />
      </View>

      {/* 4. 内容层 */}
      <View>
        <View className="flex-row items-center mb-4">
          <Ionicons name={icon} size={18} color={activeColor} />
          <Text
            // 确保标题文字在深色背景下可见
            className="text-xs font-bold uppercase tracking-wider ml-2 opacity-80"
            style={{ color: activeColor }}
          >
            {label}
          </Text>
        </View>

        <View className="flex-row items-end">
          <Text
            // 确保数值在深色背景下为白色
            className="text-3xl font-black text-slate-800 dark:text-white"
          >
            {value}
          </Text>
          {unit && (
            <Text
              // 确保单位文字在深色背景下为浅灰
              className="text-sm font-medium text-slate-400 dark:text-slate-400 mb-1 ml-1"
            >
              {unit}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
