import Link from "next/link";
import { MessageCircle, PlayCircle } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function ThanksPage() {
  return (
    <main className="min-h-screen bg-[#fbfdf9] px-4 py-8 text-brand-ink sm:px-6 lg:px-8">
      <Logo />
      <section className="mx-auto mt-10 max-w-3xl rounded-lg border border-brand-green/10 bg-white p-6 text-center shadow-soft sm:p-10">
        <h1 className="text-3xl font-black text-brand-ink sm:text-5xl">Wait... watch the video before you go</h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-700">
          Before your next step, this space can show a short video once your Vimeo link is ready.
        </p>

        <div className="mt-8 grid aspect-video place-items-center rounded-lg border border-dashed border-brand-green/30 bg-brand-mint text-brand-green">
          <div>
            <PlayCircle className="mx-auto h-12 w-12" />
            <p className="mt-3 font-bold">Video coming soon</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-md bg-brand-green px-6 py-3 text-sm font-bold text-white">
            Back to website
          </Link>
          <button className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-md border border-brand-green/20 bg-white px-6 py-3 text-sm font-bold text-brand-green opacity-70">
            <MessageCircle className="h-4 w-4" />
            WhatsApp link coming soon
          </button>
        </div>
      </section>
    </main>
  );
}
