import MediaScreen from '@/components/media/MediaScreen';
import { toaster } from '@/components/toaster/toaster';
import { Txt } from '@/components/ui/texts';
import { useGetOrCreateMedia } from '@/lib/media/getOrCreateMedia';
import { Media } from '@/lib/media/media.types';
import { usePluginClient } from '@/lib/plugin/usePluginClient';
import { Db } from '@/lib/supabase/db/schema';
import { usePlugin } from '@/lib/supabase/queries/plugins';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

export default function MediaScreenRoute() {
  const params = useLocalSearchParams();
  const rawMedia = JSON.parse(params.rawMedia as string) as Media;
  const getOrCreate = useGetOrCreateMedia();

  const [media, setMedia] = useState<Db.Media | null | undefined>();

  useEffect(() => {
    getOrCreate.mutate(
      {
        title: rawMedia.title,
        type: rawMedia.type,
        plugin_id: rawMedia.plugin_id,
        external_id: rawMedia.external_id,
        poster_url: rawMedia.poster_url ?? undefined,
      },
      {
        onSuccess: (m) => {
          setMedia(m);
        },
        onError: (err) => {
          toaster.error("Errore nella creazione media sul db");
          console.error("Errore nel getOrCreateMedia:", err);
        },
      },
    );
  }, []);

  if (media === undefined) return <ActivityIndicator />
  
  if (media === null) return <Txt>Errore</Txt>

  if (media) return <MediaScreen media={media} />
}
