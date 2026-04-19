export type RelationshipKey = "partner" | "bestFriend" | "family" | "crush";

export const RELATIONSHIP_LABEL_TO_KEY: Record<string, RelationshipKey> = {
  Partner: "partner",
  "Best Friend": "bestFriend",
  Family: "family",
  Crush: "crush",
};

export const memoryTemplates: Record<RelationshipKey, string[]> = {
  partner: [
    "First Meet",
    "Favorite Memory",
    "Special Moment",
    "Why I Love You",
  ],
  bestFriend: [
    "Craziest Memory",
    "Best Moment Together",
    "Inside Joke",
    "Why You're Important",
  ],
  family: [
    "Childhood Memory",
    "Favorite Moment",
    "What I Appreciate",
    "Gratitude Message",
  ],
  crush: [
    "When I Noticed You",
    "Favorite Moment",
    "What I Feel",
    "A Secret Message",
  ],
};

export type MusicTrackId = "soft_piano" | "romantic_melody" | "birthday_tune" | "none";

export const musicTrackOptions: {
  id: MusicTrackId;
  name: string;
  desc: string;
  /** Maps to `/music/{file}.mp3` when bundled on the server */
  file: string | null;
}[] = [
  {
    id: "soft_piano",
    name: "Soft Piano",
    desc: "Gentle keys, calm and cinematic",
    file: "piano",
  },
  {
    id: "romantic_melody",
    name: "Romantic Melody",
    desc: "Warm strings and soft intimacy",
    file: "acoustic",
  },
  {
    id: "birthday_tune",
    name: "Happy Birthday Tune",
    desc: "Light, celebratory sparkle",
    file: "upbeat",
  },
  { id: "none", name: "None", desc: "Voices and visuals only", file: null },
];

export function relationshipToKey(label: string | undefined): RelationshipKey {
  if (!label) return "partner";
  return RELATIONSHIP_LABEL_TO_KEY[label] ?? "partner";
}

export function resolveMusicSrcFromContent(data: {
  music?: string;
  musicBase64?: string;
  musicTrack?: MusicTrackId | string;
}): string | null {
  if (data.musicBase64 && typeof data.musicBase64 === "string") {
    return data.musicBase64;
  }
  if (data.music && typeof data.music === "string" && data.music.startsWith("data:")) {
    return data.music;
  }
  const track = (data.musicTrack || data.music) as string | undefined;
  if (!track || track === "none") return null;
  const opt = musicTrackOptions.find((o) => o.id === track);
  if (opt?.file) return `/music/${opt.file}.mp3`;
  if (track === "piano" || track === "lofi" || track === "acoustic" || track === "upbeat") {
    return `/music/${track}.mp3`;
  }
  return null;
}

export function musicLabelFromContent(data: {
  music?: string;
  musicBase64?: string;
  musicTrack?: string;
}): string | undefined {
  if (data.musicBase64 || (data.music && data.music.startsWith("data:"))) {
    return "Custom upload";
  }
  const id = data.musicTrack || data.music;
  if (!id || id === "none") return undefined;
  const opt = musicTrackOptions.find((o) => o.id === id);
  if (opt) return opt.name;
  const legacy: Record<string, string> = {
    piano: "Soft Piano Melody",
    lofi: "Lofi Chill Vibes",
    acoustic: "Acoustic Sunset",
    upbeat: "Upbeat Pop",
  };
  return legacy[id] ?? id;
}

export const letterTemplates: Record<RelationshipKey, string[]> = {
  partner: ["Love Letter", "Appreciation Letter"],
  bestFriend: ["Thank You Letter", "Funny Letter"],
  family: ["Gratitude Letter", "Emotional Letter"],
  crush: ["Confession Letter", "Secret Letter"],
};

const dearName = (name?: string) => (name?.trim() ? name.trim() : "you");

/** Soft starter copy — user replaces entirely in the editor. */
export function getLetterPlaceholder(
  relationshipLabel: string | undefined,
  letterType: string | undefined,
  recipientName?: string,
): string {
  const who = dearName(recipientName);
  const rel = relationshipToKey(relationshipLabel);
  const lt = letterType || "";

  if (rel === "family" && lt.includes("Gratitude")) {
    return `Dear ${who},\n\nThank you for everything — the quiet sacrifices, the laughter, the way you make home feel safe. I don't say it enough, but I carry your love with me every day.\n\nWith all my heart,`;
  }
  if (rel === "family") {
    return `Dear ${who},\n\nThere are feelings too big for ordinary days, so I'm writing them down for you here. You've shaped my world in more ways than I can count.\n\nAlways,`;
  }
  if (rel === "partner" && lt.includes("Love")) {
    return `My love,\n\nBefore the world rushes in again, I wanted a quiet place to tell you how deeply you're seen — not for what you do, but for who you are to me.\n\nForever yours,`;
  }
  if (rel === "partner") {
    return `Dear ${who},\n\nSome people walk through life like a gift — and you're one of them. Thank you for the patience, the softness, and the way you choose me.\n\nWith love,`;
  }
  if (rel === "bestFriend" && lt.includes("Funny")) {
    return `Hey ${who},\n\nOfficial documentation states you are legally required to read this letter because our friendship is basically a sitcom and I'm the sentimental one this episode.\n\nOkay but seriously — thank you for being my person.\n\nYours in chaos,`;
  }
  if (rel === "bestFriend") {
    return `Hey ${who},\n\nIf best friends were stars, you'd be the whole constellation I navigate by. Thanks for every late-night talk, every ridiculous plan, and every time you showed up without being asked.\n\nLove you tons,`;
  }
  if (rel === "crush" && lt.includes("Confession")) {
    return `Hey ${who},\n\nI've been carrying these words longer than I meant to. Nothing here needs an answer — I only wanted you to know, honestly and gently, how much you mean to me.\n\n—`;
  }
  if (rel === "crush") {
    return `For ${who},\n\nSome feelings stay folded in pockets until the right moment. If you're reading this, maybe this is mine — a small, brave note meant only for your eyes.\n\n—`;
  }
  return `Dear ${who},\n\nI wrote this slowly, the way you deserve to be thought about — with care, with warmth, and with gratitude for you.\n\nWith love,`;
}

export type ExperienceType = "website" | "letter";
