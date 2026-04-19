import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { getValidAuthToken } from "@/lib/queryClient";
import DashboardCard, { type DashboardCardItem } from "@/components/dashboard/DashboardCard";
import {
  formatCreatedAt,
  inferCreationKind,
  previewImageFromContent,
  relationshipFromContent,
} from "@/lib/dashboardUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ApiWebsite = {
  id: string;
  title: string;
  theme: string;
  content: string;
  createdAt?: string | Date;
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [rows, setRows] = useState<ApiWebsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"duplicate" | "delete" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DashboardCardItem | null>(null);

  const load = useCallback(async () => {
    const token = getValidAuthToken();
    if (!token) {
      setLocation("/login");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/websites", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) {
        setError("Could not load your creations.");
        setRows([]);
        return;
      }
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load your creations.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [setLocation]);

  useEffect(() => {
    void load();
  }, [load]);

  const items: DashboardCardItem[] = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        kind: inferCreationKind(r.content),
        title: r.title,
        relationship: relationshipFromContent(r.content),
        createdLabel: formatCreatedAt(r.createdAt) || "Recently",
        previewImage: previewImageFromContent(r.content),
      })),
    [rows],
  );

  const duplicateItem = async (id: string) => {
    const token = getValidAuthToken();
    if (!token) return;
    setBusyId(id);
    setBusyAction("duplicate");
    try {
      const res = await fetch(`/api/websites/${id}`);
      if (!res.ok) throw new Error("fetch");
      const row = (await res.json()) as ApiWebsite;
      const base = row.title.replace(/\s*\(copy(?:\s*\d+)?\)\s*$/i, "").trim() || "Surprise";
      const dupTitle = `${base} (copy)`;
      const create = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: dupTitle,
          theme: row.theme,
          content: row.content,
        }),
      });
      if (!create.ok) throw new Error("create");
      setError(null);
      await load();
    } catch {
      setError("Duplicate failed. Try again.");
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const token = getValidAuthToken();
    if (!token) return;
    const id = deleteTarget.id;
    setBusyId(id);
    setBusyAction("delete");
    try {
      const res = await fetch(`/api/websites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("delete");
      setDeleteTarget(null);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Delete failed. Try again.");
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7FA] via-[#FFE4EC]/25 to-[#FFF7FA] pb-24 pt-6 md:pt-8">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex flex-col gap-6 border-b border-[#FFD6E7]/60 pb-10 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FF6B9D]/85">
              Aura Studio
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#1A1A1A] md:text-4xl">
              My Creations
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#1A1A1A]/55">
              Websites and letters you&apos;ve published — open, refine, duplicate, or remove in
              one calm place.
            </p>
          </div>
          <Link href="/create">
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#ff8fb3] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_10px_36px_-10px_rgba(255,107,157,0.45)] transition-transform hover:scale-[1.02] sm:w-auto">
              <Plus className="h-4 w-4" />
              New surprise
            </span>
          </Link>
        </motion.header>

        {error ? (
          <div className="mb-8 rounded-2xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-[#1A1A1A]/50">
            <Loader2 className="h-9 w-9 animate-spin text-[#FF6B9D]" />
            <p className="text-sm font-medium">Gathering your surprises…</p>
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md rounded-3xl border border-[#FFD6E7]/90 bg-white/80 px-8 py-14 text-center shadow-[0_16px_48px_-20px_rgba(255,107,157,0.15)]"
          >
            <p className="font-serif text-xl font-medium text-[#1A1A1A]">No creations yet</p>
            <p className="mt-2 text-sm leading-relaxed text-[#1A1A1A]/50">
              When you publish a website or a letter, it will appear here — ready to share or
              polish.
            </p>
            <Link href="/create" className="mt-8 inline-block">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.02] hover:bg-[#e85a8a]">
                <Plus className="h-4 w-4" />
                Create your first surprise
              </span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, index) => (
              <DashboardCard
                key={item.id}
                item={item}
                index={index}
                busyDuplicate={busyId === item.id && busyAction === "duplicate"}
                busyDelete={busyId === item.id && busyAction === "delete"}
                onDuplicate={() => void duplicateItem(item.id)}
                onDelete={() => setDeleteTarget(item)}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="border-[#FFD6E7] bg-[#FFF7FA] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">Delete this creation?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#1A1A1A]/60">
              {deleteTarget ? (
                <>
                  <span className="font-medium text-[#1A1A1A]">{deleteTarget.title}</span> will be
                  removed permanently. This cannot be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-[#FFD6E7] bg-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmDelete()}
              className="rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
