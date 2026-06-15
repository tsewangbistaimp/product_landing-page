"use client";

import { CheckCircle2, Gift, Loader2, Sparkles, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { formatMoney, product } from "@/lib/product";

const storageKey = "tb_spin_discount";
const prizeOrder = [10, 20, 50, 75, 100];
const shoeSizes = ["US 6", "US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];

type SpinDiscount = {
  code: string;
  percent: number;
  label: string;
  shoeSize: string;
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  status?: string;
  nextEligibleAt?: string;
};

type SpinResponse = {
  ok: boolean;
  isDuplicate: boolean;
  discount?: SpinDiscount;
  cooldownUntil?: string;
  error?: string;
};

export function SpinAndWinPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [error, setError] = useState("");
  const [discount, setDiscount] = useState<SpinDiscount | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState("");
  const [countdown, setCountdown] = useState("");
  const [rotation, setRotation] = useState(0);
  const delayMs = useMemo(() => Number(process.env.NEXT_PUBLIC_SPIN_DELAY_MS || 2500), []);

  useEffect(() => {
    const savedDiscount = readSavedDiscount();
    if (savedDiscount) {
      setDiscount(savedDiscount);
      setCooldownUntil(savedDiscount.nextEligibleAt || "");
      return;
    }

    const timer = window.setTimeout(() => setIsOpen(true), Number.isFinite(delayMs) ? delayMs : 2500);
    const handleExitIntent = (event: MouseEvent) => {
      if (event.clientY <= 12) setIsOpen(true);
    };

    document.addEventListener("mouseleave", handleExitIntent);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseleave", handleExitIntent);
    };
  }, [delayMs]);

  useEffect(() => {
    if (!cooldownUntil) {
      setCountdown("");
      return;
    }

    function updateCountdown() {
      setCountdown(formatCountdown(cooldownUntil));
    }

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  async function handleSpin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSpinning) return;

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    setIsSpinning(true);
    setError("");
    const formData = new FormData(form);
    const payload = {
      fullName: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      whatsapp: String(formData.get("whatsapp") || ""),
      shoeSize: String(formData.get("shoeSize") || "")
    };

    try {
      const response = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as SpinResponse;
      if (!response.ok) {
        if (data.cooldownUntil) setCooldownUntil(data.cooldownUntil);
        throw new Error(data.error || "Please check your details and try again.");
      }
      if (!data.discount) throw new Error("Spin failed. Please try again.");
      const wonDiscount = data.discount;

      const prizeIndex = Math.max(0, prizeOrder.indexOf(wonDiscount.percent));
      const segmentCenter = prizeIndex * 72 + 36;
      setRotation(360 * 5 + (360 - segmentCenter));

      window.setTimeout(() => {
        setDiscount(wonDiscount);
        setCooldownUntil(wonDiscount.nextEligibleAt || data.cooldownUntil || "");
        window.localStorage.setItem(storageKey, JSON.stringify(wonDiscount));
        window.dispatchEvent(new CustomEvent("spin-discount-applied", { detail: wonDiscount }));
        trackSpinWin(wonDiscount);
        setIsSpinning(false);
      }, 2600);
    } catch (spinError) {
      setError(spinError instanceof Error ? spinError.message : "Spin failed. Please try again.");
      setIsSpinning(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-4 z-40 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-3 text-sm font-black text-white shadow-2xl transition hover:bg-[#c95833] sm:bottom-6 sm:right-6"
      >
        <Gift className="h-4 w-4" />
        {discount ? `${discount.percent}% OFF Applied` : "Spin & Win"}
      </button>

      {!isOpen ? null : (
        <div className="fixed inset-0 z-50 grid place-items-center bg-brand-ink/55 px-4 py-6 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-white/40 bg-[#fbfdf9] shadow-2xl">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close spin popup"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-brand-ink shadow-sm transition hover:bg-brand-mint"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative overflow-hidden bg-brand-green p-6 text-white sm:p-8">
            {discount ? <Confetti /> : null}
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-orange">
              <Sparkles className="h-4 w-4" />
              Limited Spin Reward
            </p>
            <h2 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
              Spin & win up to 100% OFF
            </h2>
            <p className="mt-4 leading-7 text-white/80">
              Complete the form, spin once, and your winning discount will be applied automatically to checkout.
            </p>

            <div className="mx-auto mt-8 grid max-w-sm place-items-center">
              <div className="relative">
                <div className="absolute left-1/2 top-[-14px] z-10 h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[24px] border-x-transparent border-t-brand-orange" />
                <div
                  className="spin-wheel relative grid h-72 w-72 place-items-center rounded-full border-[10px] border-white bg-white shadow-2xl transition-transform duration-[2600ms] ease-out sm:h-80 sm:w-80"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {prizeOrder.map((prize, index) => (
                    <span
                      key={prize}
                      className="absolute text-sm font-black text-brand-ink"
                      style={{ transform: `rotate(${index * 72 + 36}deg) translateY(-106px) rotate(-${index * 72 + 36}deg)` }}
                    >
                      {prize}% OFF
                    </span>
                  ))}
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-green text-white shadow-lg">
                    <Gift className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {discount ? (
              <div className="flex min-h-full flex-col justify-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-mint text-brand-green">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <p className="mt-6 text-sm font-bold uppercase tracking-wide text-brand-orange">Your discount is applied</p>
                <h3 className="mt-2 text-4xl font-black text-brand-ink">{discount.label}</h3>
                {countdown ? (
                  <p className="mt-3 rounded-md bg-white px-4 py-3 text-sm font-bold text-brand-green">
                    Next Spin & Win available in {countdown}
                  </p>
                ) : null}
                <div className="mt-6 grid gap-3 rounded-lg bg-brand-mint p-5">
                  <Summary label="Original price" value={formatMoney(discount.originalTotal)} />
                  <Summary label="Discount amount" value={`-${formatMoney(discount.discountAmount)}`} />
                  <Summary label="Final price" value={formatMoney(discount.finalTotal)} />
                  <Summary label="Discount code" value={discount.code} />
                </div>
                <a
                  href="#showcase"
                  onClick={() => setIsOpen(false)}
                  className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-brand-green px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-green/90"
                >
                  Order with my discount
                </a>
              </div>
            ) : (
              <form onSubmit={handleSpin} className="grid gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">Unlock your checkout price</p>
                  <h3 className="mt-2 text-3xl font-black text-brand-ink">Enter details to spin</h3>
                  <p className="mt-3 leading-7 text-slate-700">
                    One spin is allowed per email and WhatsApp number. The winning result is generated securely on the server.
                  </p>
                  {countdown ? (
                    <p className="mt-3 rounded-md bg-brand-mint px-4 py-3 text-sm font-bold text-brand-green">
                      You can spin again in {countdown}.
                    </p>
                  ) : null}
                </div>

                <input name="fullName" required minLength={2} placeholder="Full Name" className="rounded-md border border-brand-green/20 px-4 py-3 outline-none focus:border-brand-green" />
                <input name="email" required type="email" placeholder="Email Address" className="rounded-md border border-brand-green/20 px-4 py-3 outline-none focus:border-brand-green" />
                <input name="whatsapp" required minLength={7} placeholder="WhatsApp Number" className="rounded-md border border-brand-green/20 px-4 py-3 outline-none focus:border-brand-green" />
                <select name="shoeSize" required defaultValue="" className="rounded-md border border-brand-green/20 bg-white px-4 py-3 outline-none focus:border-brand-green">
                  <option value="" disabled>
                    Select Shoe Size
                  </option>
                  {shoeSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>

                {error ? <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

                <button
                  type="submit"
                  disabled={isSpinning}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-green px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-green/90 disabled:opacity-70"
                >
                  {isSpinning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Spinning...
                    </>
                  ) : (
                    "Spin Now"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
          </div>
        </div>
      )}
    </>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-white px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-right font-black text-brand-ink">{value}</span>
    </div>
  );
}

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 24 }).map((_, index) => (
        <span
          key={index}
          className="confetti-piece absolute h-3 w-2 rounded-sm bg-brand-orange"
          style={{
            left: `${(index * 37) % 100}%`,
            animationDelay: `${(index % 8) * 0.12}s`,
            backgroundColor: index % 3 === 0 ? "#f0714a" : index % 3 === 1 ? "#ffffff" : "#d8eadf"
          }}
        />
      ))}
    </div>
  );
}

function readSavedDiscount(): SpinDiscount | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as SpinDiscount) : null;
  } catch {
    return null;
  }
}

function formatCountdown(targetIso: string) {
  const remainingMs = new Date(targetIso).getTime() - Date.now();
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return "";

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}

function trackSpinWin(discount: SpinDiscount) {
  const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
  if (!fbq) return;

  fbq("trackCustom", "SpinWinDiscount", {
    discount_code: discount.code,
    discount_percent: discount.percent,
    shoe_size: discount.shoeSize,
    final_price: discount.finalTotal
  });
}
