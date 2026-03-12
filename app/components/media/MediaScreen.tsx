import { TinyLabel } from "@/components/common/common";
import { toaster } from "@/components/toaster/toaster";
import { Frame } from "@/components/ui/frame/frame";
import Spacer from "@/components/ui/spacer";
import { Txt } from "@/components/ui/texts";
import { FRAME_MARGIN } from "@/lib/config";
import { Logger } from "@/lib/logger/logger";
import { useFetchEpisodesFromPlugin } from "@/lib/plugin/plugin-client-query";
import { Plugin } from "@/lib/plugin/plugin.types";
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
import { ActivityIndicator, Image, Pressable, View } from "react-native";

import { H5 } from "../ui/headings";
import MediaEpisodesList from "./MediaEpisodesList";
import { useTMDBEpisodes } from "./TMDB/useTMDBEpisodes";
import { SecondaryButton } from "../ui/buttons";

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
  const { openPlayer, setPlayer } = usePlayerStore();

  const { data: watchStatus } = useWatchStatus(media.id, user?.id);
  const updateWatchStatus = useUpdateWatchStatus(media.id, user!.id);
  const { data: episodes, isLoading: isLoadingEpisodes } =
    useFetchEpisodesFromPlugin(media.plugin_id, media.external_id);

  const { data: episodesCovers } = useTMDBEpisodes(media.title, media.type);

  const seasons = episodes ? getSeasons(episodes) : [];
  const [selectedSeason, setSelectedSeason] = useState(0);

  function getSeasons(episodes: Plugin.Episode[]): Plugin.Episode[][] {
    const seasons: Plugin.Episode[][] = [];
    let current: Plugin.Episode[] = [];

    for (let i = 0; i < episodes.length; i++) {
      if (i > 0 && episodes[i].number <= episodes[i - 1].number) {
        seasons.push(current);
        current = [];
      }
      current.push(episodes[i]);
    }

    if (current.length > 0) seasons.push(current);

    return seasons;
  }

  const handleOpenPlayer = async (episodeNumber: number) => {
    const episodeId = episodes![episodeNumber - 1].id;

    try {
      console.log(episodeId);
      const sources = await pluginClient?.getEpisodeSource(episodeId);
      console.log(sources);
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
      <View
        style={{
          flexDirection: "column",
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

        <Spacer />

        {DbPlugin ? (
          <TinyLabel
            text={`${(DbPlugin.manifest as Plugin.Manifest)!.name} - ${media.type.toUpperCase()}`}
          />
        ) : (
          <ActivityIndicator />
        )}
      </View>

      <Spacer size="xl" />

      <H5 text="Episodi" />

      <Spacer />

      <View style={{ flexDirection: "row", gap: 8 }}>
        {seasons.map((_, i) => (
          <SecondaryButton
            key={i}
            size="sm"
            onPress={() => setSelectedSeason(i)}
            style={{
              opacity:
                selectedSeason === i
                  ? 0.4
                  : 1,
            }}
          >
            <Txt>{`S${i + 1}`}</Txt>
          </SecondaryButton>
        ))}
      </View>

      <Spacer size="md" />

      {isLoadingEpisodes && <ActivityIndicator />}

      {!episodes && !isLoadingEpisodes && <Txt>errore episodi</Txt>}

      {episodes && (
        <MediaEpisodesList
          media={media}
          episodes={seasons[selectedSeason]}
          episodesCovers={episodesCovers?.slice(
            seasons.slice(0, selectedSeason).reduce((acc, s) => acc + s.length, 0),
            seasons.slice(0, selectedSeason + 1).reduce((acc, s) => acc + s.length, 0),
          )}
          onPress={handleOpenPlayer}
        />
      )}
    </Frame>
  );
};

export default MediaScreen;
