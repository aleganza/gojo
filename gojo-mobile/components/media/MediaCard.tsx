import { MEDIA_CARD_HEIGHT } from "@/lib/config";
import { Media } from "@/lib/media/media.types";
import { AniPressable, AniView } from "@/lib/reanimated/components";
import { useTheme } from "@/lib/theme/useTheme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Txt } from "../ui/texts";

const MediaCard: React.FC<{
  media: Media;
}> = ({ media }) => {
  const { theme } = useTheme();
  const router = useRouter();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }] as any,
  }));

  const handlePress = () => {
    router.push({
      pathname: `/(app)/media/[id]`,
      params: { id: media.id ?? "preview", rawMedia: JSON.stringify(media) },
    });
  };

  return (
    <AniView entering={FadeIn.duration(200)}>
      <AniPressable
        onPressIn={() => {
          scale.value = withTiming(0.95, { duration: 70 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={handlePress}
        style={[
          animatedStyle,
          {
            flexDirection: "column",
            gap: 4,
            marginRight: 8,
            width: MEDIA_CARD_HEIGHT / 1.45,
          },
        ]}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={{
              uri: media.poster_url ?? undefined,
            }}
            style={{
              height: MEDIA_CARD_HEIGHT,
              width: "100%",
              borderRadius: theme.borderRadius.xs,
              backgroundColor: theme.colors.foreground,
            }}
          />
        </View>

        <>
          <Txt
            style={{
              fontFamily: theme.family.accent.bold,
              fontSize: theme.fontSize.sm,
              textAlign: "left",
              width: "100%",
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {media.title}
          </Txt>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Txt
              style={{
                fontFamily: theme.family.accent.medium,
                color: theme.colors.textShy,
                textAlign: "left",
                fontSize: theme.fontSize.sm,
              }}
            >
              {media.type}
            </Txt>
          </View>
        </>
      </AniPressable>
    </AniView>
  );
};

export default MediaCard;
