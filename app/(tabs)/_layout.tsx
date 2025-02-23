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
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: { height: 60, backgroundColor: "#000" , borderStyle: "solid", borderTopWidth: 1, borderTopColor: 'black'},
        tabBarIconStyle: { fontSize: 28 },
        tabBarActiveTintColor: "white",
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
                backgroundColor: Colors.dark.primaryColor,
                borderRadius: 50,
                width: 50,
                height: 50,
                shadowColor: Colors.light.primaryColor,
                shadowOffset: {
                  width: 2,
                  height: 2,
                },
                shadowOpacity: 1,
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
