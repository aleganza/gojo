import { Media, MediaEpisodeCover } from '@/lib/media/media.types';
import { Plugin } from '@/lib/plugin/plugin.types';
import React from 'react';
import { FlatList } from 'react-native';

import MediaEpisode from './MediaEpisode';
import { useTheme } from '@/lib/theme/useTheme';
import { AniView } from '@/lib/reanimated/components';

/**
 * -- behavior --
 *
 * from [id] (media page), opens SearchInProviderSheet
 * from the player changes source directly
 */

const MediaEpisodesList: React.FC<{
  media: Media;
  episodes: Plugin.Episode[];
  episodesCovers?: MediaEpisodeCover[];
  onPress: (number: number) => void;
}> = ({ media, episodes, episodesCovers, onPress }) => {
  const { theme } = useTheme()

  return (
    <>
      <AniView style={{ flex: 1 }}>
        <FlatList
          horizontal={false}
          scrollEnabled={false}
          data={episodes}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          renderItem={({ item, index }) => (
            <MediaEpisode
              key={index}
              media={media}
              number={item.number}
              coverColor={theme.colors.mist.toString()}
              // episodeCover={episodesCovers?.[item.number - 1]}
              episodeCover={episodesCovers?.[item.number - 1]}
              onPress={() => {
                onPress(item.number);
              }}
            />
          )}
        />
      </AniView>
    </>
  );
};

export default MediaEpisodesList;
