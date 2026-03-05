import { Frame } from "@/components/ui/frame/frame";
import { FRAME_MARGIN } from "@/lib/config";
import { useTheme } from "@/lib/theme/useTheme";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function IndexTabScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { activeThemeName, setTheme } = useTheme();

  return (
    <Frame
      scrollable
      useSafeArea
      showHeader
      headerText="Spesa"
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
    >
      <StatusBar style={activeThemeName === "dark" ? "light" : "dark"} />
      <View style={{ paddingHorizontal: FRAME_MARGIN }}></View>
    </Frame>
  );
}
