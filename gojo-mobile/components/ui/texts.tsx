import { useTheme } from "@/lib/theme/useTheme";
import { forwardRef } from "react";
import { Text, TextProps } from "react-native";

const BaseTxt = forwardRef<Text, TextProps>(({ style, ...props }, ref) => {
  const { theme } = useTheme();

  return (
    <Text
      ref={ref}
      style={[
        {
          fontFamily: theme.family.accent.regular,
          fontSize: theme.fontSize.md,
          color: theme.colors.text,
          letterSpacing: -0.5,
        },
        style,
      ]}
      {...props}
    />
  );
});

export const Txt = BaseTxt;

export const MonoText = forwardRef<Text, TextProps>(
  ({ style, ...props }, ref) => {
    const { theme } = useTheme();

    return (
      <Txt
        ref={ref}
        style={[
          {
            fontFamily: theme.family.mono.regular,
            fontSize: theme.fontSize.sm,
            letterSpacing: 1
          },
          style,
        ]}
        {...props}
      />
    );
  },
);
