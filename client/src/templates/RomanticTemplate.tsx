import { ReactNode, Ref } from "react";
import PublishedSurpriseLayout from "./PublishedSurpriseLayout";
import type { PublishedMemoryItem } from "./publishedSiteThemes";

type RomanticTemplateProps = {
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

function getRomanticHeadline(relationship?: string, confessionMode?: boolean) {
  if (relationship === "Partner") {
    return confessionMode ? "A love note, softly revealed" : "To my favorite person";
  }
  if (relationship === "Best Friend") {
    return "Best friend energy, forever glowing";
  }
  if (relationship === "Family") {
    return "Home is in every memory with you";
  }
  if (relationship === "Crush") {
    return confessionMode ? "A shy little secret just for you" : "A sweet surprise for you";
  }
  return "A little romance, wrapped in memories";
}

export default function RomanticTemplate(props: RomanticTemplateProps) {
  const headline = getRomanticHeadline(props.relationship, props.confessionMode);
  return (
    <PublishedSurpriseLayout
      themeId="romantic"
      badgeText="Birthday Romance"
      birthdayTitle={`Happy Birthday ${props.name || "Birthday Star"}`}
      subtitle={headline}
      messageCardTitle={`A message for ${props.name || "you"}${props.relationship ? ` (${props.relationship})` : ""}`}
      message={props.message ?? ""}
      messageFallback="A beautiful message waits here."
      memories={props.memories}
      themeLabel={props.themeLabel}
      musicLabel={props.musicLabel}
      actions={props.actions}
      qr={props.qr}
      memoryRef={props.memoryRef}
      onCelebrate={props.onCelebrate}
      galleryTitle="Memory Bouquet"
      gallerySubtitle="Soft moments, floating like petals."
      emptyGalleryText="No memories added yet."
      sequentialReveal={props.sequentialReveal}
    />
  );
}
