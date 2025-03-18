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
              timestamp: lastMessage?.created_at
                ? new Date(lastMessage.created_at)
                : new Date(0),
              lastMessageTime: lastMessage?.created_at
                ? moment(lastMessage.created_at).fromNow()
                : undefined,
            };
          })
        );

        // Sort by most recent message timestamp
        const sortedUsers = usersWithLastMessage.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        setUsers(sortedUsers);
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
      timestamp?: Date;
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
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("message, created_at, is_read, receiver_id")
            .or(`sender_id.eq.${chat.id},receiver_id.eq.${chat.id}`)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Fetch unread messages count
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact" })
            .eq("receiver_id", user?.user?.id)
            .eq("sender_id", chat.id)
            .eq("is_read", false);

          return {
            ...chat,
            lastMessage: lastMessage?.message || "No messages yet",
            timestamp: lastMessage?.created_at
              ? new Date(lastMessage.created_at)
              : new Date(0),
            lastMessageTime: lastMessage?.created_at
              ? moment(lastMessage.created_at).fromNow()
              : undefined,
            unreadCount: unreadCount || 0,
          };
        })
      );

      // Sort by most recent message timestamp
      const sortedUsers = usersWithLastMessage.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );

      setUsers(sortedUsers);
    };

    fetchUsersWithLastMessage();
  }, []);

  // Auto-refresh every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
    }, 1000); // Refresh every 1 second

    return () => clearInterval(interval); // Cleanup interval on unmount
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
            {/* Unread Messages Badge */}
            {(item.unreadCount ?? 0) > 0 && (
              <View 
                style={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  backgroundColor: Colors.light.primaryColor,
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  zIndex: 10,
                  transform: [{ translateY: -12 }]
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                  {item.unreadCount}
                </Text>
              </View>
            )}
            
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
                  uri:
                    item.profile_image ||
                    "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=3131&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </View>

            {/* Chat Info */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View className="flex-row justify-between items-center">
                <Text 
                  className={`text-base font-semibold ${(item.unreadCount ?? 0) > 0 ? 'text-black' : 'text-gray-900'}`}
                  style={(item.unreadCount ?? 0) > 0 ? { fontWeight: '700' } : {}}
                >
                  {item.name}
                </Text>
                <Text className="text-xs text-gray-500">
                  {item.lastMessageTime || ""}
                </Text>
              </View>

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className={`text-sm ${(item.unreadCount ?? 0) > 0 ? 'text-gray-800 font-medium' : 'text-gray-600'} mt-1`}
              >
                {item.lastMessage}
              </Text>
            </View>

            {/* Arrow Icon */}
            <View className="relative">
              {(item.unreadCount ?? 0) > 0 && (
                <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                  <Text className="text-xs text-white font-bold">
                    {item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
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
  const [groups, setGroups] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserGroups = async () => {
    try {
      setRefreshing(true);
      
      // Get current authenticated user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.error("No authenticated user found");
        return;
      }

      const userId = userData.user.id;

      // Get all groups the user is a member of
      const { data: userGroups, error: userGroupsError } = await supabase
        .from('group_members')
        .select("group_id, groups(id, name, created_at, image_url)")
        .eq('user_id', userId)
        .limit(1000);

      if (userGroupsError) {
        console.error("Error fetching user groups:", userGroupsError);
        return;
      }
      // Extract unique groups - ensure each item is a single object not an array
   
      const uniqueGroups = userGroups.map(item => item.groups);

      // For each group, get member count and last message
      const groupsWithDetails = await Promise.all(
        uniqueGroups.map(async (group) => {
          // Get member count
          const { count: memberCount } = await supabase
            .from('group_members')
            .select('*', { count: 'exact' })
            .eq('group_id', group.id);

          // Get group members with profiles for avatars
          const { data: members } = await supabase
            .from('group_members')
            .select('users:user_id(id, name, profile_image)')
            .eq('group_id', group.id)
            .limit(3);

          const memberImages = members?.map(m => m.users?.profile_image) || [];

          // Get last message and unread count
          const { data: lastMessage } = await supabase
            .from('group_messages')
            .select('message, created_at')
            .eq('group_id', group.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread message count for current user
          const { count: unreadCount } = await supabase
            .from('group_messages')
            .select('*', { count: 'exact' })
            .eq('group_id', group.id)
            .eq('is_read', false)
            .neq('sender_id', userId);
        
          return {
            id: group.id,
            name: group.name,
            image_url: group.image_url,
            members: memberCount || 0,
            time: lastMessage?.created_at 
              ? moment(lastMessage.created_at).fromNow()
              : "No activity",
            lastMessage: lastMessage?.message || "No messages yet",
            memberImages: memberImages,
            unreadCount: unreadCount || 0,
            timestamp: lastMessage?.created_at 
              ? new Date(lastMessage.created_at) 
              : new Date(0),
          };
        })
      );

      // Sort by most recent message timestamp
      const sortedGroups = groupsWithDetails.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );

      setGroups(sortedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, []);

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
        data={groups}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchUserGroups}
            colors={[Colors.light.primaryColor]}
            tintColor={Colors.light.primaryColor}
          />
        }
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
             {item.image_url ? (
               <Image
                style={{ width: 48, height: 48, borderRadius: 24 }} 
                source={{
                  uri: item.image_url
                }}
              />
             ) : (
              <Text style={{ fontSize: 20, color: Colors.light.primaryColor }}>
                {item.name.charAt(0)}
              </Text>
             )}
            </View>

            {/* Group Info */}
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-900">
                {item.name}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <Text className="text-sm text-gray-500">
                  {item.members} members
                </Text>
                <View className="w-1.5 h-1.5 bg-gray-400 rounded-full mx-2" />
                <Text className="text-sm text-gray-500">{item.time}</Text>
              </View>

              {/* Profile Images and Unread Count */}
              <View className="flex-row items-center mt-2">
                <View className="flex-row">
                  {item.memberImages && 
                    item.memberImages.slice(0, 3).map((profile, idx) => (
                      <Image
                        key={`member-${idx}`}
                        source={{ 
                          uri: profile || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=3131&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        }}
                        className="w-6 h-6 rounded-full border-2 border-white"
                        style={{ marginLeft: idx > 0 ? -8 : 0 }}
                      />
                    ))}
                </View>

                {(item.unreadCount > 0) && (
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
        ListEmptyComponent={
          <View className="items-center justify-center p-6 opacity-70">
            <Text className="text-gray-500 text-center">
              No groups found. Pull down to refresh.
            </Text>
          </View>
        }
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
