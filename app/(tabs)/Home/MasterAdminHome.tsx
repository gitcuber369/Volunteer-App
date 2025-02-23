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
import OnlineChurchMembers from "@/components/OnlineComponent";

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <StatusBar animated={true} barStyle="light-content" />
      <View style={{ flex: 1 }}>
        <Header />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ padding: 16 }}>
          <UserGreeting />
          </View>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "600" , paddingHorizontal: 16}}>
            Overview
          </Text>
         
          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <ChartCard
              title="Volunteers"
              icon="people-outline"
              chart={
                <BarChart
                  data={janeDoeData.volunteersPerGroup}
                  barWidth={20}
                  spacing={10}
                  roundedTop
                  hideAxesAndRules
                  xAxisLabelTextStyle={{ color: "white", fontSize: 12 }}
                  hideOrigin
                  hideRules
                  hideYAxisText
                  showGradient
                  frontColor="#2563eb"
                  barStyle={{ borderRadius: 10 }}
                />
              }
            />
            <View style={{ width: 16 }} />
            <ChartCard
              title="Interactions"
              icon="sync-outline"
              chart={
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
                  frontColor="#22c55e"
                />
              }
            />
          </View>
          <InteractionTrendsCard />
          <View>
            <OnlineChurchMembers users={users} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const Header = () => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    }}
  >
    <Image
      source={require("@/assets/images/icons/icon.png")}
      style={{ width: 64, height: 64 }}
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
        <Ionicons name="moon-outline" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="search-outline" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="notifications-outline" size={24} color="white" />
      </TouchableOpacity>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
        }}
        style={{ width: 48, height: 48, borderRadius: 24 }}
        resizeMode="cover"
      />
    </View>
  </View>
);

const UserGreeting = () => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
      marginBottom: 20,
    }}
  >
    <Image
      source={{
        uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      }}
      style={{ width: 80, height: 80, borderRadius: 40 }}
      resizeMode="cover"
    />
    <View>
      <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
        {getGreeting()}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginTop: 8,
        }}
      >
        <Text style={{ color: "#9ca3af", fontSize: 18, fontWeight: "600" }}>
          {users[1].name}
        </Text>
        <Badge
          text="Master Admin"
          color="white"
          size="small"
          backgroundColor="#333"
          borderColor="transparent"
        />
      </View>
    </View>
  </View>
);

const ChartCard = ({ title, icon, chart }) => (
  <View
    style={{
      flex: 1,
      backgroundColor: "#1B1838",
      borderRadius: 16,
      padding: 6,
      height: 320,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
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
        }}
      >
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
        {title}
      </Text>
    </View>
    <View style={{ flex: 1, justifyContent: "center" }}>{chart}</View>
  </View>
);

const InteractionTrendsCard = () => (
  <View
    style={{
      backgroundColor: "#1B1838",
      borderRadius: 12,
      padding: 24,
      marginTop: 20,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
      }}
    >
      <Ionicons name="stats-chart-outline" size={24} color="white" />
      <Text style={{ color: "white", fontSize: 20, fontWeight: "600" }}>
        Interaction Trends
      </Text>
    </View>
    <LineChart
      data={janeDoeData.volunteersAdded}
      curved
      thickness={3}
      color={Colors.light.primaryColor}
      dataPointsColor={Colors.light.primaryColor}
      dataPointsTextColor="white"
      endFillColor="transparent"
      startOpacity={0.4}
      endOpacity={0}
      hideDataPoints={false}
      hideRules
      hideYAxisText
      hideAxesAndRules
      yAxisLabelTexts={["0", "5", "10", "15"]}
      xAxisLabelTextStyle={{ color: "white", fontSize: 12 }}
    />
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 24,
      }}
    >
      <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
        Total Volunteers: 50
      </Text>
      <Text style={{ color: "#4ade80", fontSize: 18, fontWeight: "600" }}>
        Online: 10
      </Text>
    </View>
  </View>
);

export default MasterAdminHome;
