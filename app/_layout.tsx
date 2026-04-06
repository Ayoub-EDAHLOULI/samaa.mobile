import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Point the root router directly to the tabs group */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
