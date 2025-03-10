import {
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
import Badge from "@/components/ui/badge";

// Sample admin groups data
const adminGroups = [
  {
    id: 1,
    name: "Food Distribution",
    image:
      "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    members: 12,
    lastActivity: "2 hours ago",
  },
  {
    id: 2,
    name: "Shelter Volunteers",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    members: 8,
    lastActivity: "Yesterday",
  },
  {
    id: 3,
    name: "Clothing Drive",
    image:
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    members: 15,
    lastActivity: "3 days ago",
  },
];

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

const VolunteerHome = () => {
  const { top } = useSafeAreaInsets();

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
          <View>
            <GroupsList />
          </View>
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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 8 }}
    >
      {adminGroups.map((group) => (
        <TouchableOpacity
          key={group.id}
          style={{
            width: 220,
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
        >
          <Image
            source={{ uri: group.image }}
            style={{ width: "100%", height: 120 }}
            resizeMode="cover"
          />
          <View style={{ padding: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: Colors.light.text,
                marginBottom: 8,
              }}
            >
              {group.name}
            </Text>
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
                {group.lastActivity}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={{
          width: 220,
          marginHorizontal: 8,
          backgroundColor: "white",
          borderRadius: 12,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: Colors.light.primaryColor,
          justifyContent: "center",
          alignItems: "center",
          height: 180,
        }}
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
            uri: users[3].profileImage,
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

const UserGreeting = () => (
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
        uri: users[3].profileImage,
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
          {users[3].name}
        </Text>
        <Badge
          text="Admin"
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
            St. Mary's Church
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="location-outline" size={16} color="#9ca3af" />
          <Text style={{ marginLeft: 4, color: "#9ca3af", fontSize: 14 }}>
            Los Angeles, CA
          </Text>
        </View>
      </View>
    </View>
  </View>
);

export default VolunteerHome;
