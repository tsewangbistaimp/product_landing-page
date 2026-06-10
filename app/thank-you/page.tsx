import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { formatMoney, product } from "@/lib/product";

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const productName = String(params.product || product.name);
  const quantity = String(params.quantity || "1");
  const total = Number(params.total || product.offerPrice);
  return (
    <main className="min-h-screen bg-[#fbfdf9]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <Logo />
        <section className="mt-10 rounded-lg border border-brand-green/10 bg-white p-6 text-center shadow-soft sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-mint text-brand-green"><CheckCircle2 className="h-9 w-9" /></div>
          <h1 className="mt-6 text-3xl font-bold text-brand-ink sm:text-4xl">Thank you for your order!</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-700">Our sales representative will call you soon to confirm your order.</p>
          <div className="mt-8 grid gap-3 rounded-lg bg-brand-mint p-5 sm:grid-cols-2">
            <Summary label="Product ordered" value={productName} />
            <Summary label="Quantity" value={quantity} />
            <Summary label="Total price" value={formatMoney(total)} />
            <Summary label="Payment method" value="Cash On Delivery" />
          </div>
          <Link href="/" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-brand-green px-6 py-3 text-sm font-semibold text-white">Continue Shopping</Link>
        </section>
      </div>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-white px-4 py-3 text-left"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-bold text-brand-ink">{value}</p></div>;
}
