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
} from "react-native";
import { supabase } from "@/service/supabaseClient";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  useEffect(() => {
    // Fetch current user's church_id when component mounts
    getCurrentUserChurchId();
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

  const renderUser: ListRenderItem<User> = ({ item }) => (
    <View style={styles.userCard}>
      {item.profile_image ? (
        <Image
          source={{ uri: item.profile_image }}
          style={styles.profileImage}
        />
      ) : (
        <View style={styles.profileImagePlaceholder}>
          <Text style={styles.profileImagePlaceholderText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.userRole}>{item.role}</Text>
          <Text style={styles.churchInfo}>
            {item.church_id && item.churches
              ? item.churches.name
              : "Not associated"}
          </Text>
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
          <Text style={styles.addButtonText}>
            {item.church_id === currentUserChurchId ? "Added" : "Add"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = (): React.ReactElement | null => {
    if (loading) return null;

    if (searchQuery.length > 2) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      );
    } else if (currentUserChurchId && users.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No members in your church yet</Text>
        </View>
      );
    } else if (!currentUserChurchId) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You are not part of any church</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          placeholderTextColor="#888"
        />
      </View>

      {searchQuery.length === 0 && currentUserChurchId && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Church Members</Text>
        </View>
      )}

      {loading && (
        <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
      )}

      <FlatList<User>
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f7fa",
  },
  searchContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContainer: {
    marginBottom: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  searchInput: {
    height: 56,
    paddingHorizontal: 20,
    backgroundColor: "white",
    fontSize: 16,
    borderRadius: 16,
  },
  loader: {
    marginVertical: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileImagePlaceholderText: {
    color: "white",
    fontSize: 20,
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
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  userRole: {
    fontSize: 13,
    color: "#4F46E5",
    fontWeight: "500",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  churchInfo: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
  },
  addButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  addButtonDisabled: {
    backgroundColor: "#A5B4FC",
  },
  addButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
});

export default Search;
