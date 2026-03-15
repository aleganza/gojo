import { Media, MediaEpisodeCover } from "@/lib/media/media.types";
import {
  parseLength,
  parseSummary,
  parseTitle,
} from "@/lib/streaming/player/parse";
import { useTheme } from "@/lib/theme/useTheme";
import { Play } from "lucide-react-native";
import { useState } from "react";
import { DimensionValue, Image, TouchableOpacity, View } from "react-native";

import { Txt } from "../ui/texts";

const MediaEpisode: React.FC<{
  media: Media;
  number: number;
  coverColor?: string;
  episodeCover?: MediaEpisodeCover;
  episodeProgress?: {
    progress: number;
    duration: number;
  };
  insidePlayer?: boolean;
  onPress: () => void;
}> = ({
  media,
  number,
  episodeCover,
  coverColor,
  episodeProgress,
  onPress,
}) => {
  const { theme } = useTheme();

  const parsedTitle = parseTitle(episodeCover, number);
  const parsedLength = parseLength(episodeCover);
  const parsedSummary = parseSummary(episodeCover);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        flexDirection: "column",
        gap: 7,
        width: "100%",
        marginRight: 0,
        // marginBottom: 22,
        borderRadius: theme.borderRadius.sm,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 9,
          width: "100%",
        }}
      >
        <View
          style={{
            position: "relative",
            height: 70,
            width: 70 * 1.78,
            borderRadius: theme.borderRadius.sm,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={onPress}
            style={{
              position: "relative",

              height: "100%",
              width: "100%",
            }}
          >
            <Image
              source={{ uri: episodeCover?.image ?? undefined }}
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: coverColor ?? theme.colors.foreground,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 30,
                height: 30,
                borderRadius: "100%",
                transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
                backgroundColor: `#00000080`,
                borderWidth: 1.5,
                borderColor: `#99999960`,
              }}
            >
              <Play
                fill={theme.colors.text}
                color={theme.colors.text}
                size={14}
                style={{ marginLeft: 1 }}
              />
            </View>
          </TouchableOpacity>

          {episodeProgress && (
            <>
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: 4,
                  backgroundColor: "#aeaeae70",
                }}
              />

              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: `${(
                    100 *
                    (episodeProgress.progress / episodeProgress.duration)
                  ).toString()}%` as DimensionValue,
                  height: 4,
                  backgroundColor: theme.colors.primary,
                }}
              />
            </>
          )}
        </View>

        <View
          style={{
            flexShrink: 1,
            flexDirection: "column",
            justifyContent: "center",
            marginRight: 30,
          }}
        >
          <Txt
            numberOfLines={2}
            ellipsizeMode="tail"
            // style={{ width: undefined }}
          >
            <Txt
              style={{
                fontFamily: theme.family.accent.semi_bold,
                color: theme.colors.textMuted,
                fontSize: 14,
              }}
            >
              {`${number}.  `}
            </Txt>
            <Txt
              style={{
                fontFamily: theme.family.accent.semi_bold,
                color: theme.colors.textShy,
                fontSize: 14,
              }}
            >
              {parsedTitle}
            </Txt>
          </Txt>

          {episodeCover && episodeCover.length && (
            <Txt
              style={{
                fontFamily: theme.family.accent.medium,
                color: theme.colors.textMuted,
                fontSize: 13,
                marginTop: 2,
                // textAlign: undefined,
                // width: undefined,
              }}
            >
              {parsedLength}
            </Txt>
          )}
        </View>
      </View>

      <Txt
        style={{
          fontFamily: theme.family.accent.medium,
          color: theme.colors.textShy,
          fontSize: 13,
        }}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {parsedSummary}
      </Txt>
    </TouchableOpacity>
  );
};

export default MediaEpisode;
