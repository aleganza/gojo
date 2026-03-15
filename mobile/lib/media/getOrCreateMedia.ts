import { useMutationData } from "../query/useMutationData";
import { supabase } from "../supabase/client";

import type { Db } from "../supabase/db/schema";

type CreateMediaInput = {
  title: string;
  type: "movie" | "serie" | "anime" | "unknown";
  plugin_id: string;
  external_id: string;
  poster_url?: string;
};

export async function getOrCreateMedia(media: CreateMediaInput) {
  // Provo a leggere il media tramite plugin_id + external_id
  const { data: existing, error: fetchError } = await supabase
    .from("media")
    .select("*")
    .eq("plugin_id", media.plugin_id)
    .eq("external_id", media.external_id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = row not found (supabase)
    throw fetchError;
  }

  if (existing) return existing;

  // Non trovato → lo creo
  const { data: created, error: createError } = await supabase
    .from("media")
    .insert([media])
    .select()
    .single();

  if (createError) throw createError;

  return created;
}

export function useGetOrCreateMedia() {
  return useMutationData<Db.Media, CreateMediaInput, Error>({
    mutationFn: getOrCreateMedia,
  });
}
