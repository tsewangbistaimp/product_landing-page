"use client";

import { useRouter } from "next/navigation";
import { product } from "@/lib/product";

export function OrderButton({ quantity = 1, children, className = "" }: { quantity?: number; children: React.ReactNode; className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        const total = quantity * product.offerPrice + product.deliveryFee;
        router.push(`/checkout?product=${encodeURIComponent(product.name)}&quantity=${quantity}&price=${product.offerPrice}&total=${total}`);
      }}
      className={`inline-flex min-h-12 items-center justify-center rounded-md bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-[#104227] ${className}`}
    >
      {children}
    </button>
  );
}
