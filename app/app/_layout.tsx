import "react-native-reanimated";

import { BottomSheetProvider } from "@/components/bottom-sheet/provider";
import { ToastProvider } from "@/components/toaster/provider";
import { QueryProvider } from "@/lib/query/provider";
import { FONT_PATHS } from "@/lib/theme/families";
import { useTheme } from "@/lib/theme/useTheme";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuth } from "@/lib/supabase/auth/useAuth";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(FONT_PATHS);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { activeThemeName, reactNavigationTheme } = useTheme();
  const { isAuthenticated, session } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState<boolean>(false);

  useEffect(() => {
    if (session !== undefined) {
      setIsNavigationReady(true);
    }
  }, [session]);

  useEffect(() => {
    // verify session before checking if user is authenticated
    // ONLY AFTER session is verified, choose where to redirect user if needed
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // redirect to login if not authenticated and not already in auth route
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // redirect to app if authenticated and still in auth route
      router.replace("/(app)/");
    }
  }, [isAuthenticated, segments, isNavigationReady]);

  return (
    <ThemeProvider value={reactNavigationTheme}>
      <QueryProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetProvider>
            <ToastProvider>
              <StatusBar
                style={activeThemeName === "dark" ? "light" : "dark"}
              />
              <Slot />
            </ToastProvider>
          </BottomSheetProvider>
        </GestureHandlerRootView>
      </QueryProvider>
    </ThemeProvider>
  );
}
