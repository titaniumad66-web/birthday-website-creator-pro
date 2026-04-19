/**
 * Predefined visual themes for published birthday surprise pages.
 * Each theme is a complete, polished token set — no random combinations.
 */
export type PublishedMemoryItem = {
  image?: string;
  caption?: string;
  date?: string;
  /** Adaptive label from relationship-based templates */
  templateTitle?: string;
  /** User-editable chapter title; when empty, UI falls back to templateTitle */
  title?: string;
  /** When true (and an image exists), this memory is the hero image on the published layout */
  isFeatured?: boolean;
  /** Optional longer note (separate from caption for legacy) */
  body?: string;
};

/** Display heading: custom title, else template suggestion, else caption. */
export function memoryChapterHeading(m: PublishedMemoryItem): string {
  const custom = m.title?.trim();
  if (custom) return custom;
  return m.templateTitle?.trim() || m.caption?.trim() || "Memory";
}

export type PublishedThemeId =
  | "romantic"
  | "emotional"
  | "pastel"
  | "minimal"
  | "royal"
  | "funny";

export type PublishedThemeTokens = {
  /** Full-page background */
  pageClass: string;
  /** Small pill above title */
  badgeClass: string;
  /** Main H1 */
  titleClass: string;
  /** Subtitle under title */
  subtitleClass: string;
  /** Message card container */
  messageCardClass: string;
  /** “A message for…” heading inside card */
  messageHeadingClass: string;
  /** Body text in message card */
  messageBodyClass: string;
  /** Theme / music chips */
  metaChipClass: string;
  /** Celebrate Now — gradient + glow */
  primaryCtaClass: string;
  /** Right column: subtle panel behind actions */
  actionsPanelClass: string;
  /** Secondary / outline buttons in actions slot (wrapper hint) */
  actionAreaClass: string;
  /** Memory section title */
  galleryTitleClass: string;
  /** Memory section subtitle */
  gallerySubClass: string;
  /** Memory grid card */
  memoryCardClass: string;
  /** Decorative blob A */
  blobAClass: string;
  /** Decorative blob B */
  blobBClass: string;
};

