import { useQueryData } from "../query/useQueryData";
import { usePlugin } from "../supabase/queries/plugins";
import { Plugin } from "./plugin.types";
import { usePluginClient } from "./usePluginClient";

export function useSearchInPlugin(pluginId: string, query: string) {
  const { data: DbPlugin } = usePlugin(pluginId);

  return useQueryData<Plugin.SearchResult[], Error>({
    queryKey: [pluginId, "plugin-search", query],
    enabled: !!DbPlugin && false, // will be invoked from parent, by calling refetch
    fetcher: async () => {
      const pluginClient = usePluginClient(DbPlugin!);
      return await pluginClient!.search(query);
    },
  });
}

// export function useFetchEpisodesFromPlugin(pluginId: string, query: string) {
//   const { data: DbPlugin } = usePlugin(pluginId);

//   return useQueryData<Plugin.SearchResult[], Error>({
//     queryKey: [pluginId, "plugin-search", query],
//     enabled: !!DbPlugin,
//     fetcher: async () => {
//       const pluginClient = usePluginClient(DbPlugin!);
//       return await pluginClient!.search(query);
//     },
//   });
// }

// export function useFetchSourcesFromPlugin(pluginId: string, query: string) {
//   const { data: DbPlugin } = usePlugin(pluginId);

//   return useQueryData<Plugin.SearchResult[], Error>({
//     queryKey: [pluginId, "plugin-search", query],
//     enabled: !!DbPlugin,
//     fetcher: async () => {
//       const pluginClient = usePluginClient(DbPlugin!);
//       return await pluginClient!.search(query);
//     },
//   });
// }
