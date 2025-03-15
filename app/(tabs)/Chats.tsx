import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { oneToOneChats, groupChats } from "@/constants/data";
import { router } from "expo-router";
import { supabase } from "@/service/supabaseClient";
import moment from "moment";

const Tab = createMaterialTopTabNavigator();

const OneToOneChats = () => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        console.error("No authenticated user found");
        setRefreshing(false);
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("church_id")
        .eq("id", user.user.id)
        .single();

      if (!userData) {
        console.error("No user data found");
        setRefreshing(false);
        return;
      }

      const { data: churchUsers } = await supabase
        .from("users")
        .select("id, name, profile_image")
        .eq("church_id", userData.church_id)
        .neq("id", user.user.id);

      if (churchUsers) {
        const usersWithLastMessage = await Promise.all(
          churchUsers.map(async (chat) => {
            const { data: lastMessage } = await supabase
              .from("messages")
              .select("message, created_at")
              .or(`sender_id.eq.${chat.id},receiver_id.eq.${chat.id}`)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            return {
              ...chat,
              lastMessage: lastMessage?.message || "No messages yet",
              lastMessageTime: lastMessage?.created_at
                ? moment(lastMessage.created_at).fromNow()
                : undefined,
            };
          })
        );
        setUsers(usersWithLastMessage);
      }
    } catch (error) {
      console.error("Error refreshing chats:", error);
    } finally {
      setRefreshing(false);
    }
  };
  const [users, setUsers] = useState<
    {
      id: string;
      name: string;
      profile_image: string;
      lastMessage?: string;
      lastMessageTime?: string;
      time?: string;
      unreadCount?: number;
    }[]
  >([]);

  useEffect(() => {
    const fetchUsersWithLastMessage = async () => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      const { data: userData, error: userDataError } = await supabase
        .from("users")
        .select("church_id")
        .eq("id", user?.user?.id)
        .single();

      if (userDataError) {
        console.error("Error fetching user data:", userDataError);
        return;
      }

      // Fetch users from the same church excluding current user
      const { data: churchUsers, error: churchUsersError } = await supabase
        .from("users")
        .select("id, name, profile_image")
        .eq("church_id", userData.church_id)
        .neq("id", user?.user?.id);

      if (churchUsersError) {
        console.error("Error fetching church users:", churchUsersError);
        return;
      }

      // Fetch last messages for each user
      const usersWithLastMessage = await Promise.all(
        churchUsers.map(async (chat) => {
          const { data: lastMessage, error: lastMessageError } = await supabase
            .from("messages")
            .select("message, created_at")
            .or(`sender_id.eq.${chat.id},receiver_id.eq.${chat.id}`)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (lastMessageError && lastMessageError.code !== "PGRST116") {
            console.error("Error fetching last message:", lastMessageError);
          }

          return {
            ...chat,
            lastMessage: lastMessage?.message || "No messages yet",
            lastMessageTime: lastMessage?.created_at
              ? moment(lastMessage.created_at).fromNow()
              : undefined,
          };
        })
      );

      setUsers(usersWithLastMessage);
    };

    fetchUsersWithLastMessage();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        padding: 16,
      }}
    >
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primaryColor]}
            tintColor={Colors.light.primaryColor}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({ pathname: "/Chat/[id]", params: { id: item.id } })
            }
            android_ripple={{ color: "rgba(0,0,0,0.05)" }}
            className="flex-row items-center p-4 rounded-xl mb-3 border border-gray-200"
            style={({ pressed }) => [
              {
                backgroundColor: "#ffffff",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            {/* User Profile Image */}
            <View
              style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              overflow: "hidden",
              borderWidth: 2,
              borderColor: "rgba(37, 99, 235, 0.1)",
              }}
            >
              <Image
              source={{ 
                uri: item.profile_image || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=3131&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              }}
              style={{ width: "100%", height: "100%" }}
              />
            </View>

            {/* Chat Info */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View className="flex-row justify-between items-center">
                <Text className="text-base font-semibold text-gray-900">
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500">
                  {item.lastMessageTime || ""}
                </Text>
              </View>
              
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-sm text-gray-600 mt-1"
              >
                {item.lastMessage}
              </Text>
            </View>

            {/* Arrow Icon */}
            <Text className="text-2xl text-gray-500 opacity-50 ml-2">›</Text>
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="items-center justify-center p-6 opacity-70">
            <Text className="text-gray-500 text-center">
              No contacts found. Pull down to refresh.
            </Text>
          </View>
        }
      />
    </View>
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
