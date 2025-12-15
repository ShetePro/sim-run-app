import { Text, View } from "react-native";
import React from "react";
import { MenuItem } from "@/components/ui/MenuItem";
import { Divider } from "@/components/ui/Divider";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LanguageView() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900 pl-6 pr-6">
      <View>
        <Text className="text-slate-500 dark:text-slate-400 text-xl font-bold uppercase mb-2 ml-2">
          语言管理
        </Text>
      </View>
      <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden ">
        <MenuItem
          icon="map-outline"
          color="#10B981"
          label="离线地图管理"
          onPress={() => console.log("Nav to Offline Maps")}
        />
        <Divider />
        <MenuItem
          icon="heart-outline"
          color="#EF4444"
          label="健康数据同步"
          value="已连接"
          onPress={() => console.log("Nav to Health")}
        />
        <Divider />
        <MenuItem
          icon="notifications-outline"
          color="#F59E0B"
          label="消息通知"
          onPress={() => console.log("Nav to Notifications")}
        />
      </View>
    </SafeAreaView>
  );
}
