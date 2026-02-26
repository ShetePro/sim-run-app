import MapView, { MapType, Marker, Polyline, Region } from "react-native-maps";
import {
  StyleProp,
  ViewStyle,
  Image,
  Platform,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ThemedText } from "@/components/ThemedText";
import { useSettingsStore, PATH_COLOR_NAMES } from "@/store/settingsStore";
import { filterValidCoordinates } from "@/utils/map/coordinates";
import { MapLoading } from "./MapLoading";
import { Ionicons } from "@expo/vector-icons";

interface MapProps {
  style?: StyleProp<ViewStyle>;
  className?: string;
  heading: number;
  location: LatLon | null;
  // 可选的路径点，用于显示跑步轨迹
  path?: LatLon[];
}

/**
 * 将 zoom 级别转换为 latitudeDelta
 * zoom 20 对应的 latitudeDelta 约为 0.000343
 */
function zoomToLatitudeDelta(zoom: number): number {
  // latitudeDelta = 360 / 2^zoom
  return 360 / Math.pow(2, zoom);
}

/**
 * 计算比例尺的宽度（米）
 * 根据当前地图的缩放级别计算合适的比例尺
 */
function getScaleWidth(
  latitudeDelta: number,
  screenWidth: number,
): { width: number; label: string } {
  // 地球周长约 40075000 米
  const earthCircumference = 40075000;

  // 计算当前缩放级别下屏幕宽度对应的实际距离（米）
  // latitudeDelta 是纬度跨度，1度纬度约 111km
  const metersPerDegree = earthCircumference / 360;
  const metersPerScreen = latitudeDelta * metersPerDegree;

  // 比例尺占屏幕宽度的 1/4
  const scaleMeters = metersPerScreen / 4;

  // 取整到合适的数值
  const scales = [
    { value: 10, label: "10 m" },
    { value: 20, label: "20 m" },
    { value: 50, label: "50 m" },
    { value: 100, label: "100 m" },
    { value: 200, label: "200 m" },
    { value: 500, label: "500 m" },
    { value: 1000, label: "1 km" },
    { value: 2000, label: "2 km" },
    { value: 5000, label: "5 km" },
    { value: 10000, label: "10 km" },
    { value: 20000, label: "20 km" },
    { value: 50000, label: "50 km" },
  ];

  // 找到最接近但不大于 scaleMeters 的刻度
  let closestScale = scales[0];
  for (const scale of scales) {
    if (scale.value <= scaleMeters) {
      closestScale = scale;
    } else {
      break;
    }
  }

  // 计算比例尺在屏幕上的宽度（像素）
  const pixelWidth = (closestScale.value / metersPerScreen) * screenWidth;

  return { width: pixelWidth, label: closestScale.label };
}

/**
 * 自定义比例尺组件
 */
function ScaleBar({
  latitudeDelta,
  screenWidth,
  visible,
}: {
  latitudeDelta: number;
  screenWidth: number;
  visible: boolean;
}) {
  if (!visible || !latitudeDelta || latitudeDelta <= 0) return null;

  const { width, label } = getScaleWidth(latitudeDelta, screenWidth);

  // 限制最大宽度
  const displayWidth = Math.min(Math.max(width, 30), 120);

  return (
    <View
      className="absolute bottom-4 left-4 bg-white/80 dark:bg-slate-800/80 px-2 py-1.5 rounded-lg"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
      }}
    >
      {/* 比例尺线条 - 上方横线 + 两侧竖线 */}
      <View className="flex-row items-end mb-1" style={{ width: displayWidth }}>
        <View className="w-0.5 h-2 bg-slate-700 dark:bg-slate-300" />
        <View className="flex-1 h-0.5 bg-slate-700 dark:bg-slate-300" />
        <View className="w-0.5 h-2 bg-slate-700 dark:bg-slate-300" />
      </View>
      {/* 标签 */}
      <Text className="text-xs text-slate-700 dark:text-slate-300 font-medium text-center">
        {label}
      </Text>
    </View>
  );
}

