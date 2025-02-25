import React from "react";
import { View, Text, FlatList, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface Group {
  id: string;
  name: string;
  memberCount: number;
  lastActive: string;
  profileImages: string[];
}

const groups: Group[] = [
  { 
    id: "1", 
    name: "Group 1", 
    memberCount: 12, 
    lastActive: "2 hours ago",
    profileImages: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6"
    ]
  },
  { 
    id: "2", 
    name: "Group 2", 
    memberCount: 8, 
    lastActive: "1 day ago",
    profileImages: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9"
    ]
  },
  { 
    id: "3", 
    name: "Group 3", 
    memberCount: 15, 
    lastActive: "3 hours ago",
    profileImages: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    ]
  },
  { 
    id: "4", 
    name: "Group 4", 
    memberCount: 10, 
    lastActive: "Just now",
    profileImages: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6"
    ]
  },
  { 
    id: "5", 
    name: "Group 5", 
    memberCount: 6, 
    lastActive: "5 hours ago",
    profileImages: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    ]
  },
  { 
    id: "6", 
    name: "Group 6", 
    memberCount: 20, 
    lastActive: "1 hour ago",
    profileImages: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    ]
  },
];

const GroupsList: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Church Groups
      </Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            {/* Group Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={24} color={Colors.light.primaryColor} />
            </View>

            {/* Group Info */}
            <View style={styles.textContainer}>
              <Text style={styles.groupName}>{item.name}</Text>
              <View style={styles.groupDetails}>
                <Text style={styles.memberCount}>{item.memberCount} members</Text>
                <Text style={styles.lastActive}>• {item.lastActive}</Text>
              </View>
              
              {/* Profile Images */}
              <View style={styles.profileImagesContainer}>
                {item.profileImages.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={[
                      styles.profileImage,
                      { marginLeft: index > 0 ? -15 : 0 }
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Arrow Icon */}
            <Ionicons name="chevron-forward" size={24} color={Colors.light.text} />
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
    color: Colors.light.text,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  groupDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberCount: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.6,
  },
  lastActive: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.6,
    marginLeft: 4,
  },
  profileImagesContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.light.background,
  }
});

export default GroupsList;
