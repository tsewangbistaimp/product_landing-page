"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { formatMoney, product } from "@/lib/product";
import { OrderButton } from "./OrderButton";

export function ProductOrderPanel() {
  const [quantity, setQuantity] = useState(1);
  const total = useMemo(() => quantity * product.offerPrice + product.deliveryFee, [quantity]);

  function updateQuantity(value: number) {
    if (!Number.isFinite(value)) return;
    setQuantity(Math.min(product.maxQuantity, Math.max(1, Math.floor(value))));
  }

  return (
    <div className="mt-8 rounded-lg border border-brand-green/10 bg-brand-mint p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="grid gap-2 text-sm font-semibold text-brand-ink">
          Quantity
          <div className="flex overflow-hidden rounded-md border border-brand-green/20 bg-white">
            <button
              type="button"
              onClick={() => updateQuantity(quantity - 1)}
              aria-label="Decrease quantity"
              className="grid h-12 w-12 place-items-center text-brand-green hover:bg-brand-mint"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              value={quantity}
              onChange={(event) => updateQuantity(Number(event.target.value))}
              inputMode="numeric"
              className="h-12 w-20 border-x border-brand-green/10 text-center font-bold outline-none"
            />
            <button
              type="button"
              onClick={() => updateQuantity(quantity + 1)}
              aria-label="Increase quantity"
              className="grid h-12 w-12 place-items-center text-brand-green hover:bg-brand-mint"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </label>

        <div className="text-left sm:text-right">
          <p className="text-sm text-slate-600">Total transaction</p>
          <p className="text-3xl font-bold text-brand-green">{formatMoney(total)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <OrderButton quantity={quantity}>Buy Now</OrderButton>
        <OrderButton quantity={quantity} className="bg-brand-orange hover:bg-[#c95833]">
          Order {quantity} Pair{quantity > 1 ? "s" : ""}
        </OrderButton>
      </div>
    </div>
  );
}
