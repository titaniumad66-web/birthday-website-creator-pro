import { motion, useReducedMotion } from "framer-motion";

/** Soft pastel mesh — large blurred blobs, very low contrast */
export default function LandingAmbient() {
  const reduce = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#FFF7FA]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF7FA] via-[#FFE4EC]/80 to-[#FFF7FA]" />
      <div className="aura-radial-soft absolute inset-0 opacity-90" />

      {!reduce && (
        <>
          <motion.div
            className="absolute -left-[18%] top-[-8%] h-[58vmin] w-[58vmin] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,107,157,0.12),transparent_68%)] blur-3xl"
            animate={{ x: [0, 28, 0], y: [0, 22, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-[12%] bottom-[0%] h-[52vmin] w-[52vmin] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,214,231,0.65),transparent_70%)] blur-3xl"
            animate={{ x: [0, -24, 0], y: [0, -18, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          />
          <motion.div
            className="absolute left-[25%] bottom-[-12%] h-[42vmin] w-[42vmin] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,182,210,0.2),transparent_72%)] blur-3xl"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
    </div>
  );
}
