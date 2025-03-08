import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { supabase } from "@/service/supabaseClient";
import { Colors } from "@/constants/Colors";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      console.log("Signing in user...");

      // Authenticate user with email & password
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        console.error("Sign-In Error:", authError);
        throw authError;
      }

      console.log("User signed in successfully:", authData);

      // Get user ID
      const userId = authData.user?.id;
      if (!userId) {
        throw new Error("User ID not found after sign-in.");
      }

      // Fetch user details from `users` table
      console.log("Fetching user role...");
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("User Fetch Error:", userError);
        throw userError;
      }

      const role = userData?.role;
      console.log("User role fetched:", role);

      // Redirect based on role
      if (role === "MasterAdmin") {
        router.push({
          pathname: "/(tabs)/Home/MasterAdminHome",
          params: { role: "MasterAdminHome" },
        });
      } else {
        router.push({
          pathname: "/(tabs)/Home/VolunteerHome",
          params: { role: "VolunteerHome" },
        });
      }

      Alert.alert("Sign-In Successful", "Welcome back!");
    } catch (error) {
      console.error("Sign-In Failed:", error);
      Alert.alert("Sign-In Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignUp = () => {
    router.push("/sign-up");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/icon/splash-icon-light.png")}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <View style={styles.contentContainer}>
            {/* Logo or Image */}
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/icon/splash-icon-light.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your journey
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSignIn}
                style={styles.button}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Signing In..." : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={navigateToSignUp}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImageStyle: {
    opacity: 0.1, 
    resizeMode: "contain",
  },
  keyboardAvoid: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.primaryColor,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    marginVertical: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.light.primaryColor,
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    backgroundColor: Colors.light.primaryColor,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  signUpText: {
    color: Colors.light.primaryColor,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default SignIn;
