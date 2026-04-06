import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Inject the multi-language engine before anything renders!
import "../src/i18n";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
