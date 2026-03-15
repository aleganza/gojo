import { useMutationData } from "@/lib/query/useMutationData";
import { useQueryData } from "@/lib/query/useQueryData";

import { supabase } from "../client";
import { Db } from "../db/schema";
import { queryClient } from "@/lib/query/client";

/* -------------------------------- */
/* get media by id */
/* -------------------------------- */
async function getMedia(id: string) {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export function useMedia(id: string) {
  return useQueryData<Db.Media, Error>({
    queryKey: ["media", id],
    fetcher: () => getMedia(id),
  });
}

/* -------------------------------- */
/* create media */
/* -------------------------------- */
type CreateMediaInput = {
  title: string;
  type: "movie" | "serie" | "anime";
  plugin_id: string;
  external_id: string;
  poster_url?: string;
};

async function createMedia(media: CreateMediaInput) {
  const { data, error } = await supabase
    .from("media")
    .insert([media])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function useCreateMedia() {
  return useMutationData<Db.Media, CreateMediaInput, Error>({
    mutationFn: createMedia,
  });
}

// --- Hook generico per media filtrati per watch status ---
function useMediaByStatus(userId: string | undefined, status: Db.WatchStatus["status"]) {
  return useQueryData<Db.Media[], unknown>({
    enabled: !!userId,
    queryKey: ["mediaByStatus", userId, status],
    fetcher: async () => {
      const { data: wsList, error: wsError } = await supabase
        .from("watch_status")
        .select("*")
        .eq("user_id", userId)
        .eq("status", status);

      if (wsError) throw wsError;

      if (!wsList || wsList.length === 0) return [];

      const mediaIds = wsList.map((ws) => ws.media_id);
      const { data: mediaList, error: mediaError } = await supabase
        .from("media")
        .select("*")
        .in("id", mediaIds);

      if (mediaError) throw mediaError;

      return mediaList;
    },
  });
}

export function usePlanToWatchMedia(userId: string | undefined) {
  return useMediaByStatus(userId, "plan_to_watch");
}

export function useWatchingMedia(userId: string | undefined) {
  return useMediaByStatus(userId, "watching");
}
