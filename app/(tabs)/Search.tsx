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
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fetch current user's church_id when component mounts
    getCurrentUserChurchId();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchUsers();
    } else if (currentUserChurchId) {
      // Show church members when no search or search is too short
      fetchChurchMembers();
    } else {
      setUsers([]);
    }
  }, [searchQuery, currentUserChurchId]);

  const getCurrentUserChurchId = async (): Promise<void> => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("users")
        .select("church_id")
        .eq("id", user.id)
        .single();

      if (data && data.church_id) {
        setCurrentUserChurchId(data.church_id);
      } else if (error) {
        console.error("Error fetching current user's church:", error.message);
      }
    }
    setLoading(false);
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

  const renderUser: ListRenderItem<User> = ({ item, index }) => {
    // Staggered animation for list items
    const itemDelay = index * 100;
    
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
          }
        ]}
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
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.rolePill}>
              <Text style={styles.userRole}>{item.role}</Text>
            </View>
            <View style={styles.churchPill}>
              <FontAwesome5 name="church" size={12} color="#6B7280" style={styles.churchIcon} />
              <Text style={styles.churchInfo}>
                {item.church_id && item.churches
                  ? item.churches.name
                  : "Not associated"}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.addButton,
            item.church_id === currentUserChurchId && styles.addButtonDisabled,
          ]}
          onPress={() => addUserToChurch(item.id)}
          disabled={item.church_id === currentUserChurchId}
        >
          {addingUserId === item.id ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.addButtonText}>
                {item.church_id === currentUserChurchId ? "Added" : "Add"}
              </Text>
              {item.church_id !== currentUserChurchId && (
                <Ionicons name="add-circle" size={14} color="white" style={styles.addIcon} />
              )}
            </>
          )}
        </TouchableOpacity>
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
          <Ionicons name="search" size={50} color="#D1D5DB" />
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubText}>Try a different search term</Text>
        </View>
      );
    } else if (currentUserChurchId && users.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={50} color="#D1D5DB" />
          <Text style={styles.emptyText}>No members in your church yet</Text>
          <Text style={styles.emptySubText}>Search for users to add them</Text>
        </View>
      );
    } else if (!currentUserChurchId) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="home" size={50} color="#D1D5DB" />
          <Text style={styles.emptyText}>You are not part of any church</Text>
          <Text style={styles.emptySubText}>Join a church to add members</Text>
        </View>
      );
    }

    return null;
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

      {searchQuery.length === 0 && currentUserChurchId && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionText}>
            <Ionicons name="people" size={18} color={Colors.light.background} style={styles.sectionIcon} />
            Church Members
          </Text>
          <Text style={styles.countBadge}>{users.length}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.light.primaryColor} />
          <Text style={styles.loaderText}>Searching...</Text>
        </View>
      )}

      <FlatList<User>
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: "#1F2937",
  },
  clearButton: {
    padding: 8,
  },
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  countBadge: {
    backgroundColor: "#EEF2FF",
    color: Colors.light.primaryColor,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    flexWrap: "wrap",
  },
  rolePill: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    color: Colors.light.primaryColor,
    fontWeight: "600",
  },
  churchPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  churchIcon: {
    marginRight: 4,
  },
  churchInfo: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: Colors.light.primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  addButtonDisabled: {
    backgroundColor: Colors.light.primaryColor,
  },
  addButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  addIcon: {
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
});

export default Search;