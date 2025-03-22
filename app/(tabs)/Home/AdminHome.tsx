import {
  ActivityIndicator,
  Image,
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
import { useUserData } from "@/hooks/useAuth";
import Badge from "@/components/ui/badge";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/service/supabaseClient";
import moment from "moment";

// Volunteer contact status data
const contactStatus = {
  red: 5, // not contacted for more than a month
  yellow: 12, // not contacted for weeks
  green: 24, // recently contacted
};

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

const AdminHome = () => {
  const { top } = useSafeAreaInsets();
  const { userData, loading } = useUserData();
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          justifyContent: "center",
          alignItems: "center",
        }}
        edges={["top"]}
      >
        <StatusBar animated={true} barStyle="dark-content" />
        <ActivityIndicator size="large" color={Colors.light.primaryColor} />
        <Text style={{ marginTop: 16, color: Colors.light.text }}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

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
            <ContactStatusCards />
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
            <AdminGroupsList />
          </View>
          <Text
            style={{
              color: Colors.light.text,
              fontSize: 20,
              fontWeight: "600",
              paddingHorizontal: 16,
              marginTop: 24,
              marginBottom: 12,
            }}
          >
            Active Volunteers
          </Text>
         
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const ContactStatusCards = () => (
  <View style={{ marginTop: 16 }}>
    <Text
      style={{
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
        color: Colors.light.text,
      }}
    >
      Volunteer Contact Status
    </Text>
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      {/* Red Card - Not contacted for more than a month */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFEBEE", // Light red
          borderRadius: 12,
          padding: 16,
          borderLeftWidth: 4,
          borderLeftColor: "#EF5350", // Red
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        }}
      >
        <Text style={{ color: "#B71C1C", fontSize: 14, marginBottom: 4 }}>
          Urgent
        </Text>
        <Text style={{ color: "#D32F2F", fontSize: 24, fontWeight: "700" }}>
          {contactStatus.red}
        </Text>
        <Text style={{ color: "#B71C1C", fontSize: 12, marginTop: 4 }}>
          No contact for 1+ month
        </Text>
      </View>

      {/* Yellow Card - Not contacted for weeks */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFF8E1", // Light yellow
          borderRadius: 12,
          padding: 16,
          borderLeftWidth: 4,
          borderLeftColor: "#FFD54F", // Yellow
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        }}
      >
        <Text style={{ color: "#F57F17", fontSize: 14, marginBottom: 4 }}>
          Follow Up
        </Text>
        <Text style={{ color: "#FF8F00", fontSize: 24, fontWeight: "700" }}>
          {contactStatus.yellow}
        </Text>
        <Text style={{ color: "#F57F17", fontSize: 12, marginTop: 4 }}>
          No contact for weeks
        </Text>
      </View>

      {/* Green Card - Recently contacted */}
      <View
        style={{
          flex: 1,
          backgroundColor: "#E8F5E9", // Light green
          borderRadius: 12,
          padding: 16,
          borderLeftWidth: 4,
          borderLeftColor: "#66BB6A", // Green
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        }}
      >
        <Text style={{ color: "#2E7D32", fontSize: 14, marginBottom: 4 }}>
          Active
        </Text>
        <Text style={{ color: "#388E3C", fontSize: 24, fontWeight: "700" }}>
          {contactStatus.green}
        </Text>
        <Text style={{ color: "#2E7D32", fontSize: 12, marginTop: 4 }}>
          Recently contacted
        </Text>
      </View>
    </View>
  </View>
);

const AdminGroupsList = () => {
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 8 }}
    >
      {groups.map((group) => (
        <TouchableOpacity
          key={group.id}
          style={{
            width: 220,
            height: 250, // Fixed height for consistency
            marginHorizontal: 8,
            backgroundColor: "white",
            borderRadius: 12,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}
          onPress={() => router.push(`/${group.id}`)}
        >
          <Image
            source={{ uri: group.image_url || 'https://placeholder.com/500' }}
            style={{ width: "100%", height: 120 }}
            resizeMode="cover"
          />
          <View style={{ padding: 12, flex: 1, justifyContent: "space-between" }}>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: Colors.light.text,
                    marginBottom: 4,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {group.name}
                </Text>
                {group.unreadCount > 0 && (
                  <View style={{
                    backgroundColor: Colors.light.primaryColor,
                    borderRadius: 10,
                    minWidth: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                      {group.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text 
                style={{ color: '#6b7280', fontSize: 12, marginBottom: 8, height: 30 }}
                numberOfLines={2}
              >
                {group.lastMessage}
              </Text>
            </View>
            
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="people-outline" size={14} color="#9ca3af" />
                  <Text style={{ marginLeft: 4, color: "#9ca3af", fontSize: 12 }}>
                    {group.members} members
                  </Text>
                </View>
                <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                  {group.time}
                </Text>
              </View>
              
              {/* User avatars */}
              {group.memberImages.length > 0 && (
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  {group.memberImages.slice(0, 3).map((image, index) => (
                    <Image 
                      key={index}
                      source={{ uri: image || 'https://via.placeholder.com/30' }}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        marginLeft: index > 0 ? -10 : 0,
                        borderWidth: 1,
                        borderColor: 'white'
                      }}
                    />
                  ))}
                  {group.members > 3 && (
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#e5e7eb',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: -10,
                      borderWidth: 1,
                      borderColor: 'white'
                    }}>
                      <Text style={{ fontSize: 10, color: '#6b7280' }}>
                        +{group.members - 3}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity

        style={{
          width: 220,
          height: 250, // Same height as other cards
          marginHorizontal: 8,
          backgroundColor: "white",
          borderRadius: 12,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: Colors.light.primaryColor,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => router.push('/Action')}
      >
        <Ionicons
          name="add-circle-outline"
          size={32}
          color={Colors.light.primaryColor}
        />
        <Text
          style={{
            marginTop: 8,
            color: Colors.light.primaryColor,
            fontWeight: "500",
          }}
        >
          Create New Group
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Header = () => {
  const scrollY = useSharedValue(0);
  const { userData, loading } = useUserData();
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
        source={require("@/assets/images/icon/icon.png")}
        style={[{ width: 64, height: 64 }, iconAnimatedStyle]}
        resizeMode="cover"
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

        <TouchableOpacity
          onPress={() => {
            router.push("/(tabs)/Search");
          }}
        >
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
        <TouchableOpacity
        onPress={() => {
          router.push("/(tabs)/Profile");
        }
        }
        >
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
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const UserGreeting = () => {
  const { userData, loading } = useUserData();
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
          text={userData?.role}
          color="white"
          size="small"
          backgroundColor="#10b981"
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
           {userData?.church?.name}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="location-outline" size={16} color="#9ca3af" />
          <Text style={{ marginLeft: 4, color: "#9ca3af", fontSize: 14 }}>
            {userData?.church?.address}
          </Text>
        </View>
      </View>
    </View>
  </View>
  )
};

export default AdminHome;
