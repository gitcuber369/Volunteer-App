import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/service/supabaseClient";
import { router } from "expo-router";
import { useUserData } from "@/hooks/useAuth";

async function handleLogout() {
  try {
    await AsyncStorage.removeItem("session_token");
    await supabase.auth.signOut();
    Alert.alert("Logged out successfully.");
    router.replace({
      pathname: "/",
    });
  } catch (error) {
    console.error("Sign-Out Error:", error);
  }
}

// Call fetchUserData when the component mounts

const Profile = () => {
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();
  const { userData, loading } = useUserData();

  // Call fetchUserData when the component mounts

  const admin = {
    name: "John Doe",
    email: "admin@church.org",
    role: "Master Admin",
    church: {
      name: "Grace Church",
      logo: "assets/images/icon/icon.png",
    },
    engagementStats: {
      green: 35,
      yellow: 10,
      red: 5,
    },
  };

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/icon/icon.png")}
              style={styles.churchLogo}
            />
            <Text style={styles.churchName}>{admin.church.name}</Text>
          </View>
          {/* Admin Details */}
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: "https://i.pravatar.cc/300?img=8" }}
                style={styles.profileImage}
              />
              <Text style={styles.adminName}>
                {userData?.name || admin.name}
              </Text>
              <View style={styles.editIconContainer}>
                <Ionicons name="pencil" size={14} color="white" />
              </View>
            </View>
            <Text style={styles.adminName}>{userData?.name}</Text>
            <Text style={styles.adminEmail}>{userData?.email}</Text>
            <Text style={styles.adminRole}>{userData?.role}</Text>
          </View>
          {/* Volunteer Engagement Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Volunteer Engagement</Text>
            <View style={styles.statsContainer}>
              <View style={[styles.statBox, { backgroundColor: "#10B981" }]}>
                <Text style={styles.statNumber}>
                  {admin.engagementStats.green}
                </Text>
                <Text style={styles.statLabel}>Green</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: "#F59E0B" }]}>
                <Text style={styles.statNumber}>
                  {admin.engagementStats.yellow}
                </Text>
                <Text style={styles.statLabel}>Yellow</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: "#EF4444" }]}>
                <Text style={styles.statNumber}>
                  {admin.engagementStats.red}
                </Text>
                <Text style={styles.statLabel}>Red</Text>
              </View>
            </View>
          </View>
          {/* Actions */}
          <View style={styles.actionCard}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="people-outline" size={24} color="#2563eb" />
              <Text style={styles.actionText}>Manage Users</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="layers-outline" size={24} color="#2563eb" />
              <Text style={styles.actionText}>Manage Teams</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#2563eb" />
              <Text style={styles.actionText}>Messaging</Text>
            </TouchableOpacity>
          </View>
          {/* Logout Button */}
          const [loggingOut, setLoggingOut] = useState(false);
          <TouchableOpacity
            style={[styles.logoutButton, { opacity: loading ? 0.5 : 0.7 }]}
            onPress={async () => {
              handleLogout();
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={24} color="white" />
                <Text style={styles.logoutText}>Logout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F3F4F6",
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  churchLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  churchName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  profileCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 10,
    alignItems: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  adminName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  adminEmail: {
    fontSize: 16,
    color: "gray",
    marginTop: 4,
  },
  adminRole: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "bold",
    marginTop: 4,
  },
  editIconContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.primaryColor,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  statsCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  statLabel: {
    fontSize: 14,
    color: "white",
  },
  actionCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#2563eb",
  },
  logoutButton: {
    backgroundColor: Colors.light.primaryColor,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 60,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default Profile;
