import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { getValidAuthToken } from "@/lib/queryClient";

type CountdownLockProps = {
  websiteId: string;
  unlockAt: string;
  recipientName?: string;
  /** Fires when the scheduled time is reached (natural unlock). */
  onUnlocked: () => void;
  /** Fires after the creator uses “Open now” successfully. */
  onEarlyOpened?: () => void;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getParts(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return { d, h, m, s: sec };
}

export default function CountdownLock({
  websiteId,
  unlockAt,
  recipientName,
  onUnlocked,
  onEarlyOpened,
}: CountdownLockProps) {
  const target = new Date(unlockAt).getTime();
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      const next = Math.max(0, target - Date.now());
      setRemaining(next);
      if (next <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        window.clearInterval(t);
        onUnlocked();
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [target, onUnlocked]);

  const { d, h, m, s } = getParts(remaining);

  const handleOpenNow = async () => {
    const token = getValidAuthToken();
    if (!token) {
      setOpenError("Sign in as the creator to open early.");
      return;
    }
    setOpening(true);
    setOpenError(null);
    try {
      const res = await fetch(`/api/websites/${websiteId}/unlock-now`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403) {
          setOpenError("Only the creator can unlock this surprise early.");
        } else {
          setOpenError("Could not unlock. Try again.");
        }
        return;
      }
      onEarlyOpened?.();
    } catch {
      setOpenError("Network error. Try again.");
    } finally {
      setOpening(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(255,214,231,0.55),transparent_60%)]" />
      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FFD6E7] bg-white/90 shadow-sm">
          <Lock className="h-6 w-6 text-[#FF6B9D]" aria-hidden />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF6B9D]/90">
          Scheduled surprise
        </p>
        <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-[#1A1A1A] sm:text-4xl">
          Your surprise unlocks in…
        </h1>
        {recipientName ? (
          <p className="mt-3 text-sm text-[#1A1A1A]/60">Made with love for {recipientName}</p>
        ) : null}

        <div className="mt-10 grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Days", v: d },
            { label: "Hrs", v: h },
            { label: "Min", v: m },
            { label: "Sec", v: s },
          ].map((unit) => (
            <div
              key={unit.label}
              className="rounded-2xl border border-[#FFD6E7]/90 bg-white/90 py-4 shadow-[0_8px_32px_-12px_rgba(255,107,157,0.15)] backdrop-blur-sm"
            >
              <div className="font-serif text-2xl font-semibold tabular-nums text-[#1A1A1A] sm:text-3xl">
                {pad(unit.v)}
              </div>
              <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#1A1A1A]/45">
                {unit.label}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm leading-relaxed text-[#1A1A1A]/55">
          When the countdown ends, your full surprise will appear automatically.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleOpenNow}
            disabled={opening}
            className="inline-flex items-center gap-2 rounded-full border border-[#FFD6E7] bg-white/90 px-6 py-2.5 text-sm font-medium text-[#1A1A1A]/80 shadow-sm transition-colors hover:bg-[#FFF7FA] disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4 text-[#FF6B9D]" />
            {opening ? "Opening…" : "Open now (creator)"}
          </button>
          {openError ? <p className="max-w-sm text-xs text-red-600/90">{openError}</p> : null}
        </div>
      </div>
    </motion.div>
  );
}
