import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import React from "react";
import { router } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import LoginSheet from "@/components/LoginSheet";

const Index = () => {
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
