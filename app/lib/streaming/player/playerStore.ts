import { Db } from "@/lib/supabase/db/schema";
import { create } from "zustand";
import { StreamingSource } from "../streamingSource.types";
import { router } from "expo-router";
import { Media } from "@/lib/media/media.types";

type PlayerState = {
  media?: Media;
  streamingSource?: StreamingSource;
  watchStatus?: Db.WatchStatus;
  episodeNumber: number;
  startAt: number;
  openPlayer: () => void;
  setPlayer: (playerData: {
    media: Media;
    streamingSource: StreamingSource;
    watchStatus?: Db.WatchStatus;
    episodeNumber: number;
    startAt: number;
  }) => void;
  nextEpisode: () => void;
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  media: undefined,
  streamingSource: undefined,
  watchStatus: undefined,
  episodeNumber: 0,
  startAt: 0,
  openPlayer: () => {
    router.push("/(app)/player/");
  },
  setPlayer: ({
    media,
    streamingSource,
    watchStatus,
    episodeNumber,
    startAt,
  }) => set({ media, streamingSource, watchStatus, episodeNumber, startAt }),
  nextEpisode: () => {
    const ws = get().watchStatus;
    if (!ws) return;

    // TODO: trigger next episode
  },
}));
