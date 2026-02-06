import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { SwitchItem } from "@/components/ui/SwitchItem";
import { Divider } from "@/components/ui/Divider";
import {
  useSettingsStore,
  MAP_TYPE_NAMES,
  PATH_COLOR_NAMES,
  PATH_WIDTH_OPTIONS,
  MapType,
  PathColor,
} from "@/store/settingsStore";

export default function MapSettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { settings, updateSetting, isLoaded, initialize } = useSettingsStore();
  const { map } = settings;

  // 初始化设置
  useEffect(() => {
    if (!isLoaded) {
      initialize();
    }
  }, []);

  // 地图类型选择
  const handleMapTypeSelect = (type: MapType) => {
    updateSetting("map.mapType", type);
  };

  // 路径颜色选择
  const handlePathColorSelect = (color: PathColor) => {
    updateSetting("map.pathColor", color);
  };

  // 路径宽度选择
  const handlePathWidthSelect = (width: number) => {
    updateSetting("map.pathWidth", width);
  };

  // 地图类型选择器
  const renderMapTypeSelector = () => (
    <View className="flex-row gap-2 mt-2">
      {(Object.keys(MAP_TYPE_NAMES) as MapType[]).map((type) => (
        <TouchableOpacity
          key={type}
          onPress={() => handleMapTypeSelect(type)}
          className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-xl border ${
            map.mapType === type
              ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
              : "bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700"
          }`}
        >
          <Ionicons
            name={MAP_TYPE_NAMES[type].icon as keyof typeof Ionicons.glyphMap}
            size={18}
            color={map.mapType === type ? "#3B82F6" : "#6B7280"}
          />
          <Text
            className={`ml-2 text-sm font-medium ${
              map.mapType === type
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {t(`mapSettings.mapType.${type}`) || MAP_TYPE_NAMES[type].name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // 路径颜色选择器
  const renderPathColorSelector = () => (
    <View className="flex-row gap-3 mt-2">
      {(Object.keys(PATH_COLOR_NAMES) as PathColor[]).map((color) => (
        <TouchableOpacity
          key={color}
          onPress={() => handlePathColorSelect(color)}
          className={`items-center ${
            map.pathColor === color ? "opacity-100" : "opacity-60"
          }`}
        >
          <View
            className={`w-10 h-10 rounded-full border-2 ${
              map.pathColor === color
                ? "border-slate-800 dark:border-white"
                : "border-transparent"
            }`}
            style={{ backgroundColor: PATH_COLOR_NAMES[color].color }}
          />
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t(`mapSettings.pathColor.${color}`) || PATH_COLOR_NAMES[color].name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // 路径宽度选择器
  const renderPathWidthSelector = () => (
    <View className="flex-row gap-2 mt-2">
      {PATH_WIDTH_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => handlePathWidthSelect(option.value)}
          className={`flex-1 items-center py-3 rounded-xl border ${
            map.pathWidth === option.value
              ? "bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
              : "bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700"
          }`}
        >
          <View
            className="rounded-full mb-2"
            style={{
              width: 30,
              height: option.value,
              backgroundColor: PATH_COLOR_NAMES[map.pathColor].color,
            }}
          />
          <Text
            className={`text-xs font-medium ${
              map.pathWidth === option.value
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {t(`mapSettings.pathWidth.${option.value}`) || option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500 dark:text-slate-400">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* --- 头部导航 --- */}
        <View className="flex-row items-center px-4 py-3 bg-white dark:bg-slate-800">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color={isDark ? "#fff" : "#1f2937"} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-slate-800 dark:text-white -ml-6">
            {t("mapSettings.title") || "地图设置"}
          </Text>
          <View className="w-8" />
        </View>

        {/* --- 地图类型 --- */}
        <View className="px-5 mt-4 mb-2">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
            {t("mapSettings.mapTypeTitle") || "地图类型"}
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-xl p-4">
            {renderMapTypeSelector()}
          </View>
        </View>

        {/* --- 显示选项 --- */}
        <View className="px-5 mt-4 mb-2">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
            {t("mapSettings.displayOptions") || "显示选项"}
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
            <SwitchItem
              icon="locate"
              title={t("mapSettings.showUserLocation") || "显示当前位置"}
              subtitle={t("mapSettings.showUserLocationDesc") || "在地图上显示您的位置"}
              value={map.showUserLocation}
              onValueChange={(value) => updateSetting("map.showUserLocation", value)}
              colorScheme="primary"
            />
            <Divider />
            <SwitchItem
              icon="navigate"
              title={t("mapSettings.followUserLocation") || "跟随位置"}
              subtitle={t("mapSettings.followUserLocationDesc") || "地图自动跟随您的移动"}
              value={map.followUserLocation}
              onValueChange={(value) => updateSetting("map.followUserLocation", value)}
              colorScheme="success"
            />
            <Divider />
            <SwitchItem
              icon="compass"
              title={t("mapSettings.showCompass") || "显示指南针"}
              subtitle={t("mapSettings.showCompassDesc") || "在地图上显示方向"}
              value={map.showCompass}
              onValueChange={(value) => updateSetting("map.showCompass", value)}
              colorScheme="purple"
            />
            <Divider />
            <SwitchItem
              icon="resize"
              title={t("mapSettings.showScale") || "显示比例尺"}
              subtitle={t("mapSettings.showScaleDesc") || "显示地图比例尺"}
              value={map.showScale}
              onValueChange={(value) => updateSetting("map.showScale", value)}
              colorScheme="primary"
            />
            <Divider />
            <SwitchItem
              icon="cube"
              title={t("mapSettings.tiltEnabled") || "3D 倾斜视角"}
              subtitle={t("mapSettings.tiltEnabledDesc") || "开启后地图呈倾斜视角（45度）"}
              value={map.tiltEnabled}
              onValueChange={(value) => updateSetting("map.tiltEnabled", value)}
              colorScheme="primary"
            />
            <Divider />
            <SwitchItem
              icon="car"
              title={t("mapSettings.showTraffic") || "显示交通状况"}
              subtitle={t("mapSettings.showTrafficDesc") || "在地图上显示实时交通信息"}
              value={map.showTraffic}
              onValueChange={(value) => updateSetting("map.showTraffic", value)}
              colorScheme="danger"
            />
            <Divider />
            <SwitchItem
              icon="pin"
              title={t("mapSettings.showPOI") || "显示兴趣点"}
              subtitle={t("mapSettings.showPOIDesc") || "显示商店、餐厅等地点标记"}
              value={map.showPOI}
              onValueChange={(value) => updateSetting("map.showPOI", value)}
              colorScheme="success"
            />
          </View>
        </View>

        {/* --- 交互设置 --- */}
        <View className="px-5 mt-4 mb-2">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
            {t("mapSettings.interaction") || "交互设置"}
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
            <SwitchItem
              icon="expand"
              title={t("mapSettings.zoomEnabled") || "允许缩放"}
              subtitle={t("mapSettings.zoomEnabledDesc") || "双指捏合缩放地图"}
              value={map.zoomEnabled}
              onValueChange={(value) => updateSetting("map.zoomEnabled", value)}
              colorScheme="primary"
            />
            <Divider />
            <SwitchItem
              icon="refresh-circle"
              title={t("mapSettings.rotateEnabled") || "允许旋转"}
              subtitle={t("mapSettings.rotateEnabledDesc") || "双指旋转地图方向"}
              value={map.rotateEnabled}
              onValueChange={(value) => updateSetting("map.rotateEnabled", value)}
              colorScheme="purple"
            />
            <Divider />
            <SwitchItem
              icon="hand-left"
              title={t("mapSettings.scrollEnabled") || "允许平移"}
              subtitle={t("mapSettings.scrollEnabledDesc") || "单指拖动移动地图"}
              value={map.scrollEnabled}
              onValueChange={(value) => updateSetting("map.scrollEnabled", value)}
              colorScheme="success"
            />
            <Divider />
            <SwitchItem
              icon="swap-vertical"
              title={t("mapSettings.pitchEnabled") || "允许倾斜"}
              subtitle={t("mapSettings.pitchEnabledDesc") || "双指上下滑动改变视角倾斜"}
              value={map.pitchEnabled}
              onValueChange={(value) => updateSetting("map.pitchEnabled", value)}
              colorScheme="warning"
            />
          </View>
        </View>

        {/* --- 路径样式 --- */}
        <View className="px-5 mt-4 mb-2">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
            {t("mapSettings.pathStyle") || "路径样式"}
          </Text>

          {/* 路径颜色 */}
          <View className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-3">
            <Text className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              {t("mapSettings.pathColorTitle") || "路径颜色"}
            </Text>
            {renderPathColorSelector()}
          </View>

          {/* 路径宽度 */}
          <View className="bg-white dark:bg-slate-800 rounded-xl p-4">
            <Text className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              {t("mapSettings.pathWidthTitle") || "路径粗细"}
            </Text>
            {renderPathWidthSelector()}
          </View>
        </View>

        {/* --- 其他设置 --- */}
        <View className="px-5 mt-4 mb-2">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
            {t("mapSettings.other") || "其他"}
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
            <SwitchItem
              icon="sunny"
              title={t("mapSettings.keepScreenOn") || "保持屏幕常亮"}
              subtitle={t("mapSettings.keepScreenOnDesc") || "跑步时防止屏幕自动锁定"}
              value={map.keepScreenOn}
              onValueChange={(value) => updateSetting("map.keepScreenOn", value)}
              colorScheme="warning"
            />
          </View>
        </View>

        {/* --- 重置按钮 --- */}
        <View className="px-5 mt-6 mb-8">
          <TouchableOpacity
            onPress={() => {
              const { resetGroup } = useSettingsStore.getState();
              resetGroup("map");
            }}
            className="flex-row items-center justify-center py-3 bg-slate-100 dark:bg-slate-800 rounded-xl"
          >
            <Ionicons name="refresh" size={18} color="#6B7280" />
            <Text className="ml-2 text-slate-600 dark:text-slate-400 font-medium">
              {t("mapSettings.reset") || "恢复默认设置"}
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-slate-400 text-xs mt-6">
            {t("mapSettings.tips") || "这些设置将影响跑步时的地图显示效果"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
