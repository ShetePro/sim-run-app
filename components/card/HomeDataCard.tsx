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
      <View
        className="absolute inset-0 opacity-10 dark:opacity-20"
        style={{ backgroundColor: activeColor }}
      />

      <View className="absolute -right-4 -bottom-4 opacity-10 dark:opacity-5">
        <Ionicons name={icon} size={80} color={activeColor} />
      </View>

      <View>
        <View className="flex-row items-center mb-4">
          <Ionicons name={icon} size={18} color={activeColor} />
          <Text
            className="text-xs font-bold uppercase tracking-wider ml-2 opacity-80"
            style={{ color: activeColor }}
          >
            {label}
          </Text>
        </View>

        <View className="flex-row items-end">
          <Text
            className="text-3xl font-black text-slate-800 dark:text-white"
          >
            {value}
          </Text>
          {unit && (
            <Text
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
