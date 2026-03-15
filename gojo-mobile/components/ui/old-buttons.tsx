import { BlurView } from "expo-blur";
import { Txt } from "./texts";
import { AniTouchableOpacity, AniView } from "@/lib/reanimated/components";
import { useTheme } from "@/lib/theme/useTheme";
import { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { PLAYER_TOGGLE_CONTROLS_TIMING } from "@/lib/streaming/player/player-animations";
// import { TouchableOpacity, TouchableOpacityProps } from "react-native-gesture-handler";
import { LucideIcon } from "lucide-react-native";
import { memo } from "react";
import { ColorValue, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  square?: boolean;
  type?: 'primary' | 'destructive' | 'outline' | 'ghost';
  bg?: ColorValue;
  accent?: ColorValue;
  fillIcon?: boolean;
  LeftIcon?: LucideIcon;
  RightIcon?: LucideIcon;
  loading?: boolean;
}

export const useButtonPressAnimation = (customScale?: number) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    // scale.value = withTiming(customScale ?? 0.85, { duration: 70 });
    opacity.value = withTiming(0.5, { duration: 70 });
  };

  const handlePressOut = () => {
    // scale.value = 1;
    opacity.value = 1;
  };

  return {
    animatedStyle,
    handlePressIn,
    handlePressOut,
  };
};

export interface IconCircleButtonProps extends TouchableOpacityProps {
  Icon: LucideIcon;
  type?: 'primary' | 'outline';
  hitSlop?: number;
  accent?: ColorValue;
  fillIcon?: boolean;
  sizeBias?: number;
  largerTouchArea?: boolean;
  iconContainerAnimatedStyle?: any;
}

export const IconCircleButton: React.FC<IconCircleButtonProps> = ({
  Icon,
  sizeBias = 0,
  hitSlop,
  accent,
  fillIcon,
  largerTouchArea = false,
  iconContainerAnimatedStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const { animatedStyle, handlePressIn, handlePressOut } = useButtonPressAnimation();

  const size = 20 + sizeBias;
  const padding = 8;

  return (
    <AniTouchableOpacity
      activeOpacity={1}
      hitSlop={hitSlop}
      {...props}
      onPressIn={(e) => {
        // avoid closing controls after tap
        e.stopPropagation()
        handlePressIn()
      }}
      onPressOut={handlePressOut}
      style={[
        {
          justifyContent: 'center',
          alignItems: 'center',
          padding: largerTouchArea ? 15 : padding - 3,
          borderRadius: '100%',
        },
        animatedStyle,
      ]}
    >
      <AniView
        style={[
          {
            borderRadius: '100%',
            padding: padding - 5,
          },
          iconContainerAnimatedStyle,
        ]}
      >
        <Icon
          color={accent ?? theme.colors.text}
          size={size}
          fill={fillIcon ? accent ?? theme.colors.text : 'transparent'}
        />
      </AniView>
    </AniTouchableOpacity>
  );
};

interface PlayerButtonProps extends TouchableOpacityProps {
  Icon: LucideIcon;
  text?: string;
  secondaryText?: string;
  fillIcon?: boolean;
  sizeBias?: number;
  disabled?: boolean;
}

export const PlayerButton: React.FC<PlayerButtonProps> = memo(
  ({ Icon, text, secondaryText, fillIcon = false, sizeBias = 0, disabled, ...props }) => {
    const { theme } = useTheme();

    const color = disabled ? theme.colors.textMuted : theme.colors.text;

    return (
      <TouchableOpacity
        // avoid closing controls after tap
        onPressIn={(e) => e.stopPropagation()}
        disabled={disabled}
        activeOpacity={0.3}
        {...props}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
          // backgroundColor: "#F8238231",
          backgroundColor: 'transparent',
          borderRadius: 9999,
        }}
      >
        <Icon
          strokeWidth={1.5}
          size={25 + sizeBias}
          fill={fillIcon ? color : 'transparent'}
          color={color}
        />
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.text === nextProps.text &&
      prevProps.secondaryText === nextProps.secondaryText &&
      prevProps.fillIcon === nextProps.fillIcon &&
      prevProps.sizeBias === nextProps.sizeBias &&
      prevProps.Icon === nextProps.Icon &&
      JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style)
    );
  }
);

export const PlayerSkipButton: React.FC<ButtonProps> = ({
  title,
  accent,
  fillIcon,
  LeftIcon,
  ...props
}) => {
  const { theme } = useTheme();
  const { animatedStyle, handlePressIn, handlePressOut } = useButtonPressAnimation();

  return (
    <AniView
      entering={FadeIn.duration(PLAYER_TOGGLE_CONTROLS_TIMING)}
      exiting={FadeOut.duration(PLAYER_TOGGLE_CONTROLS_TIMING)}
    >
      <AniTouchableOpacity
        activeOpacity={0.5}
        style={[
          {
            borderRadius: theme.borderRadius.md,
            overflow: 'hidden',
            alignSelf: 'flex-start',
          },
          animatedStyle,
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        <BlurView
          intensity={30}
          tint="light"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: theme.borderRadius.md,
            backgroundColor: '#3b3b3b80',
          }}
        >
          {LeftIcon && <LeftIcon color={theme.colors.text} size={18} />}

          {title && (
            <Txt
              style={{
                fontFamily: 'SemiBold',
                fontSize: 14,
                color: theme.colors.text,
              }}
            >
              {title}
            </Txt>
          )}
        </BlurView>
      </AniTouchableOpacity>
    </AniView>
  );
};