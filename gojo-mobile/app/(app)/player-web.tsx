import { MonoText } from "@/components/ui/texts";
import { useStorage } from "@/lib/store/useStorage";
import { parseInsidePlayerTitle } from "@/lib/streaming/player/parse";
import { usePlayerStore } from "@/lib/streaming/player/playerStore";
import { useAuth } from "@/lib/supabase/auth/useAuth";
import {
  useUpdateCurrentEpisode,
  useUpdateWatchStatus,
  useWatchStatus,
} from "@/lib/supabase/queries/watch_status";
import { router } from "expo-router";
import Hls from "hls.js";
import {
  ArrowLeft,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeOff,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerWebScreenRoute() {
  const { user } = useAuth();
  if (!user) throw new Error("User not authenticated");

  const state = usePlayerStore();
  if (state.status !== "ready") throw new Error("Player not initialized");

  const { storage } = useStorage();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eightyFiveFiredRef = useRef(false);
  const readyFiredRef = useRef(false);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const { data: watchStatus } = useWatchStatus(state.media.id!, user.id);
  const mutateWatchStatus = useUpdateWatchStatus(state.media.id!, user.id);
  const mutateCurrentEpisode = useUpdateCurrentEpisode(
    state.media.id!,
    user.id,
  );

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Posizione visiva del thumb durante il drag — null = segue currentTime
  const [dragProgress, setDragProgress] = useState<number | null>(null);

  const [progressUpdated, setProgressUpdated] = useState(false);

  const sourceUrl = state.streamingSource.qualities[0]?.url ?? null;
  const streamType = state.streamingSource.type;
  const title = state.media.title;

  // ─── Auto-hide controls ──────────────────────────────────────────────────

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      // Legge il valore live dal DOM per evitare closure stale su `playing`
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  }, []);

  const setOnWatching = () => {
    if (watchStatus?.status !== "watching") {
      let current_episode = undefined;
      if (!watchStatus?.current_episode) current_episode = 1;

      let current_season = undefined;
      if (!watchStatus?.current_season) current_season = 1;

      if (storage.player.syncProgress) {
        mutateWatchStatus.mutate({
          status: "watching",
          current_episode,
          current_season,
        });
      }
    }
  };

  // ─── Carica la source + autoplay ────────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sourceUrl) return;

    eightyFiveFiredRef.current = false;
    readyFiredRef.current = false;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls = streamType === "hls" || sourceUrl.includes(".m3u8");

    if (isHls) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari — HLS nativo
        video.src = sourceUrl;
        video.addEventListener(
          "loadedmetadata",
          () => video.play().catch(console.warn),
          { once: true },
        );
      } else if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!videoRef.current) return;
          hls.currentLevel = hls.levels.length - 1;
          videoRef.current.play().catch(console.warn);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal)
            console.error("HLS fatal error", data.type, data.details);
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;

        setOnWatching();
      } else {
        console.warn("HLS non supportato su questo browser");
      }
    } else {
      // mp4 / dash diretto
      video.src = sourceUrl;
      video.play().catch(console.warn);

      setOnWatching();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [sourceUrl, streamType]);

  const onSourceReady = () => {
    // Parte quando la source è caricata e il video inizia a riprodursi
  };

  const onReachedEightyFivePercent = () => {
    if (storage.player.syncProgress && !progressUpdated) {
      mutateCurrentEpisode.mutate({
        current_episode: state.currentEpisode,
        current_season: state.currentSeason,
      });
    }
  };

  // ─── Event listeners video ───────────────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    const handleTimeUpdate = () => {
      const t = video.currentTime;
      const d = video.duration;

      // Non aggiornare currentTime mentre l'utente sta draggando
      if (!isDraggingRef.current) setCurrentTime(t);

      if (d > 0 && t / d >= 0.85 && !eightyFiveFiredRef.current) {
        eightyFiveFiredRef.current = true;
        onReachedEightyFivePercent();
        setProgressUpdated(true);
      }

      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handleLoadedMetadata = () => setDuration(video.duration);

    const handleCanPlay = () => {
      if (!readyFiredRef.current) {
        readyFiredRef.current = true;
        onSourceReady();
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // ─── Fullscreen listener ─────────────────────────────────────────────────

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ─── Auto focus al mount ─────────────────────────────────────────────────

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // ─── Cleanup timer ───────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  // ─── Azioni player ───────────────────────────────────────────────────────

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
    resetControlsTimer();
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(
      0,
      Math.min(video.duration, video.currentTime + seconds),
    );
    resetControlsTimer();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    resetControlsTimer();
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen().catch(console.warn);
    else document.exitFullscreen();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const v = parseFloat(e.target.value);
    video.volume = v;
    setVolume(v);
    setMuted(v === 0);
    resetControlsTimer();
  };

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlay();
        break;
      case "F11":
        e.preventDefault();
        toggleFullscreen();
        break;
      case "Escape":
        if (document.fullscreenElement) document.exitFullscreen();
        break;
      case "ArrowRight":
        e.preventDefault();
        seek(10);
        break;
      case "ArrowLeft":
        e.preventDefault();
        seek(-10);
        break;
    }
  };

  // ─── Seek bar drag ───────────────────────────────────────────────────────

  const getSeekRatio = (clientX: number): number => {
    const bar = seekBarRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleSeekMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDraggingRef.current = true;

    const video = videoRef.current;
    const ratio = getSeekRatio(e.clientX);

    setDragProgress(ratio * 100);
    if (video) video.currentTime = ratio * duration;

    const onMove = (ev: MouseEvent) => {
      const r = getSeekRatio(ev.clientX);
      setDragProgress(r * 100);
      if (videoRef.current) videoRef.current.currentTime = r * duration;
    };

    const onUp = (ev: MouseEvent) => {
      isDraggingRef.current = false;
      const r = getSeekRatio(ev.clientX);
      if (videoRef.current) {
        videoRef.current.currentTime = r * duration;
        setCurrentTime(r * duration);
      }
      setDragProgress(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    resetControlsTimer();
  };

  const progress =
    dragProgress !== null
      ? dragProgress
      : duration > 0
        ? (currentTime / duration) * 100
        : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      style={webStyles.container}
      onMouseMove={resetControlsTimer}
      onMouseEnter={resetControlsTimer}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <video ref={videoRef} style={webStyles.video} playsInline />

      {storage.player.showDevTools && (
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 30,
            top: "50%",
            transform: "translateY(-50%)",
            gap: 1,
            flexDirection: "column",
          }}
        >
          <MonoText>
            watchStatus.current_episode: {watchStatus?.current_episode}
          </MonoText>
          <MonoText>
            watchStatus.current_season: {watchStatus?.current_season}
          </MonoText>
          <MonoText>ctx.currentEpisode:{state.currentEpisode}</MonoText>
          <MonoText>ctx.currentSeason:{state.currentSeason}</MonoText>
          <MonoText>ctx.status: {state.status}</MonoText>
          <MonoText>
            progressUpdated: {progressUpdated ? "true" : "false"}
          </MonoText>
          <MonoText>
            sync: {storage.player.syncProgress ? "true" : "false"}
          </MonoText>
        </div>
      )}

      <div
        style={{
          ...webStyles.overlay,
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? "auto" : "none",
        }}
      >
        {/* Top bar */}
        <div style={webStyles.topBar}>
          <button style={webStyles.iconBtn} onClick={() => router.back()}>
            <ArrowLeft color="#fff" size={22} />
          </button>
          <span style={webStyles.titleText}>
            {title} |{" "}
            {parseInsidePlayerTitle(
              state.seasonCovers?.[state.currentEpisode - 1],
              state.currentEpisode,
            )}
          </span>
        </div>

        {/* Center click area — play/pause */}
        <div style={webStyles.centerArea} onClick={togglePlay} />

        {/* Bottom controls */}
        <div style={webStyles.bottomBar}>
          {/* Seek bar */}
          <div
            ref={seekBarRef}
            style={webStyles.seekBarTrack}
            onMouseDown={handleSeekMouseDown}
          >
            <div
              style={{
                ...webStyles.seekBarBuffered,
                width: `${bufferedPercent}%`,
              }}
            />
            <div
              style={{ ...webStyles.seekBarProgress, width: `${progress}%` }}
            />
            <div style={{ ...webStyles.seekBarThumb, left: `${progress}%` }} />
          </div>

          {/* Controls row */}
          <div style={webStyles.controlsRow}>
            <div style={webStyles.controlsLeft}>
              <button style={webStyles.iconBtn} onClick={() => seek(-10)}>
                <RotateCcw color="#fff" size={20} />
              </button>
              <button style={webStyles.iconBtn} onClick={togglePlay}>
                {playing ? (
                  <Pause color="#fff" size={24} fill="#fff" />
                ) : (
                  <Play color="#fff" size={24} fill="#fff" />
                )}
              </button>
              <button style={webStyles.iconBtn} onClick={() => seek(10)}>
                <RotateCw color="#fff" size={20} />
              </button>
              <button style={webStyles.iconBtn} onClick={toggleMute}>
                {muted || volume === 0 ? (
                  <VolumeOff color="#fff" size={20} />
                ) : (
                  <Volume2 color="#fff" size={20} />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                style={webStyles.volumeSlider}
              />
            </div>

            <div style={webStyles.controlsRight}>
              <span style={webStyles.timeText}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <button style={webStyles.iconBtn} onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize color="#fff" size={20} />
                ) : (
                  <Maximize color="#fff" size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Stili web inline ────────────────────────────────────────────────────────

const webStyles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    width: "100%",
    height: "100vh",
    backgroundColor: "#000",
    overflow: "hidden",
    userSelect: "none",
    outline: "none", // nasconde il focus ring del browser
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 70%, rgba(0,0,0,0.75) 100%)",
    transition: "opacity 0.3s ease",
    cursor: "default",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "20px 24px 0",
  },
  titleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 500,
    letterSpacing: 0.2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  centerArea: {
    flex: 1,
    cursor: "pointer",
  },
  bottomBar: {
    padding: "0 24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  seekBarTrack: {
    position: "relative",
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    cursor: "pointer",
    marginBottom: 4,
  },
  seekBarBuffered: {
    position: "absolute",
    height: "100%",
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
    pointerEvents: "none",
  },
  seekBarProgress: {
    position: "absolute",
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#fff",
    pointerEvents: "none",
  },
  seekBarThumb: {
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: 14,
    height: 14,
    borderRadius: "50%",
    backgroundColor: "#fff",
    pointerEvents: "none",
    boxShadow: "0 0 4px rgba(0,0,0,0.4)",
  },
  controlsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  controlsLeft: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  controlsRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    background: "none",
    border: "none",
    padding: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    transition: "background 0.15s",
    color: "#fff",
  },
  volumeSlider: {
    width: 80,
    accentColor: "#fff",
    cursor: "pointer",
    marginLeft: 4,
  },
  timeText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: 0.3,
  },
};
