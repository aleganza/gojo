import { ProductList } from "@/components/product/products-list";
import { Frame } from "@/components/ui/frame/frame";
import { Txt } from "@/components/ui/texts";
import { Product } from "@/lib/nutrition/types";
import { useScannedProductHistory } from "@/lib/nutrition/useNutritionDataByBarcode";
import { useTheme } from "@/lib/theme/useTheme";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function HistoryTabScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { activeThemeName } = useTheme();

  const { data: products, isLoading } = useScannedProductHistory();

  const handleItemPress = (product: Product) => {
    router.push({
      pathname: "/(app)/product",
      params: {
        barcode: product.barcode,
      },
    });
  };

  return (
    <Frame
      scrollable
      useSafeArea
      showHeader
      headerText="Cronologia"
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
    >
      <StatusBar style={activeThemeName === "dark" ? "light" : "dark"} />

      {isLoading && <Txt>carico...</Txt>}

      {!isLoading && products && (
        <ProductList
          products={products}
          scrollEnabled={false}
          onItemPress={handleItemPress}
        />
      )}
    </Frame>
  );
}
