import { ReactNode, Ref } from "react";
import PublishedSurpriseLayout from "./PublishedSurpriseLayout";
import type { PublishedMemoryItem } from "./publishedSiteThemes";

type FunnyTemplateProps = {
  name?: string;
  relationship?: string;
  confessionMode?: boolean;
  message?: string;
  memories?: PublishedMemoryItem[];
  themeLabel?: string;
  musicLabel?: string;
  actions?: ReactNode;
  qr?: ReactNode;
  memoryRef?: Ref<HTMLElement>;
  onCelebrate: () => void;
  sequentialReveal?: boolean;
};

function getFunnyHeadline(relationship?: string, confessionMode?: boolean) {
  if (relationship === "Best Friend") {
    return "The ultimate chaos duo celebration";
  }
  if (relationship === "Family") {
    return "Family fun, maximum sparkle levels";
  }
  if (relationship === "Partner") {
    return confessionMode ? "Plot twist: I adore you" : "Birthday shenanigans for my favorite human";
  }
  if (relationship === "Crush") {
    return confessionMode ? "Emergency: confession alert" : "Birthday giggles incoming";
  }
  return "Giggles, glitter, and good vibes";
}

export default function FunnyTemplate(props: FunnyTemplateProps) {
  const headline = getFunnyHeadline(props.relationship, props.confessionMode);
  return (
    <PublishedSurpriseLayout
      themeId="funny"
      badgeText="Funny Mode"
      birthdayTitle={`Happy Birthday ${props.name || "Legend"}`}
      subtitle={headline}
      messageCardTitle={`Message for ${props.name || "you"}${props.relationship ? ` (${props.relationship})` : ""}`}
      message={props.message ?? ""}
      messageFallback="Insert epic birthday message here."
      memories={props.memories}
      themeLabel={props.themeLabel}
      musicLabel={props.musicLabel}
      actions={props.actions}
      qr={props.qr}
      memoryRef={props.memoryRef}
      onCelebrate={props.onCelebrate}
      galleryTitle="Memory Stickers"
      gallerySubtitle="Tap into the best bloopers."
      emptyGalleryText="No memories added yet."
      sequentialReveal={props.sequentialReveal}
    />
  );
}
