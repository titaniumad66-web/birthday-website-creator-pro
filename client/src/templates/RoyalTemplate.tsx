import { ReactNode, Ref } from "react";
import PublishedSurpriseLayout from "./PublishedSurpriseLayout";
import type { PublishedMemoryItem } from "./publishedSiteThemes";

type RoyalTemplateProps = {
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

function getRoyalTagline(relationship?: string, confessionMode?: boolean) {
  if (relationship === "Partner") {
    return confessionMode ? "A secret oath beneath golden light" : "An elegant tribute to my forever";
  }
  if (relationship === "Family") {
    return "A regal salute to the ones who raised me";
  }
  if (relationship === "Best Friend") {
    return "A royal roast for the court jester";
  }
  if (relationship === "Crush") {
    return confessionMode ? "A velvet confession, softly spoken" : "A royal wink from afar";
  }
  return "A gilded celebration for a shining soul";
}

export default function RoyalTemplate(props: RoyalTemplateProps) {
  const tagline = getRoyalTagline(props.relationship, props.confessionMode);
  return (
    <PublishedSurpriseLayout
      themeId="royal"
      badgeText="Royal Vibe"
      birthdayTitle={`Happy Birthday ${props.name || "Royal Star"}`}
      subtitle={tagline}
      messageCardTitle={`Dearest ${props.name || "you"}${props.relationship ? ` (${props.relationship})` : ""}`}
      message={props.message ?? ""}
      messageFallback="A regal message belongs here."
      memories={props.memories}
      themeLabel={props.themeLabel}
      musicLabel={props.musicLabel}
      actions={props.actions}
      qr={props.qr}
      memoryRef={props.memoryRef}
      onCelebrate={props.onCelebrate}
      galleryTitle="Royal Gallery"
      gallerySubtitle="Moments fit for the crown."
      emptyGalleryText="No memories added yet."
      sequentialReveal={props.sequentialReveal}
    />
  );
}
