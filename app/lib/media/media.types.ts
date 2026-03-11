import { Db } from "../supabase/db/schema";

export type Media = Omit<Db.Media, "id"> & { id?: string };
