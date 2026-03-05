import { useEffect, useMemo, useState } from "react";
import { getValidAuthToken } from "@/lib/queryClient";
import { Download, Upload, RefreshCw, Trash2, Image as ImageIcon } from "lucide-react";

type TemplateItem = {
  id: string;
  title: string;
  imageUrl: string;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const qs = new URLSearchParams(window.location.search);
    return qs.get("tab") || "dashboard";
  });
  useEffect(() => {
    const onPop = () => {
      const qs = new URLSearchParams(window.location.search);
      setActiveTab(qs.get("tab") || "dashboard");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, any | null>>({});
  const [busySection, setBusySection] = useState<string | null>(null);
  const [pricingItems, setPricingItems] = useState<{ productName: string; price: string }[]>([]);
  const [pricingEdit, setPricingEdit] = useState<Record<string, string>>({});
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<"all" | "approved" | "pending">("all");
  const [stats, setStats] = useState<{
    users: number;
    websites: number;
    purchases: number;
    revenueApproved: number;
    pendingPayments: number;
  } | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; username: string; email: string; role: string; createdAt?: string }>>([]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      if (!res.ok) {
        setError("Failed to load templates.");
        return;
      }
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load templates.");
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const sections = useMemo(
    () => [
      { key: "hero", label: "Hero Section", maxWidth: 2000 },
      { key: "templates", label: "Template Preview", maxWidth: 1200 },
      { key: "ai-magic", label: "AI Magic Section", maxWidth: 500 },
      { key: "celebration", label: "Celebration Graphics", maxWidth: 500 },
      { key: "mockups", label: "Website Mockups", maxWidth: 2000 },
    ],
    []
  );

  const fetchImages = async () => {
    try {
      const results = await Promise.all(
        sections.map(async (s) => {
          const res = await fetch(`/api/site-images?section=${encodeURIComponent(s.key)}`);
          if (!res.ok) return [s.key, null] as const;
          const data = await res.json();
          return [s.key, Array.isArray(data) && data.length ? data[0] : null] as const;
        })
      );
      const map: Record<string, any | null> = {};
      for (const [k, v] of results) map[k] = v;
      setImages(map);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPricing = async () => {
    try {
      const token = getValidAuthToken();
      if (!token) return;
      const res = await fetch("/api/pricing", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setPricingItems(Array.isArray(data) ? data : []);
      const draft: Record<string, string> = {};
      for (const it of Array.isArray(data) ? data : []) draft[it.productName] = it.price;
      setPricingEdit(draft);
    } catch {}
  };

  const savePricing = async (product: string) => {
    try {
      const token = getValidAuthToken();
      if (!token) return;
      const price = pricingEdit[product] || "";
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_name: product, price }),
      });
      if (!res.ok) {
        setError("Failed to update pricing.");
        return;
      }
      await fetchPricing();
    } catch {
      setError("Failed to update pricing.");
    }
  };

  const fetchPayments = async (status?: "approved" | "pending") => {
    try {
      const token = getValidAuthToken();
      if (!token) return;
      const qs = status ? `?status=${encodeURIComponent(status)}` : "";
      const res = await fetch(`/api/purchases${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch {}
  };

  const actPayment = async (id: string, action: "approve" | "reject") => {
    try {
      const token = getValidAuthToken();
      if (!token) return;
      const res = await fetch(`/api/purchases/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError("Action failed.");
        return;
      }
      await fetchPayments();
    } catch {
      setError("Action failed.");
    }
  };

  useEffect(() => {
    fetchPricing();
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const token = getValidAuthToken();
      if (!token) return;
      const res = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch {}
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      const token = getValidAuthToken();
      if (!token) return;
      const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {}
  };
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function resizeImageIfNeeded(file: File, maxWidth: number) {
    const img = document.createElement("img");
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("read failed"));
      r.readAsDataURL(file);
    });
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image load failed"));
      img.src = dataUrl;
    });
    if (img.width <= maxWidth) {
      return file;
    }
    const scale = maxWidth / img.width;
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(img.width * scale);
    canvas.height = Math.floor(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.9)
    );
    return new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg"), {
      type: "image/jpeg",
    });
  }

  async function uploadOrReplace(sectionKey: string, f: File) {
    const token = getValidAuthToken();
    if (!token) {
      setError("You must be logged in as admin.");
      return;
    }
    const meta = sections.find((s) => s.key === sectionKey)!;
    const optimized = await resizeImageIfNeeded(f, meta.maxWidth);
    setBusySection(sectionKey);
    setError(null);
    try {
      const existing = images[sectionKey];
      const form = new FormData();
      form.append("section_name", sectionKey);
      form.append("image", optimized);
      const url = existing ? `/api/site-images/${existing.id}` : "/api/site-images";
      const method = existing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) {
        setError("Upload failed. Please try again.");
        return;
      }
      await fetchImages();
      try {
        window.dispatchEvent(new CustomEvent("site-images-updated", { detail: { section: sectionKey } }));
      } catch {}
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setBusySection(null);
    }
  }

  async function deleteImage(sectionKey: string) {
    const token = getValidAuthToken();
    if (!token) {
      setError("You must be logged in as admin.");
      return;
    }
    const existing = images[sectionKey];
    if (!existing) return;
    setBusySection(sectionKey);
    try {
      const res = await fetch(`/api/site-images/${existing.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError("Delete failed. Please try again.");
        return;
      }
      await fetchImages();
    } catch {
      setError("Delete failed. Please try again.");
    } finally {
      setBusySection(null);
    }
  }

  function onPickFile(sectionKey: string, ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (f) {
      uploadOrReplace(sectionKey, f);
      ev.currentTarget.value = "";
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || isSubmitting) return;
    const token = getValidAuthToken();
    if (!token) {
      setError("You must be logged in as admin.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", title.trim());
    formData.append("title", title.trim());
    formData.append("image", file);

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        setError("Upload failed. Please try again.");
        return;
      }

      setTitle("");
      setFile(null);
      await fetchTemplates();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    const token = getValidAuthToken();
    if (!token) {
      setError("You must be logged in as admin.");
      return;
    }

    try {
      const res = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setError("Delete failed. Please try again.");
        return;
      }

      setTemplates((prev) => prev.filter((item) => item.id !== templateId));
    } catch {
      setError("Delete failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-serif font-medium">👑 Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome King. System is under your control.
          </p>
        </div>

        {activeTab === "dashboard" && (
        <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-md">
          <h2 className="text-2xl font-serif font-medium mb-4">
            Admin Template Manager
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Template Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-11 rounded-xl border border-border bg-white/70 px-4 text-sm shadow-sm"
                placeholder="Romantic teaser"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setFile(event.target.files ? event.target.files[0] : null)
                }
                className="h-11 rounded-xl border border-border bg-white/70 px-4 text-sm shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="h-11 px-6 rounded-xl bg-black text-white text-sm font-medium shadow-lg hover:scale-105 transition-transform disabled:opacity-60"
            >
              {isSubmitting ? "Uploading..." : "Upload Template"}
            </button>
          </form>
          {error && (
            <div className="mt-4 text-sm text-red-600">{error}</div>
          )}
        </div>
        )}

        {activeTab === "analytics" && (
        <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-md">
          <h2 className="text-2xl font-serif font-medium mb-4">Platform Analytics</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-border bg-white p-5 shadow">
              <div className="text-xs uppercase tracking-[0.2em] text-purple-700/70">Total Users</div>
              <div className="mt-2 text-3xl font-semibold">{stats?.users ?? "—"}</div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5 shadow">
              <div className="text-xs uppercase tracking-[0.2em] text-purple-700/70">Websites</div>
              <div className="mt-2 text-3xl font-semibold">{stats?.websites ?? "—"}</div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5 shadow">
              <div className="text-xs uppercase tracking-[0.2em] text-purple-700/70">Payments</div>
              <div className="mt-2 text-3xl font-semibold">{stats?.purchases ?? "—"}</div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5 shadow">
              <div className="text-xs uppercase tracking-[0.2em] text-purple-700/70">Revenue</div>
              <div className="mt-2 text-3xl font-semibold">₹{stats?.revenueApproved ?? 0}</div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5 shadow">
              <div className="text-xs uppercase tracking-[0.2em] text-purple-700/70">Pending</div>
              <div className="mt-2 text-3xl font-semibold">{stats?.pendingPayments ?? "—"}</div>
            </div>
          </div>
        </div>
        )}

        {activeTab === "images" && (
        <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-md">
          <h2 className="text-2xl font-serif font-medium mb-4">Image Manager</h2>
          <p className="text-muted-foreground mb-6">
            Upload, replace, or delete images used across the website.
          </p>
          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => {
              const item = images[s.key];
              const loading = busySection === s.key;
              return (
                <div
                  key={s.key}
                  className="relative rounded-2xl border border-border bg-white/70 p-4 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground">
                      max {s.maxWidth}px
                    </div>
                  </div>
                  <div className="mt-3 aspect-[4/3] rounded-xl overflow-hidden border border-border bg-secondary/30">
                    {item?.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={s.label}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="h-full w-full grid place-content-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <label className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold hover:bg-secondary/40 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onPickFile(s.key, e)}
                        className="hidden"
                      />
                      <Upload className="mr-2 h-3.5 w-3.5" />
                      {item ? "Replace" : "Upload"}
                    </label>
                    {item && (
                      <button
                        type="button"
                        onClick={() => deleteImage(s.key)}
                        className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold hover:bg-secondary/40"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => fetchImages()}
                      className="ml-auto inline-flex items-center rounded-full border border-border bg-white px-3 py-2 text-xs font-medium hover:bg-secondary/40"
                      disabled={loading}
                    >
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Refresh
                    </button>
                  </div>
                  {loading && (
                    <div className="absolute inset-0 grid place-content-center rounded-2xl bg-white/60 text-xs font-medium">
                      Working...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}

        {activeTab === "pricing" && (
        <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-md">
          <h2 className="text-2xl font-serif font-medium mb-4">Pricing Management</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {["website_creation", "template"].map((p) => (
              <div key={p} className="rounded-2xl border border-border bg-white/70 p-4 shadow">
                <div className="text-sm font-medium">{p.replace("_", " ")}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-foreground/70">₹</span>
                  <input
                    value={pricingEdit[p] ?? ""}
                    onChange={(e) =>
                      setPricingEdit((prev) => ({ ...prev, [p]: e.target.value }))
                    }
                    className="h-10 rounded-md border border-border px-3 text-sm"
                    placeholder="49"
                  />
                  <button
                    type="button"
                    onClick={() => savePricing(p)}
                    className="ml-auto rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {activeTab === "payments" && (
        <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-serif font-medium">Payments</h2>
            <div className="inline-flex overflow-hidden rounded-full border border-border bg-white">
              <button
                type="button"
                onClick={() => {
                  setPaymentFilter("all");
                  fetchPayments();
                }}
                className={`px-4 py-1.5 text-sm ${paymentFilter === "all" ? "bg-secondary/40" : ""}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentFilter("approved");
                  fetchPayments("approved");
                }}
                className={`px-4 py-1.5 text-sm ${paymentFilter === "approved" ? "bg-secondary/40" : ""}`}
              >
                Approved
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentFilter("pending");
                  fetchPayments("pending");
                }}
                className={`px-4 py-1.5 text-sm ${paymentFilter === "pending" ? "bg-secondary/40" : ""}`}
              >
                Pending
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {payments.map((p) => {
              const date = p.createdAt ? new Date(p.createdAt) : null;
              const when = date ? date.toLocaleString() : "—";
              return (
                <div key={p.id} className="rounded-2xl border border-border bg-white p-4 shadow">
                  <div className="text-xs uppercase tracking-[0.2em] text-purple-700/70">
                    {p.productType}
                  </div>
                  <div className="mt-1 text-lg font-semibold">₹{p.amount}</div>
                  <div className="mt-1 text-sm text-foreground/80">User: {p.userEmail ?? "Unknown"}</div>
                  <div className="mt-1 text-xs text-foreground/60">{when}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest">
                    Status: <span className="font-semibold">{p.paymentStatus}</span>
                  </div>
                  {p.paymentScreenshot ? (
                    <a
                      href={p.paymentScreenshot}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block rounded-xl border border-border"
                    >
                      <img
                        src={p.paymentScreenshot}
                        alt="screenshot"
                        className="h-40 w-full rounded-xl object-cover"
                      />
                    </a>
                  ) : (
                    <div className="mt-3 h-40 w-full rounded-xl border border-border grid place-content-center text-xs text-foreground/60">
                      No screenshot
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => actPayment(p.id, "approve")}
                      className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => actPayment(p.id, "reject")}
                      className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {activeTab === "templates" && (
        <div className="space-y-4">
          <h3 className="text-xl font-serif font-medium">Existing Templates</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group relative rounded-2xl overflow-hidden aspect-[9/16] shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <img
                src={template.imageUrl}
                alt={template.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center justify-end text-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <a
                  href={template.imageUrl}
                  download
                  className="flex flex-col items-center text-white"
                >
                  <Download className="w-8 h-8 text-white mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
                  <span className="text-sm font-medium">Download</span>
                </a>
                <p className="text-white font-medium text-lg">
                  {template.title || "Template"}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(template.id)}
                  className="mt-3 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-gray-900 shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
        )}

        {activeTab === "users" && (
          <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-2xl font-serif font-medium mb-4">Users</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((u) => (
                <div key={u.id} className="rounded-2xl border border-border bg-white p-4 shadow">
                  <div className="text-sm font-medium">{u.username || u.email || u.id}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                  <div className="mt-2 text-xs uppercase tracking-widest">
                    Role: <span className="font-semibold">{u.role}</span>
                  </div>
                  <div className="mt-1 text-xs text-foreground/60">
                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-sm text-muted-foreground">No users found.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
