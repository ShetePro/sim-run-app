import { Redirect, Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import TabBar from "@/components/tab-bar/TabBar";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSession } from "@/components/SessionProvider";
import { ThemedText } from "@/components/ThemedText";
import { WithTranslation, withTranslation } from "react-i18next";

function TabLayout({ t }: WithTranslation) {
  const colors = useThemeColor();
  const { session, isLoading } = useSession();
  if (isLoading) {
    return <ThemedText>Loading...</ThemedText>;
  }
  // 判断是否登录
  // if (!session) {
  //   return <Redirect href="/SignIn" />;
  // }
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        animation: "fade",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t("history"),
        }}
      />
      <Tabs.Screen
        name="charts"
        options={{
          title: t("charts"),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: t("user"),
        }}
      />
    </Tabs>
  );
}
export default withTranslation("tabs")(TabLayout);
