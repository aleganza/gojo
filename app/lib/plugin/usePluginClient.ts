import { Db } from "../supabase/db/schema";

export type Plugin = Db.Plugin;

export const usePluginClient = (plugin: Plugin | undefined) => {
  const getWrapper = () => {
    if (plugin === undefined) throw "no"

    const apiFactory = new Function(plugin.script);
    const api = apiFactory();

    return api;
  };

  const search = async (query: string) => {
    const w = getWrapper();

    return await w.search(query);
  };

  const getEpisodes = async (id: string) => {
    const w = getWrapper();

    return await w.fetchEpisodes(id);
  };

  const getEpisodeSource = async (episodeId: string) => {
    const w = getWrapper();

    return await w.fetchSources(episodeId);
  };

  if (plugin === undefined) return null

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
