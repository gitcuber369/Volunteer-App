import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { users } from "@/constants/data";
import GroupsList from "@/components/OnlineComponent";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Badge from "@/components/ui/badge";
import { useUserData } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/service/supabaseClient";
import moment from "moment";
import { router } from "expo-router";

const getGreeting = () => {
  const currentHour = new Date().getHours();
  if (currentHour < 12) {
    return "Good Morning 🌅";
  } else if (currentHour < 18) {
    return "Good Afternoon ☀️";
  } else {
    return "Good Evening 🌙";
  }
};




const VolunteerHome = () => {
  const { top } = useSafeAreaInsets();
  const { userData } = useUserData();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      edges={["top"]}
    >
      <StatusBar animated={true} barStyle="dark-content" />
      <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
        <Header />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 16 }}>
            <UserGreeting />
          </View>
          <Text
            style={{
              color: Colors.light.text,
              fontSize: 20,
              fontWeight: "600",
              paddingHorizontal: 16,
              marginTop: 16,
              marginBottom: 12,
            }}
          >
            Your Groups
          </Text>
          <View>
            <GroupChats />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const Header = () => {
  const { userData } = useUserData();
  const scrollY = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, -20],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        scrollY.value,
        [0, 100],
        [1, 0.8],
        Extrapolate.CLAMP
      ),
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            scrollY.value,
            [0, 100],
            [1, 0.8],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
          paddingHorizontal: 16,
          backgroundColor: Colors.light.background,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        },
        animatedStyles,
      ]}
    >
      <Animated.Image
        source={require("@/assets/images/icon/adaptive-icon.png")}
        style={[{ width: 100, height: 60 }, iconAnimatedStyle]}
        resizeMode="center"
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.light.primaryColor,
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Animated.View style={iconAnimatedStyle}>
            <Ionicons name="moon-outline" size={24} color="white" />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity>
          <Animated.View style={iconAnimatedStyle}>
            <Ionicons
              name="search-outline"
              size={24}
              color={Colors.light.icon}
            />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity>
          <Animated.View style={iconAnimatedStyle}>
            <View>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={Colors.light.icon}
              />
              <View
                style={{
                  position: "absolute",
                  right: -6,
                  top: -6,
                  backgroundColor: "#ef4444",
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 12, fontWeight: "600" }}
                >
                  3
                </Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>

        <Animated.Image
          source={{
            uri: userData?.profile_image,
          }}
          style={[
            { width: 48, height: 48, borderRadius: 24 },
            iconAnimatedStyle,
          ]}
          resizeMode="cover"
        />
      </View>
    </Animated.View>
  );
};

const UserGreeting = () => {
  const { userData } = useUserData();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 4,
        marginBottom: 12,
      }}
    >
      <Image
        source={{
          uri: userData?.profile_image,
        }}
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          marginRight: 16,
        }}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: Colors.light.text,
            fontSize: 22,
            fontWeight: "700",
            marginBottom: 4,
          }}
        >
          {getGreeting()}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: "#9ca3af",
              fontSize: 16,
              fontWeight: "600",
              marginRight: 8,
            }}
          >
            {userData?.name}
          </Text>
          <Badge
            text="Volunteer"
            color="white"
            size="small"
            backgroundColor="#2563eb"
            borderColor="transparent"
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <Ionicons name="business-outline" size={16} color="#9ca3af" />
            <Text style={{ marginLeft: 4, color: "#9ca3af", fontSize: 14 }}>
              {userData?.church?.name || "Church Name"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="location-outline" size={16} color="#9ca3af" />
            <Text style={{ marginLeft: 4, color: "#9ca3af", fontSize: 14 }}>
              {userData?.church?.address || "Location"}
            </Text>
          </View>
        </View>
      </View>
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
        .select("group_id, groups(id, name, created_at)")
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
export default VolunteerHome;
