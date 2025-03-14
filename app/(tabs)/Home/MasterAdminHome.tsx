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
import { BarChart, LineChart } from "react-native-gifted-charts";
import Badge from "@/components/ui/badge";
import { Colors } from "@/constants/Colors";
import { users } from "@/constants/data";
import GroupsList from "@/components/OnlineComponent";
import { useUserData } from "@/hooks/useAuth";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

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

const janeDoeData = {
  volunteersPerGroup: [
    { value: 4, label: "G1" },
    { value: 3, label: "G2" },
    { value: 3, label: "G3" },
    { value: 3, label: "G4" },
    { value: 3, label: "G5" },
    { value: 5, label: "G6" },
  ],
  interactions: [
    { value: 8, label: "Sep 1" },
    { value: 10, label: "Sep 2" },
    { value: 9, label: "Sep 3" },
    { value: 10, label: "Sep 4" },
    { value: 9, label: "Sep 5" },
    { value: 8, label: "Sep 6" },
  ],
  volunteersAdded: [
    { value: 2, label: "Sep 1" },
    { value: 5, label: "Sep 2" },
    { value: 10, label: "Sep 3" },
    { value: 4, label: "Sep 4" },
    { value: 6, label: "Sep 5" },
    { value: 5, label: "Sep 6" },
    { value: 5, label: "Sep 7" },
    { value: 5, label: "Sep 8" },
    { value: 5, label: "Sep 9" },
  ],
};

const MasterAdminHome = () => {
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
          </View>
          <Text
            style={{
              color: Colors.light.text,
              fontSize: 20,
              fontWeight: "600",
              paddingHorizontal: 16,
            }}
          >
            Overview
          </Text>

          <View
            style={{
              flexDirection: "row",
              marginTop: 5,
              paddingHorizontal: 16,
            }}
          >
            <ChartCard
              title="Volunteers"
              icon="people-outline"
              chart={
                <View style={{ marginTop: -20 }}>
                  <BarChart
                    data={janeDoeData.volunteersPerGroup}
                    barWidth={20}
                    spacing={10}
                    roundedTop
                    hideAxesAndRules
                    xAxisLabelTextStyle={{ color: "transparent", fontSize: 12 }}
                    hideOrigin
                    hideRules
                    hideYAxisText
                    showGradient
                    frontColor={Colors.light.accent2}
                    barStyle={{ borderRadius: 10 }}
                  />
                </View>
              }
            />
            <View style={{ width: 16 }} />
            <ChartCard
              title="Interactions"
              icon="sync-outline"
              chart={
                <View style={{ marginTop: -20 }}>
                  <BarChart
                    data={janeDoeData.interactions}
                    barWidth={20}
                    spacing={10}
                    roundedTop
                    xAxisLabelTextStyle={{ color: "white", fontSize: 12 }}
                    hideAxesAndRules
                    hideOrigin
                    hideRules
                    hideYAxisText
                    showGradient
                    frontColor={Colors.light.accent1}
                  />
                </View>
              }
            />
          </View>
          <InteractionTrendsCard />
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
            uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
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
            text="Master Admin"
            color="white"
            size="small"
            backgroundColor="#333"
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
  );
};

const ChartCard = ({
  title,
  icon,
  chart,
}: {
  title: string;
  icon: string;
  chart: React.ReactNode;
}) => (
  <View
    style={{
      flex: 1,
      backgroundColor: Colors.light.background,
      borderRadius: 16,
      height: 250,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      marginBottom: 16,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        padding: 12,
        borderRadius: 12,
      }}
    >
      <View
        style={{
          backgroundColor: Colors.light.primaryColor,
          borderRadius: 8,
          padding: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <Text
        style={{
          color: "#1B1838",
          fontSize: 18,
          fontWeight: "600",
          textAlign: "center",
          alignSelf: "center",
        }}
      >
        {title}
      </Text>
    </View>
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {chart}
    </View>
  </View>
);

const InteractionTrendsCard = () => (
  <View
    style={{
      backgroundColor: Colors.light.background,
      borderRadius: 24,
      padding: 24,
      marginTop: 16,
      marginHorizontal: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
    }}
  >
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: 20,
        paddingHorizontal: 8,
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        padding: 12,
        borderRadius: 16,
      }}
    >
      <View
        style={{
          backgroundColor: Colors.light.primaryColor,
          padding: 10,
          borderRadius: 12,
          marginRight: 12,
        }}
      >
        <Ionicons name="stats-chart-outline" size={24} color="white" />
      </View>
      <Text
        style={{ color: Colors.light.text, fontSize: 22, fontWeight: "700" }}
      >
        Interaction Trends
      </Text>
    </View>
    <LineChart
      data={janeDoeData.volunteersAdded}
      curved
      thickness={4}
      color={Colors.light.primaryColor}
      dataPointsColor={Colors.light.primaryColor}
      endFillColor={Colors.light.primaryColor}
      startOpacity={0.2}
      endOpacity={0.01}
      hideDataPoints={false}
      hideYAxisText
      hideAxesAndRules
      yAxisLabelTexts={["0", "5", "10", "15"]}
      xAxisLabelTextStyle={{ color: Colors.light.text, fontSize: 12 }}
    />
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 24,
        backgroundColor: "rgba(0,0,0,0.02)",
        padding: 16,
        borderRadius: 16,
      }}
    >
      <View>
        <Text
          style={{
            color: Colors.light.text,
            fontSize: 14,
            opacity: 0.6,
            marginBottom: 4,
          }}
        >
          Total Volunteers
        </Text>
        <Text
          style={{ color: Colors.light.text, fontSize: 24, fontWeight: "700" }}
        >
          50
        </Text>
      </View>
      <View>
        <Text
          style={{
            color: "#4ade80",
            fontSize: 14,
            opacity: 0.8,
            marginBottom: 4,
            textAlign: "right",
          }}
        >
          Active Groups
        </Text>
        <Text style={{ color: "#4ade80", fontSize: 24, fontWeight: "700" }}>
          6
        </Text>
      </View>
    </View>
  </View>
);

export default MasterAdminHome;
