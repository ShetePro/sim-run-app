import React from "react";
import { View, ViewStyle } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";

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
          style={{ flex: 1, boxSizing: 'content', padding: 20, ...style }}
        >
          <ThemedView style={{ flex: 1, ...style }}>{children}</ThemedView>
        </SafeAreaView>
      ) : (
        <View className={'w-full h-full'}>
          <ThemedView style={{ flex: 1, width: "100%", height: "100%", ...style }}>{children}</ThemedView>
        </View>
      )}
    </>
  );
}
