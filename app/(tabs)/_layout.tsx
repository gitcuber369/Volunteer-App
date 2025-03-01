import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router"; // ✅ Get params using expo-router

import HomeScreen from "@/app/(tabs)/Home/HomeScreen";
import TasksScreen from "@/app/(tabs)/TaskScreen";
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
  const { role } = useLocalSearchParams(); // ✅ Get role from params

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
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Action"
        component={ActionScreen}
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity
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
  );
}
