import { ReactNode, Ref } from "react";
import PublishedSurpriseLayout from "./PublishedSurpriseLayout";
import type { PublishedMemoryItem } from "./publishedSiteThemes";

type EmotionalTemplateProps = {
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

function getEmotionalLead(relationship?: string, confessionMode?: boolean) {
  if (relationship === "Family") {
    return "A warm thank-you for every gentle moment.";
  }
  if (relationship === "Best Friend") {
    return "Every laugh, every late-night story, all cherished.";
  }
  if (relationship === "Partner") {
    return confessionMode ? "A tender truth, spoken softly." : "A quiet love, spoken clearly.";
  }
  if (relationship === "Crush") {
    return confessionMode ? "A shy note that finally found its way." : "A kind thought, sent with a smile.";
  }
  return "A heartfelt celebration in soft focus.";
}

export default function EmotionalTemplate(props: EmotionalTemplateProps) {
  const lead = getEmotionalLead(props.relationship, props.confessionMode);
  return (
    <PublishedSurpriseLayout
      themeId="emotional"
      badgeText="Emotional Vibe"
      birthdayTitle={`Happy Birthday ${props.name || "Lovely Soul"}`}
      subtitle={lead}
      messageCardTitle={`Dear ${props.name || "you"}${props.relationship ? ` (${props.relationship})` : ""}`}
      message={props.message ?? ""}
      messageFallback="A gentle message belongs here."
      memories={props.memories}
      themeLabel={props.themeLabel}
      musicLabel={props.musicLabel}
      actions={props.actions}
      qr={props.qr}
      memoryRef={props.memoryRef}
      onCelebrate={props.onCelebrate}
      galleryTitle="Memory Journal"
      gallerySubtitle="Gentle scenes, softly unfolding."
      emptyGalleryText="No memories added yet."
      sequentialReveal={props.sequentialReveal}
    />
  );
}
