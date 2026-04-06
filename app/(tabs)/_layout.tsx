import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

const ACTIVE = "#38BDF8";
const INACTIVE = "rgba(255,255,255,0.28)";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Float the bar above the content so the sphere bleeds through
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === "ios" ? 96 : 72,
          paddingBottom: Platform.OS === "ios" ? 28 : 16,
          paddingTop: 8,
        },
        // Dark gradient vignette so icons stay readable over the sphere
        tabBarBackground: () => (
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.88)"]}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.listen"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "radio" : "radio-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t("tabs.library"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "albums" : "albums-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "options" : "options-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
