import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  StatusBar,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState, useRef, useCallback } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import HomeScreen from "@/app/(tabs)/Home/HomeScreen";
import TasksScreen from "@/app/(tabs)/Search";
import ChatsScreen from "@/app/(tabs)/Chats";
import ProfileScreen from "@/app/(tabs)/Profile";
import ActionScreen from "@/app/(tabs)/Action";

import MasterAdminHome from "./Home/MasterAdminHome";
import AdminHome from "./Home/AdminHome";
import TeamLead from "./Home/TeamLead";
import VolunteerHome from "./Home/VolunteerHome";
import { Colors } from "@/constants/Colors";
import { BlurView } from "expo-blur";
const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const { role } = useLocalSearchParams();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Snap points for the bottom sheet
  const snapPoints = ["50%", "75%"];

  // Handle opening the bottom sheet
  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
    setIsBottomSheetOpen(true);
  }, []);

  // Handle closing the bottom sheet
  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsBottomSheetOpen(false);
  }, []);

  // ✅ Dynamically select the home screen based on role
  const getHomeScreen = () => {
    switch (role) {
      case "MasterAdminHome":
        return MasterAdminHome;
      case "AdminHome":
        return AdminHome;
      case "TeamLead":
        return TeamLead;
      case "VolunteerHome":
        return VolunteerHome;
      default:
        return HomeScreen; // Default screen if role is undefined
    }
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          animation: "fade",
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabelPosition: "below-icon",
          lazy: false, // Loads screens eagerly for smoother transitions
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: 80,
            borderStyle: "solid",
            borderTopWidth: 1,
            borderTopColor: "#eee",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
            paddingBottom: 8,
          },
          tabBarBackground: () => (
            <BlurView
              intensity={50}
              tint="light"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ),
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarActiveTintColor: Colors.light.primaryColor,
          tabBarInactiveTintColor: "#999",
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 4,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={getHomeScreen()}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={TasksScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Action"
          component={ActionScreen}
          options={{
            tabBarButton: (props) => (
              <TouchableOpacity
                onPress={handleOpenBottomSheet}
                style={{
                  top: -20,
                  left: 0,
                  right: 0,
                  marginHorizontal: "auto",
                  backgroundColor: Colors.light.primaryColor,
                  borderRadius: 50,
                  width: 50,
                  height: 50,
                  shadowColor: Colors.light.primaryColor,
                  shadowOffset: {
                    width: 2,
                    height: 2,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 3.84,
                  elevation: 2,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="add" size={32} color="white" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen
          name="Chats"
          component={ChatsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={handleCloseBottomSheet}
        handleIndicatorStyle={{ backgroundColor: "#ddd", width: 50 }}
        backgroundStyle={{
          backgroundColor: "white",
          borderRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        }}
      >
        <BottomSheetView style={{ flex: 1, padding: 24, marginBottom: 80 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              textAlign: "center",
              color: "#333",
              marginBottom: 20,
            }}
          >
            Create New Group
          </Text>

          {/* Group Profile Image */}
          <TouchableOpacity
            style={{
              alignSelf: "center",
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: "#f8f8f8",
              justifyContent: "center",
              alignItems: "center",
              marginVertical: 16,
              borderWidth: 1,
              borderColor: "#eaeaea",
              shadowColor: Colors.light.primaryColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
              overflow: "hidden",
            }}
            onPress={async () => {
              // Request media library permissions
              const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

              if (status !== "granted") {
                alert(
                  "Sorry, we need camera roll permissions to make this work!"
                );
                return;
              }

              // Launch the image picker
              let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
              });

              if (!result.canceled) {
                // Set the selected image
                setGroupImage(result.assets[0].uri);
              }
            }}
          >
            {groupImage ? (
              <Image
                source={{ uri: groupImage }}
                style={{ width: 110, height: 110 }}
                contentFit="cover"
              />
            ) : (
              <>
                <Ionicons
                  name="camera"
                  size={40}
                  color={Colors.light.primaryColor}
                />
                <Text style={{ fontSize: 13, marginTop: 6, color: "#666" }}>
                  Add Photo
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Group Name Input */}
          <View
            style={{
              backgroundColor: "#f9f9f9",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: "#eee",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                marginBottom: 8,
                color: "#555",
                fontWeight: "500",
              }}
            >
              Group Name
            </Text>
            <TextInput
              placeholder="Enter group name"
              placeholderTextColor="#aaa"
              style={{
                fontSize: 16,
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: "#eaeaea",
              }}
            />
          </View>

          {/* Volunteers List */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                marginBottom: 12,
                color: "#444",
              }}
            >
              Add Volunteers
            </Text>

            <View
              style={{
                backgroundColor: "#f9f9f9",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#eee",
                maxHeight: 220,
              }}
            >
              <ScrollView style={{ maxHeight: 220 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                  <View
                    key={item}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderBottomWidth: item !== 5 ? 1 : 0,
                      borderBottomColor: "#eee",
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: "#e0e0e0",
                        marginRight: 14,
                      }}
                    />
                    <Text style={{ flex: 1, fontSize: 15 }}>
                      Volunteer {item}
                    </Text>
                    <TouchableOpacity
                      style={{
                        padding: 8,
                        backgroundColor: "rgba(0,0,0,0.03)",
                        borderRadius: 20,
                      }}
                    >
                      <Ionicons
                        name="add-circle"
                        size={24}
                        color={Colors.light.primaryColor}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={{
              backgroundColor: Colors.light.primaryColor,
              padding: 16,
              borderRadius: 14,
              marginBottom: 80,
              alignItems: "center",
              shadowColor: Colors.light.primaryColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              Create Group
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
