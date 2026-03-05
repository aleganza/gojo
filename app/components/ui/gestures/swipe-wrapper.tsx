// SwipeWrapper.tsx
import React, { ReactNode, useRef } from "react";
import { ColorValue, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type { LucideIcon } from "lucide-react-native";
type ButtonConfig = {
  icon: LucideIcon;
  color?: ColorValue | string;
  onPress: () => void;
  width?: number;
};

type SwipeWrapperProps = {
  children: ReactNode;
  leftButtons?: ButtonConfig[];
  rightButtons?: ButtonConfig[];
};

export const SwipeWrapper: React.FC<SwipeWrapperProps> = ({
  children,
  leftButtons = [],
  rightButtons = [],
}) => {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const swipeDirection = useSharedValue<1 | -1 | 0>(0);
  const swipeIntent = useSharedValue<"open" | "close" | null>(null);
  // const triggeredSingleButton = useSharedValue(false);

  const defaultButtonSize = 80;
  const overshot = defaultButtonSize;


  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      swipeDirection.value = 0;
      swipeIntent.value = Math.abs(translateX.value) < 10 ? "open" : "close";
      console.log('partito a ', translateX.value)
      // triggeredSingleButton.value = false;
    })
    .onUpdate((event) => {
      if (swipeDirection.value === 0 && Math.abs(event.translationX) > 2) {
        swipeDirection.value = event.translationX > 0 ? 1 : -1;
      }

      // const swipeHasStartedRight = swipeDirection.value === 1;
      // const swipeHasStartedLeft = swipeDirection.value === -1;
      // const isOpening = swipeIntent.value === "open";
      // const isClosing = swipeIntent.value === "close";

      // if (swipeHasStartedRight) {
      //   console.log("de");
      // }

      // if (swipeHasStartedLeft) {
      //   console.log("si");
      // }

      translateX.value = startX.value + event.translationX;

      const leftLimit = leftButtons.reduce(
        (acc, b) => acc + defaultButtonSize,
        0,
      );
      const rightLimit = rightButtons.reduce(
        (acc, b) => acc + defaultButtonSize,
        0,
      );

      if (translateX.value > leftLimit) {
        const extra = translateX.value - leftLimit;
        translateX.value = leftLimit + extra / (1 + extra / overshot);
      }

      if (translateX.value < -rightLimit) {
        const extra = -rightLimit - translateX.value;
        translateX.value = -rightLimit - extra / (1 + extra / overshot);
      }
    })
    .onEnd(() => {
      const leftSnap = leftButtons.reduce(
        (acc, b) => acc + defaultButtonSize,
        0,
      );
      const rightSnap = rightButtons.reduce(
        (acc, b) => acc + defaultButtonSize,
        0,
      );

      const swipeHasStartedRight = swipeDirection.value === 1;
      const swipeHasStartedLeft = swipeDirection.value === -1;
      const isOpening = swipeIntent.value === "open";
      const isClosing = swipeIntent.value === "close";
      console.log({
        swipeHasStartedRight,
        swipeHasStartedLeft,
        isOpening,
        isClosing,
      });

      if (swipeHasStartedRight && isOpening) {
        translateX.value = withSpring(leftSnap);
      }

      if (swipeHasStartedLeft && isOpening) {
        translateX.value = withSpring(-rightSnap);
      }

      if (isClosing) {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const renderButtons = (buttons: ButtonConfig[], side: "left" | "right") =>
    buttons.map((btn, index) => {
      const IconComponent = btn.icon;
      const n = buttons.length;

      const btnStyle = useAnimatedStyle(() => {
        let progress = (Math.abs(translateX.value) / n) * 40; // ????
        if (progress > 1) progress = 1;

        const rigor = (Math.abs(translateX.value) * (n - index)) / n;

        const width = interpolate(
          progress,
          [0, 1],
          [0, rigor],
          Extrapolation.CLAMP,
        );
        return {
          width,
        };
      });

      const iconStyle = useAnimatedStyle(() => {
        let scale = clamp(
          Math.abs(translateX.value) / (defaultButtonSize * n),
          0,
          1,
        );
        const rigor = (Math.abs(translateX.value) * (n - index - 1)) / n;

        return {
          paddingRight: rigor,
          transform: [{ scale }],
        };
      });

      return (
        <Animated.View
          key={index}
          style={[
            styles.button,
            { backgroundColor: btn.color || "#ff3b30", height: "100%" },
            side === "left" ? { left: 0 } : { right: 0 },
            // {opacity: 0.7},
            btnStyle,
          ]}
        >
          <Pressable
            onPress={() => {
              runOnJS(btn.onPress)();
              translateX.value = withSpring(0);
            }}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Animated.View style={[iconStyle]}>
              <IconComponent color="white" />
            </Animated.View>
          </Pressable>
        </Animated.View>
      );
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.container}>
        {translateX.value >= 0 && (
          <View style={styles.buttonsContainer}>
            {renderButtons(leftButtons, "left")}
          </View>
        )}
        {translateX.value <= 0 && (
          <View style={styles.buttonsContainer}>
            {renderButtons(rightButtons, "right")}
          </View>
        )}

        {/* <View style={styles.buttonsContainer}>{renderButtons(leftButtons, 'left')}</View>
        <View style={styles.buttonsContainer}>
          {renderButtons(rightButtons, "right")}
        </View> */}
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: { overflow: "hidden" },
  buttonsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row-reverse",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
  },
});


{/* <SwipeWrapper
  leftButtons={[
    {
      icon: Archive,
      color: "blue",
      onPress: () => console.log("Archive"),
    },
  ]}
  rightButtons={[
    {
      icon: Trash,
      color: "green",
      onPress: () => console.log("Delete"),
    },
    {
      icon: Edit,
      color: "orange",
      onPress: () => console.log("Edit"),
    },
    {
      icon: Archive,
      color: "blue",
      onPress: () => console.log("Archive"),
    },
  ]}
>
  <View
    style={{
      height: 60,
      backgroundColor: "olive",
      justifyContent: "center",
      padding: 16,
      // opacity: 0.5
    }}
  >
    <Txt>Swipe me!</Txt>
  </View>
</SwipeWrapper> */}