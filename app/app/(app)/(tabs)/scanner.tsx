import { SheetManager } from "@/components/bottom-sheet/manager";
import { ProductScannerScreen } from "@/components/scanner";
import { Frame } from "@/components/ui/frame/frame";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function IndexTabScreen() {
  const tabBarHeight = useBottomTabBarHeight();

  const handleScan = (barcode: string) => {
    SheetManager.show("product", { barcode });
  };

  return (
    <Frame
      showHeader={false}
      // contentContainerStyle={{ paddingBottom: tabBarHeight }}
    >
      <StatusBar style={"light"} />
      <View style={{ width: "100%", height: "100%" }}>
        <ProductScannerScreen onScan={handleScan} />
      </View>
    </Frame>
  );
}
