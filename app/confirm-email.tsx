import { useEffect } from "react";
import { supabase } from "@/service/supabaseClient";
import { router } from "expo-router";
import { Text, View, ActivityIndicator, Alert } from "react-native";

export default function EmailVerificationScreen() {
  useEffect(() => {
    async function checkVerification() {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (data.user?.email_confirmed_at) {
        Alert.alert("Email Verified!", "Redirecting to the dashboard...");
        router.push("/dashboard");
      } else {
        Alert.alert("Email not verified", "Please check your email.");
      }
    }
    checkVerification();
  }, []);

  return (
    <View>
      <Text>Verifying email...</Text>
      <ActivityIndicator size="large" />
    </View>
  );
}
