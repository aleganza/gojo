import MediaGrid from "@/components/media/MediaGrid";
import { toaster } from "@/components/toaster/toaster";
import { PrimaryButton } from "@/components/ui/buttons";
import { Frame } from "@/components/ui/frame/frame";
import { Input } from "@/components/ui/input";
import Spacer from "@/components/ui/spacer";
import { FRAME_MARGIN } from "@/lib/config";
import { useSearchInPlugin } from "@/lib/plugin/plugin-client-query";
import { usePluginClient } from "@/lib/plugin/usePluginClient";
import { usePlugin } from "@/lib/supabase/queries/plugins";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

import type { Plugin } from "@/lib/plugin/plugin.types";
export default function IndexTabScreen() {
  const { id: pluginId }: { id: string } = useLocalSearchParams();

  const { data: DbPlugin, isLoading: isLoadingPlugin } = usePlugin(pluginId);
  const pluginClient = usePluginClient(DbPlugin!); // protected by usePlugin loading

  const [searchText, setSearchText] = useState<string>("");
  const {
    data: searchResults,
    refetch: search,
    isLoading,
    error,
  } = useSearchInPlugin(pluginId, searchText);

  const handleSearch = async () => {
    try {
      await search();
    } catch (error) {
      toaster.error("Errore nella ricerca");
    }
  };

  return (
    <Frame
      useSafeArea
      showHeader
      headerText={
        isLoadingPlugin
          ? "Carico..."
          : (DbPlugin?.manifest as Plugin.Manifest).name
      }
      isSubScreen
      contentContainerStyle={{
        marginHorizontal: FRAME_MARGIN,
      }}
    >
      {!isLoadingPlugin && pluginClient && (
        <>
          <Input onChangeText={setSearchText} isSearchBar clearable />

          <Spacer />

          <PrimaryButton onPress={handleSearch}>Cerca</PrimaryButton>

          <Spacer />

          {searchResults && (
            <MediaGrid
              mediaList={searchResults.map((r) => ({
                title: r.title,
                plugin_id: DbPlugin!.id,
                external_id: r.id,
                poster_url: r.image,
                type: r.type ?? "unknown",
              }))}
            />
          )}
        </>
      )}
    </Frame>
  );
}
