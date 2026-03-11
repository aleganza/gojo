import HubItem from "@/components/hub/HubItem";
import HubItemsGroup from "@/components/hub/HubItemsGroup";
import HubWrapper from "@/components/hub/HubWrapper";
import MediaSection from "@/components/media/MediaSection";
import { toaster } from "@/components/toaster/toaster";
import { SecondaryButton } from "@/components/ui/buttons";
import { Frame } from "@/components/ui/frame/frame";
import { Input } from "@/components/ui/input";
import Spacer from "@/components/ui/spacer";
import { FRAME_MARGIN } from "@/lib/config";
import { Plugin } from "@/lib/plugin/plugin.types";
import { useAuth } from "@/lib/supabase/auth/useAuth";
import {
  usePlanToWatchMedia,
  useWatchingMedia,
} from "@/lib/supabase/queries/media";
import { useAddPlugin, usePlugins } from "@/lib/supabase/queries/plugins";
import { useUserProfile } from "@/lib/supabase/queries/user";
import { useTheme } from "@/lib/theme/useTheme";
import { StatusBar } from "expo-status-bar";
import { LogOut } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

export default function IndexTabScreen() {
  const { data: plugins } = usePlugins();
  const { mutate: addPlugin } = useAddPlugin();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile(
    user?.id,
  );
  const { data: watchingList } = useWatchingMedia(user?.id);
  const { data: planToWatchList } = usePlanToWatchMedia(user?.id);

  const [pluginText, setPluginText] = useState<string>("");

  const handleAddPlugin = async () => {
    const trimmedUrl = pluginText.trim();

    if (!trimmedUrl.endsWith(".json")) {
      toaster.error("Invalid plugin url");
      throw "Invalid plugin URL";
    }

    try {
      const manifestRes = await fetch(trimmedUrl);
      const manifest = await manifestRes.json();

      const scriptUrl = manifest.scriptUrl;

      const scriptRes = await fetch(scriptUrl);
      const script = await scriptRes.text();

      addPlugin({ manifest, script });

      toaster.success(`${manifest.name} installed`);
    } catch (error) {
      toaster.error("plugin fetch error");
      console.error(error);
    }
  };

  return (
    <Frame
      scrollable
      useSafeArea
      // contentContainerStyle={{
      //   marginHorizontal: FRAME_MARGIN,
      // }}
    >
      <StatusBar style={"light"} />

      <View style={{ marginHorizontal: FRAME_MARGIN }}>
        <HubWrapper>
          <HubItemsGroup label="Profilo">
            <HubItem
              imageUri={
                userProfile?.avatar_url ??
                "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
              }
              label={userProfile?.username ?? ""}
              // route="/(app)/(my-profile)"
              isLoading={isProfileLoading}
            />
            <HubItem
              Icon={LogOut}
              label="Esci"
              action={logout}
              labelColor={theme.colors.alert}
            />
          </HubItemsGroup>

          <HubItemsGroup label="Plugins">
            {plugins?.map((p, index) => (
              <HubItem
                key={index}
                label={(p.manifest as Plugin.Manifest).name}
                route={{
                  pathname: "/(app)/plugin/[id]/",
                  params: {
                    id: p.id,
                  },
                }}
              />
            ))}
          </HubItemsGroup>
        </HubWrapper>

        <Spacer />

        <View style={{ borderRadius: theme.borderRadius.md, overflow: "hidden" }}>
          <Input onChangeText={setPluginText} placeholder="Inserisci l'url del plugin"  wrapperStyle={{borderRadius: 0}} />
          <SecondaryButton onPress={handleAddPlugin} fullWidth style={{borderRadius: 0}} >
            Aggiungi plugin
          </SecondaryButton>
        </View>
      </View>

      <Spacer size="lg" />

      <View
        style={{ borderBottomColor: theme.colors.mist, borderBottomWidth: 1 }}
      />

      <Spacer size="lg" />

      {watchingList && watchingList.length > 0 && (
        <>
          <MediaSection title="Continua a guardare" mediaList={watchingList} />

          <Spacer />
        </>
      )}

      {planToWatchList && planToWatchList.length > 0 && (
        <>
          <MediaSection title="Da guardare" mediaList={planToWatchList} />
        </>
      )}
    </Frame>
  );
}
