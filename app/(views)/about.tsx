import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Divider } from "@/components/ui/Divider";

const APP_VERSION = "1.0.0";
const BUILD_NUMBER = "20250130";

export default function AboutScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View className="mb-6">
      <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
        {title}
      </Text>
      <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
        {children}
      </View>
    </View>
  );

  const renderItem = (
    label: string,
    value?: string,
    onPress?: () => void,
    showArrow = false
  ) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800"
    >
      <Text className="text-base text-slate-700 dark:text-slate-200 font-medium">
        {label}
      </Text>
      <View className="flex-row items-center">
        {value && (
          <Text className="text-slate-400 text-sm mr-2">{value}</Text>
        )}
        {showArrow && (
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900" edges={["top"]}>
      {/* 顶部导航 */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#6366f1" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 dark:text-white ml-2">
          {t("about.title")}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Logo 区域 */}
        <View className="items-center py-10">
          <View className="w-24 h-24 bg-indigo-600 rounded-3xl items-center justify-center mb-4 shadow-lg">
            <Ionicons name="walk" size={48} color="white" />
          </View>
          <Text className="text-2xl font-bold text-slate-800 dark:text-white">
            SimRun
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 mt-1">
            {t("about.slogan")}
          </Text>
          <View className="flex-row items-center mt-3 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full">
            <Text className="text-slate-600 dark:text-slate-300 text-sm">
              v{APP_VERSION}
            </Text>
          </View>
        </View>

        {/* 版本信息 */}
        {renderSection(t("about.versionInfo"), (
          <>
            {renderItem(t("about.version"), APP_VERSION)}
            <Divider />
            {renderItem(t("about.buildNumber"), BUILD_NUMBER)}
            <Divider />
            {renderItem(t("about.updateCheck"), undefined, () => {
              // 检查更新逻辑
            }, true)}
          </>
        ))}

        {/* 法律信息 */}
        {renderSection(t("about.legal"), (
          <>
            {renderItem(t("about.privacyPolicy"), undefined, () => {
              openLink("https://your-privacy-policy-url.com");
            }, true)}
            <Divider />
            {renderItem(t("about.termsOfService"), undefined, () => {
              openLink("https://your-terms-url.com");
            }, true)}
          </>
        ))}

        {/* 关于我们 */}
        {renderSection(t("about.team"), (
          <View className="p-4">
            <Text className="text-slate-600 dark:text-slate-300 text-sm leading-6">
              {t("about.description")}
            </Text>
            <View className="flex-row items-center mt-4">
              <Ionicons name="mail-outline" size={18} color="#6366f1" />
              <Text className="text-indigo-600 dark:text-indigo-400 ml-2 text-sm">
                sheteprolin@gmail.com
              </Text>
            </View>
          </View>
        ))}

        {/* 底部版权 */}
        <View className="items-center py-8">
          <Text className="text-slate-400 text-xs">
            © 2025 SimRun Team. {t("about.allRightsReserved")}
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            Made with ❤️ for runners
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
