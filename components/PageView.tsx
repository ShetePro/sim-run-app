import React from "react";
import { SafeAreaView, View, ViewStyle } from "react-native";

export default function PageView({
  children,
  safeArea = true,
  style = {},
}: {
  children: React.ReactNode;
  safeArea?: boolean;
  style?: ViewStyle;
}) {
  return (
    <>
      {safeArea ? (
        <SafeAreaView
          style={{ flex: 1, boxSizing: "content", padding: 20, ...style }}
        >
          {children}
        </SafeAreaView>
      ) : (
        <View style={style}>{children}</View>
      )}
    </>
  );
}
