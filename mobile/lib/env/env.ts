import { Platform } from "react-native";

// -----------------------------
// ENVIRONMENT
// -----------------------------
const getEnvironment = (): string => process.env.NODE_ENV ?? "development";

const keepDevelopmentFeatureInProduction = true;

const envIs = {
  development: getEnvironment() === "development" || keepDevelopmentFeatureInProduction,
  production: getEnvironment() === "production",
  test: getEnvironment() === "test",
};

export const env = {
  getEnvironment,
  is: envIs,
};

// -----------------------------
// PLATFORM
// -----------------------------
const getPlatform = (): string => Platform.OS; // 'ios', 'android', 'web'

const platformIs = {
  ios: getPlatform() === "ios",
  android: getPlatform() === "android",
  web: getPlatform() === "web",
  mobile: getPlatform() === "ios" || getPlatform() === "android",
};

export const platform = {
  getPlatform,
  is: platformIs,
};