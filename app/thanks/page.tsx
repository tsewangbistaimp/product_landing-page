import Link from "next/link";
import { CheckCircle2, MessageCircle, PlayCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { formatMoney, product } from "@/lib/product";

export default async function ThanksPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const productName = String(params.product || product.name);
  const quantity = String(params.quantity || "1");
  const total = Number(params.total || product.offerPrice);

  return (
    <main className="min-h-screen bg-[#fbfdf9] px-4 py-8 text-brand-ink sm:px-6 lg:px-8">
      <Logo />

      <section className="mx-auto mt-10 max-w-4xl rounded-lg border border-brand-green/10 bg-white p-6 text-center shadow-soft sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-mint text-brand-green">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        <h1 className="mt-6 text-3xl font-black text-brand-ink sm:text-5xl">
          Wait... watch the video before you go
        </h1>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-700">
          Before your order confirmation, please watch this short video so you know what to do next.
        </p>

        <div className="mt-8 overflow-hidden rounded-lg border border-brand-green/10 bg-brand-mint shadow-sm">
          <div className="grid aspect-video place-items-center px-5 text-brand-green">
            <div>
              <PlayCircle className="mx-auto h-14 w-14" />
              <p className="mt-3 text-lg font-black">Video coming soon</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-700">
                Send me your Vimeo link later and I will embed the video here.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 rounded-lg bg-[#fbfdf9] p-5 text-left sm:grid-cols-2">
          <Summary label="Product ordered" value={productName} />
          <Summary label="Quantity" value={quantity} />
          <Summary label="Total transaction" value={formatMoney(total)} />
          <Summary label="Payment method" value="Cash On Delivery" />
        </div>

        <p className="mx-auto mt-6 max-w-2xl leading-7 text-slate-700">
          Thank you for your order. Our sales representative will call you soon to confirm your details.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            disabled
            className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-brand-green px-6 py-3 text-sm font-bold text-white opacity-70"
          >
            <MessageCircle className="h-4 w-4" />
            Chat with me on WhatsApp
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-brand-green/20 bg-white px-6 py-3 text-sm font-bold text-brand-green transition hover:border-brand-green"
          >
            Back to website
          </Link>
        </div>
      </section>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-brand-green/10 bg-white px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-black text-brand-ink">{value}</p>
    </div>
  );
}
