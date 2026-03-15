export namespace Db {
  export type UserProfile = {
    id: string;
    user_id: string;
    username: string;
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
  };

  export type Plugin = {
    id: string; // UUID
    slug: string;
    manifest: unknown; // JSONB
    script: string;
  };

  export type Media = {
    id: string; // UUID
    title: string;
    type: "movie" | "serie" | "anime" | "unknown";
    plugin_id: string; // UUID
    external_id: string;
    poster_url: string | null;
  };

  export type WatchStatus = {
    id: string; // UUID
    user_id: string; // UUID (auth.users.id)
    media_id: string; // UUID
    status: "watching" | "completed" | "plan_to_watch" | "unknown";
    current_episode: number | null;
    current_season: number | null;
    updated_at: string; // timestamp
  };
}
