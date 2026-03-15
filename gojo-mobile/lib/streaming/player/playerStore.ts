import { Db } from "@/lib/supabase/db/schema";
import { create } from "zustand";
import { StreamingSource } from "../streamingSource.types";
import { router } from "expo-router";
import { Media, MediaEpisodeCover } from "@/lib/media/media.types";
import { Plugin } from "@/lib/plugin/plugin.types";
import { platform } from "@/lib/env/env";

type PlayerStateEmpty = {
  status: "idle";
};

type PlayerStateLoaded = {
  status: "ready";
  media: Media;
  seasons: Plugin.Season[];
  streamingSource: StreamingSource;
  seasonCovers?: MediaEpisodeCover[];
  currentEpisode: number;
  currentSeason: number;
  startAt: number;
};

type PlayerState = (PlayerStateEmpty | PlayerStateLoaded) & {
  openPlayer: () => void;
  setPlayer: (playerData: Omit<PlayerStateLoaded, "status">) => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  status: "idle",
  openPlayer: () => {
    if (platform.is.mobile) {
      router.push("/(app)/player-mobile/");
      return;
    }
    
    if (platform.is.web) {
      router.push("/(app)/player-web/");
      return;
    }

    throw Error("No player");
  },
  setPlayer: ({
    media,
    seasons,
    seasonCovers,
    streamingSource,
    currentEpisode,
    currentSeason,
    startAt,
  }) =>
    set({
      status: "ready",
      media,
      seasons,
      seasonCovers,
      streamingSource,
      currentEpisode,
      currentSeason,
      startAt,
    }),
}));
