import React from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { users } from "@/constants/data"; // ✅ Importing users correctly
import { Colors } from "@/constants/Colors";

interface User {
  id: number;
  name: string;
  role: string;
  profileImage: string;
}

const OnlineChurchMembers: React.FC = () => {
  return (
    <View style={styles.container} className="mt-4 bg-">
      <Text style={styles.header} className="text-white ">
        Online Church Members
      </Text>
      <FlatList
        data={users} // ✅ Using imported users directly
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.memberItem}>
            {/* Profile Image */}
            <Image
              source={{ uri: item.profileImage }}
              style={styles.profileImage}
            />

            {/* User Info */}
            <View style={styles.textContainer} className="flex gap-2">
              <Text style={styles.memberName}>{item.name}</Text>
              <View style={styles.badge}>
                <Text className="text-gray-300">{item.role}</Text>
              </View>
            </View>

            {/* Online Indicator */}
            <View style={styles.onlineIndicator} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,

    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B1838",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  memberRole: {
    fontSize: 14,
    color: "#666",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primaryColor,
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: "white",
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00C853", // ✅ Bright Green Color for Online Status
    marginLeft: 10,
  },
});

export default OnlineChurchMembers;
