import MapView, { MapType, Marker, Polyline, Region } from "react-native-maps";
import { StyleProp, ViewStyle, Image, Platform, View, Text, TouchableOpacity } from "react-native";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ThemedText } from "@/components/ThemedText";
import { useSettingsStore, PATH_COLOR_NAMES } from "@/store/settingsStore";
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
 * 计算比例尺的宽度（米）
 * 根据当前地图的缩放级别计算合适的比例尺
 */
function getScaleWidth(latitudeDelta: number, screenWidth: number): { width: number; label: string } {
  // 地球周长约 40075000 米
  const earthCircumference = 40075000;
  
  // 计算当前缩放级别下屏幕宽度对应的实际距离（米）
  const metersPerScreen = earthCircumference * (latitudeDelta / 360);
  
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
 * 自定义指南针组件
 * 始终指向北方，点击恢复地图朝向
 */
function Compass({ 
  onPress,
  visible,
  isNorthUp = false,
}: { 
  onPress: () => void;
  visible: boolean;
  isNorthUp?: boolean;
}) {
  if (!visible) return null;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute top-4 right-4 w-12 h-12 bg-white/90 dark:bg-slate-800/90 rounded-full items-center justify-center shadow-lg"
      style={{ 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
      }}
      activeOpacity={0.8}
    >
      {/* 指南针始终指向北方，不随地图旋转 */}
      <View style={{ transform: [{ rotate: '0deg' }] }}>
        <Ionicons 
          name="compass" 
          size={28} 
          color={isNorthUp ? "#3B82F6" : "#F59E0B"} 
        />
      </View>
    </TouchableOpacity>
  );
}

/**
 * 自定义比例尺组件
 */
function ScaleBar({ 
  latitudeDelta, 
  screenWidth,
  visible 
}: { 
  latitudeDelta: number; 
  screenWidth: number;
  visible: boolean;
}) {
  if (!visible || !latitudeDelta) return null;
  
  const { width, label } = getScaleWidth(latitudeDelta, screenWidth);
  
  // 限制最大宽度
  const displayWidth = Math.min(width, 150);
  
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
      {/* 比例尺线条 */}
      <View 
        className="border-b-2 border-l-2 border-r-2 border-slate-700 dark:border-slate-300 h-2 mb-1"
        style={{ width: displayWidth }}
      />
      {/* 标签 */}
      <Text className="text-xs text-slate-700 dark:text-slate-300 font-medium text-center">
        {label}
      </Text>
    </View>
  );
}

function Map({
  style,
  heading,
  location,
  path,
}: MapProps) {
  const mapRef = useRef<MapView>(null);
  const [showMark, setShowMark] = useState<boolean>(false);
  const [region, setRegion] = useState<Region | null>(null);
  const [mapLayout, setMapLayout] = useState({ width: 0, height: 0 });
  
  // 读取地图设置
  const { settings } = useSettingsStore();
  const { map: mapSettings } = settings;

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
    if (mapSettings.followUserLocation) {
      mapRef.current?.animateCamera({
        center: {
          longitude: location?.longitude || 0,
          latitude: location?.latitude || 0,
        },
        pitch: mapSettings.showBuildings ? 45 : 0,
        zoom: 20,
      });
    }
  }, [location, heading, mapSettings.followUserLocation, mapSettings.showBuildings]);

  // 处理区域变化，用于更新比例尺
  const handleRegionChange = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  // 处理布局变化，获取地图尺寸
  const handleLayout = useCallback((event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setMapLayout({ width, height });
  }, []);

  // 当前地图朝向状态
  const [mapHeading, setMapHeading] = useState(0);
  
  // 处理相机变化，更新地图朝向
  const handleCameraChange = useCallback((event: any) => {
    const { heading } = event.nativeEvent;
    if (heading !== undefined) {
      setMapHeading(heading);
    }
  }, []);
  
  // 重置地图朝向北方
  const handleCompassPress = useCallback(() => {
    if (location) {
      // 只重置朝向，保持当前的 pitch 和 zoom
      mapRef.current?.animateCamera({
        center: {
          longitude: location.longitude,
          latitude: location.latitude,
        },
        heading: 0, // 朝向北方
        // 不设置 pitch，保持当前倾斜角度
      });
    }
  }, [location]);

  if (!location) {
    return <ThemedText>获取位置中...</ThemedText>;
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
        // 地图设置
        showsUserLocation={mapSettings.showUserLocation}
        followsUserLocation={false} // 我们手动控制相机移动
        showsCompass={false} // 使用自定义指南针
        showsScale={false} // 使用自定义比例尺
        showsBuildings={mapSettings.showBuildings}
        showsTraffic={false}
        showsIndoors={false}
        // 区域变化回调
        onRegionChangeComplete={handleRegionChange}
        // 相机变化回调（用于监听地图朝向）
        onCameraChange={handleCameraChange}
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
        {path && path.length > 1 && (
          <Polyline
            coordinates={path}
            strokeColor={pathColor}
            strokeWidth={mapSettings.pathWidth}
          />
        )}
      </MapView>

      {/* 自定义指南针 */}
      <Compass 
        onPress={handleCompassPress}
        visible={mapSettings.showCompass}
        isNorthUp={Math.abs(mapHeading) < 5 || Math.abs(mapHeading - 360) < 5}
      />

      {/* 自定义比例尺 */}
      <ScaleBar 
        latitudeDelta={region?.latitudeDelta || 0.001}
        screenWidth={mapLayout.width}
        visible={mapSettings.showScale}
      />
    </View>
  );
}

export default Map;
