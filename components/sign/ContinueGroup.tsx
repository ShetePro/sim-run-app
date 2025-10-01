import { Pressable, View, StyleSheet, Text } from "react-native";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "@/styles/theme";
import { WithTranslation, withTranslation } from "react-i18next";

function ContinueGroup({ t }: WithTranslation) {
  return (
    <View className={"flex flex-col items-center justify-center"} style={{ height: 80}}>
      <Text
        className={"font-bold mb-5"}
        style={{ color: COLORS.primaryColor }}
      >
        {t("continue")}
      </Text>
      <View className={"flex flex-row items-center gap-2"}>
        <Pressable style={styles.continueBox}>
          <FontAwesome5 name="mobile-alt" size={24} color="black" />
        </Pressable>
        <Pressable style={styles.continueBox}>
          <AntDesign name="wechat" size={24} color="black" />
        </Pressable>
        <Pressable style={styles.continueBox}>
          <AntDesign name="alipay-circle" size={24} color="black" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  continueBox: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 40,
    backgroundColor: "#ECECEC",
    borderRadius: 10,
  },
});

export default withTranslation("login")(ContinueGroup);
