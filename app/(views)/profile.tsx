import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Divider } from "@/components/ui/Divider";
import NumberInputSheet from "@/components/form/NumberInputSheet";
import {
  NumberInputControlProps,
  NumberInputSheetHandle,
} from "@/types/formTypes";
import { getStorageItem, setStorageItemAsync } from "@/hooks/useStorageState";
import Toast from "react-native-toast-message";

export default function ProfileEditScreen() {
  const router = useRouter();
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
    height: { title: "身高", unit: "cm", key: "height", value: "0" },
    weight: { title: "体重", unit: "kg", key: "weight", value: "0" },
    age: { title: "年龄", unit: "岁", key: "age", value: "0" },
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
      Alert.alert("保存成功", "个人资料已更新", [
        { text: "确定", onPress: () => router.back() },
      ]);
    }, 1000);
  };

  // 更新表单辅助函数
  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setStorageItemAsync('userInfo', JSON.stringify({ ...form, [key]: value })).then(() => {
    });
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
          headerTitle: "编辑资料",
          headerTitleStyle: { color: "#0f172a" },
          headerStyle: { backgroundColor: "#fff" },
          headerShadowVisible: false,
          headerBackTitle: "取消",
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
                  保存
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
          <TouchableOpacity className="relative">
            <Image
              style={{
                width: 100,
                height: 100,
                backgroundColor: "#0553",
                borderRadius: 9999,
              }}
              source={{ uri: form.avatar }}
            />
            <View className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full border-[3px] border-white dark:border-slate-900">
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <Text className="text-slate-500 text-xs font-bold uppercase mb-2 ml-2">
          基础信息
        </Text>
        <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-6 shadow-sm">
          <FormItem label="昵称">
            <TextInput
              value={form.nickname}
              onChangeText={(t) => updateForm("nickname", t)}
              placeholder="请输入昵称"
              className="flex-1 text-right text-slate-800 dark:text-white font-medium h-full"
              placeholderTextColor="#94a3b8"
            />
          </FormItem>

          <Divider />

          <FormItem label="个性签名">
            <TextInput
              value={form.signature}
              onChangeText={(t) => updateForm("bio", t)}
              placeholder="一句话介绍自己"
              maxLength={30}
              className="flex-1 text-right text-slate-800 dark:text-white font-medium h-full"
              placeholderTextColor="#94a3b8"
            />
          </FormItem>
        </View>

        <Text className="text-slate-500 text-xs font-bold uppercase mb-2 ml-2">
          身体数据
        </Text>
        <View className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-8 shadow-sm">
          {/* 性别选择器 */}
          <View className="flex-row items-center justify-between p-4 min-h-[56px]">
            <Text className="text-slate-600 dark:text-slate-300 text-base font-medium">
              性别
            </Text>
            <View className="flex-row bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <GenderOption
                label="男"
                value="male"
                selected={form.gender === "male"}
                onSelect={() => updateForm("gender", "male")}
              />
              <GenderOption
                label="女"
                value="female"
                selected={form.gender === "female"}
                onSelect={() => updateForm("gender", "female")}
              />
            </View>
          </View>

          <Divider />

          <FormItem label="身高">
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
          <FormItem label="体重">
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
          <FormItem label="年龄">
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
          准确的身体数据有助于更精准地计算卡路里消耗。
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
