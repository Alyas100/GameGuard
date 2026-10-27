import { Stack } from "expo-router";
import '../lib/i18n'; // <-- ADD THIS IMPORT FOR THE LANG THING

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* These are your "logged out" screens */}
      <Stack.Screen name="index" />
      <Stack.Screen name="custom-login" />
      <Stack.Screen name="custom-register" />

      {/* This one line loads your entire tab bar layout */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