export const PUBLISHED_THEMES: Record<PublishedThemeId, PublishedThemeTokens> = {
  romantic: {
    pageClass:
      "min-h-screen bg-gradient-to-b from-[#FFF7FA] via-[#FFE4EC]/80 to-[#FFF7FA] text-[#1A1A1A]",
    badgeClass:
      "inline-flex items-center rounded-full border border-[#FFD6E7] bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FF6B9D]",
    titleClass:
      "mt-6 font-serif text-[clamp(2.25rem,6vw,3.75rem)] font-semibold leading-[1.08] tracking-tight text-[#1A1A1A]",
    subtitleClass: "mt-5 text-lg leading-relaxed text-[#FF6B9D]/85 md:text-xl",
    messageCardClass:
      "rounded-3xl border border-[#FFD6E7]/90 bg-[#FFF7FA] p-8 shadow-[0_12px_48px_-12px_rgba(255,107,157,0.12)] md:p-10",
    messageHeadingClass: "font-serif text-xl font-semibold text-[#1A1A1A] md:text-2xl",
    messageBodyClass:
      "mt-5 whitespace-pre-wrap text-base leading-[1.75] text-[#1A1A1A]/80 md:text-[1.05rem]",
    metaChipClass:
      "rounded-full border border-[#FFD6E7] bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1A1A1A]/70",
    primaryCtaClass:
      "w-full rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#ff8fb3] px-8 py-4 text-center text-base font-semibold text-white shadow-[0_8px_32px_-4px_rgba(255,107,157,0.45)] transition-transform hover:scale-[1.02] active:scale-[0.99]",
    actionsPanelClass:
      "flex flex-col gap-5 rounded-3xl border border-[#FFD6E7]/60 bg-white/60 p-6 shadow-sm backdrop-blur-sm",
    actionAreaClass: "space-y-3 [&_button]:rounded-full [&_button]:min-h-[44px] [&_a]:rounded-full",
    galleryTitleClass: "font-serif text-3xl font-semibold text-[#1A1A1A] md:text-4xl",
    gallerySubClass: "mt-2 text-sm text-[#1A1A1A]/55 md:text-base",
    memoryCardClass:
      "overflow-hidden rounded-3xl border border-[#FFD6E7]/80 bg-white p-4 shadow-[0_12px_40px_-16px_rgba(255,107,157,0.1)]",
    blobAClass:
      "absolute -top-8 left-6 h-40 w-40 rounded-full bg-[#FFD6E7]/50 blur-3xl",
    blobBClass:
      "absolute bottom-0 right-8 h-44 w-44 rounded-full bg-[#FF6B9D]/10 blur-3xl",
  },
  emotional: {
    pageClass:
      "min-h-screen bg-gradient-to-br from-[#FFF7FA] via-[#FFE8F0] to-[#FFF7FA] text-[#1A1A1A]",
    badgeClass:
      "inline-flex items-center rounded-full border border-[#FFD6E7] bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c45a7a]",
    titleClass:
      "mt-6 font-serif text-[clamp(2.25rem,6vw,3.75rem)] font-medium leading-[1.08] text-[#1A1A1A]",
    subtitleClass: "mt-5 text-lg leading-relaxed text-[#b85c7a]/90 md:text-xl",
    messageCardClass:
      "rounded-3xl border border-[#FFD6E7]/90 bg-[#FFE4EC]/40 p-8 shadow-[0_12px_40px_-12px_rgba(200,100,130,0.12)] backdrop-blur-sm md:p-10",
    messageHeadingClass: "font-serif text-xl font-semibold text-[#1A1A1A] md:text-2xl",
    messageBodyClass:
      "mt-5 whitespace-pre-wrap text-base leading-[1.75] text-[#1A1A1A]/80 md:text-[1.05rem]",
    metaChipClass:
      "rounded-full border border-[#FFD6E7] bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1A1A1A]/65",
    primaryCtaClass:
      "w-full rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#e85a8a] px-8 py-4 text-center text-base font-semibold text-white shadow-[0_8px_28px_-4px_rgba(255,107,157,0.4)] transition-transform hover:scale-[1.02]",
    actionsPanelClass:
      "flex flex-col gap-5 rounded-3xl border border-[#FFD6E7]/70 bg-white/70 p-6 shadow-sm backdrop-blur-sm",
    actionAreaClass: "space-y-3 [&_button]:rounded-full [&_a]:rounded-full",
    galleryTitleClass: "font-serif text-3xl font-medium text-[#1A1A1A] md:text-4xl",
    gallerySubClass: "mt-2 text-sm text-[#1A1A1A]/55",
    memoryCardClass:
      "overflow-hidden rounded-3xl border border-[#FFD6E7]/80 bg-white/95 p-4 shadow-md",
    blobAClass: "absolute left-8 top-24 h-36 w-36 rounded-full bg-[#FFD6E7]/40 blur-3xl",
    blobBClass: "absolute right-10 top-40 h-32 w-32 rounded-full bg-[#FF6B9D]/8 blur-3xl",
  },
  pastel: {
    pageClass:
      "min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#FFF7FA] to-[#fdf4ff] text-[#1A1A1A]",
    badgeClass:
      "inline-flex items-center rounded-full border border-[#e9d5ff] bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9333ea]/80",
    titleClass:
      "mt-6 font-serif text-[clamp(2.25rem,6vw,3.75rem)] font-semibold leading-[1.08] text-[#1A1A1A]",
    subtitleClass: "mt-5 text-lg leading-relaxed text-[#FF6B9D]/80 md:text-xl",
    messageCardClass:
      "rounded-3xl border border-white/80 bg-white/90 p-8 shadow-[0_16px_48px_-12px_rgba(147,51,234,0.08)] md:p-10",
    messageHeadingClass: "font-serif text-xl font-semibold text-[#1A1A1A] md:text-2xl",
    messageBodyClass:
      "mt-5 whitespace-pre-wrap text-base leading-[1.75] text-[#1A1A1A]/78 md:text-[1.05rem]",
    metaChipClass:
      "rounded-full border border-[#ede9fe] bg-[#faf5ff]/90 px-3 py-1.5 text-xs font-medium text-[#1A1A1A]/65",
    primaryCtaClass:
      "w-full rounded-full bg-gradient-to-r from-[#c084fc] to-[#FF6B9D] px-8 py-4 text-center text-base font-semibold text-white shadow-[0_8px_32px_-4px_rgba(192,132,252,0.35)] transition-transform hover:scale-[1.02]",
    actionsPanelClass:
      "flex flex-col gap-5 rounded-3xl border border-[#ede9fe] bg-white/75 p-6 shadow-sm backdrop-blur-sm",
    actionAreaClass: "space-y-3 [&_button]:rounded-full [&_a]:rounded-full",
    galleryTitleClass: "font-serif text-3xl font-semibold text-[#1A1A1A] md:text-4xl",
    gallerySubClass: "mt-2 text-sm text-[#1A1A1A]/55",
    memoryCardClass:
      "overflow-hidden rounded-3xl border border-[#f3e8ff] bg-white/95 p-4 shadow-md",
    blobAClass: "absolute left-10 top-16 h-36 w-36 rounded-full bg-sky-100/60 blur-3xl",
    blobBClass: "absolute right-8 bottom-32 h-40 w-40 rounded-full bg-fuchsia-100/50 blur-3xl",
  },
  minimal: {
    pageClass: "min-h-screen bg-gradient-to-b from-[#FFF7FA] to-[#FFFBFC] text-[#1A1A1A]",
    badgeClass:
      "inline-flex items-center rounded-full border border-[#e8e8e8] bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1A1A1A]/45",
    titleClass:
      "mt-6 font-serif text-[clamp(2.25rem,6vw,3.5rem)] font-semibold leading-[1.08] tracking-tight text-[#1A1A1A]",
    subtitleClass: "mt-5 text-lg leading-relaxed text-[#FF6B9D]/70 md:text-xl",
    messageCardClass:
      "rounded-3xl border border-[#FFD6E7]/60 bg-[#FFF7FA] p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.04)] md:p-10",
    messageHeadingClass: "text-xl font-semibold text-[#1A1A1A] md:text-2xl",
    messageBodyClass:
      "mt-5 whitespace-pre-wrap text-base leading-[1.75] text-[#1A1A1A]/75 md:text-[1.05rem]",
    metaChipClass:
      "rounded-full border border-[#eee] bg-white px-3 py-1.5 text-xs font-medium text-[#1A1A1A]/55",
    primaryCtaClass:
      "w-full rounded-full border-2 border-[#FF6B9D] bg-[#FF6B9D] px-8 py-4 text-center text-base font-semibold text-white shadow-[0_6px_24px_-4px_rgba(255,107,157,0.35)] transition-all hover:bg-[#e85a8a] hover:border-[#e85a8a]",
    actionsPanelClass:
      "flex flex-col gap-5 rounded-3xl border border-[#f0f0f0] bg-white/90 p-6 shadow-sm",
    actionAreaClass: "space-y-3 [&_button]:rounded-full [&_a]:rounded-full",
    galleryTitleClass: "text-3xl font-semibold text-[#1A1A1A] md:text-4xl",
    gallerySubClass: "mt-2 text-sm text-[#1A1A1A]/50",
    memoryCardClass:
      "overflow-hidden rounded-2xl border border-[#eee] bg-white p-4 shadow-sm",
    blobAClass: "absolute left-1/4 top-20 h-32 w-32 -translate-x-1/2 rounded-full bg-[#FFD6E7]/30 blur-3xl",
    blobBClass: "absolute right-1/4 top-40 h-28 w-28 rounded-full bg-[#FFE4EC]/50 blur-3xl",
  },
  royal: {
    pageClass:
      "min-h-screen bg-gradient-to-b from-[#FFF9F0] via-[#FFEFD5] to-[#FFF7FA] text-[#3d2b1f]",
    badgeClass:
      "inline-flex items-center rounded-full border border-[#e8c48b]/60 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8b6914]",
    titleClass:
      "mt-6 font-serif text-[clamp(2.25rem,6vw,3.75rem)] font-semibold leading-[1.08] text-[#3d2b1f]",
    subtitleClass: "mt-5 text-lg leading-relaxed text-[#8b6914]/85 md:text-xl",
    messageCardClass:
      "rounded-3xl border border-[#e8c48b]/50 bg-white/85 p-8 shadow-[0_16px_48px_-12px_rgba(184,134,11,0.15)] md:p-10",
    messageHeadingClass: "font-serif text-xl font-semibold text-[#3d2b1f] md:text-2xl",
    messageBodyClass:
      "mt-5 whitespace-pre-wrap text-base leading-[1.75] text-[#3d2b1f]/85 md:text-[1.05rem]",
    metaChipClass:
      "rounded-full border border-[#e8c48b]/50 bg-[#FFFBF5] px-3 py-1.5 text-xs font-medium text-[#5c4a32]",
    primaryCtaClass:
      "w-full rounded-full bg-gradient-to-r from-[#d4a017] to-[#f59e0b] px-8 py-4 text-center text-base font-semibold text-white shadow-[0_8px_28px_-4px_rgba(212,160,23,0.4)] transition-transform hover:scale-[1.02]",
    actionsPanelClass:
      "flex flex-col gap-5 rounded-3xl border border-[#e8c48b]/40 bg-white/70 p-6 shadow-sm backdrop-blur-sm",
    actionAreaClass: "space-y-3 [&_button]:rounded-full [&_a]:rounded-full",
    galleryTitleClass: "font-serif text-3xl font-semibold text-[#3d2b1f] md:text-4xl",
    gallerySubClass: "mt-2 text-sm text-[#5c4a32]/80",
    memoryCardClass:
      "overflow-hidden rounded-3xl border border-[#e8c48b]/45 bg-white/90 p-4 shadow-md",
    blobAClass: "absolute right-12 top-20 h-40 w-40 rounded-full bg-amber-100/70 blur-3xl",
    blobBClass: "absolute left-8 bottom-24 h-36 w-36 rounded-full bg-orange-100/50 blur-3xl",
  },
  funny: {
    pageClass:
      "min-h-screen bg-gradient-to-br from-[#fffbeb] via-[#FFF7FA] to-[#ecfccb]/40 text-[#1A1A1A]",
    badgeClass:
      "inline-flex items-center rounded-full border border-[#bbf7d0] bg-white/95 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#15803d]",
    titleClass:
      "mt-6 font-serif text-[clamp(2.1rem,5.5vw,3.25rem)] font-bold leading-[1.08] text-[#1A1A1A]",
    subtitleClass: "mt-5 text-lg font-medium leading-relaxed text-[#FF6B9D]/85 md:text-xl",
    messageCardClass:
      "rounded-3xl border-2 border-dashed border-[#86efac] bg-white/95 p-8 shadow-[0_12px_36px_-8px_rgba(34,197,94,0.15)] md:p-10",
    messageHeadingClass: "text-xl font-bold text-[#1A1A1A] md:text-2xl",
    messageBodyClass:
      "mt-5 whitespace-pre-wrap text-base leading-[1.75] text-[#1A1A1A]/85 md:text-[1.05rem]",
    metaChipClass:
      "rounded-full border border-[#d9f99d] bg-[#f7fee7] px-3 py-1.5 text-xs font-semibold text-[#3f6212]",
    primaryCtaClass:
      "w-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] px-8 py-4 text-center text-base font-bold text-white shadow-[0_8px_28px_-4px_rgba(34,197,94,0.35)] transition-transform hover:scale-[1.02] hover:-translate-y-0.5",
    actionsPanelClass:
      "flex flex-col gap-5 rounded-3xl border-2 border-[#bbf7d0] bg-white/80 p-6 shadow-md",
    actionAreaClass: "space-y-3 [&_button]:rounded-full [&_a]:rounded-full",
    galleryTitleClass: "text-3xl font-bold text-[#1A1A1A] md:text-4xl",
    gallerySubClass: "mt-2 text-sm font-medium text-[#15803d]/80",
    memoryCardClass:
      "overflow-hidden rounded-3xl border-2 border-[#bbf7d0] bg-white p-4 shadow-lg",
    blobAClass: "absolute left-6 top-24 h-32 w-32 rounded-full bg-yellow-100/80 blur-3xl",
    blobBClass: "absolute right-10 bottom-40 h-36 w-36 rounded-full bg-lime-100/60 blur-3xl",
  },
};

export function getPublishedTheme(themeId: string | undefined): PublishedThemeTokens {
  const id = (themeId || "romantic") as PublishedThemeId;
  return PUBLISHED_THEMES[id] ?? PUBLISHED_THEMES.romantic;
}
