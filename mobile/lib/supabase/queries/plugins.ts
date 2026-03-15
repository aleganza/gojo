import { useMutationData } from "@/lib/query/useMutationData";
import { useQueryData } from "@/lib/query/useQueryData";

import { supabase } from "../client";

import type { Db } from "../db/schema";
import { queryClient } from "@/lib/query/client";

export function usePlugins() {
  return useQueryData<Db.Plugin[], Error>({
    queryKey: ["plugins"],
    fetcher: async () => {
      const { data, error } = await supabase
        .from("plugins")
        .select("*");

      if (error) throw error;
      return data;
    },
  });
}

export function usePlugin(id: string) {
  return useQueryData<Db.Plugin, Error>({
    queryKey: ["plugin", id],
    fetcher: async () => {
      const { data, error } = await supabase
        .from("plugins")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

type AddPluginInput = {
  manifest: Record<string, any>;
  script: string;
};

export function useAddPlugin() {
  return useMutationData<Db.Plugin, AddPluginInput, Error>({
    mutationFn: async ({ manifest, script }) => {
      const { data, error } = await supabase
        .from("plugins")
        .insert([{ slug: manifest.slug, manifest, script }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plugins"] });
    },
  });
}

type RemovePluginInput = {
  id: string;
};

export function useRemovePlugin() {
  return useMutationData<Db.Plugin, RemovePluginInput, Error>({
    mutationFn: async ({ id }) => {
      const { data, error } = await supabase
        .from("plugins")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (deletedPlugin) => {
      // Aggiorna la cache di "plugins" rimuovendo il plugin eliminato
      queryClient.setQueryData<Db.Plugin[] | undefined>(["plugins"], (old) =>
        old?.filter((p) => p.id !== deletedPlugin.id)
      );
      // Invalida eventualmente la cache del singolo plugin
      queryClient.invalidateQueries({ queryKey: ["plugin", deletedPlugin.id] });
    },
  });
}
