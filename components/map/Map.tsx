import MapView, { Marker } from "react-native-maps";
import { Animated, Image, StyleProp, View, ViewStyle } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState, useRef } from "react";
import { ThemedText } from "@/components/ThemedText";

function Map({
  style,
  className,
  location,
}: {
  style?: StyleProp<ViewStyle>;
  className?: string;
  location: { latitude: number; longitude: number } | null;
}) {
  const mapRef = useRef<MapView>(null);
  if (!location) {
    return <ThemedText>加载中...</ThemedText>;
  }
  return (
    <MapView
      ref={mapRef}
      style={style}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      }}
      showsUserLocation={true}
      followsUserLocation={true}
    ></MapView>
  );
}

export default Map;
