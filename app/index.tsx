import { View, Text, StyleSheet, Image, Platform, Alert } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginSheet from "@/components/LoginSheet";

// Configure how notifications are handled when received

const useSessionRedirect = () => {
  const [isChurch, setIsChurch] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionToken = await AsyncStorage.getItem("session_token");
        const role = await AsyncStorage.getItem("user_role");

        console.log("Session token:", sessionToken);
        console.log("Here is the role of the user", role);

        if (sessionToken && role) {
          switch (role) {
            case "MasterAdmin":
              router.replace({
                pathname: "/(tabs)/Home/MasterAdminHome",
                params: { role: "MasterAdminHome" },
              });
              break;
            case "Admin":
              router.push({
                pathname: "/(tabs)/Home/AdminHome",
                params: { role: "AdminHome" },
              });
              break;
            default:
              router.replace({
                pathname: "/(tabs)/Home/VolunteerHome",
                params: { role: "VolunteerHome" },
              });
              break;
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
    width: 250,
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