function Map({ style, heading, location, path }: MapProps) {
  const mapRef = useRef<MapView>(null);
  const [showMark, setShowMark] = useState<boolean>(false);
  const [region, setRegion] = useState<Region | null>(null);
  const [mapLayout, setMapLayout] = useState({ width: 0, height: 0 });

  // 本地跟随状态 - 用户手动操作后自动关闭跟随
  const [isFollowingUser, setIsFollowingUser] = useState<boolean>(false);
  // 标记是否是代码触发的区域变化（而非用户操作）
  const isProgrammaticChange = useRef(false);

  // 读取地图设置
  const { settings, updateSetting } = useSettingsStore();
  const { map: mapSettings } = settings;

  // 初始化时同步全局设置到本地状态
  useEffect(() => {
    setIsFollowingUser(mapSettings.followUserLocation);
  }, [mapSettings.followUserLocation]);

  // 地图类型转换
  const mapType: MapType = useMemo(() => {
    switch (mapSettings.mapType) {
      case "satellite":
        return "satellite";
      case "hybrid":
        return "hybrid";
      case "standard":
      default:
        return "standard";
    }
  }, [mapSettings.mapType]);

  // 路径颜色
  const pathColor = useMemo(() => {
    return PATH_COLOR_NAMES[mapSettings.pathColor]?.color || "#3B82F6";
  }, [mapSettings.pathColor]);

  useEffect(() => {
    const isShowMark =
      location && !(location.latitude === 0 && location.longitude === 0);
    setShowMark(!!isShowMark);

    // 只有在跟随位置开启时才自动移动地图
    if (isFollowingUser && location) {
      isProgrammaticChange.current = true;
      const zoom = 20;
      mapRef.current?.animateCamera({
        center: {
          longitude: location.longitude || 0,
          latitude: location.latitude || 0,
        },
        pitch: mapSettings.tiltEnabled ? 45 : 0,
        zoom,
      });
      // 手动更新 region 状态（animateCamera 不会触发 onRegionChangeComplete）
      const newLatitudeDelta = zoomToLatitudeDelta(zoom);
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: newLatitudeDelta,
        longitudeDelta: newLatitudeDelta,
      });
    }
  }, [location, heading, isFollowingUser, mapSettings.tiltEnabled]);

  // 处理用户手动拖拽地图 - 取消跟随
  const handlePanDrag = useCallback(() => {
    if (isFollowingUser) {
      setIsFollowingUser(false);
      // 同时更新全局设置
      updateSetting("map.followUserLocation", false);
    }
  }, [isFollowingUser, updateSetting]);

  // 恢复跟随位置
  const handleResumeFollow = useCallback(() => {
    setIsFollowingUser(true);
    updateSetting("map.followUserLocation", true);
    // 立即移动到当前位置
    if (location) {
      isProgrammaticChange.current = true;
      const zoom = 20;
      mapRef.current?.animateCamera({
        center: {
          longitude: location.longitude || 0,
          latitude: location.latitude || 0,
        },
        pitch: mapSettings.tiltEnabled ? 45 : 0,
        zoom,
      });
      // 手动更新 region 状态（animateCamera 不会触发 onRegionChangeComplete）
      const newLatitudeDelta = zoomToLatitudeDelta(zoom);
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: newLatitudeDelta,
        longitudeDelta: newLatitudeDelta,
      });
    }
  }, [location, mapSettings.tiltEnabled, updateSetting]);

  // 处理区域变化，用于更新比例尺
  const handleRegionChange = useCallback((newRegion: Region) => {
    // 如果是代码触发的变化，跳过更新避免重复
    if (isProgrammaticChange.current) {
      isProgrammaticChange.current = false;
      return;
    }
    setRegion(newRegion);
  }, []);

  // 处理布局变化，获取地图尺寸
  const handleLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setMapLayout({ width, height });
  }, []);

  if (!location) {
    return <MapLoading style={style} />;
  }

  return (
    <View style={style} className="relative" onLayout={handleLayout}>
      <MapView
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        provider={Platform.OS === "android" ? "google" : undefined}
        mapType={mapType}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }}
        // 地图显示设置 - 使用 react-native-maps 原生属性
        showsUserLocation={mapSettings.showUserLocation}
        followsUserLocation={false}
        showsCompass={mapSettings.showCompass} // 原生指南针（iOS）
        showsScale={false} // 禁用原生比例尺，使用自定义
        showsBuildings={true} // 始终显示建筑
        showsTraffic={mapSettings.showTraffic} // 交通状况
        showsPointsOfInterest={mapSettings.showPOI} // 兴趣点
        showsIndoors={false}
        // 交互手势设置
        zoomEnabled={mapSettings.zoomEnabled} // 缩放
        rotateEnabled={mapSettings.rotateEnabled} // 旋转
        scrollEnabled={mapSettings.scrollEnabled} // 滚动/平移
        pitchEnabled={mapSettings.pitchEnabled} // 倾斜手势
        // 区域变化回调
        onRegionChangeComplete={handleRegionChange}
        // 用户拖拽手势 - 取消跟随
        onPanDrag={handlePanDrag}
      >
        {/* 当前位置标记（仅当不显示用户位置或需要自定义标记时） */}
        {showMark && !mapSettings.showUserLocation && (
          <Marker
            coordinate={location}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={heading}
          >
            <Image
              source={require("../../assets/images/map-position.png")}
              style={{
                width: 20,
                height: 20,
                transform: [{ rotate: `${heading}deg` }],
              }}
            />
          </Marker>
        )}

        {/* 跑步路径 */}
        {path &&
          path.length > 1 &&
          (() => {
            const validPath = filterValidCoordinates(path);
            return validPath.length > 1 ? (
              <Polyline
                coordinates={validPath}
                strokeColor={pathColor}
                strokeWidth={mapSettings.pathWidth}
              />
            ) : null;
          })()}
      </MapView>

      {/* 自定义比例尺 - 跨平台可靠 */}
      <ScaleBar
        latitudeDelta={region?.latitudeDelta || 0.001}
        screenWidth={mapLayout.width}
        visible={mapSettings.showScale}
      />

      {/* 恢复跟随位置按钮 - 当用户手动操作后显示 */}
      {!isFollowingUser && location && (
        <TouchableOpacity
          onPress={handleResumeFollow}
          className="absolute bottom-20 right-4 bg-white dark:bg-slate-800 w-12 h-12 rounded-full items-center justify-center shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons name="locate" size={24} color="#6366F1" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default Map;
