import { TinyLabel } from "@/components/common/common";
import { toaster } from "@/components/toaster/toaster";
import { Frame } from "@/components/ui/frame/frame";
import Spacer from "@/components/ui/spacer";
import { Txt } from "@/components/ui/texts";
import { FRAME_MARGIN } from "@/lib/config";
import { Logger } from "@/lib/logger/logger";
import { usePluginClient } from "@/lib/plugin/usePluginClient";
import { usePlayerStore } from "@/lib/streaming/player/playerStore";
import { useAuth } from "@/lib/supabase/auth/useAuth";
import { Db } from "@/lib/supabase/db/schema";
import { usePlugin } from "@/lib/supabase/queries/plugins";
import {
  useUpdateWatchStatus,
  useWatchStatus,
} from "@/lib/supabase/queries/watch_status";
import { useTheme } from "@/lib/theme/useTheme";
import { Bookmark, Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { H5 } from "../ui/headings";

import type { Plugin as PluginTypes } from "@/lib/plugin/plugin.types";
interface MediaScreenProps {
  media: Db.Media;
}

const MediaScreen: React.FC<MediaScreenProps> = ({ media }) => {
  const { data: DbPlugin, isLoading: isLoadingPlugin } = usePlugin(
    media.plugin_id,
  );
  const pluginClient = usePluginClient(DbPlugin!); // protected by usePlugin loading

  const { user } = useAuth();

  const { theme } = useTheme();

  const { data: watchStatus } = useWatchStatus(media.id, user?.id);
  const updateWatchStatus = useUpdateWatchStatus(media.id, user!.id);

  const { openPlayer, setPlayer } = usePlayerStore();
  const [episodes, setEpisodes] = useState<PluginTypes.Episode[]>([]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      const e = await pluginClient?.getEpisodes(media.external_id);

      setEpisodes(e);
    };

    if (!media || isLoadingPlugin) return;

    fetchEpisodes();
  }, [media, isLoadingPlugin]);

  const handleOpenPlayer = async (episodeId: string, episodeNumber: number) => {
    try {
      console.log(episodeId);
      const sources = await pluginClient?.getEpisodeSource(episodeId);
      const streamingSource = sources[0];

      setPlayer({
        media: media,
        streamingSource,
        watchStatus: undefined,
        episodeNumber,
        startAt: 0,
      });
      openPlayer();
    } catch (error) {
      toaster.error("Errore nell'apertura del player");
      Logger.error(error);
    }
  };

  const handleAddToPlanToWatch = async () => {
    try {
      switch (watchStatus?.status) {
        case "completed":
          break;
        case "unknown":
        case "watching":
          updateWatchStatus.mutate({ status: "plan_to_watch" });
          // toaster.info("In lista")
          break;
        case "plan_to_watch":
          updateWatchStatus.mutate({ status: "unknown" });
          // toaster.info("Rimosso dalla lista")
          break;
      }
    } catch (error) {
      toaster.error("Errore: no media id");
    }
  };
  
  return (
    <Frame
      scrollable
      useSafeArea
      showHeader
      isSubScreen
      headerText={media.title}
      rightIcons={[
        {
          icon: watchStatus?.status === "completed" ? Check : Bookmark,
          fillIcon: !(watchStatus?.status === "unknown"),
          isLoading: updateWatchStatus.isPending,
          onPress: () => {
            handleAddToPlanToWatch();
          },
        },
      ]}
      contentContainerStyle={{
        marginHorizontal: FRAME_MARGIN,
      }}
    >
      {media ? (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              // padding: theme.spacing.md,
              backgroundColor: theme.colors.background,
              borderRadius: theme.borderRadius.lg,
            }}
          >
            <Image
              source={{ uri: media.poster_url ?? undefined }}
              style={{
                width: 100,
                height: 140,
                borderRadius: theme.borderRadius.md,
              }}
              resizeMode="cover"
            />

            <Spacer size="md" direction="horizontal" />

            <View
              style={{
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Txt
                style={{
                  fontSize: theme.fontSize.lg,
                  fontFamily: theme.family.accent.bold,
                  color: theme.colors.text,
                }}
              >
                {media.title}
              </Txt>

              <Spacer size="sm" />

              <View style={{ alignSelf: "flex-start" }}>
                <TinyLabel text={media.type.toUpperCase()} />
              </View>

              <Spacer size="sm" />

              <Txt
                style={{
                  fontSize: theme.fontSize.sm,
                  fontFamily: theme.family.accent.regular,
                  color: theme.colors.textShy,
                }}
              >
                External ID: {media.external_id}
              </Txt>
            </View>
          </View>

          <H5 text="Episodi" />

          <View>
            {episodes.map((e, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  handleOpenPlayer(e.id, e.number);
                }}
              >
                <Txt>{e.number}</Txt>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <Txt>Loading media...</Txt>
      )}
    </Frame>
  );
};

export default MediaScreen;
