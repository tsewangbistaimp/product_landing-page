import Image from "next/image";
import { product } from "@/lib/product";

export function Logo() {
  return (
    <div className="flex justify-center">
      <Image
        src="/brand/tse-logo.png"
        alt={product.brandName}
        width={210}
        height={160}
        priority
        className="h-auto w-32 object-contain sm:w-40"
      />
    </div>
  );
}
