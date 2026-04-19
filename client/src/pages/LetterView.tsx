import { useParams } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import CountdownLock from "@/components/surprise/CountdownLock";
import MusicPlayer from "@/components/surprise/MusicPlayer";
import { musicLabelFromContent, resolveMusicSrcFromContent } from "@/lib/surpriseConfig";
import LetterLayout from "@/templates/LetterLayout";

export type LetterContent = {
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
  musicBase64?: string;
  musicTrack?: string;
  scheduleSurprise?: boolean;
  unlockAt?: string | null;
  earlyUnlocked?: boolean;
};

export default function LetterView() {
  const { id } = useParams();
  const [data, setData] = useState<LetterContent | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scheduleGateClear, setScheduleGateClear] = useState(false);

  const sharePath = id ? `/letter/${id}` : "";
  const shareUrl = id ? `${window.location.origin}${sharePath}` : "";

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
      return;
    } catch {
      const el = document.createElement("textarea");
      el.value = shareUrl;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      el.style.top = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      } finally {
        document.body.removeChild(el);
      }
    }
  };

  const musicSrc = useMemo(() => (data ? resolveMusicSrcFromContent(data) : null), [data]);

  const isScheduleLocked = useMemo(() => {
    if (!data?.scheduleSurprise || !data.unlockAt) return false;
    if (data.earlyUnlocked) return false;
    if (scheduleGateClear) return false;
    const t = new Date(data.unlockAt).getTime();
    if (Number.isNaN(t)) return false;
    return Date.now() < t;
  }, [data, scheduleGateClear]);

  useEffect(() => {
    setLoadError(false);
    setScheduleGateClear(false);
    if (!id) {
      setData(null);
      setLoadError(true);
      return;
    }
    fetch(`/api/websites/${id}`)
      .then((res) => res.json())
      .then((res) => {
        if (!res?.content || typeof res.content !== "string") {
          setData(null);
          setLoadError(true);
          return;
        }
        try {
          const parsed = JSON.parse(res.content) as LetterContent;
          if (parsed?.type !== "letter") {
            setData(null);
            setLoadError(true);
            return;
          }
          if (typeof res.earlyUnlocked === "boolean") {
            parsed.earlyUnlocked = res.earlyUnlocked;
          }
          if (res.unlockAt) {
            parsed.unlockAt = new Date(res.unlockAt).toISOString();
          }
          setData(parsed);
        } catch {
          setData(null);
          setLoadError(true);
        }
      })
      .catch(() => {
        setData(null);
        setLoadError(true);
      });
  }, [id]);

  const shareMessage = "A letter made just for you 💌";
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${shareUrl}`)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`;
  const musicLabel = data ? musicLabelFromContent(data) : undefined;

  const actions = data ? (
    <div className="flex w-full flex-col items-stretch gap-3 sm:max-w-md sm:mx-auto">
      {!isScheduleLocked ? <MusicPlayer src={musicSrc} canInteract /> : null}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={copyLink}
          className="rounded-full border border-[#FFD6E7] bg-[#FFE4EC]/50 px-5 py-2.5 text-sm font-medium text-[#1A1A1A] shadow-sm transition-transform hover:bg-[#FFD6E7]/60"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full border border-[#FFD6E7] bg-[#FFE4EC]/50 px-5 py-2.5 text-sm font-medium text-[#1A1A1A] shadow-sm transition-transform hover:bg-[#FFD6E7]/60"
        >
          Share on WhatsApp
        </a>
        <a
          href={twitterHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full border border-[#FFD6E7] bg-[#FFE4EC]/50 px-5 py-2.5 text-sm font-medium text-[#1A1A1A] shadow-sm transition-transform hover:bg-[#FFD6E7]/60"
        >
          Share on Twitter (X)
        </a>
      </div>
    </div>
  ) : null;

  const qrNode = shareUrl ? (
    <div className="mt-8 flex flex-col items-center gap-3">
      <div className="rounded-2xl border border-[#FFD6E7] bg-white p-4 shadow-md">
        <QRCodeCanvas value={shareUrl} size={160} includeMargin />
      </div>
      <p className="text-center text-sm text-[#1A1A1A]/55">Scan to open this letter</p>
    </div>
  ) : null;

  if (!id) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-lg text-muted-foreground">
        This letter is unavailable right now.
      </div>
    );
  }

  if (!data && !loadError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-lg text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 text-center text-lg text-muted-foreground">
        This letter is unavailable right now.
      </div>
    );
  }

  if (isScheduleLocked) {
    return (
      <CountdownLock
        websiteId={id}
        unlockAt={data.unlockAt!}
        recipientName={data.name}
        onUnlocked={() => setScheduleGateClear(true)}
        onEarlyOpened={() => {
          setScheduleGateClear(true);
          setData((prev) => (prev ? { ...prev, earlyUnlocked: true } : null));
        }}
      />
    );
  }

  return (
    <LetterLayout
      themeId={data.theme}
      title={data.title}
      letterContent={data.content || ""}
      image={data.image}
      relationship={data.relationship}
      letterType={data.letterType}
      recipientName={data.name}
      footer={
        musicLabel ? (
          <span className="text-[#1A1A1A]/45">
            Soundtrack: <span className="font-medium text-[#1A1A1A]/55">{musicLabel}</span>
          </span>
        ) : null
      }
      actions={
        <>
          {actions}
          {qrNode}
        </>
      }
    />
  );
}
