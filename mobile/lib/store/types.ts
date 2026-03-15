import { Theme } from "@/lib/theme/types";
import { Orientation, OrientationLock } from "expo-screen-orientation";

export interface StorageState {
  theme: Theme;
  hasCompletedOnboarding: boolean;
  defaultOrientation: OrientationLock
  player: {
    showDevTools: boolean;
    syncProgress: boolean;
    volume: number,
    playbackRate: number;
    quality: string | undefined;
    timelineAnimation: string;
    autoMaxBrightness: boolean
  }
}
