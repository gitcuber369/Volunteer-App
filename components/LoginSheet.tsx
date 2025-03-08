import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useRef } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { defaultStyles } from "@/constants/Styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheetChoose from "./BottomSheetChoose";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, useNavigation } from "expo-router";
const LoginSheet = () => {
  const { bottom } = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const navigation = useNavigation();

  const handleRoleSelect = (role) => {
    bottomSheetRef.current?.close();
    router.replace({
      pathname: "/(tabs)/Home/HomeScreen",
      params: { role },
    });
  };

  return (
    <View style={[styles.container, { paddingBottom: bottom }]}>
      <TouchableOpacity
        onPress={() => bottomSheetRef.current?.expand()}
        style={[styles.btnLight, defaultStyles.btn]}
      >
        <Text style={[styles.btnText]}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/(auth)/sign-up")}
      className="bg-primary border-primary border-2"
        style={[
          defaultStyles.btn,
          {
            borderWidth: 3,
          },
        ]}
      >
        <Text style={[styles.btnText]}>Register</Text>
      </TouchableOpacity>
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.divider} />
      </View>
      <TouchableOpacity
        style={[defaultStyles.btn, { backgroundColor: "#333" }]}
      >
        <AntDesign name="google" size={24} style={styles.btnIcon} />
        <Text style={styles.btnText}>Continue with Google</Text>
      </TouchableOpacity>
      <Text style={styles.termsText}>
        By signing in, you are accepting the Terms and Conditions.
      </Text>
      <BottomSheetChoose ref={bottomSheetRef} />
    </View>
  );
};

export default LoginSheet;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#000",
    padding: 20,
    gap: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  btnLight: {
    backgroundColor: "#1F4766",
  },
  btnIcon: {
    paddingRight: 6,
    color: "#fff",
  },
  btnText: {
    fontSize: 20,
    color: "#fff",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.5)",
  },
  termsText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 10,
  },
});
