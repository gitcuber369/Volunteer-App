import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { supabase } from "@/service/supabaseClient";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
export default function CreateGroupScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [localImage, setLocalImage] = useState<string | null>(null);
  type User = {
    id: string;
    role: string;
    name: string;
    email: string;
    profile_image: string | null;
  };
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchUsersFromSameChurch();
  }, []);

  const pickImage = async (setImageFunction: (uri: string) => void) => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageFunction(result.assets[0].uri);
    }
  };

  // Function to upload an image to Supabase Storage - Fixed version
  const uploadImage = async (fileUri: string, path: string) => {
    try {
      const fileExt = fileUri.split(".").pop();
      const fileName = `${path}/${Date.now()}.${fileExt}`;

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to ArrayBuffer using base64-arraybuffer decoder
      const arrayBuffer = decode(base64);

      // Upload to Supabase Storage using ArrayBuffer
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
        });

      if (error) {
        console.error("Image Upload Error:", error);
        throw error;
      }

      // Get public URL of the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      const publicUrl = publicUrlData.publicUrl;

      console.log("Image Uploaded Successfully:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Upload Image Error:", error);
      return null;
    }
  };

  async function fetchUsersFromSameChurch() {
    try {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "You must be logged in to create a group");
        return;
      }

      // First get the current user's church_id
      const { data: currentUserData, error: currentUserError } = await supabase
        .from("users")
        .select("church_id")
        .eq("id", user.id)
        .single();

      if (currentUserError || !currentUserData?.church_id) {
        console.error("Error fetching current user church:", currentUserError);
        Alert.alert("Error", "Could not determine your church affiliation");
        return;
      }

      // Then fetch all users from the same church
      const { data: churchMembers, error: membersError } = await supabase
        .from("users")
        .select("id, name, email, role, profile_image")
        .eq("church_id", currentUserData.church_id)
        .neq("id", user.id); // Exclude the current user

      if (membersError) {
        console.error("Error fetching church members:", membersError);
        Alert.alert("Error", "Could not load church members");
        return;
      }

      setUsers(churchMembers || []);
    } catch (error) {
      console.error("Error in fetchUsersFromSameChurch:", error);
      Alert.alert("Error", "Failed to load users from your church");
    }
  }

  async function createGroup() {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }
  
    if (selectedUsers.length === 0) {
      Alert.alert("Error", "Please select at least one member for the group");
      return;
    }
  
    try {
      setIsLoading(true);
      
      // Upload image if selected
      let uploadedImageUrl = null;
      if (imageUrl) {
        setIsUploading(true);
        uploadedImageUrl = await uploadImage(imageUrl, "group_images");
        setIsUploading(false);
        
        if (!uploadedImageUrl) {
          Alert.alert("Warning", "Failed to upload image, but proceeding with group creation");
        }
      }
  
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) {
        Alert.alert("Error", "You must be logged in to create a group");
        return;
      }
  
      // Create the group in the database
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .insert({
          name,
          image_url: uploadedImageUrl, // Use the uploaded image URL here
          created_by: user.id,
        })
        .select()
        .single();
  
      if (groupError) {
        throw groupError;
      }
  
      // Rest of your existing code...
      // Add all selected members to the group
      const groupMembers = selectedUsers.map((userId) => ({
        group_id: groupData.id,
        user_id: userId,
      }));
  
      // Add the creator as an admin
      groupMembers.push({
        group_id: groupData.id,
        user_id: user.id,
      });
  
      const { error: memberError } = await supabase
        .from("group_members")
        .insert(groupMembers);
  
      if (memberError) {
        throw memberError;
      }
  
      Alert.alert("Success", "Group created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Failed to create group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Group Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <View style={styles.profileImageContainer}>
          <Text style={styles.label}>Profile Image</Text>
          <TouchableOpacity
            style={styles.imageSelector}
            onPress={() => pickImage(setImageUrl)}
          >
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons
                  name="camera-alt"
                  size={24}
                  color={Colors.light.primaryColor}
                />
              </View>
            )}
            <Text style={styles.imageText}>
              {imageUrl
                ? "Change profile image"
                : "Tap to select a profile image"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Select Members</Text>
      <Text style={styles.selectedCount}>
        Selected: {selectedUsers.length} member
        {selectedUsers.length !== 1 ? "s" : ""}
      </Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              setSelectedUsers((prev) =>
                prev.includes(item.id)
                  ? prev.filter((id) => id !== item.id)
                  : [...prev, item.id]
              )
            }
            style={[
              styles.userItem,
              selectedUsers.includes(item.id) && styles.selectedUserItem,
            ]}
          >
            <View style={styles.userRow}>
              <Image
                source={{
                  uri: item.profile_image || "https://via.placeholder.com/40",
                }}
                style={styles.profileImage}
              />
              <Text style={styles.userName}>{item.name}</Text>
              {selectedUsers.includes(item.id) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={[styles.createButton, isLoading && styles.disabledButton]}
        onPress={createGroup}
        disabled={isLoading}
      >
        <Text style={styles.createButtonText}>
          {isLoading ? "Creating..." : "Create Group"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  createButton: {
    backgroundColor: "#0066cc",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  imageUploadContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  imageSelector: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    marginTop: 8,
    color: Colors.light.primaryColor,
    textAlign: 'center',
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  placeholderText: {
    color: "#888",
    textAlign: "center",
  },
  uploadButton: {
    backgroundColor: "#0066cc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  // ...rest of your existing styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  selectedCount: {
    marginBottom: 12,
    color: "#666",
  },
  list: {
    flex: 1,
    marginBottom: 20,
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedUserItem: {
    backgroundColor: "#e6f7ff",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    flex: 1,
    fontSize: 16,
  },
  checkmark: {
    color: "#0066cc",
    fontSize: 18,
    fontWeight: "bold",
  },
});
