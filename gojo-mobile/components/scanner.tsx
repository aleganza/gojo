import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Txt } from "./ui/texts";
import { SecondaryButton } from "./ui/buttons";
import { Logger } from "@/lib/logger/logger";

type Props = {
  onScan: (barcode: string) => void;
};

export function ProductScannerScreen({ onScan }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const lastScanTimeRef = React.useRef(0);
  const THROTTLE_TIME = 1500;

  function handleBarCodeScanned(scanningResult: BarcodeScanningResult) {
    const now = Date.now();

    if (now - lastScanTimeRef.current < THROTTLE_TIME) {
      return;
    }

    lastScanTimeRef.current = now;

    setScanned(true);
    onScan(scanningResult.data);

    Logger.info("Barcode scanned: " + scanningResult.data)
  }

  if (!permission || !permission.granted) {
    return (
      <View style={styles.center}>
        <Txt>Camera permission required</Txt>
        <SecondaryButton onPress={requestPermission}>
          Allow Camera
        </SecondaryButton>
      </View>
    );
  }

  return (
    <CameraView
      style={styles.camera}
      onBarcodeScanned={handleBarCodeScanned}
      barcodeScannerSettings={{
        barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
      }}
    />
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
