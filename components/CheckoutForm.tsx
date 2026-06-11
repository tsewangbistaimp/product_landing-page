"use client";

import { Loader2, Minus, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { formatMoney, product } from "@/lib/product";

function CheckoutFormInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const initialQuantity = useMemo(() => {
    const requestedQuantity = Number(params.get("quantity") || 1);
    return Math.min(product.maxQuantity, Math.max(1, Number.isFinite(requestedQuantity) ? requestedQuantity : 1));
  }, [params]);
  const [quantity, setQuantity] = useState(initialQuantity);
  const order = useMemo(() => {
    return {
      productName: params.get("product") || product.name,
      quantity,
      pricePerPiece: product.offerPrice,
      totalPrice: quantity * product.offerPrice + product.deliveryFee
    };
  }, [params, quantity]);

  function updateQuantity(value: number) {
    if (!Number.isFinite(value)) return;
    setQuantity(Math.min(product.maxQuantity, Math.max(1, Math.floor(value))));
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get("fullName") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      location: String(formData.get("location") || ""),
      ...order
    };
    try {
      const response = await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Order submission failed.");
      router.push(`/thank-you?product=${encodeURIComponent(order.productName)}&quantity=${order.quantity}&total=${order.totalPrice}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Order submission failed.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submitOrder} className="mt-8 grid gap-5">
      <input name="fullName" required placeholder="Full Name" className="rounded-md border border-brand-green/20 px-4 py-3 outline-none focus:border-brand-green" />
      <input name="phone" required placeholder="Phone Number" className="rounded-md border border-brand-green/20 px-4 py-3 outline-none focus:border-brand-green" />
      <input name="email" type="email" required placeholder="Email Address" className="rounded-md border border-brand-green/20 px-4 py-3 outline-none focus:border-brand-green" />
      <textarea name="location" required placeholder="Kindly share your exact location" className="min-h-28 rounded-md border border-brand-green/20 px-4 py-3 outline-none focus:border-brand-green" />
      <label className="grid gap-2 text-sm font-semibold text-brand-ink">
        Quantity
        <div className="flex w-fit overflow-hidden rounded-md border border-brand-green/20 bg-white">
          <button type="button" onClick={() => updateQuantity(quantity - 1)} aria-label="Decrease quantity" className="grid h-12 w-12 place-items-center text-brand-green hover:bg-brand-mint">
            <Minus className="h-4 w-4" />
          </button>
          <input value={quantity} onChange={(event) => updateQuantity(Number(event.target.value))} inputMode="numeric" className="h-12 w-24 border-x border-brand-green/10 text-center font-bold outline-none" />
          <button type="button" onClick={() => updateQuantity(quantity + 1)} aria-label="Increase quantity" className="grid h-12 w-12 place-items-center text-brand-green hover:bg-brand-mint">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </label>
      <div className="grid gap-4 rounded-lg bg-brand-mint p-5 sm:grid-cols-2">
        <Summary label="Product Name" value={order.productName} />
        <Summary label="Quantity" value={String(order.quantity)} />
        <Summary label="Price Per Piece" value={formatMoney(order.pricePerPiece)} />
        <Summary label="Total Transaction" value={formatMoney(order.totalPrice)} />
      </div>
      {error ? <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
      <button disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-green px-6 py-3 text-sm font-semibold text-white disabled:opacity-70">
        {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting Order...</> : "Order Now"}
      </button>
    </form>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-bold text-brand-ink">{value}</p></div>;
}

export function CheckoutForm() {
  return <Suspense fallback={<div className="mt-8 rounded-md bg-brand-mint p-5">Loading checkout...</div>}><CheckoutFormInner /></Suspense>;
}
