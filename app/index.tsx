import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import LoginSheet from "@/components/LoginSheet";
import { useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
// Custom hook for session check and redirection
const useSessionRedirect = () => {
  const [isChurch, setIsChurch] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionToken = await AsyncStorage.getItem("session_token");
        const role = await AsyncStorage.getItem("user_role");

        console.log("Session token:", sessionToken);
        console.log("Here is the role of the user", role);
        
        if(sessionToken && role) {
          if(role === "MasterAdmin") {
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


      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkSession();
  }, []);
};
const Index = () => {
  // Use the session redirect hook
  useSessionRedirect();

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/icon/splash-icon-light.png")}
        style={styles.icons}
      />
      <Text style={styles.description}>
        Empower your church community with seamless volunteer management. Stay
        connected, track engagement, and nurture meaningful
        service—effortlessly.
      </Text>
      <LoginSheet />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
  },
  icons: {
    width: 250, // Reduce size if needed
    height: 250,
    resizeMode: "contain",
  },
  description: {
    fontSize: 20,
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "400",
  },
});
export default Index;
