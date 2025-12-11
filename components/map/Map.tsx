import MapView, { Marker } from "react-native-maps";
import { StyleProp, ViewStyle, Image, Platform } from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThemedText } from "@/components/ThemedText";

function Map({
  style,
  heading,
  location,
}: {
  style?: StyleProp<ViewStyle>;
  className?: string;
  heading: number;
  location: { latitude: number; longitude: number } | null;
}) {
  const mapRef = useRef<MapView>(null);
  const [showMark, setShowMark] = useState<boolean>(false);
  useEffect(() => {
    console.log(location, "location 当前位置");
    const isShowMark =
      location && !(location.latitude === 0 && location.longitude === 0);
    setShowMark(!!isShowMark);
    mapRef.current?.animateCamera({
      center: {
        longitude: location?.longitude || 0,
        latitude: location?.latitude || 0,
      },
      heading: heading ?? 0,
      pitch: 45,
      zoom: 20,
    });
  }, [location, heading]);
  if (!location) {
    return <ThemedText>获取位置中...</ThemedText>;
  }

  return (
    <MapView
      ref={mapRef}
      style={style}
      provider={Platform.OS === "android" ? "google" : undefined}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      }}
      showsUserLocation={false}
      followsUserLocation={true}
    >
      {showMark && (
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
    </MapView>
  );
}

export default Map;
