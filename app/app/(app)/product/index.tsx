import { ProductScreen } from "@/components/product/product-screen";
import { Frame } from "@/components/ui/frame/frame";
import { Txt } from "@/components/ui/texts";
import { FRAME_MARGIN } from "@/lib/config";
import { useScannedProduct } from "@/lib/nutrition/useNutritionDataByBarcode";
import { useTheme } from "@/lib/theme/useTheme";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function ProductScreenRoute() {
  const { barcode }: { barcode: string } = useLocalSearchParams();
  const { activeThemeName } = useTheme();

  const { data: product, isLoading } = useScannedProduct(barcode);

  console.log(product)

  return (
    <Frame scrollable useSafeArea showHeader headerText="" isSubScreen>
      <View
        style={{
          flex: 1,
          marginHorizontal: FRAME_MARGIN
        }}
      >
        {isLoading && <Txt>carico...</Txt>}

        {product && <ProductScreen product={product} />}
      </View>
    </Frame>
  );
}
