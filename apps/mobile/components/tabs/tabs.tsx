import { useTheme } from "@/lib/theme/useTheme";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Tabs, useSegments } from "expo-router";
import {
  Home,
  LucideIcon,
  Nut,
  Receipt,
  ScanBarcode,
  ShoppingBasket,
} from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

import { Txt } from "../ui/texts";

const TabBarButton: React.FC<
  { Icon: LucideIcon } & BottomTabBarButtonProps
> = ({
  Icon,
  onPress,
  accessibilityLargeContentTitle,
  "aria-selected": isFocused,
}) => {
  const { theme, getAnyTheme } = useTheme();

  const darkTheme = getAnyTheme("dark");

  const segments = useSegments();
  const isScannerTab = segments.includes("scanner");

  const [acualTheme] = useMemo(() => {
    return [isScannerTab ? darkTheme : theme];
  }, [segments, theme]);

  const color = isFocused
    ? acualTheme.colors.iconSupporting
    : acualTheme.colors.iconMuted;
  const fontFamily = isFocused
    ? acualTheme.family.accent.semi_bold
    : acualTheme.family.accent.medium;

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        pointerEvents="none"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Icon
          color={color}
          size={acualTheme.iconSize.md}
          strokeWidth={isFocused ? 1.75 : 1.5}
          // fill={isFocused ? color : "transparent"}
          style={{ marginTop: 2 }}
        />
        <Txt
          style={{
            fontFamily,
            marginTop: 2,
            fontSize: theme.fontSize.xs,
            color: color,
          }}
        >
          {accessibilityLargeContentTitle}
        </Txt>
      </View>
    </Pressable>
  );
};

export const TabBarBackground: React.FC<{
  theme: any;
  activeThemeName: "light" | "dark";
}> = ({ theme, activeThemeName }) => {
  return (
    <BlurView
      intensity={40}
      tint={activeThemeName}
      style={{
        backgroundColor: `${theme.colors.foreground.toString()}A9`,
        flex: 1,
      }}
    />
  );
};

export function TabBar() {
  const { theme, activeThemeName, getAnyTheme } = useTheme();
  const darkTheme = getAnyTheme("dark");

  const segments = useSegments();
  const isScannerTab = segments.includes("scanner");

  const [acualTheme, actualThemeName] = useMemo(() => {
    return [
      isScannerTab ? darkTheme : theme,
      isScannerTab ? "dark" : activeThemeName,
    ];
  }, [segments, theme]);

  return (
    <Tabs
      screenOptions={() => ({
        headerShown: false,
        headerBackVisible: false,
        sceneStyle: {
          backgroundColor: acualTheme.colors.background,
        },
        tabBarActiveTintColor: acualTheme.colors.primary.toString(),
        tabBarStyle: {
          backgroundColor: "transparent",
          flex: 1,
          position: "absolute",
          overflow: "hidden",
          borderTopWidth: 0,
        },
        // tabBarStyle: { display: 'none' },
        tabBarBackground: () => (
          <TabBarBackground
            theme={acualTheme}
            activeThemeName={actualThemeName}
          />
        ),
      })}
    >
      <Tabs.Screen
        name="index"
        options={(screenProps) => ({
          title: "Home",
          tabBarButton: (buttonProps) => (
            <TabBarButton Icon={Home} {...buttonProps} />
          ),
        })}
      />
    </Tabs>
  );
}
