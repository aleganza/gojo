import "react-native-reanimated";

import { QueryProvider } from "@/lib/query/provider";
import { FONT_PATHS } from "@/lib/theme/families";
import { useTheme } from "@/lib/theme/useTheme";
import { ToastProvider } from "@/components/toaster/provider";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetProvider } from "@/components/bottom-sheet/provider";
import { SQLiteProvider } from "expo-sqlite";
import { runMigrations } from "@/lib/sqlite/migrations/runMigrations";

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

  return (
    <SQLiteProvider databaseName="product.db" onInit={runMigrations}>
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
    </SQLiteProvider>
  );
}
