import { StyleSheet, SafeAreaView, View } from "react-native";

import PageView from "@/components/PageView";
import {ThemedText} from "@/components/ThemedText";

export default function RunIndexScreen() {
  return (
    <PageView style={{ paddingBottom: 100 }}>
      <View style={{ paddingBottom: 100, flex: 1, padding: 10 }}>
        <ThemedText>开始跑步吧！</ThemedText>
      </View>
    </PageView>
  );
}

const styles = StyleSheet.create({});
