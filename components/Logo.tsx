import { product } from "@/lib/product";

export function Logo() {
  return <div className="text-2xl font-black tracking-tight text-brand-green">{product.brandName}</div>;
}
