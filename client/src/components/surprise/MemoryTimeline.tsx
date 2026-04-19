import { motion } from "framer-motion";
import {
  memoryChapterHeading,
  type PublishedMemoryItem,
} from "@/templates/publishedSiteThemes";

type MemoryTimelineProps = {
  memories: PublishedMemoryItem[];
  titleClass: string;
  subtitleClass: string;
  cardClass: string;
};

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="320" viewBox="0 0 400 320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFF7FA"/><stop offset="100%" stop-color="#FFE4EC"/></linearGradient></defs><rect width="400" height="320" fill="url(#g)"/><text x="200" y="165" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#FF6B9D" opacity="0.5">Memory</text></svg>`,
  );

export default function MemoryTimeline({
  memories,
  titleClass,
  subtitleClass,
  cardClass,
}: MemoryTimelineProps) {
  const visible = memories.filter(
    (m) =>
      (m.image && m.image.length > 0) ||
      (m.body && m.body.trim().length > 0) ||
      (m.caption && m.caption.trim().length > 0) ||
      (m.templateTitle && m.templateTitle.length > 0) ||
      (m.title && m.title.trim().length > 0),
  );

  if (visible.length === 0) return null;

  return (
    <div className="relative mx-auto max-w-3xl">
      <div
        className="absolute left-[11px] top-3 bottom-3 w-px bg-gradient-to-b from-[#FFD6E7] via-[#FF6B9D]/25 to-transparent sm:left-[15px]"
        aria-hidden
      />
      <ul className="space-y-10 sm:space-y-12">
        {visible.map((memory, index) => {
          const heading = memoryChapterHeading(memory);
          const img = memory.image && memory.image.length > 0 ? memory.image : null;
          const sub = memory.date;
          const bodyText =
            memory.body?.trim() ||
            (!memory.templateTitle && !memory.title?.trim() ? memory.caption : "") ||
            "";

          return (
            <motion.li
              key={`${heading}-${index}`}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="relative pl-10 sm:pl-14"
            >
              <span className="absolute left-0 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[#FFD6E7] bg-white shadow-sm sm:top-3 sm:h-7 sm:w-7">
                <span className="h-2 w-2 rounded-full bg-[#FF6B9D]/80" />
              </span>
              <div
                className={`${cardClass} overflow-hidden transition-shadow duration-300 hover:shadow-[0_14px_36px_-10px_rgba(255,107,157,0.14)]`}
              >
                {img ? (
                  <div className="overflow-hidden rounded-2xl ring-1 ring-[#FFD6E7]/50">
                    <img
                      src={img}
                      alt={heading}
                      className="aspect-[16/10] w-full object-cover sm:aspect-[5/3]"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl ring-1 ring-[#FFD6E7]/40">
                    <img
                      src={PLACEHOLDER}
                      alt=""
                      className="aspect-[16/10] w-full object-cover opacity-90 sm:aspect-[5/3]"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                <div className="mt-4 space-y-2 px-1">
                  <h3 className={titleClass}>{heading}</h3>
                  {sub ? <p className={subtitleClass}>{sub}</p> : null}
                  {bodyText ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#1A1A1A]/75">
                      {bodyText}
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
