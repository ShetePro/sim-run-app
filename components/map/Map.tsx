import MapView, { MapType, Marker, Polyline, Region } from "react-native-maps";
import { StyleProp, ViewStyle, Image, Platform, View } from "react-native";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ThemedText } from "@/components/ThemedText";
import { useSettingsStore, PATH_COLOR_NAMES } from "@/store/settingsStore";

interface MapProps {
  style?: StyleProp<ViewStyle>;
  className?: string;
  heading: number;
  location: LatLon | null;
  // 可选的路径点，用于显示跑步轨迹
  path?: LatLon[];
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
        pitch: mapSettings.tiltEnabled ? 45 : 0,
        zoom: 20,
      });
    }
  }, [location, heading, mapSettings.followUserLocation, mapSettings.tiltEnabled]);

  // 处理区域变化
  const handleRegionChange = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  if (!location) {
    return <ThemedText>获取位置中...</ThemedText>;
  }

  return (
    <View style={style} className="relative">
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
        showsCompass={mapSettings.showCompass}      // 原生指南针
        showsScale={mapSettings.showScale}          // 原生比例尺
        showsBuildings={true}                       // 始终显示建筑
        showsTraffic={mapSettings.showTraffic}      // 交通状况
        showsPointsOfInterest={mapSettings.showPOI} // 兴趣点
        showsIndoors={false}
        // 交互手势设置
        zoomEnabled={mapSettings.zoomEnabled}       // 缩放
        rotateEnabled={mapSettings.rotateEnabled}   // 旋转
        scrollEnabled={mapSettings.scrollEnabled}   // 滚动/平移
        pitchEnabled={mapSettings.pitchEnabled}     // 倾斜手势
        // 区域变化回调
        onRegionChangeComplete={handleRegionChange}
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
    </View>
  );
}

export default Map;
