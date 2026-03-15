import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { getEnvironmentVariables } from "@/lib/env/getEnvironmentVariables";

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = getEnvironmentVariables();

const supabaseUrl = SUPABASE_URL;
const supabasePublishableKey = SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
