/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */
import { COLORS } from "@/styles/theme";

const tintColorLight = "#292526";
const tintColorDark = "#fbfcfc";

export const Colors = {
  light: {
    colors: {
      text: "#11181C",
      textWeaken: "#525256",
      background: COLORS.white,
      active: COLORS.primaryColor,
      tint: tintColorLight,
      icon: "#687076",
      tabBackground: COLORS.white,
      tabIconDefault: "#687076",
      tabIconSelected: tintColorLight,
      cardBackground: COLORS.white
    },
  },
  dark: {
    colors: {
      text: "#ECEDEE",
      textWeaken: "#525256",
      // background: "#151718",
      tint: tintColorDark,
      icon: "#9BA1A6",
      tabIconDefault: "#9BA1A6",
      tabIconSelected: tintColorDark,
      background: COLORS.black,
      tabBackground: "#353636",
      active: COLORS.white,
      cardBackground: "#353636"
    },
  },
};
