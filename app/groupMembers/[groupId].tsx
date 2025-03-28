import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/service/supabaseClient";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

export default function GroupMembersScreen() {
  const { groupId } = useLocalSearchParams();

  const [groupInfo, setGroupInfo] = useState<{
    name: string;
    image_url: string | null;
  }>({ name: "", image_url: null });
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("member");
  const [isLoading, setIsLoading] = useState<boolean>(true);

useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Get current user ID from Supabase auth
            const {
                data: { user },
            } = await supabase.auth.getUser();
            const currentUserId = user?.id;

            // Fetch group data
            const { data: groupData } = await supabase
                .from("groups")
                .select("name, image_url")
                .eq("id", groupId)
                .single();

            // Fetch user role from users table
            const { data: userData } = await supabase
                .from("users")
                .select("role")
                .eq("id", currentUserId)
                .single();

            // Fetch members data
            const { data: membersData } = await supabase
                .from("group_members")
                .select("user_id, role, users(id, name, profile_image)")
                .eq("group_id", groupId);

            // Find current user's role in the group
            const userMember = membersData?.find(
                (m) => m.user_id === currentUserId
            );
            if (userMember) {
                setCurrentUserRole(userMember.role);
            }

            // If user has a system role (MasterAdmin or Admin), override the group role
            if (userData?.role === "MasterAdmin" || userData?.role === "Admin") {
                setCurrentUserRole(userData.role);
            }

            const cleaned = (membersData || []).map((m) => ({
                id: m.user_id,
                name: m.users?.name || "Unknown",
                profile_image: m.users?.profile_image || null,
                role: m.role || "member",
            }));

            setGroupInfo(groupData);
            setMembers(cleaned);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
}, [groupId]);

const removeFromGroup = async (userId: string) => {
    try {
        const { error } = await supabase
            .from("group_members")
            .delete()
            .eq("group_id", groupId)
            .eq("user_id", userId);

        if (error) throw error;

        // Update the UI by removing the member
        setMembers(members.filter((member) => member.id !== userId));
    } catch (error) {
        console.error("Error removing member:", error);
    }
};

const makeTeamLeader = async (userId: string) => {
    try {
        // Start a transaction to update both tables
        // Update the selected user to TeamLeader in group_members table
        const { error: groupMemberError } = await supabase
            .from("group_members")
            .update({ role: "TeamLeader" })
            .eq("group_id", groupId)
            .eq("user_id", userId);

        if (groupMemberError) throw groupMemberError;

        // Update the user's role in the users table
        const { error: userError } = await supabase
            .from("users")
            .update({ role: "TeamLeader" })
            .eq("id", userId);

        if (userError) throw userError;

        // Update the UI to reflect the change
        setMembers(
            members.map((member) =>
                member.id === userId ? { ...member, role: "TeamLeader" } : member
            )
        );
    } catch (error) {
        console.error("Error updating role:", error);
    }
};

// User can manage members if they are MasterAdmin, Admin, or TeamLeader
const canManageMembers =
    currentUserRole === "MasterAdmin" ||
    currentUserRole === "Admin" ||
    currentUserRole === "TeamLeader";

const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
        case "teamleader":
            return { bg: "#E3F2FD", text: "#1565C0" };
        case "admin":
            return { bg: "#EDE7F6", text: "#5E35B1" };
        case "masteradmin":
            return { bg: "#FFEBEE", text: "#C62828" };
        default:
            return { bg: "#E8F5E9", text: "#2E7D32" };
    }
};

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.light.primaryColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.light.primaryColor}
      />

    
      <LinearGradient
        colors={[Colors.light.primaryColor, Colors.light.primaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <View style={styles.groupImageContainer}>
            {groupInfo.image_url ? (
              <Image
                source={{ uri: groupInfo.image_url }}
                style={styles.groupImage}
              />
            ) : (
              <View style={styles.groupImagePlaceholder}>
                <Text style={styles.groupImagePlaceholderText}>
                  {groupInfo.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.groupName}>{groupInfo.name}</Text>
          <View style={styles.memberCountBadge}>
            <Text style={styles.memberCount}>{members.length} members</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Members Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Members</Text>

        {/* Member List */}
        <FlatList
          data={members}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.membersList}
          renderItem={({ item }) => {
            const roleColors = getRoleBadgeColor(item.role);

            return (
              <View style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  {item.profile_image ? (
                    <Image
                      source={{ uri: item.profile_image }}
                      style={styles.memberAvatar}
                    />
                  ) : (
                    <View style={styles.memberAvatarPlaceholder}>
                      <Text style={styles.memberAvatarText}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.memberNameContainer}>
                    <Text style={styles.memberName}>{item.name}</Text>
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: roleColors.bg },
                      ]}
                    >
                      <Text
                        style={[styles.roleText, { color: roleColors.text }]}
                      >
                        {item.role}
                      </Text>
                    </View>
                  </View>
                </View>

                {canManageMembers && (
                  <View style={styles.actionButtonContainer}>
                    {item.role !== "TeamLeader" && (
                      <Text
                        style={styles.actionButton}
                        onPress={() => makeTeamLeader(item.id)}
                      >
                        Make Leader
                      </Text>
                    )}
                    <Text
                      style={[styles.actionButton, styles.removeButton]}
                      onPress={() => removeFromGroup(item.id)}
                    >
                      Remove
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  headerContent: {
    alignItems: "center",
  },
  groupImageContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  actionButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primaryColor,
    marginLeft: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    overflow: "hidden",
  },
  removeButton: {
    color: Colors.light.error,
    backgroundColor: "#FFEBEE",
  },
  groupImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#ffffff",
  },
  groupImagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#ffffff",
  },
  groupImagePlaceholderText: {
    fontSize: 44,
    fontWeight: "bold",
    color: "#ffffff",
  },
  groupName: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  memberCountBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  memberCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  sectionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    color: "#333333",
    letterSpacing: 0.5,
  },
  membersList: {
    paddingBottom: 20,
  },
  memberCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  memberAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0E6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  memberAvatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.primaryColor,
  },
  memberNameContainer: {
    flex: 1,
    marginLeft: 15,
  },
  memberInfo: {
    flex: 1,
    flexDirection: "column",
  },
  memberName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
