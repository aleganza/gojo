import { Stack } from "expo-router";

/**
 * happens when the user is authenticated
 */
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackVisible: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
