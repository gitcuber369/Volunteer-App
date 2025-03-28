/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#5740ef";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    primaryColor: "#1F4766",
    background: "#F7F7F7",
    tint: tintColorLight,
    accent1: "#A1C6AA",
    accent2: "#FAD02C",
    icon: "#687076",
    tabIconDefault: "#687076",
    error: "#B00020",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    primaryColor: "#5740ef",
    background: "#1B1838",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
