-- Tabella utenti
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Tabella plugin/sorgenti
CREATE TABLE plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    manifest JSONB NOT NULL
);

-- Tabella media (film/serie/anime)
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('movie', 'serie', 'anime', 'unknown')),
    plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    poster_url TEXT,
    UNIQUE (plugin_id, external_id)
);

-- Tabella stato di visione collegata a auth.users
CREATE TABLE watch_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('watching', 'completed', 'plan_to_watch', 'unknown')),
    current_episode TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (user_id, media_id)
);