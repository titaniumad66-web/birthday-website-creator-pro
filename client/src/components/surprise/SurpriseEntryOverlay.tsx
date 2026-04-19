import { motion } from "framer-motion";

type SurpriseEntryOverlayProps = {
  /** Overlay visible (stages 0–1). */
  show: boolean;
  /** Play exit motion (opacity + scale). */
  exiting: boolean;
  /** Data loaded; tap runs open handler. */
  readyToOpen: boolean;
  loadError: boolean;
  onTapOpen: () => void;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function SurpriseEntryOverlay({
  show,
  exiting,
  readyToOpen,
  loadError,
  onTapOpen,
}: SurpriseEntryOverlayProps) {
  if (!show) return null;

  return (
    <motion.div
      key="surprise-entry"
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      initial={false}
      animate={
        exiting
          ? { opacity: 0, scale: 0.94 }
          : { opacity: 1, scale: 1 }
      }
      transition={{ duration: 0.65, ease: easeOut }}
      style={{ pointerEvents: exiting ? "none" : "auto" }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#FFF7FA] via-[#FFE8F0] to-[#fce7f3]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_20%,rgba(255,214,231,0.65),transparent_55%)]"
        aria-hidden
      />
      <div
        className="absolute left-[12%] top-[18%] h-40 w-40 rounded-full bg-[#FFD6E7]/50 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute bottom-[12%] right-[10%] h-48 w-48 rounded-full bg-[#FF6B9D]/12 blur-3xl"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="relative w-full max-w-md text-center"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#FF6B9D]/85">
          Aura
        </p>
        <h1 className="mt-5 font-serif text-[1.65rem] font-medium leading-snug tracking-tight text-[#1A1A1A] sm:text-4xl">
          Someone made this for you ❤️
        </h1>

        {loadError ? (
          <p className="mt-5 text-sm leading-relaxed text-[#1A1A1A]/55">
            This link isn&apos;t available right now.
          </p>
        ) : null}

        <div className="mt-12 flex justify-center">
          <motion.button
            type="button"
            onClick={onTapOpen}
            disabled={!readyToOpen && !loadError}
            whileHover={{ scale: readyToOpen || loadError ? 1.02 : 1 }}
            whileTap={{ scale: readyToOpen || loadError ? 0.98 : 1 }}
            transition={{ duration: 0.25 }}
            className="min-h-[52px] w-full max-w-xs rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#ff8fb3] px-10 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_44px_-10px_rgba(255,107,157,0.42)] disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
          >
            {loadError
              ? "Continue"
              : readyToOpen
                ? "Tap to open"
                : "Almost ready…"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
