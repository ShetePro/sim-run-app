import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image"; // 高性能图片组件
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

// 模拟用户信息数据
const USER_MOCK = {
  name: "Runner Alex",
  email: "alex.runner@example.com",
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  stats: {
    totalDistance: "1,240",
    totalRuns: 142,
    badges: 12,
  },
};

export default function UserProfileScreen() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");

  // 处理主题切换
  const handleThemeToggle = () => {
    toggleColorScheme();
    setIsDark(!isDark);
  };

  // 处理注销
  const handleLogout = () => {
    Alert.alert("退出登录", "确定要退出当前账号吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "退出",
        style: "destructive",
        onPress: () => console.log("Logged out"),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* --- 头部：个人信息与概览 --- */}
        <View className="px-6 pt-8 pb-6 bg-white dark:bg-slate-800 rounded-b-3xl  mb-6">
          <View className="flex-row items-center mb-6">
            <Image
              source={USER_MOCK.avatar}
              className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-indigo-900"
              contentFit="cover"
              transition={500}
            />
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold text-slate-800 dark:text-white">
                {USER_MOCK.name}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm">
                {USER_MOCK.email}
              </Text>
              <TouchableOpacity className="mt-2 bg-indigo-50 dark:bg-indigo-900/30 self-start px-3 py-1 rounded-full">
                <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                  编辑资料
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 跑步核心数据 (Gamification) */}
          <View className="flex-row justify-between bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl">
            <StatItem
              label="累计公里"
              value={USER_MOCK.stats.totalDistance}
              unit="km"
            />
            <View className="w-[1px] bg-slate-200 dark:bg-slate-600 h-8 self-center" />
            <StatItem label="跑步次数" value={USER_MOCK.stats.totalRuns} />
            <View className="w-[1px] bg-slate-200 dark:bg-slate-600 h-8 self-center" />
            <StatItem
              label="获得徽章"
              value={USER_MOCK.stats.badges}
              icon="medal-outline"
            />
          </View>
        </View>

        {/* --- 设置分组 1: 应用偏好 --- */}
        <View className="px-5 mb-2">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
            偏好设置
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden ">
            <MenuItem
              icon="language"
              color="#3B82F6"
              label="语言 / Language"
              value="中文"
              onPress={() => console.log("Open Language Modal")}
            />
            <MenuDivider />
            <View className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg items-center justify-center bg-purple-100 dark:bg-purple-900/30 mr-3">
                  <Ionicons name="moon" size={18} color="#A855F7" />
                </View>
                <Text className="text-base text-slate-700 dark:text-slate-200 font-medium">
                  深色模式
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{ false: "#767577", true: "#818cf8" }}
                thumbColor={isDark ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* --- 设置分组 2: 跑步工具 --- */}
        <View className="px-5 mt-4 mb-2">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
            跑步工具
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden ">
            <MenuItem
              icon="map-outline"
              color="#10B981"
              label="离线地图管理"
              onPress={() => console.log("Nav to Offline Maps")}
            />
            <MenuDivider />
            <MenuItem
              icon="heart-outline"
              color="#EF4444"
              label="健康数据同步"
              value="已连接"
              onPress={() => console.log("Nav to Health")}
            />
            <MenuDivider />
            <MenuItem
              icon="notifications-outline"
              color="#F59E0B"
              label="消息通知"
              onPress={() => console.log("Nav to Notifications")}
            />
          </View>
        </View>

        {/* --- 设置分组 3: 其他 --- */}
        <View className="px-5 mt-4 mb-8">
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden ">
            <MenuItem
              icon="help-circle-outline"
              color="#64748B"
              label="帮助与反馈"
            />
            <MenuDivider />
            <MenuItem
              icon="information-circle-outline"
              color="#64748B"
              label="关于我们"
              value="v1.0.0"
            />
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            className="mt-6 flex-row items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="ml-2 text-red-500 font-semibold text-base">
              退出登录
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-slate-400 text-xs mt-6 mb-10">
            SimRun App © 2025
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- 子组件：统计项 ---
const StatItem = ({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: any;
}) => (
  <View className="items-center flex-1">
    <View className="flex-row items-end">
      <Text className="text-xl font-bold text-slate-800 dark:text-white">
        {value}
      </Text>
      {unit && (
        <Text className="text-xs text-slate-500 mb-1 ml-0.5">{unit}</Text>
      )}
    </View>
    <View className="flex-row items-center mt-1">
      {icon && (
        <Ionicons
          name={icon}
          size={10}
          color="#64748B"
          style={{ marginRight: 2 }}
        />
      )}
      <Text className="text-xs text-slate-400 font-medium">{label}</Text>
    </View>
  </View>
);

// --- 子组件：菜单项 ---
interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  value?: string;
  onPress?: () => void;
}

const MenuItem = ({ icon, color, label, value, onPress }: MenuItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800"
  >
    <View className="flex-row items-center">
      <View
        className="w-8 h-8 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: `${color}20` }} // 20% opacity using hex
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="text-base text-slate-700 dark:text-slate-200 font-medium">
        {label}
      </Text>
    </View>

    <View className="flex-row items-center">
      {value && <Text className="text-slate-400 text-sm mr-2">{value}</Text>}
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </View>
  </TouchableOpacity>
);

// --- 子组件：分割线 ---
const MenuDivider = () => (
  <View className="h-[1px] bg-slate-100 dark:bg-slate-700 ml-[52px]" />
);
