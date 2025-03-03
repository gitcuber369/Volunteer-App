import {
  Text,
  View,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useRef, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { groupChats } from "@/constants/data";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const GroupChatScreen = () => {
  const params = useLocalSearchParams();
  const { groupId } = params;
  const [message, setMessage] = useState("");
  const scrollViewRef = useRef(null);

  const currentGroup = groupChats.find((chat) => chat.id === Number(groupId));

  useEffect(() => {
    // Scroll to bottom when component mounts or messages change
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  }, [currentGroup?.messages]);

  const sendMessage = () => {
    if (message.trim().length === 0) return;
    // Here you would normally add the message to your backend
    // For now just resetting the input
    setMessage("");

    // Scroll to bottom after sending message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (!currentGroup) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>Group not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 px-4 py-2 bg-primary rounded-lg"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-2">
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.light.primaryColor}
          />
        </TouchableOpacity>

        <Image
          source={{ uri: currentGroup.profileImage }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View>
          <Text className="text-lg font-semibold">{currentGroup.name}</Text>
          <Text className="text-xs text-gray-500">
            {currentGroup.members?.length || 0} members
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        {currentGroup.messages.map((message, index) => (
          <View
            key={index}
            className={`mb-4 max-w-[80%] ${message.senderId === 1 ? "self-end ml-auto" : "self-start"}`}
          >
            {message.senderId !== 1 && (
              <View className="flex-row items-start mb-1">
                <Image
                  source={{
                    uri: message.senderImage || "https://placekitten.com/50/50",
                  }}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <Text className="text-xs text-gray-500">
                  {message.senderName || "Unknown User"}
                </Text>
              </View>
            )}
            <View
              className={`p-3 rounded-2xl ${
                message.senderId === 1 ? "bg-primary" : "bg-gray-200"
              }`}
            >
              <Text
                className={message.senderId === 1 ? "text-white" : "text-black"}
              >
                {message.text}
              </Text>
            </View>

            <Text className="text-xs text-gray-500 mt-1 ml-1">
              {message.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="border-t border-gray-200"
        keyboardVerticalOffset={10}
      >
        <View className="p-2">
          <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2">
            <TextInput
              className="flex-1 text-base mr-2"
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity className="mr-2 rounded-full items-center justify-center">
              <Ionicons
                name="attach"
                size={20}
                color={Colors.light.primaryColor}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-primary w-8 h-8 rounded-full items-center justify-center"
              onPress={sendMessage}
            >
              <Ionicons name="send" size={12} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GroupChatScreen;
