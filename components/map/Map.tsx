import MapView, { MapType, Marker, Polyline } from "react-native-maps";
import { StyleProp, ViewStyle, Image, Platform } from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
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

  if (!location) {
    return <ThemedText>获取位置中...</ThemedText>;
  }

  return (
    <MapView
      ref={mapRef}
      style={style}
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
      showsCompass={mapSettings.showCompass}
      showsScale={mapSettings.showScale}
      showsBuildings={mapSettings.showBuildings}
      showsTraffic={false}
      showsIndoors={false}
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
  );
}

export default Map;
