import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ListRenderItem,
  Animated,
  StatusBar,
  ScrollView,
} from "react-native";
import { supabase } from "@/service/supabaseClient";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

// Define types for user data
interface Church {
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_image: string | null;
  church_id: string | null;
  churches: Church | null;
}

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentUserChurchId, setCurrentUserChurchId] = useState<string | null>(
    null
  );
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [fadingUserId, setFadingUserId] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [groups, setGroups] = useState<{ id: string, name: string }[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [addingToGroup, setAddingToGroup] = useState<boolean>(false);
  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current user's church_id when component mounts
    getCurrentUserInfo();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (currentUserChurchId) {
      fetchGroups();
    }
  }, [currentUserChurchId]);

  useEffect(() => {
    if (searchQuery.length > 2 && currentUserChurchId) {
      // Modified to only search within users who have the same church_id
      fetchChurchMembersWithSearch();
    } else if (currentUserChurchId) {
      // Show church members when no search or search is too short
      fetchChurchMembers();
    } else {
      setUsers([]);
    }
  }, [searchQuery, currentUserChurchId]);

  const getCurrentUserInfo = async (): Promise<void> => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("users")
        .select("church_id, role")
        .eq("id", user.id)
        .single();

      if (data) {
        setCurrentUserChurchId(data.church_id);
        setCurrentUserRole(data.role);
      } else if (error) {
        console.error("Error fetching current user's info:", error.message);
      }
    }
    setLoading(false);
  };

  const fetchGroups = async (): Promise<void> => {
    if (!currentUserChurchId) return;

    try {
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, created_by")
        .eq("church_id", currentUserChurchId);

      if (error) {
        console.error("Error fetching groups:", error.message);
      } else {
        setGroups(data);
      }
    } catch (error) {
      console.error("Exception fetching groups:", error);
    }
  };

  const fetchUserChurchAndGroups = async (userId: string): Promise<{churchId: string | null, groupIds: string[]}> => {
    try {
      // Fetch user's church
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("church_id")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user's church:", userError.message);
        return { churchId: null, groupIds: [] };
      }

      // Fetch user's groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);

      if (groupsError) {
        console.error("Error fetching user's groups:", groupsError.message);
        return { churchId: userData?.church_id || null, groupIds: [] };
      }

      const groupIds = groupsData.map(item => item.group_id);
      
      return {
        churchId: userData?.church_id || null,
        groupIds
      };
    } catch (error) {
      console.error("Exception fetching user's church and groups:", error);
      return { churchId: null, groupIds: [] };
    }
  };

  const fetchChurchMembers = async (): Promise<void> => {
    if (!currentUserChurchId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, name, email, role, profile_image, church_id, churches(name)"
        )
        .eq("church_id", currentUserChurchId);

      if (error) {
        console.error("Error fetching church members:", error.message);
      } else {
        setUsers(data as User[]);
      }
    } catch (error) {
      console.error("Exception fetching church members:", error);
    } finally {
      setLoading(false);
    }
  };

  // New function to search within church members only
  const fetchChurchMembersWithSearch = async (): Promise<void> => {
    if (!currentUserChurchId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, name, email, role, profile_image, church_id, churches(name)"
        )
        .eq("church_id", currentUserChurchId)
        .ilike("name", `%${searchQuery}%`);

      if (error) {
        console.error("Error searching church members:", error.message);
      } else {
        setUsers(data as User[]);
      }
    } catch (error) {
      console.error("Exception searching church members:", error);
    } finally {
      setLoading(false);
    }
  };

  // Keeping this function for reference, but it won't be used anymore
  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, name, email, role, profile_image, church_id, churches(name)"
        )
        .ilike("name", `%${searchQuery}%`)
        .is("church_id", null);

      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        setUsers(data as User[]);
      }
    } catch (error) {
      console.error("Exception fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const addUserToChurch = async (userId: string): Promise<void> => {
    if (!currentUserChurchId) {
      Alert.alert("Error", "You don't belong to any church. Cannot add users.");
      return;
    }

    setAddingUserId(userId);

    try {
      const { error } = await supabase
        .from("users")
        .update({ church_id: currentUserChurchId })
        .eq("id", userId);

      if (error) {
        Alert.alert("Error", "Failed to add user to church: " + error.message);
      } else {
        // Update the local state to reflect the change
        setUsers(
          users.map((user) => {
            if (user.id === userId) {
              // Get the church name from any other user with the same church_id
              const churchName =
                users.find(
                  (u) => u.church_id === currentUserChurchId && u.churches
                )?.churches?.name || "Your church";

              return {
                ...user,
                church_id: currentUserChurchId,
                churches: { name: churchName },
              };
            }
            return user;
          })
        );

        Alert.alert("Success", "User added to your church successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error(error);
    } finally {
      setAddingUserId(null);
    }
  };

  const addUserToGroup = async (userId: string, groupId: string): Promise<void> => {
    if (!groupId) {
      Alert.alert("Error", "Please select a group");
      return;
    }

    setAddingToGroup(true);

    try {
      // First, check if the user is already in the group
      const { data: existingMembership, error: checkError } = await supabase
        .from('group_members')
        .select('id')
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .single();

      if (existingMembership) {
        Alert.alert("Note", "User is already a member of this group");
        setAddingToGroup(false);
        setShowGroupModal(false);
        return;
      }

      const { error } = await supabase
        .from('group_members')
        .insert({
          user_id: userId,
          group_id: groupId,
          role: 'Member'
        });

      if (error) {
        Alert.alert("Error", "Failed to add user to group: " + error.message);
      } else {
        Alert.alert("Success", "User added to group successfully!");
        setShowGroupModal(false);
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error(error);
    } finally {
      setAddingToGroup(false);
    }
  };

  const promoteToAdmin = async (userId: string): Promise<void> => {
    setChangingRoleId(userId);

    try {
      const { error } = await supabase
        .from("users")
        .update({ role: "Admin" })
        .eq("id", userId);

      if (error) {
        Alert.alert("Error", "Failed to promote user: " + error.message);
      } else {
        // Update the local state to reflect the change
        setUsers(
          users.map((user) => {
            if (user.id === userId) {
              return {
                ...user,
                role: "Admin",
              };
            }
            return user;
          })
        );

        Alert.alert("Success", "User has been promoted to Admin!");
        setExpandedUserId(null);
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error(error);
    } finally {
      setChangingRoleId(null);
    }
  };

  const toggleExpandUser = (userId: string): void => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
    }
  };

  const openGroupModal = (userId: string): void => {
    setSelectedUserId(userId);
    setSelectedGroupId(null);
    setShowGroupModal(true);
  };

  const renderUser: ListRenderItem<User> = ({ item, index }) => {
    const isExpanded = expandedUserId === item.id;
    const isMasterAdmin = currentUserRole === "MasterAdmin";
    const canPromote = isMasterAdmin && item.role === "Volunteer" && item.church_id === currentUserChurchId;
    const isAlreadyInChurch = item.church_id === currentUserChurchId;
    return (
      <Animated.View 
        style={[
          styles.userCard,
          { 
            opacity: fadeAnim, 
            transform: [{ 
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              }) 
            }] 
          },
          isExpanded && styles.expandedCard
        ]}
      >
        <TouchableOpacity 
          style={styles.userCardContent}
          onPress={() => toggleExpandUser(item.id)}
          activeOpacity={0.7}
        >
          {item.profile_image ? (
            <Image
              source={{ uri: item.profile_image }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: getRandomColor(item.name) }]}>
              <Text style={styles.profileImagePlaceholderText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text
            numberOfLines={1}
            ellipsizeMode="tail"
             style={styles.userEmail}>{item.email}</Text>
            <View style={styles.detailsContainer}>
              <View style={[
                styles.rolePill, 
                item.role === "Admin" && styles.adminRolePill,
                item.role === "MasterAdmin" && styles.masterAdminRolePill
              ]}>
                <Text style={[
                  styles.userRole,
                  item.role === "Admin" && styles.adminRoleText,
                  item.role === "MasterAdmin" && styles.masterAdminRoleText
                ]}>{item.role}</Text>
              </View>
              <View style={styles.churchPill}>
                <FontAwesome5 name="church" size={12} color="#6B7280" style={styles.churchIcon} />
                <Text 
                  numberOfLines={1}
                  style={styles.churchInfo}>
                  {item.church_id && item.churches
                    ? item.churches.name
                    : "Not associated"}
                </Text>
              </View>
            </View>
          </View>
          
          {!isExpanded && !isAlreadyInChurch && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                addUserToChurch(item.id);
              }}
              disabled={addingUserId === item.id}
            >
              {addingUserId === item.id ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Text style={styles.addButtonText}>Add</Text>
                  <Ionicons name="add-circle" size={14} color="white" style={styles.addIcon} />
                </>
              )}
            </TouchableOpacity>
          )}
          
          {!isExpanded && isAlreadyInChurch && (
            <View style={styles.addedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{marginRight: 4}} />
              <Text style={styles.addedText}>Added</Text>
            </View>
          )}
          
          {isMasterAdmin && (
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B7280" 
              style={styles.expandIcon}
            />
          )}
        </TouchableOpacity>

        {isExpanded && isAlreadyInChurch && (
          <View style={styles.expandedOptions}>
            {canPromote && (
              <TouchableOpacity 
                style={styles.promoteButton}
                onPress={() => promoteToAdmin(item.id)}
                disabled={changingRoleId === item.id}
              >
                {changingRoleId === item.id ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="shield" size={16} color="white" style={{marginRight: 8}} />
                    <Text style={styles.promoteButtonText}>Promote to Admin</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.groupButton}
              onPress={() => openGroupModal(item.id)}
            >
              <Ionicons name="people" size={16} color="white" style={{marginRight: 8}} />
              <Text style={styles.groupButtonText}>Add to Group</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  const getRandomColor = (name: string): string => {
    const colors = [
      "#4F46E5", "#6366F1", "#8B5CF6", "#A855F7", "#EC4899", 
      "#F43F5E", "#F97316", "#FBBF24", "#22C55E", "#0EA5E9"
    ];
    const hash = name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + acc;
    }, 0);
    return colors[hash % colors.length];
  };

  const renderEmptyList = (): React.ReactElement | null => {
    if (loading) return null;

    if (searchQuery.length > 2) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={60} color="#D1D5DB" />
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubText}>Try a different search term</Text>
        </View>
      );
    } else if (currentUserChurchId && users.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={60} color="#D1D5DB" />
          <Text style={styles.emptyText}>No members in your church yet</Text>
          <Text style={styles.emptySubText}>Search for users to add them</Text>
        </View>
      );
    } else if (!currentUserChurchId) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="home" size={60} color="#D1D5DB" />
          <Text style={styles.emptyText}>You are not part of any church</Text>
          <Text style={styles.emptySubText}>Join a church to add members</Text>
        </View>
      );
    }

    return null;
  };

  const renderGroupModal = () => {
    if (!showGroupModal) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add to Group</Text>
            <TouchableOpacity onPress={() => setShowGroupModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>
            Select a group to add this member to:
          </Text>
          
          <ScrollView style={styles.groupList}>
            {groups.length === 0 ? (
              <Text style={styles.noGroupsText}>No groups available</Text>
            ) : (
              groups.map(group => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.groupItem,
                    selectedGroupId === group.id && styles.selectedGroupItem
                  ]}
                  onPress={() => setSelectedGroupId(group.id)}
                >
                  <Text style={[
                    styles.groupItemText,
                    selectedGroupId === group.id && styles.selectedGroupItemText
                  ]}>
                    {group.name}
                  </Text>
                  {selectedGroupId === group.id && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.light.primaryColor} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowGroupModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                (!selectedGroupId || addingToGroup) && styles.disabledButton
              ]}
              onPress={() => selectedUserId && selectedGroupId && addUserToGroup(selectedUserId, selectedGroupId)}
              disabled={!selectedGroupId || addingToGroup}
            >
              {addingToGroup ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>Add to Group</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find People</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          placeholder="Search users by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          placeholderTextColor="#9CA3AF"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.length === 0 && currentUserChurchId && users.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTextContainer}>
            <Ionicons name="people" size={20} color={Colors.light.primaryColor} style={styles.sectionIcon} />
            <Text style={styles.sectionText}>People</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{users.length}</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.light.primaryColor} />
          <Text style={styles.loaderText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList<User>
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUser}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
      
      {renderGroupModal()}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: "#1F2937",
  },
  clearButton: {
    padding: 6,
  },
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  sectionIcon: {
    marginRight: 8,
  },
  countBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    color: Colors.light.primaryColor,
    fontWeight: "600",
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  expandedCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  userCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileImagePlaceholderText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
    paddingRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    flexWrap: "wrap",
  },
  rolePill: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  adminRolePill: {
    backgroundColor: "#ECFDF5",
  },
  masterAdminRolePill: {
    backgroundColor: "#FEF3C7",
  },
  userRole: {
    fontSize: 13,
    color: Colors.light.primaryColor,
    fontWeight: "600",
  },
  adminRoleText: {
    color: "#059669",
  },
  masterAdminRoleText: {
    color: "#D97706",
  },
  churchPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    flexShrink: 1,
    maxWidth: '100%',
  },
  churchIcon: {
    marginRight: 4,
  },
  churchInfo: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    flexShrink: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: Colors.light.primaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  addIcon: {
    marginLeft: 4,
  },
  addedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  addedText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "600",
  },
  expandIcon: {
    padding: 8,
    marginLeft: 4,
  },
  expandedOptions: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  promoteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.accent1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: Colors.light.accent1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  promoteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  groupButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor:  Colors.light.primaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  groupButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    flex: 1,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 16,
  },
  groupList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  groupItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F3F4F6",
  },
  selectedGroupItem: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: Colors.light.primaryColor,
  },
  groupItemText: {
    fontSize: 16,
    color: "#4B5563",
    fontWeight: "500",
  },
  selectedGroupItemText: {
    color: Colors.light.primaryColor,
    fontWeight: "600",
  },
  noGroupsText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    padding: 20,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    color: "#4B5563",
    fontWeight: "600",
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: Colors.light.primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
});

export default Search;