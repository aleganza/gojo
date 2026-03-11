import { StreamingSource } from "../streaming/streamingSource.types";

export namespace Plugin {
  export type Manifest = {
    name: string;
    slug: string;
    version: string;
    iconUrl: string;
    scriptUrl: string;
  };

  export type SearchResult = {
    id: string;
    title: string;
    image: string;
    url: string;
    type?: "movie" | "serie" | "anime" | "unknown";
  };

  export type Episode = {
    id: string;
    number: number;
  };

  export type Source = StreamingSource;
}
