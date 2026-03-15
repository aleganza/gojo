import { getEnvironmentVariables } from "../env/getEnvironmentVariables";
import { useQueryData } from "../query/useQueryData";
import { usePlugin } from "../supabase/queries/plugins";
import { Plugin } from "./plugin.types";
import { usePluginClient } from "./usePluginClient";

const { TMDB_API_KEY } = getEnvironmentVariables()

export function useSearchInPlugin(pluginId: string, query: string) {
  const { data: DbPlugin } = usePlugin(pluginId);

  return useQueryData<Plugin.SearchResult[], Error>({
    queryKey: [pluginId, "plugin-search", query],
    enabled: !!DbPlugin && false, // will be invoked from parent, by calling refetch
    fetcher: async () => {
      const pluginClient = usePluginClient(DbPlugin!);
      const tmdb_key = pluginClient?.slug === "vixsrc" ? TMDB_API_KEY : undefined
    
      const a  = await pluginClient!.search(query, tmdb_key);
      return a
    },
  });
}

export function useFetchEpisodesFromPlugin(pluginId: string, mediaId: string) {
  const { data: DbPlugin } = usePlugin(pluginId);

  return useQueryData<Plugin.Season[], Error>({
    queryKey: [pluginId, "plugin-fetch-seasons", mediaId],
    enabled: !!DbPlugin,
    fetcher: async () => {
      const pluginClient = usePluginClient(DbPlugin!);
      const tmdb_key = pluginClient?.slug === "vixsrc" ? TMDB_API_KEY : undefined
      console.log(pluginClient?.slug)

      return await pluginClient!.getEpisodes(mediaId, tmdb_key);
    },
  });
}

// export function useFetchSourcesFromPlugin(pluginId: string, episodeId: string) {
//   const { data: DbPlugin } = usePlugin(pluginId);

//   return useQueryData<Plugin.Source[], Error>({
//     queryKey: [pluginId, "plugin-fetch-sources", episodeId],
//     enabled: !!DbPlugin,
//     fetcher: async () => {
//       const pluginClient = usePluginClient(DbPlugin!);
//       return await pluginClient!.getEpisodeSource(episodeId);
//     },
//   });
// }
