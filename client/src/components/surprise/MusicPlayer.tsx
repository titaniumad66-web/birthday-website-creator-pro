import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";

type MusicPlayerProps = {
  src: string | null;
  /** When true, user may start playback (e.g. after tap-to-open + not locked). */
  canInteract?: boolean;
  /**
   * Increment after a user gesture that reveals content (e.g. tap-to-open while unlocked,
   * or creator “open early”) to try starting playback once browsers allow it.
   */
  attemptAutoplayKey?: number;
};

export default function MusicPlayer({
  src,
  canInteract = false,
  attemptAutoplayKey = 0,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !src) return;
    el.volume = muted ? 0 : volume;
    el.loop = true;
    if (el.getAttribute("data-src") !== src) {
      el.src = src;
      el.setAttribute("data-src", src);
    }
  }, [src, volume, muted]);

  useEffect(() => {
    if (!canInteract || !src || attemptAutoplayKey < 1) return;
    const el = audioRef.current;
    if (!el) return;
    let cancelled = false;
    void el.play().then(() => {
      if (!cancelled) setPlaying(true);
    }).catch(() => {
      if (!cancelled) setPlaying(false);
    });
    return () => {
      cancelled = true;
    };
  }, [canInteract, src, attemptAutoplayKey]);

  const toggle = useCallback(async () => {
    const el = audioRef.current;
    if (!el || !src || !canInteract) return;
    try {
      if (playing) {
        el.pause();
        setPlaying(false);
      } else {
        await el.play();
        setPlaying(true);
      }
    } catch {
      setPlaying(false);
    }
  }, [canInteract, playing, src]);

  if (!src) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-[#FFD6E7]/90 bg-white/85 p-4 shadow-sm backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A1A1A]/45">
            Soundtrack
          </span>
          <button
            type="button"
            disabled
            className="inline-flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-gradient-to-r from-[#FF6B9D]/35 to-[#ff8fb3]/35 text-white/80 shadow-none"
            aria-label="No music available"
          >
            <Play className="ml-0.5 h-4 w-4" />
          </button>
          <p className="min-w-0 flex-1 text-[11px] leading-snug text-[#1A1A1A]/48">
            No music available
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-[#FFD6E7]/90 bg-white/85 p-4 shadow-sm backdrop-blur-sm"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A1A1A]/45">
          Soundtrack
        </span>
        <button
          type="button"
          onClick={toggle}
          disabled={!canInteract}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#ff8fb3] text-white shadow-md transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={playing ? "Pause music" : "Play music"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <div className="flex min-w-[140px] flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="text-[#1A1A1A]/50 transition-colors hover:text-[#1A1A1A]"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              setMuted(v === 0);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="h-1 flex-1 cursor-pointer accent-[#FF6B9D]"
          />
        </div>
      </div>
      {!canInteract ? (
        <p className="mt-2 text-[11px] text-[#1A1A1A]/45">Sound unlocks when your surprise opens.</p>
      ) : (
        <p className="mt-2 text-[11px] text-[#1A1A1A]/45">
          We&apos;ll try to start softly after you open — tap play anytime if needed.
        </p>
      )}
      <audio ref={audioRef} preload="metadata" className="hidden" />
    </motion.div>
  );
}
