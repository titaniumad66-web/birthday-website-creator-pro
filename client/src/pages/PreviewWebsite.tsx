import { useRef } from "react";
import { musicLabelFromContent, resolveMusicSrcFromContent } from "../lib/surpriseConfig";
import LetterLayout from "../templates/LetterLayout";
import MusicPlayer from "../components/surprise/MusicPlayer";
import story1 from "../assets/images/story-1.png";
import story2 from "../assets/images/story-2.png";
import RomanticTemplate from "../templates/RomanticTemplate";
import EmotionalTemplate from "../templates/EmotionalTemplate";
import FunnyTemplate from "../templates/FunnyTemplate";
import RoyalTemplate from "../templates/RoyalTemplate";
import MinimalTemplate from "../templates/MinimalTemplate";
import PastelTemplate from "../templates/PastelTemplate";

type ThemeId = "romantic" | "pastel" | "royal" | "minimal" | "emotional" | "funny";

type Memory = {
  id: string;
  image: string;
  caption: string;
  date: string;
};

type PreviewPayload = {
  name: string;
  relationship: string;
  message: string;
  memories: Memory[];
  theme: string;
  confessionMode?: boolean;
  music?: string;
  musicTrack?: string;
  scheduleSurprise?: boolean;
  unlockAt?: string | null;
  earlyUnlocked?: boolean;
};

type LetterPreviewPayload = {
  type: "letter";
  experienceType?: "letter";
  name?: string;
  relationship?: string;
  letterType?: string;
  title?: string;
  content: string;
  image?: string;
  theme?: string;
  music?: string;
  musicTrack?: string;
};

const sample = {
  name: "Sarah",
  relationship: "Best Friend",
  message:
    "Happy Birthday! You make ordinary days feel extraordinary. Thanks for the laughs, the kindness, and every little moment that turned into a memory. I hope today feels like sunshine.",
  memories: [
    {
      id: "m1",
      image: story1,
      caption: "Our first spontaneous adventure.",
      date: "2024-05-18",
    },
    {
      id: "m2",
      image: story2,
      caption: "That night we laughed until 2AM.",
      date: "2024-09-02",
    },
    {
      id: "m3",
      image: story1,
      caption: "A quiet moment that meant everything.",
      date: "2025-01-11",
    },
    {
      id: "m4",
      image: story2,
      caption: "New year, same favorite person.",
      date: "2025-12-31",
    },
    {
      id: "m5",
      image: story1,
      caption: "Coffee dates and big dreams.",
      date: "2026-02-10",
    },
    {
      id: "m6",
      image: story2,
      caption: "A snapshot of pure joy.",
      date: "2026-03-01",
    },
  ],
  music: "upbeat",
  confessionMode: false,
  theme: "romantic",
} as const;

function decodePreviewPayload(encoded: string): PreviewPayload | LetterPreviewPayload | null {
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as Record<string, unknown>;

    if (parsed?.type === "letter") {
      if (typeof parsed.content !== "string") return null;
      return parsed as unknown as LetterPreviewPayload;
    }

    const p = parsed as Partial<PreviewPayload>;
    if (
      typeof p?.name !== "string" ||
      typeof p?.relationship !== "string" ||
      typeof p?.message !== "string" ||
      !Array.isArray(p?.memories) ||
      typeof p?.theme !== "string"
    ) {
      return null;
    }
    if (p?.confessionMode !== undefined && typeof p.confessionMode !== "boolean") {
      return null;
    }
    if (p?.music !== undefined && typeof p.music !== "string") {
      return null;
    }

    return p as PreviewPayload;
  } catch {
    return null;
  }
}

function isThemeId(theme: string): theme is ThemeId {
  return theme === "romantic" || theme === "pastel" || theme === "royal" || theme === "minimal" || theme === "emotional" || theme === "funny";
}

export default function PreviewWebsite() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("d");
  const incoming = encoded ? decodePreviewPayload(encoded) : null;

  if (incoming && "type" in incoming && incoming.type === "letter") {
    const letter = incoming;
    const musicSrc = resolveMusicSrcFromContent(letter);
    const musicLabel = musicLabelFromContent(letter);
    return (
      <LetterLayout
        themeId={letter.theme}
        title={letter.title}
        letterContent={letter.content}
        image={letter.image}
        relationship={letter.relationship}
        letterType={letter.letterType}
        recipientName={letter.name}
        footer={
          musicLabel ? (
            <span className="text-[#1A1A1A]/45">
              Soundtrack: <span className="font-medium text-[#1A1A1A]/55">{musicLabel}</span>
            </span>
          ) : null
        }
        actions={
          <div className="mx-auto w-full max-w-md">
            <MusicPlayer src={musicSrc} canInteract />
          </div>
        }
      />
    );
  }

  const site = incoming as PreviewPayload | null;

  const name = site?.name ?? sample.name;
  const relationship = site?.relationship ?? sample.relationship;
  const message = site?.message ?? sample.message;
  const memories = [...(site?.memories ?? sample.memories)];
  const themeRaw = site?.theme ?? sample.theme;
  const theme: ThemeId = isThemeId(themeRaw) ? themeRaw : "romantic";
  const confessionMode = site?.confessionMode ?? sample.confessionMode;
  const music = site?.music ?? sample.music;
  const musicTrack = site?.musicTrack;
  const templates = {
    romantic: RomanticTemplate,
    emotional: EmotionalTemplate,
    funny: FunnyTemplate,
    royal: RoyalTemplate,
    minimal: MinimalTemplate,
    pastel: PastelTemplate,
  } as const;
  const TemplateComponent = templates[theme];
  const themeLabels: Record<string, string> = {
    romantic: "Romantic",
    emotional: "Emotional",
    funny: "Funny",
    royal: "Royal",
    minimal: "Minimal",
    pastel: "Soft Pastel",
  };
  const musicLabel = musicLabelFromContent({ music, musicTrack });
  const memoriesRef = useRef<HTMLElement | null>(null);
  const handleCelebrate = () => {
    if (memoriesRef.current) {
      memoriesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <TemplateComponent
      name={name}
      relationship={relationship}
      confessionMode={confessionMode}
      message={message}
      memories={memories}
      themeLabel={themeLabels[theme]}
      musicLabel={musicLabel}
      actions={null}
      qr={null}
      memoryRef={memoriesRef}
      onCelebrate={handleCelebrate}
    />
  );
}

