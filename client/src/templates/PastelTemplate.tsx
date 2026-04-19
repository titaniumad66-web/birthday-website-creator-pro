import { ReactNode, Ref } from "react";
import PublishedSurpriseLayout from "./PublishedSurpriseLayout";
import type { PublishedMemoryItem } from "./publishedSiteThemes";

type PastelTemplateProps = {
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

function getPastelMessage(relationship?: string, confessionMode?: boolean) {
  if (relationship === "Partner") {
    return confessionMode ? "Pastel dreams and soft confessions." : "Sweet pastel skies for my love.";
  }
  if (relationship === "Best Friend") {
    return "Bubbly memories with my favorite person.";
  }
  if (relationship === "Family") {
    return "A soft hug wrapped in color.";
  }
  if (relationship === "Crush") {
    return confessionMode ? "A tiny pastel whisper from afar." : "A gentle surprise just for you.";
  }
  return "Dreamy gradients and gentle wishes.";
}

export default function PastelTemplate(props: PastelTemplateProps) {
  const line = getPastelMessage(props.relationship, props.confessionMode);
  return (
    <PublishedSurpriseLayout
      themeId="pastel"
      badgeText="Soft Pastel Vibe"
      birthdayTitle={`Happy Birthday ${props.name || "Sweetheart"}`}
      subtitle={line}
      messageCardTitle={`A note for ${props.name || "you"}${props.relationship ? ` (${props.relationship})` : ""}`}
      message={props.message ?? ""}
      messageFallback="Soft words and gentle wishes belong here."
      memories={props.memories}
      themeLabel={props.themeLabel}
      musicLabel={props.musicLabel}
      actions={props.actions}
      qr={props.qr}
      memoryRef={props.memoryRef}
      onCelebrate={props.onCelebrate}
      galleryTitle="Dreamy Gallery"
      gallerySubtitle="Floating memories in pastel light."
      emptyGalleryText="No memories added yet."
      sequentialReveal={props.sequentialReveal}
    />
  );
}
