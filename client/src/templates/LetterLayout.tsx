import { motion } from "framer-motion";
import { ReactNode } from "react";
import { resolveBackendMediaUrl } from "../lib/api";
import { getPublishedTheme, type PublishedThemeId } from "./publishedSiteThemes";

function letterThemeSafe(themeId: string | undefined): PublishedThemeId {
  const id = (themeId || "romantic") as PublishedThemeId;
  if (id === "royal") return "romantic";
  return id;
}

export type LetterLayoutProps = {
  themeId?: string;
  title?: string;
  letterContent: string;
  image?: string;
  relationship?: string;
  letterType?: string;
  recipientName?: string;
  footer?: ReactNode;
  actions?: ReactNode;
};

export default function LetterLayout({
  themeId,
  title,
  letterContent,
  image,
  relationship,
  letterType,
  recipientName,
  footer,
  actions,
}: LetterLayoutProps) {
  const t = getPublishedTheme(letterThemeSafe(themeId));
  const displayTitle =
    title?.trim() ||
    (letterType ? letterType : recipientName ? `For ${recipientName}` : "A letter from the heart");

  return (
    <div className={`${t.pageClass} relative overflow-hidden`}>
      <motion.div
        className={t.blobAClass}
        aria-hidden
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={t.blobBClass}
        aria-hidden
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-5 pb-24 pt-16 sm:px-8 sm:pt-20 md:pt-24">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h1 className={`${t.titleClass} max-w-xl mx-auto`}>{displayTitle}</h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-sm font-medium tracking-wide text-[#FF6B9D]/90"
          >
            A letter for you ❤️
          </motion.p>
          {(relationship || letterType) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mt-2 text-xs text-[#1A1A1A]/45"
            >
              {[relationship, letterType].filter(Boolean).join(" · ")}
            </motion.p>
          )}
        </motion.header>

        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 rounded-3xl border border-[#FFD6E7]/90 bg-gradient-to-br from-[#FFF7FA] via-[#FFF7FA] to-[#FFE4EC]/95 p-8 shadow-[0_20px_56px_-20px_rgba(255,107,157,0.22)] md:p-10"
        >
          <div
            className="whitespace-pre-wrap font-sans text-[1.05rem] leading-[1.8] text-[#1A1A1A]/85 md:text-[1.08rem]"
            style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}
          >
            {letterContent}
          </div>
        </motion.article>

        {image ? (
          <motion.figure
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-12 w-full max-w-xl"
          >
            <div className="overflow-hidden rounded-2xl shadow-[0_24px_48px_-16px_rgba(255,107,157,0.25)] ring-1 ring-[#FFD6E7]/70">
              <img
                src={resolveBackendMediaUrl(image) ?? image}
                alt=""
                className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
              />
            </div>
          </motion.figure>
        ) : null}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="mt-14 text-center text-sm font-medium text-[#1A1A1A]/50"
        >
          Made just for you ❤️
        </motion.p>

        {actions ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="mx-auto mt-10 flex max-w-lg flex-col items-stretch gap-3 sm:items-center"
          >
            {actions}
          </motion.div>
        ) : null}

        {footer ? <div className="mt-10 text-center text-xs text-[#1A1A1A]/40">{footer}</div> : null}
      </div>
    </div>
  );
}

