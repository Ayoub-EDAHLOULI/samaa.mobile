import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hides the default top header
        tabBarStyle: {
          backgroundColor: "#0F172A", // Matches our dark theme
          borderTopWidth: 0, // Removes the ugly top border
          elevation: 0, // Removes shadow on Android
        },
        tabBarActiveTintColor: "#38BDF8", // Samaa Blue for active tab
        tabBarInactiveTintColor: "#64748B", // Slate gray for inactive tabs
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Listen",
          tabBarIcon: ({ color }) => (
            <Ionicons name="mic-circle" size={32} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => (
            <Ionicons name="library" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
