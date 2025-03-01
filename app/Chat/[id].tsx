import {
  Text,
  View,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { useLocalSearchParams, router } from "expo-router";
import { oneToOneChats } from "@/constants/data";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const ChatScreen = () => {
  const params = useLocalSearchParams();

  const chatId = params?.id;
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-2">
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.light.primaryColor}
          />
        </TouchableOpacity>

        {oneToOneChats.find((chat) => chat.id === Number(chatId)) ? (
          <>
            {(() => {
              const currentChat = oneToOneChats.find(
                (chat) => chat.id === Number(chatId)
              );
              return (
                <>
                  <Image
                    source={{
                      uri: currentChat?.profileImage,
                    }}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <Text className="text-lg font-semibold">
                    {currentChat?.name}
                  </Text>
                </>
              );
            })()}
          </>
        ) : (
          <Text className="text-lg font-semibold">Chat</Text>
        )}
      </View>

      <ScrollView className="flex-1 p-4">
        {oneToOneChats
          .find((chat) => chat.id === Number(chatId))
          ?.messages.map((message, index) => (
            <View
              key={index}
              className={`mb-4 max-w-[80%] ${message.senderId === 1 ? "self-end ml-auto" : "self-start"}`}
            >
              <View
                className={`p-3 rounded-2xl ${
                  message.senderId === 1 ? "bg-primary" : "bg-gray-200"
                }`}
              >
                <Text
                  className={
                    message.senderId === 1 ? "text-white" : "text-black"
                  }
                >
                  {message.text}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">{message.time}</Text>
            </View>
          ))}
      </ScrollView>
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
            />
            <TouchableOpacity className=" mr-2 rounded-full items-center justify-center">
              <Ionicons
                name="add"
                size={20}
                color={Colors.light.primaryColor}
              />
            </TouchableOpacity>
            <TouchableOpacity className="bg-primary w-8 h-8  rounded-full items-center justify-center">
              <Ionicons name="send" size={12} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
