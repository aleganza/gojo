import { useOpenFoodFacts } from "@/lib/nutrition/open-food-facts/useOpenFoodFacts";
import { Product } from "@/lib/nutrition/types";
import { mapOffRawToProduct } from "@/lib/nutrition/utils";
import {
  getProduct,
  upsertProduct,
  getAllProductsChronologically,
  deleteProduct,
} from "../queries/product.queries";

export function useProductAdapter() {
  const off = useOpenFoodFacts();

  async function getByBarcode(barcode: string): Promise<Product | null> {
    // DB first
    const storedRaw = await getProduct(barcode);
    if (storedRaw?.raw) return mapOffRawToProduct(storedRaw);

    // OFF fallback
    const offData = await off.getByBarcode(barcode);
    if (!offData) return null;

    // Persist
    await upsertProduct(barcode, offData);

    // Map to Product
    return mapOffRawToProduct(offData);
  }

  async function getHistory(): Promise<Product[]> {
    const raws = await getAllProductsChronologically();
    return raws.map(mapOffRawToProduct);
  }

  async function remove(barcode: string): Promise<void> {
    await deleteProduct(barcode);
  }

  return {
    getByBarcode,
    getHistory,
    remove,
  };
}
