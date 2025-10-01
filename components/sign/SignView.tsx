import { ReactNode } from "react";
import { SafeAreaView, View, ViewStyle } from "react-native";

export default function SignView({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <SafeAreaView className={"absolute w-full h-full"} style={style}>
      {children}
      <View
        className={
          "w-[600px] h-[600px] rounded-full bg-[#F8F9FF] absolute right-[-300px] top-[-350px] z-0"
        }
      ></View>
      <View
        className={
          "w-[500px] h-[500px] rounded-full border-2 border-[#F8F9FF] absolute right-[-120px] top-[-220px] z-0"
        }
      ></View>
      <View
        className={
          "w-[300px] h-[300px] border-2 border-[#F8F9FF] absolute rotate-12 left-[-200px] bottom-[0px] z-0"
        }
      ></View>
      <View
        className={
          "w-[300px] h-[300px] border-2 border-[#F8F9FF] absolute left-[-200px] bottom-[0px] z-0"
        }
      ></View>
    </SafeAreaView>
  );
}
