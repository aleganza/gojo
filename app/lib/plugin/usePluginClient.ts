import { Db } from "../supabase/db/schema";

export type Plugin = Db.Plugin;

export const usePluginClient = (plugin: Plugin | undefined) => {
  const getWrapper = () => {
    try {
      if (plugin === undefined) throw "no";

      const apiFactory = new Function(plugin.script);
      const api = apiFactory();

      return api;
    } catch (error) {
      console.error(error);
    }
  };

  const search = async (query: string, ...args: any[]) => {
    const w = getWrapper();

    return await w.search(query, ...args);
  };

  const getEpisodes = async (id: string, ...args: any[]) => {
    const w = getWrapper();

    return await w.fetchEpisodes(id, ...args);
  };

  const getEpisodeSource = async (episodeId: string, ...args: any[]) => {
    const w = getWrapper();

    return await w.fetchSources(episodeId, ...args);
  };

  if (plugin === undefined) return null;

  return {
    id: plugin.id,
    name: (plugin.manifest as any).name,
    slug: plugin.slug,
    manifest: plugin.manifest,
    script: plugin.script,
    search,
    getEpisodes,
    getEpisodeSource,
  };
};
