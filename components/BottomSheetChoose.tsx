import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { forwardRef } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { defaultStyles } from "@/constants/Styles";
import { router } from "expo-router";

const BottomSheetChoose = forwardRef((props, ref: React.Ref<BottomSheet>) => {
  const snapPoints = ["1%", "100%"];

  const navigateToRole = (role) => {
    router.push({ pathname: "/(tabs)/Home/HomeScreen", params: { role } }); // ✅ Pass as query param
  };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      handleStyle={{ backgroundColor: "#000" }}
      handleIndicatorStyle={{ backgroundColor: "#fff" }}
      style={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
      }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <TouchableOpacity
          onPress={() => navigateToRole("MasterAdminHome")} // 🔥 Pass correctly
          style={[defaultStyles.btn, styles.button]}
        >
          <Text style={styles.btnText}>Master Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigateToRole("AdminHome")}
          style={[defaultStyles.btn, styles.button]}
        >
          <Text style={styles.btnText}>Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigateToRole("TeamLead")}
          style={[defaultStyles.btn, styles.button]}
        >
          <Text style={styles.btnText}>Team Leader</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigateToRole("VolunteerHome")}
          style={[defaultStyles.btn, styles.button]}
        >
          <Text style={styles.btnText}>Volunteer</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default BottomSheetChoose;

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: "#000",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 20,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
  },
  button: {
    borderColor: "rgba(87,64,239, 1)",
    borderWidth: 3,
    backgroundColor: "rgba(87,64,239, 1)",
    width: "100%",
  },
});
