import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiUrl } from "../lib/api";
import { getValidAuthToken } from "../lib/queryClient";
import { QRCodeCanvas } from "qrcode.react";

type Info = {
  upiId: string;
  amount: string;
  qr: string;
};

export default function Payment() {
  const [, setLocation] = useLocation();
  const [info, setInfo] = useState<Info | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(apiUrl("/api/monetization/info"));
        if (!res.ok) return;
        const data = (await res.json()) as Info;
        setInfo(data);
      } catch {
      }
    };
    run();
  }, []);

  const upiPa = "anujdhavane74@okaxis";
  const deepLink =
    info?.amount
      ? `upi://pay?pa=${encodeURIComponent(upiPa)}&pn=Aura&am=${encodeURIComponent(
          info.amount,
        )}&cu=INR`
      : null;

  const handleSubmit = async () => {
    if (!file || submitting) return;
    const token = getValidAuthToken();
    if (!token) {
      setLocation("/login");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("product_type", "website_creation");
      form.append("amount", info?.amount ?? "49");
      form.append("screenshot", file);
      const res = await fetch(apiUrl("/api/purchases"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) {
        setError("Failed to submit payment proof.");
        return;
      }
      setSuccess(true);
      setFile(null);
      setLocation("/create");
    } catch {
      setError("Failed to submit payment proof.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff7fb,_#f6f1ff)] px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-sans font-semibold">Complete Payment</h1>
          <p className="mt-2 text-foreground/70">
            Scan the QR or use the UPI ID to pay and upload your screenshot for verification.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white shadow-xl border border-purple-100 p-6 grid place-content-center">
            {info?.qr ? (
              <QRCodeCanvas value={info.qr} size={220} />
            ) : (
              <div className="text-sm text-foreground/60">Loading QR...</div>
            )}
          </div>
          <div className="rounded-2xl bg-white shadow-xl border border-purple-100 p-6">
            <div className="text-sm text-foreground/70">UPI ID</div>
            <div className="mt-1 text-xl font-semibold">{upiPa}</div>
            <div className="mt-4 text-sm text-foreground/70">Amount</div>
            <div className="mt-1 text-xl font-semibold">₹{info?.amount ?? "49"}</div>
            <a
              href={deepLink ?? undefined}
              className={`mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-2 text-sm font-semibold text-white transition-opacity ${
                deepLink ? "hover:opacity-95" : "opacity-50 pointer-events-none"
              }`}
            >
              Pay with UPI App
            </a>
            <div className="mt-2 text-xs text-foreground/60">
              If the button doesn’t open your UPI app, use the QR or UPI ID above.
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-xl border border-purple-100 p-6">
          <div className="text-sm font-medium">Upload Payment Screenshot</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-3"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || submitting}
            className="mt-4 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit for Verification"}
          </button>
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
          {success && (
            <div className="mt-3 text-sm text-green-600">
              Payment submitted. We will notify you once approved.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

