import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColorScheme } from "@/hooks/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        const sessionToken = await AsyncStorage.getItem("session_token");
        const role = await AsyncStorage.getItem("user_role");

        if (loaded) {
          // Check if user is logged in
          if (sessionToken && role) {
                   if (role === "MasterAdmin") {
                     router.replace({
                       pathname: "/(tabs)/Home/MasterAdminHome",
                       params: { role: "MasterAdminHome" },
                     });
                   } else {
                     router.replace({
                       pathname: "/(tabs)/Home/VolunteerHome",
                       params: { role: "VolunteerHome" },
                     });
                   }
                 }
          // Hide splash screen once everything is ready
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.warn('Error during app initialization:', error);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [loaded, router]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode="light">
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="Chat/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="[groupId]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
