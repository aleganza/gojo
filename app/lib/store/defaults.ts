import { OrientationLock } from "expo-screen-orientation";

import { StorageState } from "./types";

export const defaultStorage: StorageState = {
  theme: "system",
  hasCompletedOnboarding: false,
  defaultOrientation: OrientationLock.LANDSCAPE_RIGHT,
  player: {
    volume: 1,
    playbackRate: 1,
    quality: undefined,
    timelineAnimation: 'fade',
    autoMaxBrightness: false,
  }
};
