import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/service/supabaseClient";

interface ChurchData {
  id: string;
  name: string;
  address: string;
  logo: string;
}

interface UserData {
  id: string;
  role: string;
  profile_image: string;
  name: string;
  email: string;
  church?: ChurchData | null;
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

   

        const { data: user, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          setLoading(false);
          return;
        }

        const userId = user?.user?.id;
        if (!userId) {
          console.error("User ID not found.");
          setLoading(false);
          return;
        }

        const { data: userData, error: userDataError } = await supabase
          .from("users")
          .select("id, role, name, email, profile_image, church:churches(id, name, address, logo)")
          .eq("id", userId)
          .single();

        if (userDataError) {
          console.error("Error fetching user data:", userDataError);
          setLoading(false);
          return;
        }

       
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
