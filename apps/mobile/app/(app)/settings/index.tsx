import HubItem from "@/components/hub/HubItem";
import HubItemsGroup from "@/components/hub/HubItemsGroup";
import HubWrapper from "@/components/hub/HubWrapper";
import { Frame } from "@/components/ui/frame/frame";
import { FRAME_MARGIN } from "@/lib/config";
import { useStorage } from "@/lib/store/useStorage";
import { CloudSync, Wrench } from "lucide-react-native";

export default function SettingsRoute() {
  const { storage, setItem } = useStorage();

  return (
    <Frame
      scrollable
      useSafeArea
      isSubScreen
      headerText="Impostazioni"
      contentContainerStyle={{
        marginHorizontal: FRAME_MARGIN,
      }}
    >
      <HubWrapper>
        <HubItemsGroup label="Player">
          <HubItem
            Icon={Wrench}
            label="Mostra informazioni tecniche nel player"
            toggle={{
              value: storage.player.showDevTools,
              onChange: (value: boolean) =>
                setItem("player.showDevTools", value),
            }}
          />
          <HubItem
            Icon={CloudSync}
            label="Sync"
            toggle={{
              value: storage.player.syncProgress,
              onChange: (value: boolean) =>
                setItem("player.syncProgress", value),
            }}
          />
        </HubItemsGroup>
      </HubWrapper>
    </Frame>
  );
}
