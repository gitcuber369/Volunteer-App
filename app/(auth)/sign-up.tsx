import { View, Text, TextInput, Pressable, StyleSheet, ImageBackground } from "react-native";
import React, { useState } from "react";
import { Colors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChurch, setIsChurch] = useState(false);

  return (
    <ImageBackground
      source={require('@/assets/images/icon/icon.png')} // Add a subtle background image
      style={styles.container}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our volunteer community</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color={Colors.light.primaryColor} style={styles.inputIcon} />
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
                <MaterialIcons name="email" size={20} color={Colors.light.primaryColor} style={styles.inputIcon} />
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
                <MaterialIcons name="lock" size={20} color={Colors.light.primaryColor} style={styles.inputIcon} />
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

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsChurch(!isChurch)}
            >
              <View
                style={[
                  styles.checkbox,
                  isChurch && { backgroundColor: Colors.light.primaryColor, borderColor: Colors.light.primaryColor },
                ]}
              >
                {isChurch && (
                  <MaterialIcons name="check" size={18} color="white" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Register as Church</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                // Add your signup logic here
                console.log({ name, email, password, isChurch });
              }}
            >
              <LinearGradient
                colors={[Colors.light.primaryColor, '#5D3FD3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity>
                <Text style={styles.loginText}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    padding: 20,
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
});

export default Signup;
