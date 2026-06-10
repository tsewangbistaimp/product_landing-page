import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { CheckoutForm } from "@/components/CheckoutForm";
import { Logo } from "@/components/Logo";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#fbfdf9]">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between"><Logo /><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green"><ArrowLeft className="h-4 w-4" />Back</Link></div>
        <section className="mt-8 rounded-lg border border-brand-green/10 bg-white p-5 shadow-soft sm:p-8">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 flex-none place-items-center rounded-md bg-brand-mint text-brand-green"><ShieldCheck className="h-5 w-5" /></div>
            <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-orange">Secure COD checkout</p><h1 className="mt-2 text-3xl font-bold text-brand-ink sm:text-4xl">Complete your order</h1><p className="mt-3 max-w-2xl leading-7 text-slate-700">Fill in your details. Your product, quantity, and price are already selected from the landing page.</p></div>
          </div>
          <CheckoutForm />
        </section>
      </div>
    </main>
  );
}
