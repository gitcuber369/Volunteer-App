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
import { useUserData} from "@/hooks/useAuth"


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
  const { userData } = useUserData()
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
            <GroupsList />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
            uri: users[2].profileImage,
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
        uri: users[2].profileImage,
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
          {users[2].name}
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
