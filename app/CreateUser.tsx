import React, { useState, useEffect } from "react";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "@/service/supabaseClient";
import { router } from "expo-router";
import { decode } from "base64-arraybuffer";
import { Picker } from "@react-native-picker/picker";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";

const CreateUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Volunteer");
  const [churchId, setChurchId] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch church ID for the logged-in master admin
  useEffect(() => {
    const fetchChurchId = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("users")
            .select("church_id")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          if (data) setChurchId(data.church_id);
        }
      } catch (error) {
        console.error("Error fetching church ID:", error);
        Alert.alert("Error", "Failed to load church information");
      }
    };

    fetchChurchId();
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

  // Function to upload an image to Supabase Storage
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

  // Handle user creation
  const handleCreateUser = async () => {
    if (!name || !email || !password || !role || !churchId) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }
  
    try {
      setIsLoading(true);
  
      // Save current admin session
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
  
      let uploadedProfileImage = null;
  
      if (profileImage) {
        uploadedProfileImage = await uploadImage(profileImage, "profiles");
        console.log("Profile Image Uploaded:", uploadedProfileImage);
      }
  
      // Create user (signs in as new user)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
  
      if (authError) throw authError;
  
      const userId = authData.user?.id;
      if (!userId) throw new Error("User ID not found after signup.");
  
      // Add user to `users` table
      const { error: userInsertError } = await supabase.from("users").insert([
        {
          id: userId,
          email,
          name,
          role,
          church_id: churchId,
          profile_image: uploadedProfileImage,
        },
      ]);
  
      if (userInsertError) throw userInsertError;
  
      // Restore original admin session
      if (currentSession) {
        const { error: restoreError } = await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        });
  
        if (restoreError) {
          console.error("Error restoring session:", restoreError);
          Alert.alert("Warning", "User created but failed to restore session.");
        }
      }
  
      Alert.alert(
        "User Created Successfully",
        `${name} has been added as a ${role}`,
        [
          {
            text: "OK",
            onPress: () => {
              setName("");
              setEmail("");
              setPassword("");
              setProfileImage(null);
              setRole("Volunteer");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("User Creation Error:", error);
      Alert.alert(
        "Failed to Create User",
        error.message || "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { label: "Volunteer", value: "Volunteer" },
    { label: "Admin", value: "Admin" },
  ];

  const selectRole = (selectedRole: string) => {
    setRole(selectedRole);
    setModalVisible(false);
  };

  return (
    <LinearGradient
      colors={['#f8f9fa', '#ffffff']}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Add New Member</Text>
          <Text style={styles.subtitle}>
            Create a new user account for your church
          </Text>

          <View style={styles.form}>
            <View style={styles.profileImageContainer}>
              <Text style={styles.label}>Profile Image</Text>
              <TouchableOpacity
                style={styles.imageSelector}
                onPress={() => pickImage(setProfileImage)}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <MaterialIcons
                      name="camera-alt"
                      size={28}
                      color={Colors.light.primaryColor}
                    />
                  </View>
                )}
                <Text style={styles.imageText}>
                  {profileImage
                    ? "Change profile image"
                    : "Tap to select a profile image"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="person"
                    size={20}
                    color={Colors.light.primaryColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    placeholder="Enter member's name"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="email"
                    size={20}
                    color={Colors.light.primaryColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    style={styles.input}
                    placeholder="Enter member's email"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="lock"
                    size={20}
                    color={Colors.light.primaryColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    placeholder="Enter temporary password"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Role</Text>
                <TouchableOpacity
                  style={styles.inputWrapper}
                  onPress={() => setModalVisible(true)}
                >
                  <MaterialIcons
                    name="people"
                    size={20}
                    color={Colors.light.primaryColor}
                    style={styles.inputIcon}
                  />
                  <Text style={styles.input}>{role.replace("_", " ")}</Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color="#999"
                    style={styles.inputIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateUser}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.light.primaryColor, '#4a67d7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Create User</Text>
                  <MaterialIcons name="person-add" size={20} color="white" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Role Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Role</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#999" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalDivider} />
              
              {roles.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.roleOption}
                  onPress={() => selectRole(item.value)}
                >
                  <Text
                    style={[
                      styles.roleText,
                      role === item.value && styles.selectedRoleText
                    ]}
                  >
                    {item.label}
                  </Text>
                  {role === item.value && (
                    <MaterialIcons name="check" size={20} color={Colors.light.primaryColor} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.light.primaryColor,
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  form: {
    gap: 16,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginVertical: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
    paddingLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  button: {
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: Colors.light.primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  gradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 16,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.light.primaryColor,
    fontSize: 16,
    fontWeight: "500",
  },
  profileImageContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  imageSelector: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.light.primaryColor,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(230, 230, 250, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.light.primaryColor,
    borderStyle: "dashed",
    marginBottom: 8,
  },
  imageText: {
    color: Colors.light.primaryColor,
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 15,
  },
  roleOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleText: {
    fontSize: 17,
    color: "#333",
  },
  selectedRoleText: {
    color: Colors.light.primaryColor,
    fontWeight: "600",
  }
});

export default CreateUser;
