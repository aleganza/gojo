import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { StorageState } from "./types";
import { defaultStorage } from "./defaults";

interface StorageStore {
  storage: StorageState;

  setItem(path: string, value: unknown): void;
  removeItem(path: string): void;

  resetDefaults(): void;
}

function setDeep(obj: any, path: string, value: unknown) {
  const keys = path.split(".");
  const lastKey = keys.pop()!;

  const target = keys.reduce((acc, key) => {
    if (acc[key] === undefined) acc[key] = {};
    return acc[key];
  }, obj);

  target[lastKey] = value;
}

function getDeep(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export const useStorageStore = create<StorageStore>()(
  persist(
    (set) => ({
      storage: defaultStorage,

      setItem: (path, value) =>
        set((state) => {
          const newStorage = structuredClone(state.storage);
          setDeep(newStorage, path, value);

          return { storage: newStorage };
        }),

      removeItem: (path) =>
        set((state) => {
          const newStorage = structuredClone(state.storage);
          const defaultValue = getDeep(defaultStorage, path);

          setDeep(newStorage, path, defaultValue);

          return { storage: newStorage };
        }),

      resetDefaults: () =>
        set({
          storage: defaultStorage,
        }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);