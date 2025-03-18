import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "@/service/supabaseClient";
import { useLocalSearchParams, router } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function GroupChatScreen() {
  const { groupId } = useLocalSearchParams();

  interface Message {
    id: string;
    message: string;
    created_at: string;
    sender_id: string;
    users: { name: string; profile_image?: string } | null;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [groupName, setGroupName] = useState("Group Chat");
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error("Error fetching user:", error);
      setCurrentUserId(data?.user?.id || null);
    };

    const fetchGroupData = async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("name, image_url")
        .eq("id", groupId)
        .single();

      if (error) console.error("Error fetching group:", error);
      else {
        setGroupName(data?.name || "Group Chat");
        setGroupImage(data?.image_url || null);
      }
    };

    fetchUserData();
    fetchGroupData();
  }, [groupId]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("group_messages")
        .select(
          "id, message, created_at, sender_id, users(name, profile_image)"
        )
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) console.error("Error fetching messages:", error);
      else setMessages(data || []);
    };

    fetchMessages();

    // Real-time subscription
    subscriptionRef.current = supabase
      .channel("group_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "group_messages" },
        async (payload) => {
          const newMessage = payload.new as Message;
          const { data: userData } = await supabase
            .from("users")
            .select("name, profile_image")
            .eq("id", newMessage.sender_id)
            .single();

          newMessage.users = userData || { name: "Unknown" };

          setMessages((prevMessages) => {
            // Avoid duplicate messages
            if (prevMessages.some((msg) => msg.id === newMessage.id)) {
              return prevMessages;
            }
            return [...prevMessages, newMessage];
          });

          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      )
      .subscribe();

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [groupId]);

  const sendMessage = useCallback(async () => {
    if (!message.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    const optimisticMessage: Message = {
      id: Date.now().toString(),
      message: message.trim(),
      created_at: new Date().toISOString(),
      sender_id: userId,
      users: { name: "You", profile_image: undefined },
    };

    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    setMessage("");

    scrollViewRef.current?.scrollToEnd({ animated: true });

    const { error } = await supabase.from("group_messages").insert([
      {
        group_id: grouxpId,
        sender_id: userId,
        message: message.trim(),
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== optimisticMessage.id)
      );
    }
  }, [message, groupId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          padding: 16,
          backgroundColor: "white",
          alignItems: "center",
          paddingTop: 50,
        }}
      >
        <Button title="←" onPress={() => router.back()} color="white" />
        {groupImage ? (
          <Image
            source={{ uri: groupImage }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              marginHorizontal: 10,
            }}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.light.primaryColor,
              justifyContent: "center",
              alignItems: "center",
              marginHorizontal: 10,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {groupName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={{ color: "black", fontSize: 18, fontWeight: "semibold" }}>
          {groupName}
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, padding: 12 }}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        {messages.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor:
                item.sender_id === currentUserId
                  ? Colors.light.primaryColor
                  : "white",
              padding: 12,
              borderRadius: 18,
              marginVertical: 4,
              maxWidth: "80%",
              alignSelf:
                item.sender_id === currentUserId ? "flex-end" : "flex-start",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              {item.users?.profile_image ? (
                <Image
                  source={{ uri: item.users.profile_image }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    marginRight: 6,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "#333",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 6,
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 10, fontWeight: "bold" }}
                  >
                    {item.users?.name?.charAt(0) || "?"}
                  </Text>
                </View>
              )}
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 12,
                  color: item.sender_id === currentUserId ? "white" : "black",
                }}
              >
                {item.users?.name || "User"}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: item }}>{item.message}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View
          style={{
            flexDirection: "row",
            padding: 12,
            borderTopWidth: 1,
            borderTopColor: "#ddd",
            backgroundColor: "white",
          }}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 24,
              padding: 12,
              marginRight: 10,
              backgroundColor: "#f8f8f8",
            }}
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={{
              backgroundColor: Colors.light.primaryColor,
              width: 44,
              height: 44,
              borderRadius: 22,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 18 }}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
