import { motion } from "framer-motion";
import { ReactNode, Ref } from "react";
import MemoryTimeline from "../components/surprise/MemoryTimeline";
import { resolveBackendMediaUrl } from "../lib/api";
import {
  getPublishedTheme,
  memoryChapterHeading,
  type PublishedMemoryItem,
  type PublishedThemeId,
} from "./publishedSiteThemes";

export type PublishedSurpriseLayoutProps = {
  themeId: PublishedThemeId;
  badgeText: string;
  birthdayTitle: string;
  subtitle: string;
  messageCardTitle: string;
  message: string;
  messageFallback: string;
  memories?: PublishedMemoryItem[];
  themeLabel?: string;
  musicLabel?: string;
  actions?: ReactNode;
  qr?: ReactNode;
  memoryRef?: Ref<HTMLElement>;
  onCelebrate: () => void;
  galleryTitle: string;
  gallerySubtitle: string;
  emptyGalleryText: string;
  /** Stagger hero: title → message → featured image → CTAs (shared link “gift” open). */
  sequentialReveal?: boolean;
};

function memoryHasVisual(m: PublishedMemoryItem) {
  return Boolean(
    (m.image && m.image.length > 0) ||
      (m.body && m.body.trim().length > 0) ||
      (m.caption && m.caption.trim().length > 0) ||
      (m.templateTitle && m.templateTitle.length > 0) ||
      (m.title && m.title.trim().length > 0),
  );
}

/**
 * Shared layout for all published surprise themes:
 * [Badge] [Title] [Subtitle] → grid: [message card + featured image] | [CTA column]
 * Then memory timeline (emotional vertical flow; omits featured card from list).
 */
