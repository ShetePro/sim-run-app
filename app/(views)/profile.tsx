import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { Divider } from "@/components/ui/Divider";
import { DefaultAvatar } from "@/components/DefaultAvatar";
import NumberInputSheet from "@/components/form/NumberInputSheet";
import {
  NumberInputControlProps,
  NumberInputSheetHandle,
} from "@/types/formTypes";
import { getStorageItem, setStorageItemAsync } from "@/hooks/useStorageState";
import Toast from "react-native-toast-message";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const numberSheetRef = useRef<NumberInputSheetHandle>(null);
  const [sheetConfig, setSheetConfig] = useState<NumberInputControlProps>({
    key: "",
    title: "",
    unit: "",
    value: "",
  });

  const numberInputOptions: {
    [key: string]: NumberInputControlProps;
  } = {
    height: {
      title: t("profile.height"),
      unit: "cm",
      key: "height",
      value: "0",
    },
    weight: {
      title: t("profile.weight"),
      unit: "kg",
      key: "weight",
      value: "0",
    },
    age: {
      title: t("profile.age"),
      unit: t("profile.ageUnit"),
      key: "age",
      value: "0",
    },
  };
  const userInfo = getStorageItem("userInfo");
  // 表单状态
  const [form, setForm] = useState<UserInfo>(
    userInfo ? JSON.parse(userInfo) : {},
  );

  // 处理保存
  const handleSave = async () => {
    setIsSaving(true);
    // 模拟 API 请求
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(t("profile.saveSuccess"), t("profile.profileUpdated"), [
        { text: t("common.confirm"), onPress: () => router.back() },
      ]);
    }, 1000);
  };

  // 更新表单辅助函数
  const updateForm = (key: string, value: string) => {
    const newForm = { ...form, [key]: value };
    setForm(newForm);
    setStorageItemAsync("userInfo", JSON.stringify(newForm));
  };

  // 选择头像
  const pickAvatar = async () => {
    // 请求权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("permission.title"), t("permission.photosRequired"));
      return;
    }

    // 打开图片选择器
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      updateForm("avatar", selectedImageUri);
    }
  };
  const openNumberInputSheet = (key: string) => {
    const config = numberInputOptions[key];
    config.value = form[key as keyof UserInfo] || "";
    setSheetConfig(config);
    numberSheetRef.current?.present();
  };
  const handleNumberInput = (value: string) => {
    updateForm(sheetConfig.key, value);
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <Stack.Screen
        options={{
          headerTitle: t("profile.editProfile"),
          headerTitleStyle: { color: "#0f172a" },
          headerStyle: { backgroundColor: "#fff" },
          headerShadowVisible: false,
          headerBackTitle: t("common.cancel"),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              className="px-2"
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <Text className="text-indigo-600 font-bold text-base">
                  {t("common.save")}
                </Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        className="flex-1 px-4 pt-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-8">
          <TouchableOpacity className="relative" onPress={pickAvatar}>
            {form.avatar ? (
              <Image
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 9999,
                }}
                source={{ uri: form.avatar }}
                contentFit="cover"
              />
            ) : (
              <DefaultAvatar nickname={form.nickname} size={100} />
            )}
            <View className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full border-[3px] border-white dark:border-slate-900">
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-slate-400 text-sm mt-2">
            {t("profile.tapToChangeAvatar")}
          </Text>
        </View>

        <Text className="text-slate-500 text-xs font-bold uppercase mb-2 ml-2">
          {t("profile.basicInfo")}
        </Text>
        <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-6 shadow-sm">
          <FormItem label={t("profile.nickname")}>
            <TextInput
              value={form.nickname}
              onChangeText={(t) => updateForm("nickname", t)}
              placeholder={t("profile.nicknamePlaceholder")}
              className="flex-1 text-right text-slate-800 dark:text-white font-medium h-full"
              placeholderTextColor="#94a3b8"
            />
          </FormItem>

          <Divider />

          <FormItem label={t("profile.signature")}>
            <TextInput
              value={form.signature}
              onChangeText={(t) => updateForm("signature", t)}
              placeholder={t("profile.signaturePlaceholder")}
              maxLength={30}
              className="flex-1 text-right text-slate-800 dark:text-white font-medium h-full"
              placeholderTextColor="#94a3b8"
            />
          </FormItem>
        </View>

        <Text className="text-slate-500 text-xs font-bold uppercase mb-2 ml-2">
          {t("profile.bodyData")}
        </Text>
        <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-8 shadow-sm">
          {/* 性别选择器 */}
          <View className="flex-row items-center justify-between p-4 min-h-[56px]">
            <Text className="text-slate-600 dark:text-slate-300 text-base font-medium">
              {t("profile.gender")}
            </Text>
            <View className="flex-row bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <GenderOption
                label={t("profile.male")}
                value="male"
                selected={form.gender === "male"}
                onSelect={() => updateForm("gender", "male")}
              />
              <GenderOption
                label={t("profile.female")}
                value="female"
                selected={form.gender === "female"}
                onSelect={() => updateForm("gender", "female")}
              />
            </View>
          </View>

          <Divider />

          <FormItem label={t("profile.height")}>
            <TouchableOpacity
              className="flex-row items-center justify-end flex-1"
              onPress={() => openNumberInputSheet("height")}
            >
              <Text className="text-right text-slate-800 dark:text-white font-bold text-lg min-w-[150px]">
                {form.height}
              </Text>
              <Text className="text-slate-400 font-medium ml-1">cm</Text>
            </TouchableOpacity>
          </FormItem>

          <Divider />

          {/* 体重 */}
          <FormItem label={t("profile.weight")}>
            <TouchableOpacity
              className="flex-row items-center justify-end flex-1"
              onPress={() => openNumberInputSheet("weight")}
            >
              <Text className="text-right text-slate-800 dark:text-white font-bold text-lg min-w-[150px]">
                {form.weight}
              </Text>
              <Text className="text-slate-400 font-medium ml-1">kg</Text>
            </TouchableOpacity>
          </FormItem>

          <Divider />

          {/* 年龄 */}
          <FormItem label={t("profile.age")}>
            <TouchableOpacity
              className="flex-row items-center justify-end flex-1"
              onPress={() => openNumberInputSheet("age")}
            >
              <Text className="text-right text-slate-800 dark:text-white font-bold text-lg min-w-[150px]">
                {form.age}
              </Text>
              <Text className="text-slate-400 font-medium ml-1">岁</Text>
            </TouchableOpacity>
          </FormItem>
        </View>

        {/* 底部提示 */}
        <Text className="text-center text-slate-400 text-xs mb-10">
          {t("profile.bodyDataTip")}
        </Text>
      </ScrollView>
      <NumberInputSheet
        ref={numberSheetRef}
        title={sheetConfig.title}
        unit={sheetConfig.unit}
        value={sheetConfig.value || ""}
        onConfirm={handleNumberInput}
      />
    </SafeAreaView>
  );
}

// --- 子组件：表单行 ---
const FormItem = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <View className="flex-row items-center justify-between p-4 min-h-[56px]">
    <Text className="text-slate-600 dark:text-slate-300 text-base font-medium w-24">
      {label}
    </Text>
    {children}
  </View>
);

// --- 子组件：性别选项 ---
const GenderOption = ({ label, value, selected, onSelect }: any) => (
  <TouchableOpacity
    onPress={onSelect}
    className={`px-4 py-1.5 rounded-md ${selected ? "bg-white dark:bg-slate-600" : ""}`}
  >
    <Text
      className={`text-sm font-semibold ${selected ? "text-indigo-600 dark:text-white" : "text-slate-400"}`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);
