import { useQueryData } from "@/lib/query/useQueryData";
import { supabase } from "../client";
import { Db } from "../db/schema";


export function useUserProfile(userId: string | undefined) {
  return useQueryData<Db.UserProfile, unknown>({
    queryKey: ["userProfile", userId],
    enabled: !!userId,
    fetcher: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();

      if (error) throw error;
      return data as unknown as Db.UserProfile;
    },
  });
}