import { StyleSheet, SafeAreaView, View, Pressable } from "react-native";

import PageView from "@/components/PageView";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";

export default function RunIndexScreen() {
  const router = useRouter();
  function onBack() {
    console.log("onBack", router.canGoBack());
    router.replace("/(tabs)");
  }
  return (
    <PageView style={{ paddingBottom: 100 }}>
      <View style={{ paddingBottom: 100, flex: 1, padding: 10 }}>
        <ThemedText>开始跑步吧！</ThemedText>
        <Pressable style={styles.finishButton} onPress={onBack}>
          <ThemedText
            style={{ color: "#fff", textAlign: "center", fontSize: 18 }}
          >
            结束跑步
          </ThemedText>
        </Pressable>
      </View>
    </PageView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  finishButton: {
    marginTop: 20,
    backgroundColor: "#dc282d",
    padding: 15,
    borderRadius: 10,
  },
});
