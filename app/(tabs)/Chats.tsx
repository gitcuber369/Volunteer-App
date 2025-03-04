import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { oneToOneChats, groupChats } from "@/constants/data";
import { router } from "expo-router";

const Tab = createMaterialTopTabNavigator();

const OneToOneChats = () => {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      {oneToOneChats.map((chat, index) => (
        <React.Fragment key={chat.id}>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/Chat/[id]", params: { id: chat.id } })
            }
            android_ripple={{ color: "#f0f0f0" }}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  marginRight: 12,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={{ uri: chat.profileImage }}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {chat.name}
                </Text>
                <Text style={{ color: "#666" }}>{chat.lastMessage}</Text>
              </View>
              <View>
                <Text style={{ color: "#666", fontSize: 12 }}>{chat.time}</Text>
                {chat.unreadCount > 0 && (
                  <View
                    style={{
                      backgroundColor: Colors.light.primaryColor,
                      borderRadius: 10,
                      padding: 4,
                      marginTop: 4,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 12 }}>
                      {chat.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
          {index < oneToOneChats.length - 1 && (
            <View
              style={{
                height: 1,
                backgroundColor: "#E8E8E8",
                marginVertical: 8,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </ScrollView>
  );
};

const GroupChats = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        padding: 16,
      }}
      className="flex-1 p-4"
    >
      <FlatList
        data={groupChats}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/[groupId]",
                params: { groupId: item.id },
              })
            }
            android_ripple={{ color: "rgba(0,0,0,0.05)" }}
            className="flex-row items-center p-4 rounded-xl mb-3 border border-gray-200"
            style={({ pressed }) => (pressed ? { opacity: 0.7 } : {})}
          >
            {/* Group Icon */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: Colors.light.primaryColor,
                  fontWeight: "600",
                }}
              >
                {item.name.charAt(0)}
              </Text>
            </View>

            {/* Group Info */}
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-900">
                {item.name}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <Text className="text-sm text-gray-500">
                  {item.members || "0"} members
                </Text>
                <View className="w-1.5 h-1.5 bg-gray-400 rounded-full mx-2" />
                <Text className="text-sm text-gray-500">{item.time}</Text>
              </View>

              {/* Profile Images and Unread Count */}
              <View className="flex-row items-center mt-2">
                <View className="flex-row">
                  {/* Add more profile images here if needed */}
                  {/* Additional profile images with overlapping effect */}
                  {item.participants &&
                    item.memberImages
                      .slice(0, 2)
                      .map((profile, idx) => (
                        <Image
                          key={`member-${idx}`}
                          source={{ uri: profile }}
                          className="size-10 rounded-full border-2 border-white shadow-sm"
                          style={{ marginLeft: -8 }}
                        />
                      ))}
                </View>

                {item.unreadCount > 0 && (
                  <View
                    className="rounded-full px-2 py-0.5 items-center justify-center ml-3"
                    style={{ backgroundColor: Colors.light.primaryColor }}
                  >
                    <Text className="text-white text-xs font-bold">
                      {item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Arrow Icon */}
            <Text className="text-2xl text-gray-500 opacity-50">›</Text>
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const Chats = () => {
  return (
    <View style={{ flex: 1, paddingTop: useSafeAreaInsets().top }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.light.primaryColor,
          tabBarInactiveTintColor: "#666",
          tabBarIndicatorStyle: { backgroundColor: Colors.light.primaryColor },
          tabBarPressColor: "transparent",
          tabBarPressOpacity: 1,
          tabBarStyle: { elevation: 0, shadowOpacity: 0 },
        }}
        tabBarPosition="top"
      >
        <Tab.Screen
          name="Direct Messages"
          component={OneToOneChats}
          options={{
            lazy: true,
            animationEnabled: true,
            tabBarStyle: { backgroundColor: Colors.light.background },
          }}
        />
        <Tab.Screen
          name="Groups"
          component={GroupChats}
          options={{
            lazy: true,
            tabBarStyle: { backgroundColor: Colors.light.background },
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

export default Chats;

const styles = {
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: Colors.light.text,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 20,
    color: Colors.light.tint,
    fontWeight: "600",
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  groupDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberInfo: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.6,
  },
  lastActive: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.6,
    marginLeft: 4,
  },
  profileImagesContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
  badge: {
    backgroundColor: Colors.light.tint,
    borderRadius: 10,
    padding: 4,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  arrowIcon: {
    fontSize: 24,
    color: Colors.light.text,
    opacity: 0.5,
  },
};
