import { FRAME_MARGIN } from "@/lib/config";
import { Media } from "@/lib/media/media.types";
import React from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { H5 } from "../ui/headings";
import LazyFlatList from "../ui/lazy-flat-list";
import MediaCard from "./MediaCard";
import Spacer from "../ui/spacer";

const MediaSection: React.FC<{
  title: string;
  mediaList: Media[] | undefined | null;
  lazy?: boolean;
}> = ({ title, mediaList, lazy = true }) => {
  if (mediaList === null) return null;

  if (mediaList === undefined) return null;

  const ListComponent = lazy ? LazyFlatList : FlatList;

  return (
    <View>
      <H5 text={title} style={{ paddingLeft: FRAME_MARGIN }} />

      <Spacer size="sm" />

      <ListComponent
        data={mediaList}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingLeft: FRAME_MARGIN }}
        renderItem={({ item, index }) => (
          <MediaCard
            key={index}
            media={item}
            // style={{
            //   marginRight: index === mediaList.length - 1 ? FRAME_MARGIN * 2 : 8,
            // }}
          />
        )}
      />
    </View>
  );
};

export default MediaSection;
