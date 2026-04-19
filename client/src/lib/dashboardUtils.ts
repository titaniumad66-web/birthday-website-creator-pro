export type CreationKind = "website" | "letter";

export function inferCreationKind(contentJson: string | null | undefined): CreationKind {
  if (!contentJson) return "website";
  try {
    const j = JSON.parse(contentJson) as { type?: string };
    if (j?.type === "letter") return "letter";
    return "website";
  } catch {
    return "website";
  }
}

export function relationshipFromContent(contentJson: string | null | undefined): string | undefined {
  if (!contentJson) return undefined;
  try {
    const j = JSON.parse(contentJson) as { relationship?: string };
    return typeof j.relationship === "string" ? j.relationship : undefined;
  } catch {
    return undefined;
  }
}

export function previewImageFromContent(contentJson: string | null | undefined): string | undefined {
  if (!contentJson) return undefined;
  try {
    const j = JSON.parse(contentJson) as {
      type?: string;
      image?: string;
      memories?: Array<{ image?: string; isFeatured?: boolean }>;
    };
    if (j?.type === "letter" && j.image) return j.image;
    const mems = j.memories;
    if (!Array.isArray(mems)) return undefined;
    const featured = mems.find((m) => m?.isFeatured && m.image);
    const first = mems.find((m) => m?.image);
    return (featured?.image || first?.image) ?? undefined;
  } catch {
    return undefined;
  }
}

export function formatCreatedAt(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