export default function PublishedSurpriseLayout({
  themeId,
  badgeText,
  birthdayTitle,
  subtitle,
  messageCardTitle,
  message,
  messageFallback,
  memories = [],
  themeLabel,
  musicLabel,
  actions,
  qr,
  memoryRef,
  onCelebrate,
  galleryTitle,
  gallerySubtitle,
  emptyGalleryText,
  sequentialReveal = false,
}: PublishedSurpriseLayoutProps) {
  const t = getPublishedTheme(themeId);
  const ease = [0.22, 1, 0.36, 1] as const;
  const featuredExplicit = memories.find(
    (m) => Boolean(m.isFeatured) && m.image && m.image.length > 0,
  );
  const firstWithImageIdx = memories.findIndex((m) => m.image && m.image.length > 0);
  const featuredIdx = featuredExplicit
    ? memories.indexOf(featuredExplicit)
    : firstWithImageIdx;
  const featured = featuredIdx >= 0 ? memories[featuredIdx] : null;
  const timelineMemories =
    featuredIdx >= 0 ? memories.filter((_, i) => i !== featuredIdx) : memories;
  const hasMemories = memories.length > 0;
  const hasTimelineContent = timelineMemories.some(memoryHasVisual);
  const body = message || messageFallback;
  const featuredLabel = featured
    ? memoryChapterHeading(featured)
    : "A cherished memory";

  return (
    <div className={t.pageClass}>
      <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pt-20 md:pt-24">
        <motion.div
          className={t.blobAClass}
          aria-hidden
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={t.blobBClass}
          aria-hidden
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.header
            initial={{ opacity: 0, y: sequentialReveal ? 14 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              sequentialReveal
                ? { duration: 0.58, delay: 0, ease }
                : { duration: 0.75, ease }
            }
            className="mx-auto max-w-3xl text-center md:max-w-4xl"
          >
            <div className={t.badgeClass}>{badgeText}</div>
            <h1 className={t.titleClass}>{birthdayTitle}</h1>
            <p className={t.subtitleClass}>{subtitle}</p>
          </motion.header>

          <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:mt-16 lg:grid-cols-[1fr_min(320px,1fr)] lg:items-start lg:gap-12 xl:max-w-6xl">
            {/* Main column: message card → featured memory image */}
            {sequentialReveal ? (
              <div className="flex flex-col">
                <motion.article
                  className={t.messageCardClass}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.2, ease }}
                >
                  <h2 className={t.messageHeadingClass}>{messageCardTitle}</h2>
                  <p className={t.messageBodyClass}>{body}</p>
                  {(themeLabel || musicLabel) && (
                    <div className="mt-8 flex flex-wrap gap-2">
                      {themeLabel && <span className={t.metaChipClass}>Vibe: {themeLabel}</span>}
                      {musicLabel && <span className={t.metaChipClass}>Soundtrack: {musicLabel}</span>}
                    </div>
                  )}
                </motion.article>

                {featured && featured.image && (
                  <motion.figure
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.38, ease }}
                    className="mx-auto mt-8 w-full max-w-[min(100%,560px)] sm:mt-10"
                  >
                    <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(255,107,157,0.18)] ring-1 ring-[#FFD6E7]/60 transition-[transform,box-shadow] duration-300 motion-safe:hover:scale-[1.01] motion-safe:hover:shadow-[0_24px_56px_-14px_rgba(255,107,157,0.22)]">
                      <img
                        src={resolveBackendMediaUrl(featured.image) ?? featured.image}
                        alt={featuredLabel}
                        className="aspect-[4/3] w-full object-cover sm:aspect-[3/2]"
                        decoding="async"
                        loading="eager"
                        fetchPriority="high"
                      />
                    </div>
                    {(featuredLabel || featured.date || featured.body) && (
                      <figcaption className="mt-4 space-y-1 text-center text-sm text-[#1A1A1A]/55">
                        <span className="font-medium text-[#1A1A1A]/75">{featuredLabel}</span>
                        {featured.date && (
                          <div className="text-xs text-[#1A1A1A]/50">{featured.date}</div>
                        )}
                        {featured.body ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#1A1A1A]/65">
                            {featured.body}
                          </p>
                        ) : null}
                      </figcaption>
                    )}
                  </motion.figure>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease }}
                className="flex flex-col"
              >
                <article className={t.messageCardClass}>
                  <h2 className={t.messageHeadingClass}>{messageCardTitle}</h2>
                  <p className={t.messageBodyClass}>{body}</p>
                  {(themeLabel || musicLabel) && (
                    <div className="mt-8 flex flex-wrap gap-2">
                      {themeLabel && <span className={t.metaChipClass}>Vibe: {themeLabel}</span>}
                      {musicLabel && <span className={t.metaChipClass}>Soundtrack: {musicLabel}</span>}
                    </div>
                  )}
                </article>

                {featured && featured.image && (
                  <motion.figure
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.15, ease }}
                    className="mx-auto mt-8 w-full max-w-[min(100%,560px)] sm:mt-10"
                  >
                    <div className="overflow-hidden rounded-2xl shadow-[0_20px_50px_-12px_rgba(255,107,157,0.18)] ring-1 ring-[#FFD6E7]/60 transition-[transform,box-shadow] duration-300 motion-safe:hover:scale-[1.01] motion-safe:hover:shadow-[0_24px_56px_-14px_rgba(255,107,157,0.22)]">
                      <img
                        src={resolveBackendMediaUrl(featured.image) ?? featured.image}
                        alt={featuredLabel}
                        className="aspect-[4/3] w-full object-cover sm:aspect-[3/2]"
                        decoding="async"
                        loading="eager"
                        fetchPriority="high"
                      />
                    </div>
                    {(featuredLabel || featured.date || featured.body) && (
                      <figcaption className="mt-4 space-y-1 text-center text-sm text-[#1A1A1A]/55">
                        <span className="font-medium text-[#1A1A1A]/75">{featuredLabel}</span>
                        {featured.date && (
                          <div className="text-xs text-[#1A1A1A]/50">{featured.date}</div>
                        )}
                        {featured.body ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#1A1A1A]/65">
                            {featured.body}
                          </p>
                        ) : null}
                      </figcaption>
                    )}
                  </motion.figure>
                )}
              </motion.div>
            )}

            {/* CTA column */}
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                sequentialReveal
                  ? { duration: 0.58, delay: 0.52, ease }
                  : { duration: 0.7, delay: 0.12, ease }
              }
              className={t.actionsPanelClass}
            >
              <button type="button" onClick={onCelebrate} className={t.primaryCtaClass}>
                Celebrate Now
              </button>
              {actions && <div className={t.actionAreaClass}>{actions}</div>}
              {qr && <div className="pt-1">{qr}</div>}
            </motion.aside>
          </div>
        </div>
      </section>

      <section ref={memoryRef} className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 text-center"
          >
            <h2 className={t.galleryTitleClass}>{galleryTitle}</h2>
            <p className={t.gallerySubClass}>{gallerySubtitle}</p>
          </motion.div>
          {hasMemories && hasTimelineContent ? (
            <MemoryTimeline
              memories={timelineMemories}
              titleClass="font-serif text-lg font-semibold text-[#1A1A1A] md:text-xl"
              subtitleClass="text-xs font-medium uppercase tracking-wider text-[#1A1A1A]/45"
              cardClass={t.memoryCardClass}
            />
          ) : hasMemories && featured && !hasTimelineContent ? (
            <p className="rounded-2xl border border-[#FFD6E7]/60 bg-white/60 py-10 text-center text-sm text-[#1A1A1A]/55">
              Your moments live in the keepsake above — every detail was placed with care.
            </p>
          ) : hasMemories ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {memories.map((memory, index) => (
                <motion.div
                  key={`${memory.image || memory.caption || index}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={`${t.memoryCardClass} transition-shadow duration-300 hover:shadow-[0_16px_40px_-12px_rgba(255,107,157,0.16)]`}
                >
                  {memory.image ? (
                    <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[#FFF7FA]">
                      <img
                        src={resolveBackendMediaUrl(memory.image) ?? memory.image}
                        alt={memory.caption || "Memory"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#FFD6E7]/60 bg-[#FFF7FA]/90 px-4 py-10 text-center text-sm text-[#1A1A1A]/55">
                      {memoryChapterHeading(memory)}
                    </div>
                  )}
                  <div className="mt-4 space-y-1 px-1">
                    <div className="font-medium text-[#1A1A1A]/90">
                      {memoryChapterHeading(memory)}
                    </div>
                    {memory.date && <div className="text-xs text-[#1A1A1A]/50">{memory.date}</div>}
                    {memory.body ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#1A1A1A]/70">
                        {memory.body}
                      </p>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#FFD6E7]/80 bg-white/80 py-14 text-center text-sm text-[#1A1A1A]/55">
              {emptyGalleryText}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

