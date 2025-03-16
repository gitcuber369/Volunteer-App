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
                onPress={
                  () => router.push("/(tabs)/Action")
                }
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
        Create Group Chat
          </Text>

          {/* Group Chat Profile Image */}
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
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            alert(
          "Sorry, we need camera roll permissions to make this work!"
            );
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
        }}
          >
        {chatImage ? (
          <Image
            source={{ uri: chatImage }}
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

          {/* Chat Name Input */}
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
          Chat Name
        </Text>
        <TextInput
          placeholder="Enter chat name"
          placeholderTextColor="#aaa"
          style={{
            fontSize: 16,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: "#eaeaea",
          }}
        />
          </View>

          {/* Group Description Input */}
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
          Group Description
        </Text>
        <TextInput
          placeholder="Enter group description"
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={3}
          style={{
            fontSize: 16,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: "#eaeaea",
            textAlignVertical: "top",
          }}
        />
          </View>

          {/* Participants List */}
          <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            marginBottom: 12,
            color: "#444",
          }}
        >
          Add Participants
        </Text>
        
        {/* Search Participants */}
        <View style={{ 
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#f2f2f2",
          borderRadius: 10,
          paddingHorizontal: 12,
          marginBottom: 10,
        }}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            placeholder="Search for participants"
            placeholderTextColor="#aaa"
            style={{
          flex: 1,
          fontSize: 15,
          paddingVertical: 10,
          paddingHorizontal: 8,
            }}
          />
        </View>

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
              borderBottomWidth: item !== 10 ? 1 : 0,
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
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "bold", color: "#888" }}>
            {`P${item}`}
              </Text>
            </View>
            <Text style={{ flex: 1, fontSize: 15 }}>
              Participant {item}
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

          {/* Selected Participants */}
          <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "600",
            marginBottom: 12,
            color: "#444",
          }}
        >
          Selected Participants (3)
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
        >
          {[1, 2, 3].map((item) => (
            <View
          key={item}
          style={{
            alignItems: "center",
            marginRight: 16,
            width: 70,
          }}
            >
          <View style={{ position: "relative" }}>
            <View
              style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: "#e0e0e0",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 6,
              }}
            >
              <Text style={{ fontWeight: "bold", color: "#888" }}>
            {`P${item}`}
              </Text>
            </View>
            <TouchableOpacity
              style={{
            position: "absolute",
            top: -5,
            right: -5,
            backgroundColor: "#ff4444",
            borderRadius: 12,
            width: 24,
            height: 24,
            justifyContent: "center",
            alignItems: "center",
              }}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text 
            numberOfLines={1} 
            style={{ fontSize: 12 }}
          >
            Participant {item}
          </Text>
            </View>
          ))}
        </ScrollView>
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
        onPress={() => {
          // Handle group creation here
          alert("Group created successfully!");
          handleCloseBottomSheet();
        }}
          >
        <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
          Create Chat Group
        </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
      ;
    </>
  );
}
