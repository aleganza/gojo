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
import { hapticVibrate } from "@/lib/utils/haptics";
import { Bookmark, Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import HubItemsGroupLabel from "../hub/HubItemsGroupLabel";
import { SecondaryButton } from "../ui/buttons";
import { H5 } from "../ui/headings";
import { ProgressBar } from "../ui/progress-bar";
import MediaEpisodesList from "./MediaEpisodesList";
import { useTMDBEpisodes } from "./TMDB/useTMDBEpisodes";
import { platform } from "@/lib/env/env";

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
  const { data: seasons, isLoading: isLoadingEpisodes } =
    useFetchEpisodesFromPlugin(media.plugin_id, media.external_id);

  const { openPlayer, setPlayer } = usePlayerStore();

  const updateWatchStatus = useUpdateWatchStatus(media.id, user!.id);

  const { data: episodesCovers } = useTMDBEpisodes(media.title, media.type);

  const [selectedSeason, setSelectedSeason] = useState(0);
  const [showAllProgress, setShowAllProgress] = useState(false);

  useEffect(() => {
    hapticVibrate();
  }, [selectedSeason]);

  const handleOpenPlayer = async (seasonNumber: number, episodeId: string) => {
    if (!seasons) return;

    try {
      const sources = await pluginClient?.getEpisodeSource(episodeId);
      const streamingSource = sources[0];

      const currentEpisode = seasons
        .flatMap((s) => s.episodes)
        .find((e) => e.id === episodeId)!.number;

      setPlayer({
        media: media,
        streamingSource,
        seasons,
        seasonCovers: episodesCovers?.find(
          (ec) => ec.season === selectedSeason + 1,
        )?.episodes,
        currentEpisode,
        currentSeason: seasonNumber,
        startAt: 0,
      });
      openPlayer();
    } catch (error) {
      toaster.error("Errore nell'apertura del player");
      Logger.error(error);
    }
  };

  const resume = () => {
    try {
      // TODO: should be centralized
      const startingEpisode = watchStatus?.current_episode ?? 1;
      const startingSeason = watchStatus?.current_season ?? 1;

      const currentSeason = seasons!.find((s) => s.season === startingSeason);
      if (!currentSeason) throw "Stagione non trovata";

      const increaseSeason = startingEpisode === currentSeason.episodes.length;

      const episodeToPlay = increaseSeason ? 1 : startingEpisode + 1;
      const seasonToPlay = increaseSeason ? startingSeason + 1 : startingSeason;

      const seasonObj = seasons!.find((s) => s.season === seasonToPlay);
      if (!seasonObj) throw "Stagione successiva non trovata";

      const episodeObj = seasonObj.episodes.find(
        (ep) => ep.number === episodeToPlay,
      );
      if (!episodeObj) throw "Episodio non trovato";

      handleOpenPlayer(seasonObj.season, episodeObj.id);
    } catch (error) {
      toaster.error(error as string);
      console.error(error);
    }
  };

  const handleAddToPlanToWatch = async () => {
    try {
      switch (watchStatus?.status) {
        case "completed":
          break;
        case "unknown":
        case "watching":
          await updateWatchStatus.mutateAsync({ status: "plan_to_watch" });
          toaster.info("In lista");
          break;
        case "plan_to_watch":
          await updateWatchStatus.mutateAsync({ status: "unknown" });
          toaster.info("Rimosso dalla lista");
          break;
      }
    } catch (error) {
      toaster.error("Errore: no media id");
    }
  };

  // console.log("dio", watchStatus, "\n", media.id, "\n", user?.id)

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
        flex: platform.is.web ? 1 : undefined,
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

      {watchStatus && seasons && (
        <>
          <Spacer size="xl" />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setShowAllProgress(!showAllProgress);
            }}
          >
            {showAllProgress ? (
              <>
                {seasons.map((s, index) => {
                  const currentSeasonProgress = watchStatus.current_season ?? 0;
                  const currentEpisodeProgress =
                    watchStatus.current_episode ?? 0;
                  const seasonEpisodes = seasons.find(
                    (ss) => ss.season === s.season,
                  )!.episodes.length;
                  const seasonProgress =
                    currentSeasonProgress < s.season
                      ? 0
                      : currentSeasonProgress > s.season
                        ? seasonEpisodes
                        : currentEpisodeProgress;

                  return (
                    <View key={index}>
                      <HubItemsGroupLabel
                        label={`Stagione ${s.season}: ${seasonProgress} / ${seasonEpisodes}`}
                      />

                      <Spacer size="sm" />

                      <ProgressBar
                        progress={(seasonProgress / seasonEpisodes) * 100}
                      />

                      <Spacer size="sm" />
                    </View>
                  );
                })}
              </>
            ) : (
              <>
                <HubItemsGroupLabel
                  label={`Progresso: ${
                    seasons
                      .filter(
                        (s) => s.season < (watchStatus.current_season ?? 0),
                      )
                      .reduce(
                        (acc, current) => acc + current.episodes.length,
                        0,
                      ) + (watchStatus.current_episode ?? 0)
                  } / ${seasons.flatMap((s) => s.episodes).length}`}
                />

                <Spacer size="sm" />

                <ProgressBar
                  progress={
                    seasons
                      .filter(
                        (s) => s.season < (watchStatus.current_season ?? 0),
                      )
                      .reduce(
                        (acc, current) => acc + current.episodes.length,
                        0,
                      ) +
                    (watchStatus.current_episode ?? 0) /
                      seasons.flatMap((s) => s.episodes).length
                  }
                />

                <Spacer size="sm" />
              </>
            )}
          </TouchableOpacity>

          <Spacer />

          <SecondaryButton onPress={resume} size="md" fullWidth>
            Riprendi
          </SecondaryButton>
        </>
      )}

      <Spacer size="xl" />

      <H5 text="Episodi" />

      <Spacer />

      {seasons && (
        <ScrollView
          horizontal
          contentContainerStyle={{ flexDirection: "row", gap: 8 }}
          style={{ maxHeight: platform.is.web ? 38 : undefined }}
        >
          {seasons.map((_, i) => (
            <SecondaryButton
              key={i}
              size="sm"
              onPress={() => setSelectedSeason(i)}
              style={{
                opacity: selectedSeason === i ? 0.4 : 1,
              }}
            >
              <Txt>{`S${i + 1}`}</Txt>
            </SecondaryButton>
          ))}
        </ScrollView>
      )}

      <Spacer size="md" />

      {isLoadingEpisodes && <ActivityIndicator />}

      {!seasons && !isLoadingEpisodes && <Txt>errore episodi</Txt>}

      {seasons && (
        <MediaEpisodesList
          media={media}
          seasonNumber={seasons[selectedSeason].season}
          episodes={seasons[selectedSeason].episodes}
          episodesCovers={
            episodesCovers?.find((ec) => ec.season === selectedSeason + 1)
              ?.episodes
          }
          onPress={handleOpenPlayer}
        />
      )}
    </Frame>
  );
};

export default MediaScreen;
