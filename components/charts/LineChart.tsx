import { Dimensions, View, Text } from "react-native";
import {CartesianChart, Line, useChartPressState} from "victory-native";
import {Circle, useFont} from "@shopify/react-native-skia";
import {SharedValue} from "react-native-reanimated";
const DATA = Array.from({ length: 31 }, (_, i) => ({
  day: i,
  highTmp: 40 + 30 * Math.random(),
}));
export default function LineChart() {
  const font = useFont(require('@/assets/fonts/Poppins-Bold.ttf'), 12);
  const { state, isActive } = useChartPressState({ x: 0, y: { highTmp: 0 } });
  return (
    <View style={{flex: 1, width: '100%', height: 200, padding: 10}}>
      <CartesianChart
        data={DATA}
        xKey="day"
        yKeys={["highTmp"]}
        axisOptions={{ font }}
        chartPressState={state}
      >
        {({ points }) => (
          <>
            <Line points={points.highTmp} color="red" strokeWidth={3} />
            {isActive && (
              <ToolTip x={state.x.position} y={state.y.highTmp.position} />
            )}
          </>
        )}
      </CartesianChart>
    </View>
  );
}
function ToolTip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
  return <Circle cx={x} cy={y} r={8} color="black" />;
}
