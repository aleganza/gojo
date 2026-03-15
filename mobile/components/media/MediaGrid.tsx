import { FRAME_MARGIN } from "@/lib/config";
import { Media } from "@/lib/media/media.types";
import { useEffect, useMemo } from "react";
import { View } from "react-native";

import LazyFlatList from "../ui/lazy-flat-list";
import MediaCard from "./MediaCard";

const MediaGrid: React.FC<{
  mediaList: Media[];
  scrollable?: boolean;
  withHorizontalMargin?: boolean;
}> = ({
  mediaList,
  scrollable = true,
  withHorizontalMargin = false,
}) => {
  return (
    <LazyFlatList
      data={mediaList}
      horizontal={false}
      scrollEnabled={scrollable}
      keyExtractor={(_, index) => index.toString()}
      numColumns={3}
      columnWrapperStyle={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        marginHorizontal: withHorizontalMargin ? FRAME_MARGIN : 0,
      }}
      renderItem={({ item, index }: { item: Media; index: number }) => (
        <View
          style={{
            width: "30%",
            marginBottom: "5%",
            marginRight: (index + 1) % 3 === 0 ? 0 : "5%",
          }}
        >
          <MediaCard media={item} />
        </View>
      )}
    />
  );
};

export default MediaGrid;
