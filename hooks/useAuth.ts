import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/service/supabaseClient";

interface UserData {
  id: string;
  role: string;
  name: string;
  email: string;
}

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session_token = await AsyncStorage.getItem("session_token");

        if (!session_token) {
          console.error("No session token found");
          setLoading(false);
          return;
        }

        console.log("Session Token Found:", session_token);

        const { data: user, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          setLoading(false);
          return;
        }

        const userId = user?.user?.id;
        console.log("Authenticated User ID:", userId);

        if (!userId) {
          console.error("User ID not found.");
          setLoading(false);
          return;
        }

        const { data: userData, error: userDataError } = await supabase
          .from("users")
          .select("id, role, name, email")
          .eq("id", userId)
          .single();

        if (userDataError) {
          console.error("Error fetching user data:", userDataError);
          setLoading(false);
          return;
        }

        console.log("Fetched User Data:", userData);
        setUserData(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, loading };
};
