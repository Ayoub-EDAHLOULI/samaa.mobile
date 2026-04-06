import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as SystemUI from "expo-system-ui";

import "../src/i18n";
import "../src/global.css";

export default function RootLayout() {
  useEffect(() => {
    // Paint the Android system navigation bar to match the app background.
    // Required alongside edgeToEdgeEnabled: true so the bar doesn't flash white.
    SystemUI.setBackgroundColorAsync("#000000");
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
