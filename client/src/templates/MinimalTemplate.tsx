import { ReactNode, Ref } from "react";
import PublishedSurpriseLayout from "./PublishedSurpriseLayout";
import type { PublishedMemoryItem } from "./publishedSiteThemes";

type MinimalTemplateProps = {
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

function getMinimalSubtitle(relationship?: string, confessionMode?: boolean) {
  if (relationship === "Partner") {
    return confessionMode ? "A simple confession, softly delivered." : "A clean, honest celebration.";
  }
  if (relationship === "Best Friend") {
    return "Minimal design, maximum friendship.";
  }
  if (relationship === "Family") {
    return "Warm notes, clean lines.";
  }
  if (relationship === "Crush") {
    return confessionMode ? "Quiet words, loud feelings." : "A small surprise with big meaning.";
  }
  return "A modern, quiet celebration.";
}

export default function MinimalTemplate(props: MinimalTemplateProps) {
  const subtitle = getMinimalSubtitle(props.relationship, props.confessionMode);
  return (
    <PublishedSurpriseLayout
      themeId="minimal"
      badgeText="Minimal Vibe"
      birthdayTitle={`Happy Birthday ${props.name || "Friend"}`}
      subtitle={subtitle}
      messageCardTitle={`Message for ${props.name || "you"}${props.relationship ? ` (${props.relationship})` : ""}`}
      message={props.message ?? ""}
      messageFallback="A clear message lands here."
      memories={props.memories}
      themeLabel={props.themeLabel}
      musicLabel={props.musicLabel}
      actions={props.actions}
      qr={props.qr}
      memoryRef={props.memoryRef}
      onCelebrate={props.onCelebrate}
      galleryTitle="Memory Cards"
      gallerySubtitle="Clean layouts, timeless moments."
      emptyGalleryText="No memories added yet."
      sequentialReveal={props.sequentialReveal}
    />
  );
}
