import { getEnvironmentVariables } from "@/lib/env/getEnvironmentVariables";
import { MediaEpisodeCover } from "@/lib/media/media.types";
import { useQueryData } from "@/lib/query/useQueryData";
import { UseQueryResult } from "@tanstack/react-query";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const { TMDB_API_KEY } = getEnvironmentVariables();

const tmdbHeaders = {
  Authorization: `Bearer ${TMDB_API_KEY}`,
  accept: "application/json",
};

type Episode = {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date?: string;
  runtime?: number;
};

type SeasonResponse = {
  episodes: Episode[];
};

type TVSearchResponse = {
  results: {
    id: number;
    name: string;
  }[];
};

type TVDetailsResponse = {
  seasons: {
    season_number: number;
  }[];
};

async function fetchEpisodes(
  tvName: string,
  type?: string,
): Promise<MediaEpisodeCover[]> {
  const searchRes = await fetch(
    `${TMDB_BASE_URL}/search/${type === "serie" ? "tv" : "movie"}?query=${encodeURIComponent(tvName)}&language=en-US&page=1`,
    { headers: tmdbHeaders },
  );
  if (!searchRes.ok) throw new Error("TMDB search failed");

  const searchData: TVSearchResponse = await searchRes.json();
  const tv = searchData.results[0];
  if (!tv) return [];

  const detailsRes = await fetch(`${TMDB_BASE_URL}/tv/${tv.id}`, {
    headers: tmdbHeaders,
  });
  if (!detailsRes.ok) throw new Error("TMDB tv details failed");

  const details: TVDetailsResponse = await detailsRes.json();
  const seasons = details.seasons ?? [];

  const seasonData = await Promise.all(
    seasons
      .filter((s) => s.season_number > 0)
      .map(async (season) => {
        const res = await fetch(
          `${TMDB_BASE_URL}/tv/${tv.id}/season/${season.season_number}`,
          { headers: tmdbHeaders },
        );
        if (!res.ok) return null;
        const data: SeasonResponse = await res.json();
        return data.episodes;
      }),
  );

  return seasonData
    .flat()
    .filter((ep): ep is Episode => ep !== null)
    .map((ep) => ({
      image: ep.still_path
        ? `https://image.tmdb.org/t/p/w500${ep.still_path}`
        : undefined,
      title: ep.name,
      summary: ep.overview,
      airdate: ep.air_date,
      length: ep.runtime,
      episodeNumber: ep.episode_number,
      seasonNumber: ep.season_number,
    }));
}

export function useTMDBEpisodes(
  tvName: string,
  type?: string,
): UseQueryResult<MediaEpisodeCover[]> {
  return useQueryData<MediaEpisodeCover[], Error>({
    queryKey: ["tmdb", "episodes", tvName],
    enabled: !!tvName,
    fetcher: () => fetchEpisodes(tvName, type),
  });
}
