import React from "react";
import { Text, View, StyleSheet } from "react-native";

type BadgeProps = {
  text: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  size?: "small" | "medium" | "large";
};

const Badge: React.FC<BadgeProps> = ({
  text,
  color = "#fff",
  backgroundColor = "#007bff",
  borderColor = "#007bff",
  size = "medium",
}) => {
  const sizeStyles = getSizeStyles(size);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor, borderColor },
        sizeStyles.container,
      ]}
    >
      <Text style={[styles.text, { color }, sizeStyles.text]}>{text}</Text>
    </View>
  );
};

const getSizeStyles = (size: "small" | "medium" | "large") => {
  switch (size) {
    case "small":
      return {
        container: { paddingVertical: 2, paddingHorizontal: 6 },
        text: { fontSize: 12 },
      };
    case "medium":
      return {
        container: { paddingVertical: 4, paddingHorizontal: 8 },
        text: { fontSize: 14 },
      };
    case "large":
      return {
        container: { paddingVertical: 6, paddingHorizontal: 10 },
        text: { fontSize: 16 },
      };
    default:
      return {
        container: { paddingVertical: 4, paddingHorizontal: 8 },
        text: { fontSize: 14 },
      };
  }
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "bold",
  },
});

export default Badge;
