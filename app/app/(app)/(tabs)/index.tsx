import { SheetManager } from "@/components/bottom-sheet/manager";
import { SecondaryButton } from "@/components/ui/buttons";
import { Frame } from "@/components/ui/frame/frame";
import { SwipeWrapper } from "@/components/ui/gestures/swipe-wrapper";
import { Txt } from "@/components/ui/texts";
import { FRAME_MARGIN } from "@/lib/config";
import { Theme } from "@/lib/theme/types";
import { useTheme } from "@/lib/theme/useTheme";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Archive, Edit, Trash } from "lucide-react-native";
import { View } from "react-native";

export default function IndexTabScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { activeThemeName, setTheme } = useTheme();

  return (
    <Frame
      scrollable
      useSafeArea
      showHeader
      headerText="Home"
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
    >
      <StatusBar
        style={"dark"}
      />
      <View style={{ paddingHorizontal: FRAME_MARGIN }}>
        <SecondaryButton
          onPress={() => {
            SheetManager.show("product", { barcode: "8013355997293" });
          }}
        >
          gocciole
        </SecondaryButton>
                <SecondaryButton
          onPress={() => {
            SheetManager.show("product", { barcode: "8001160003629" });
          }}
        >
          pepsi
        </SecondaryButton>
                <SecondaryButton
          onPress={() => {
            SheetManager.show("product", { barcode: "8020141800002" });
          }}
        >
          ascqua
        </SecondaryButton>
      </View>
    </Frame>
  );
}
