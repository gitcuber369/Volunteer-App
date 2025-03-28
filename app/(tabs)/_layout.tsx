import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  StatusBar,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { supabase } from "@/service/supabaseClient";
const Tab = createBottomTabNavigator();



export default function BottomTabNavigator() {
  // Bottom sheet related states
  
  const { role } = useLocalSearchParams();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [chatImage, setChatImage] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string }[]>([]);

  // Snap points for the bottom sheet
  const snapPoints = ["50%", "75%"];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow access to your photos.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setChatImage(result.assets[0].uri);
    }
  };

  // Fetch All Users (Participants)
  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("id, name");
    if (error) Alert.alert("Error", error.message);
    else setAllUsers(data || []);
  };

  // Add/Remove Participant
  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Upload Image to Supabase Storage
  const uploadImage = async (imageUri: string) => {
    if (!imageUri) return null;
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const filePath = `group_images/${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from("group-images")
      .upload(filePath, blob, { contentType: "image/jpeg" });

    if (error) {
      Alert.alert("Image Upload Failed", error.message);
      return null;
    }

    return supabase.storage.from("group-images").getPublicUrl(filePath).data.publicUrl;
  };

  // Create Group in Supabase
  const createGroup = async () => {
    if (!groupName.trim() || selectedParticipants.length === 0) {
      Alert.alert("Error", "Group name and participants are required.");
      return;
    }

    let imageUrl = chatImage ? await uploadImage(chatImage) : null;

    // Insert Group
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .insert([{ name: groupName, description: groupDescription, image: imageUrl }])
      .select()
      .single();

    if (groupError) {
      Alert.alert("Group Creation Failed", groupError.message);
      return;
    }

    // Insert Participants into Group Members
    const membersData = selectedParticipants.map((userId) => ({
      group_id: groupData.id,
      user_id: userId,
    }));

    const { error: membersError } = await supabase.from("group_members").insert(membersData);

    if (membersError) {
      Alert.alert("Error Adding Participants", membersError.message);
      return;
    }

    Alert.alert("Success", "Group created successfully!");
    bottomSheetRef.current?.close();
  };


  // Handle opening the bottom sheet



  // Handle closing the bottom sheet
;

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
      <>
        <Tab.Navigator
          screenOptions={({ navigation }) => ({
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
          backgroundColor: Platform.OS === 'android' ? 'white' : 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 8,
            },
            tabBarBackground: () => (
          Platform.OS === 'android' ? null : (
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
          )
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
          })}
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
              onPress={() => {
            // Show action modal when pressed
            Alert.alert(
              "Create New",
              "What would you like to create?",
              [
                {
              text: "Create New Member",
              onPress: () => {
                router.push("/CreateUser")
              },
              style: "default"
                },
                {
              text: "Create New Group",
              onPress: () => {
               router.push("/Action")
              },
              style: "default"
                },
                {
              text: "Cancel",
              style: "cancel"
                }
              ],
              { cancelable: true }
            );
              }}
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

        {/* Bottom Sheet for Create Group */}
      
      </>
    </>
  );
}
