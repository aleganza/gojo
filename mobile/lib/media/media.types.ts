import { Db } from "../supabase/db/schema";

export type Media = Omit<Db.Media, "id"> & { id?: string };

export interface MediaEpisodeCover {
  image?: string;
  title?: string;
  summary?: string;
  airdate?: string;
  length?: string | number;
  episodeNumber?: number;
  seasonNumber?: number;
}
