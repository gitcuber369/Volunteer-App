import {
  Text,
  View,
  TextInput,
  FlatList,
  Pressable,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/service/supabaseClient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
const ChatScreen = () => {
  const { top } = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const chatId = params?.id; // Receiver ID

  interface ChatMessage {
    id?: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    created_at?: string;
  }

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [receiver, setReceiver] = useState<{
    name: string;
    profile_image: string;
  } | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      const userId = user?.user?.id;
      setUserId(userId);

      if (!userId || !chatId) return;

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${chatId}),and(sender_id.eq.${chatId},receiver_id.eq.${userId})`
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data);
      }
    };

    fetchMessages();

    // **Real-time messages listener**
    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            payload.new as ChatMessage,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [chatId]);

  useEffect(() => {
    const fetchReceiverDetails = async () => {
      if (!chatId) return;

      const { data, error } = await supabase
        .from("users")
        .select("name, profile_image")
        .eq("id", chatId)
        .single();

      if (error) {
        console.error("Error fetching user details:", error);
      } else {
        setReceiver(data);
      }
    };

    fetchReceiverDetails();
  }, [chatId]);

  const sendMessage = async () => {
    if (!message.trim() || !userId || !chatId) return;

    const newMessage = {
      sender_id: userId,
      receiver_id: chatId,
      message: message.trim(),
      created_at: new Date().toISOString(),
      id: Date.now().toString(), // Temporary ID until we get the real one from the server
    };

    // Optimistically update UI
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage(""); // Clear input field immediately

    // Then send to server
    const { error } = await supabase
      .from("messages")
      .insert([
        { sender_id: userId, receiver_id: chatId, message: message.trim() },
      ]);

    if (error) {
      console.error("Error sending message:", error);
      // Could add logic here to revert the optimistic update if needed
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
      {/* Enhanced Header */}

      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-2">
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.light.primaryColor}
          />
        </TouchableOpacity>
        {receiver && (
            <View className="flex-row items-center ml-2">
            <Image
              source={{
              uri: receiver.profile_image || "https://i.pravatar.cc/300",
              }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <Text className="ml-2 text-lg font-semibold text-gray-800">
              {receiver.name}
            </Text>
            </View>
        )}
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {messages.map((item) => {
            const isMine = item.sender_id === userId;
            return (
              <View
                key={item.id || item.created_at || Math.random().toString()}
                style={{
                  alignSelf: isMine ? "flex-end" : "flex-start",
                  backgroundColor: isMine ? Colors.light.primaryColor : "white",
                  padding: 14,
                  borderRadius: isMine ? 20 : 20,
                  borderTopLeftRadius: !isMine ? 4 : 20,
                  borderTopRightRadius: isMine ? 4 : 20,
                  marginVertical: 8,
                  maxWidth: "80%",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    color: isMine ? "#fff" : "#333",
                    fontSize: 16,
                    lineHeight: 22,
                  }}
                >
                  {item.message}
                </Text>
                <Text
                  style={{
                    color: isMine ? "rgba(255,255,255,0.7)" : "#999",
                    fontSize: 11,
                    alignSelf: "flex-end",
                    marginTop: 6,
                    fontWeight: "500",
                  }}
                >
                  {new Date(item.created_at || "").toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={16}
        style={{
          marginHorizontal: 16,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "white",
            padding: 8,
            paddingHorizontal: 16,
            borderRadius: 30,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 5,
            alignItems: "center",
          }}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor="#AAA"
            multiline
            maxLength={500}
            style={{
              flex: 1,
              paddingVertical: 6,
              paddingHorizontal: 6,
              fontSize: 14,
              color: "#333",
              maxHeight: 80,
            }}
          />
          <Pressable
            onPress={sendMessage}
            disabled={!message.trim()}
            style={({ pressed }) => ({
              backgroundColor: !message.trim()
                ? "#E0E0E0"
                : pressed
                  ? Colors.light.primaryColor
                  : Colors.light.primaryColor,
              padding: 10,
              borderRadius: 25,
              justifyContent: "center",
              alignItems: "center",
              width: 40,
              height: 40,
              marginLeft: 8,
            })}
          >
            <Ionicons name="send" size={20} color={Colors.light.primaryColor} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
