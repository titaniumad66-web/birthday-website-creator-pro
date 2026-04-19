import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ExternalLink,
  Pencil,
  Copy,
  Trash2,
  ImageIcon,
  Type,
} from "lucide-react";
import type { CreationKind } from "@/lib/dashboardUtils";

export type DashboardCardItem = {
  id: string;
  kind: CreationKind;
  title: string;
  relationship?: string;
  createdLabel: string;
  previewImage?: string;
};

type DashboardCardProps = {
  item: DashboardCardItem;
  index: number;
  onDuplicate: () => void;
  onDelete: () => void;
  busyDuplicate?: boolean;
  busyDelete?: boolean;
};

export default function DashboardCard({
  item,
  index,
  onDuplicate,
  onDelete,
  busyDuplicate,
  busyDelete,
}: DashboardCardProps) {
  const openHref = item.kind === "letter" ? `/letter/${item.id}` : `/w/${item.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#FFD6E7]/90 bg-gradient-to-b from-white/95 to-[#FFF7FA]/90 shadow-[0_12px_40px_-16px_rgba(255,107,157,0.18)] transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02] hover:shadow-[0_22px_52px_-14px_rgba(255,107,157,0.24)]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FFE4EC]/50">
        {item.previewImage ? (
          <img
            src={item.previewImage}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#1A1A1A]/35">
            {item.kind === "letter" ? (
              <Type className="h-10 w-10" strokeWidth={1.25} />
            ) : (
              <ImageIcon className="h-10 w-10" strokeWidth={1.25} />
            )}
            <span className="text-xs font-medium">No preview image</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-sm backdrop-blur-sm ${
              item.kind === "letter"
                ? "border border-[#FFD6E7]/90 bg-white/90 text-[#c45a7a]"
                : "border border-[#FFD6E7]/90 bg-white/90 text-[#FF6B9D]"
            }`}
          >
            {item.kind === "letter" ? "Letter" : "Website"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug text-[#1A1A1A]">
          {item.title || "Untitled"}
        </h3>
        {item.relationship ? (
          <p className="mt-1.5 text-sm text-[#1A1A1A]/50">{item.relationship}</p>
        ) : (
          <p className="mt-1.5 text-sm text-[#1A1A1A]/40">Personal surprise</p>
        )}
        <p className="mt-3 text-xs font-medium uppercase tracking-wider text-[#1A1A1A]/38">
          {item.createdLabel}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
          <a
            href={openHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#ff8fb3] px-3 text-xs font-semibold text-white shadow-sm transition-[transform,box-shadow] duration-200 hover:shadow-[0_10px_28px_-8px_rgba(255,107,157,0.35)] motion-safe:hover:scale-[1.03] active:scale-[0.97] sm:flex-1"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
          <Link
            href={`/create?edit=${encodeURIComponent(item.id)}`}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-[#FFD6E7] bg-white/90 px-3 text-xs font-semibold text-[#1A1A1A]/80 shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:bg-[#FFF7FA] hover:shadow-[0_8px_24px_-10px_rgba(255,107,157,0.12)] motion-safe:hover:scale-[1.02] active:scale-[0.97] sm:flex-1"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <button
            type="button"
            onClick={onDuplicate}
            disabled={busyDuplicate || busyDelete}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-[#FFD6E7] bg-white/90 px-3 text-xs font-semibold text-[#1A1A1A]/80 shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:bg-[#FFF7FA] hover:shadow-[0_8px_24px_-10px_rgba(255,107,157,0.12)] motion-safe:hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 sm:flex-1"
          >
            <Copy className="h-3.5 w-3.5" />
            {busyDuplicate ? "…" : "Duplicate"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busyDuplicate || busyDelete}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-red-200/80 bg-white/90 px-3 text-xs font-semibold text-red-600/90 shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:bg-red-50 hover:shadow-[0_8px_24px_-10px_rgba(239,68,68,0.12)] motion-safe:hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 sm:flex-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {busyDelete ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
