import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "@/service/supabaseClient";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { ActivityIndicator } from "react-native";
import { decode } from "base64-arraybuffer";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChurch, setIsChurch] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [churchName, setChurchName] = useState("");
  const [churchAddress, setChurchAddress] = useState("");
  const [churchLogo, setChurchLogo] = useState<string | null>(null);

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

  // Handle Signup
  const handleSignup = async () => {
    try {
      setIsLoading(true);
      console.log("Starting signup process...");
      let uploadedProfileImage = null;
      let uploadedChurchLogo = null;

      if (profileImage) {
        uploadedProfileImage = await uploadImage(profileImage, "profiles");
        console.log("Profile Image Uploaded:", uploadedProfileImage);
      }

      if (isChurch && churchLogo) {
        uploadedChurchLogo = await uploadImage(churchLogo, "churches");
        console.log("Church Logo Uploaded:", uploadedChurchLogo);
      }

      // If registering as a church, create the church first
      let churchId = null;
      if (isChurch) {
        console.log("Creating church...");
        const { data: churchData, error: churchError } = await supabase
          .from("churches")
          .insert([
            {
              name: churchName,
              address: churchAddress,
              logo: uploadedChurchLogo,
            },
          ])
          .select()
          .single();

        if (churchError) {
          console.error("Church Creation Error:", churchError);
          throw churchError;
        }

        churchId = churchData.id;
        console.log("Church Created Successfully:", churchId);
      }

      // Register user in Supabase Auth (No email verification)
      console.log("Creating user...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name, 
          },
        },
      });

      if (authError) {
        console.error("User Signup Error:", authError);
        throw authError;
      }

      console.log("User Created in Auth Successfully:", authData);

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error("User ID not found after signup.");
      }

      // Insert user data into the `users` table
      console.log("Inserting user into database...");
      const role = isChurch ? "MasterAdmin" : "Volunteer";
      const { error: userInsertError } = await supabase.from("users").insert([
        {
          id: userId,
          email,
          name, // Store display name in users table
          role,
          church_id: churchId,
          profile_image: uploadedProfileImage,
        },
      ]);

      if (userInsertError) {
        console.error("User Insert Error:", userInsertError);
        throw userInsertError;
      }

      console.log("User Inserted Successfully in `users` Table");

      Alert.alert("Signup Successful", "You are now logged in!");

      // **Auto-login user after signup**
      console.log("Logging in user...");

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        console.error("Auto-login Error:", loginError);
        throw loginError;
      }

      const session = authData.session;
      if (session) {
        await AsyncStorage.setItem("session_token", session.access_token);
        await AsyncStorage.setItem("user_role", role);
        console.log("Session token and role stored:", session.access_token, role);
      }
      

      // **Redirect user based on role**
      switch (role) {
        case "MasterAdmin":
          router.replace({
        pathname: "/(tabs)/Home/MasterAdminHome",
        params: { role: "MasterAdminHome" },
          });
          break;
        case "Volunteer":
          router.replace({
        pathname: "/(tabs)/Home/VolunteerHome",
        params: { role: "VolunteerHome" },
          });
          break;
       
        default:
          router.replace("/(auth)/sign-in");
          break;
      }
    } catch (error) {
      console.error("Signup Error:", error);
      Alert.alert("Signup Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/icon/icon.png")}
      style={styles.container}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.95)"]}
        style={styles.overlay}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our volunteer community</Text>

            <View style={styles.form}></View>
            <View style={styles.profileImageContainer}>
              <Text style={styles.label}>Profile Image</Text>
              <TouchableOpacity
                style={styles.imageSelector}
                onPress={() => pickImage(setProfileImage)}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
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
                  {profileImage
                    ? "Change profile image"
                    : "Tap to select a profile image"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
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
                  placeholder="Enter your name"
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
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <Pressable
              style={styles.checkboxContainer}
              onPress={() => setIsChurch(!isChurch)}
            >
              <View
                style={[
                  styles.checkbox,
                  isChurch && {
                    backgroundColor: Colors.light.primaryColor,
                    borderColor: Colors.light.primaryColor,
                  },
                ]}
              >
                {isChurch && (
                  <MaterialIcons name="check" size={18} color="white" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Register as Church</Text>
            </Pressable>

            {isChurch && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Church Name</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      name="church"
                      size={20}
                      color={Colors.light.primaryColor}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      value={churchName}
                      onChangeText={setChurchName}
                      style={styles.input}
                      placeholder="Enter church name"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Church Address</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      name="location-on"
                      size={20}
                      color={Colors.light.primaryColor}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      value={churchAddress}
                      onChangeText={setChurchAddress}
                      style={styles.input}  
                      placeholder="Enter church address"
                      placeholderTextColor="#999"
                      multiline
                    />
                  </View>
                </View>

                <View style={styles.profileImageContainer}>
                  <Text style={styles.label}>Church Logo</Text>
                  <TouchableOpacity
                    style={styles.imageSelector}
                    onPress={() => pickImage(setChurchLogo)}
                  >
                    {churchLogo ? (
                      <Image
                        source={{ uri: churchLogo }}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <MaterialIcons
                          name="image"
                          size={24}
                          color={Colors.light.primaryColor}
                        />
                      </View>
                    )}
                    <Text style={styles.imageText}>
                      {churchLogo
                        ? "Change church logo"
                        : "Tap to select a church logo"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.light.primaryColor, Colors.light.primaryColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Sign Up</Text>
                    <MaterialIcons
                      name="arrow-forward" 
                      size={20}
                      color="white"
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/sign-in")}
              >
                <Text style={styles.loginText}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  overlay: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.light.primaryColor,
    textAlign: "center",
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
  inputContainer: {
    marginBottom: 12,
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
    borderColor: "#E8E8E8",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#444",
  },
  button: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  loginText: {
    color: Colors.light.primaryColor,
    fontWeight: "600",
    fontSize: 14,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  imageSelector: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  },
});

export default Signup;
