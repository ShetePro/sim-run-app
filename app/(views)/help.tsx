import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Divider } from "@/components/ui/Divider";

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const faqs: FAQItem[] = [
    {
      question: t("help.faq.gps.question"),
      answer: t("help.faq.gps.answer"),
    },
    {
      question: t("help.faq.background.question"),
      answer: t("help.faq.background.answer"),
    },
    {
      question: t("help.faq.battery.question"),
      answer: t("help.faq.battery.answer"),
    },
    {
      question: t("help.faq.export.question"),
      answer: t("help.faq.export.answer"),
    },
  ];

  const handleSendFeedback = () => {
    if (!feedback.trim()) {
      Alert.alert(t("common.error"), t("help.feedbackEmpty"));
      return;
    }
    // 发送反馈逻辑
    Alert.alert(t("common.success"), t("help.feedbackSent"));
    setFeedback("");
    setContactEmail("");
  };

  const openEmail = () => {
    Linking.openURL("sheteprolin@gmail.com");
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900" edges={["top"]}>
      {/* 顶部导航 */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#6366f1" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 dark:text-white ml-2">
          {t("help.title")}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* 快速操作 */}
        {renderSection(t("help.quickActions"), (
          <>
            <TouchableOpacity
              onPress={openEmail}
              className="flex-row items-center p-4"
            >
              <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center">
                <Ionicons name="mail-outline" size={20} color="#6366f1" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base text-slate-700 dark:text-slate-200 font-medium">
                  {t("help.contactUs")}
                </Text>
                <Text className="text-slate-400 text-sm mt-0.5">
                  sheteprolin@gmail.com
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity
              onPress={() => Linking.openURL("https://simrun.app/guide")}
              className="flex-row items-center p-4"
            >
              <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center">
                <Ionicons name="book-outline" size={20} color="#10b981" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base text-slate-700 dark:text-slate-200 font-medium">
                  {t("help.userGuide")}
                </Text>
                <Text className="text-slate-400 text-sm mt-0.5">
                  {t("help.userGuideDesc")}
                </Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </>
        ))}

        {/* FAQ */}
        {renderSection(t("help.faq.title"), (
          <>
            {faqs.map((faq, index) => (
              <View key={index}>
                <TouchableOpacity
                  onPress={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base text-slate-700 dark:text-slate-200 font-medium flex-1 pr-4">
                      {faq.question}
                    </Text>
                    <Ionicons
                      name={expandedFAQ === index ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#9ca3af"
                    />
                  </View>
                  {expandedFAQ === index && (
                    <Text className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-5">
                      {faq.answer}
                    </Text>
                  )}
                </TouchableOpacity>
                {index < faqs.length - 1 && <Divider />}
              </View>
            ))}
          </>
        ))}

        {/* 反馈表单 */}
        {renderSection(t("help.feedback.title"), (
          <View className="p-4">
            <Text className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              {t("help.feedback.desc")}
            </Text>

            {/* 邮箱输入 */}
            <View className="mb-4">
              <Text className="text-slate-500 dark:text-slate-400 text-xs mb-2">
                {t("help.feedback.email")} ({t("common.optional")})
              </Text>
              <TextInput
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="your@email.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-slate-50 dark:bg-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white"
              />
            </View>

            {/* 反馈内容 */}
            <View className="mb-4">
              <Text className="text-slate-500 dark:text-slate-400 text-xs mb-2">
                {t("help.feedback.content")}
              </Text>
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                placeholder={t("help.feedback.placeholder")}
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-slate-50 dark:bg-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white h-28"
              />
            </View>

            {/* 提交按钮 */}
            <TouchableOpacity
              onPress={handleSendFeedback}
              className="bg-indigo-600 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-semibold text-base">
                {t("help.feedback.submit")}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* 底部提示 */}
        <View className="px-6 py-8">
          <View className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#6366f1" />
              <Text className="text-indigo-700 dark:text-indigo-300 text-sm ml-2 flex-1 leading-5">
                {t("help.responseTime")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
