import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useSession } from "@/components/SessionProvider";
import { COLORS } from "@/styles/theme";
import FormItem from "@/components/form/FormItem";
import { useForm } from "react-hook-form";
import { getRsaKey, getUserInfo, userLogin } from "@/api/login";
import { useRouter } from "expo-router";
import { AesEncryption } from "@/utils/encryption";
import { WithTranslation, withTranslation } from "react-i18next";
import LabelMove from "@/components/sign/LabelMove";
import SignView from "@/components/sign/SignView";
import ContinueGroup from "@/components/sign/ContinueGroup";
import Toast from "react-native-toast-message";
import { setStorageItemAsync } from "@/hooks/useStorageState";
import { useState } from "react";
import Loading from "@/components/ui/Loading";

function SignIn({ t }: WithTranslation) {
  const { signIn } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      userName: "",
      password: "",
    },
  });
  function goRegister() {
    router.replace("/SignUp");
  }
  async function onSubmit(data: any) {
    try {
      let rsaKey: string = "";
      if (!rsaKey) {
        const { data } = await getRsaKey();
        rsaKey = data.data;
      }
      const encryption = new AesEncryption({
        serverPublicKey: rsaKey,
      });
      const password = encryption.encryptByAES(data.password);
      setLoading(true);
      userLogin({
        ...data,
        key: encryption.getKey,
        iv: encryption.getIv,
        password,
      })
        .then(({ data }) => {
          signIn(data.data);
          getUserInfo().then(({ data }) => {
            setStorageItemAsync("user", data.data);
            Toast.show({
              type: "success",
              text1: `${data.data.userName}, 欢迎回来!`,
            });
            router.replace("/(tabs)");
          });
        })
        .finally(() => setLoading(false));
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }
  return (
    <SignView
      style={{
        flex: 1,
        backgroundColor: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <View className={"mt-10 mb-10 z-10 pl-10 pr-10 flex flex-col h-full gap-5"}>
        <View className={"flex flex-col items-center"}>
          <Text style={styles.title}>{t("title")}</Text>
          <Text style={styles.hello}>{t("welcome")}</Text>
        </View>
        <View>
          <LabelMove
            label={t("account")}
            error={!!errors["userName"]}
            height={64}
            render={(move) => (
              <FormItem
                control={control}
                rules={{
                  required: true,
                }}
                prop={"userName"}
                errors={errors}
                component={({ field: { value, onChange } }) => (
                  <TextInput
                    onFocus={() => move(true)}
                    onBlur={() => !value && move(false)}
                    className={"w-full h-full"}
                    value={value}
                    onChangeText={onChange}
                  ></TextInput>
                )}
              />
            )}
          ></LabelMove>
          <LabelMove
            label={t("password")}
            height={64}
            render={(move) => (
              <FormItem
                control={control}
                rules={{
                  required: true,
                }}
                prop={"password"}
                component={({ field: { value, onChange } }) => (
                  <TextInput
                    onFocus={() => move(true)}
                    onBlur={() => !value && move(false)}
                    className={"w-full h-full"}
                    textContentType={"password"}
                    value={value || ""}
                    onChangeText={onChange}
                  />
                )}
              />
            )}
          ></LabelMove>
          <Text
            className={"mb-4 text-right font-bold"}
            style={{ color: COLORS.primaryColor }}
          >
            {t("forgetPassword")}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          activeOpacity={0.8}
          disabled={!isValid || loading}
        >
          <View
            style={[
              styles.loginBtn,
              {
                backgroundColor: !isValid
                  ? COLORS.disabledPrimaryColor
                  : COLORS.primaryColor,
              },
            ]}
          >
            {loading ? (
              <Loading />
            ) : (
              <ThemedText
                className={"font-bold"}
                style={{ color: COLORS.white }}
              >
                {t("login")}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
        <Pressable onPress={goRegister} className={"mt-10"}>
          <Text className={"text-center font-bold p-2 "}>
            {t("createAccount")}
          </Text>
        </Pressable>
        <ContinueGroup />
      </View>
    </SignView>
  );
}

const styles = StyleSheet.create({
  title: {
    color: COLORS.primaryColor,
    fontSize: 30,
    fontWeight: "bold",
    fontFamily: "Poppins-Bold",
    marginBottom: 15,
  },
  hello: {
    fontFamily: "Poppins-SemiBold",
    color: COLORS.black,
    fontSize: 20,
    width: 250,
    textAlign: "center",
  },
  loginBtn: {
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: COLORS.primaryColor,
    boxShadow: "0 10 20 #CBD6FF",
  },
  inputBox: {
    paddingLeft: 20,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#F1F4FF",
    position: "relative",
    marginVertical: 20,
  },
});
export default withTranslation("login")(SignIn);
