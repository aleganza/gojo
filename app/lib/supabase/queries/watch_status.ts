import { queryClient } from "@/lib/query/client";
import { useMutationData } from "@/lib/query/useMutationData";
import { useQueryData } from "@/lib/query/useQueryData";

import { supabase } from "../client";
import { Db } from "../db/schema";

// --- Hook per ottenere lo stato di visione ---
export function useWatchStatus(mediaId: string, userId: string | undefined) {
  return useQueryData<Db.WatchStatus, unknown>({
    queryKey: ["watchStatus", userId, mediaId],
    enabled: !!userId,
    fetcher: async () => {
      // Controlla se esiste già
      const { data, error } = await supabase
        .from("watch_status")
        .select("*")
        .eq("user_id", userId!)
        .eq("media_id", mediaId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = row not found
        throw error;
      }

      // Se non esiste, crea una riga di default
      if (!data) {
        const { data: inserted, error: insertError } = await supabase
          .from("watch_status")
          .insert({
            user_id: userId!,
            media_id: mediaId,
            status: "unknown",
            current_episode: null,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return inserted;
      }

      return data;
    },
  });
}

export function useUpdateWatchStatus(mediaId: string, userId: string) {
  const queryKey = ["watchStatus", userId, mediaId];

  return useMutationData<
    Db.WatchStatus,
    { status: Db.WatchStatus["status"]; current_episode?: string | null },
    unknown
  >({
    mutationFn: async ({ status, current_episode }) => {
      // --- esistente: fetch/insert/update ---
      const { data: existing, error } = await supabase
        .from("watch_status")
        .select("*")
        .eq("user_id", userId)
        .eq("media_id", mediaId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      let updated: Db.WatchStatus;
      let oldStatus: Db.WatchStatus["status"] | null = null;

      if (!existing) {
        const { data: inserted, error: insertError } = await supabase
          .from("watch_status")
          .insert({
            user_id: userId,
            media_id: mediaId,
            status,
            current_episode: current_episode ?? null,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        updated = inserted;
      } else {
        oldStatus = existing.status;
        const { data: updatedData, error: updateError } = await supabase
          .from("watch_status")
          .update({
            status,
            current_episode: current_episode ?? existing.current_episode,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (updateError) throw updateError;
        updated = updatedData;
      }

      // --- aggiorna cache singolo watchStatus ---
      queryClient.setQueryData<Db.WatchStatus>(queryKey, updated);

      // --- aggiorna cache delle liste di media ---
      const listKeys: Db.WatchStatus["status"][] = [
        "watching",
        "plan_to_watch",
      ];
      listKeys.forEach(async (listStatus) => {
        const listQueryKey = ["mediaByStatus", userId, listStatus];
        const cachedList =
          queryClient.getQueryData<Db.Media[]>(listQueryKey) ?? [];

        // se il media è già nella lista
        const inListIndex = cachedList.findIndex((m) => m.id === mediaId);

        if (updated.status === listStatus) {
          // deve esserci → aggiungi se non presente
          if (inListIndex === -1) {
            const mediaRow = await supabase
              .from("media")
              .select("*")
              .eq("id", mediaId)
              .single();
            if (mediaRow.data) {
              queryClient.setQueryData<Db.Media[]>(listQueryKey, [
                ...cachedList,
                mediaRow.data,
              ]);
            }
          }
        } else {
          // non deve esserci → rimuovi se presente
          if (inListIndex !== -1) {
            const newList = [...cachedList];
            newList.splice(inListIndex, 1);
            queryClient.setQueryData(listQueryKey, newList);
          }
        }
      });

      return updated;
    },
  });
}
