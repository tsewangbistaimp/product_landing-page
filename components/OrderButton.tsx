"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { product } from "@/lib/product";

type DiscountQuery = {
  code: string;
  percent: number;
};

const discountStorageKey = "tb_spin_discount";

export function OrderButton({
  quantity = 1,
  children,
  className = "",
  discount
}: {
  quantity?: number;
  children: React.ReactNode;
  className?: string;
  discount?: DiscountQuery | null;
}) {
  const router = useRouter();
  const [savedDiscount, setSavedDiscount] = useState<DiscountQuery | null>(null);
  const activeDiscount = discount || savedDiscount;

  useEffect(() => {
    if (discount) return;

    function readDiscount() {
      try {
        const saved = window.localStorage.getItem(discountStorageKey);
        setSavedDiscount(saved ? (JSON.parse(saved) as DiscountQuery) : null);
      } catch {
        setSavedDiscount(null);
      }
    }

    readDiscount();
    window.addEventListener("spin-discount-applied", readDiscount);
    window.addEventListener("storage", readDiscount);
    return () => {
      window.removeEventListener("spin-discount-applied", readDiscount);
      window.removeEventListener("storage", readDiscount);
    };
  }, [discount]);

  return (
    <button
      type="button"
      onClick={() => {
        const params = new URLSearchParams({
          product: product.name,
          quantity: String(quantity),
          price: String(product.offerPrice),
          total: String(quantity * product.offerPrice + product.deliveryFee)
        });

        if (activeDiscount?.code && activeDiscount.percent) {
          params.set("discountCode", activeDiscount.code);
          params.set("discountPercent", String(activeDiscount.percent));
        }

        router.push(`/checkout?${params.toString()}`);
      }}
      className={`inline-flex min-h-12 items-center justify-center rounded-md bg-brand-green px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-[#104227] ${className}`}
    >
      {children}
    </button>
  );
}
