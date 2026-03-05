import { BaseBottomSheet } from "@/components/bottom-sheet/base-bottom-sheet";
import { ProductScreen } from "@/components/product/product-screen";
import { Txt } from "@/components/ui/texts";
import { useScannedProduct } from "@/lib/nutrition/useNutritionDataByBarcode";
import { useTheme } from "@/lib/theme/useTheme";
import { StyleSheet, View } from "react-native";

import { useSheetProps } from "../useSheetProps";

export interface ProductSheetProps {
  barcode: string;
}

export const ProductSheet = () => {
  const { theme } = useTheme();

  const props = useSheetProps<ProductSheetProps>("product");

  const { data: product, isLoading } = useScannedProduct(props?.barcode || "");

  return (
    <BaseBottomSheet<ProductSheetProps>
      name="product"
      scrollable
      snapPoints={["30%", "95%"]}
    >
      {() => (
        <View
          style={{
            flex: 1,
          }}
        >
          {isLoading && <Txt>carico...</Txt>}

          {product && <ProductScreen product={product} />}
        </View>
      )}
    </BaseBottomSheet>
  );
};
