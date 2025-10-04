import MapView from "react-native-maps";
import { StyleProp, ViewStyle } from "react-native";
function Map({
  style,
  className,
}: {
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  return (
    <MapView
      className={className}
      style={style}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    ></MapView>
  );
}

export default Map;
