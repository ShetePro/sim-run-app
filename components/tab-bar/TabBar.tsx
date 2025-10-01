import {
  View,
  Platform,
  StyleSheet,
  LayoutChangeEvent,
  useColorScheme,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useEffect, useLayoutEffect, useState } from "react";
import TabBarButton from "@/components/tab-bar/TabBarButton";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import CenterTabBarButton from "@/components/tab-bar/CenterTabBarButton";
import Svg, { Path } from "react-native-svg";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const theme = useColorScheme();
  useEffect(() => {
    console.log(theme, "theme toggle");
  }, [theme]);
  const [dimensions, setDimension] = useState({ height: 100, width: 300 });
  const colors = useThemeColor();
  const wrapPositionX = useSharedValue(0);
  const wrapAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: wrapPositionX.value }],
    };
  });
  const buttonWidth = dimensions.width / state.routes.length;
  function onTabBarLayout(e: LayoutChangeEvent) {
    setDimension({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  }
  const tabWidth = dimensions.width;
  const tabHeight = dimensions.height;
  const tabRadius = tabHeight / 2;
  const clipRadius = tabRadius;
  const clipBorderRadius = 5;
  function getTabBarItems() {
    const tabs = state.routes.map((route, index) => {
      const { options } = descriptors[route.key];
      const label =
        options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
            ? options.title
            : route.name;

      const isFocused = state.index === index;

      const onPress = () => {
        wrapPositionX.value = withSpring(buttonWidth * index, {
          duration: 1200,
          dampingRatio: 0.6,
        });
        const event = navigation.emit({
          type: "tabPress",
          target: route.key,
          canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
      };

      const onLongPress = () => {
        navigation.emit({
          type: "tabLongPress",
          target: route.key,
        });
      };
      return (
        <TabBarButton
          key={route.name}
          routeName={route.name}
          onPress={onPress}
          onLongPress={onLongPress}
          color={isFocused ? colors.active : colors.icon}
          label={label as string}
          isFocused={isFocused}
        />
      );
    });
    // 添加中间间隔
    const center = Math.floor(state.routes?.length / 2);
    tabs.splice(
      center,
      0,
      <View key={"center-empty"} style={{ marginHorizontal: 20 }}></View>,
    );
    return tabs;
  }
  return (
    <View style={[styles.container, styles.content]}>
      <CenterTabBarButton />
      <Svg
        style={styles.wrapper}
        height={tabHeight}
        width={tabWidth}
        viewBox={`0 0 ${tabWidth} ${tabHeight}`}
      >
        {/* 绘制下凹效果 */}
        <Path
          d={`M ${tabRadius} 0 A ${tabRadius},${tabRadius} 0,0,0 ${tabRadius},${tabHeight}
           L ${tabWidth - tabRadius} ${tabHeight}
           A ${tabRadius},${tabRadius} 0,0,0 ${tabWidth - tabRadius},0
           L ${tabWidth / 2 + clipRadius} 0
           A 10 10  0,0,0 ${tabWidth / 2 + clipRadius - 10} 10
           A ${clipRadius - 10} ${clipRadius - 10} 0,0,1 ${tabWidth / 2 - clipRadius + 10} 10
           A 10 10  0,0,0 ${tabWidth / 2 - clipRadius} 0
           L ${tabRadius} 0 z`}
          fill={colors.tabBackground} // 背景颜色
        />
      </Svg>
      <View style={{ ...styles.tabBar }} onLayout={onTabBarLayout}>
        {/*<Animated.View*/}
        {/*  style={[*/}
        {/*    wrapAnimatedStyle,*/}
        {/*    {*/}
        {/*      position: "absolute",*/}
        {/*      backgroundColor: COLORS.primaryColor,*/}
        {/*      borderRadius: 30,*/}
        {/*      marginHorizontal: 15,*/}
        {/*      width: buttonWidth - 30,*/}
        {/*      height: dimensions.height - 15,*/}
        {/*    },*/}
        {/*  ]}*/}
        {/*></Animated.View>*/}
        {getTabBarItems()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    bottom: 20,
    marginHorizontal: 20,
  },
  tabBar: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 35,
    flex: 1,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  content: Platform.select({
    ios: {},
    web: {
      width: "80%",
      left: "50%",
      transform: [{ translateX: "-50%" }],
      marginHorizontal: 0,
      bottom: 10,
    },
    default: {
      flexDirection: "row",
    },
  }),
  wrapper: {
    position: "absolute",
  },
});
