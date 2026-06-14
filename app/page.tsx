import Image from "next/image";
import { CheckCircle2, Headphones, PackageCheck, ShieldCheck, Star, Truck } from "lucide-react";
import { FlodeskForm } from "@/components/FlodeskForm";
import { Logo } from "@/components/Logo";
import { OrderButton } from "@/components/OrderButton";
import { ProductOrderPanel } from "@/components/ProductOrderPanel";
import { formatMoney, product } from "@/lib/product";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfdf9] text-brand-ink">
      <header className="mx-auto max-w-6xl px-4 pb-4 pt-6 sm:px-6 lg:px-8">
        <Logo />
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 text-center sm:px-6 sm:pb-20 lg:px-8">
        <p className="mx-auto w-fit rounded-full border border-brand-green/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-orange shadow-sm">
          Premium daily shoes at fair prices
        </p>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight text-brand-ink sm:text-6xl lg:text-7xl">
          {product.headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-xl font-semibold text-brand-green sm:text-2xl">
          {product.subHeadline}
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
          {product.description}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#showcase"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-brand-green px-7 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-[#104227] sm:w-auto"
          >
            View Shoes & Order Now
          </a>
          <a
            href="#reviews"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-brand-green/20 bg-white px-7 py-3 text-sm font-bold text-brand-green transition hover:border-brand-green sm:w-auto"
          >
            Read Reviews
          </a>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-lg border border-brand-green/10 bg-white p-4 shadow-soft sm:p-6">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={1070}
            height={1338}
            priority
            loading="eager"
            className="mx-auto max-h-[560px] w-full object-contain"
          />
          <div className="mt-5 grid gap-3 border-t border-brand-green/10 pt-5 sm:grid-cols-3">
            <Trust icon={<PackageCheck className="h-5 w-5" />} label="Cash on Delivery" />
            <Trust icon={<Truck className="h-5 w-5" />} label="Fast delivery" />
            <Trust icon={<Headphones className="h-5 w-5" />} label="Friendly support" />
          </div>
        </div>
      </section>

      <section id="showcase" className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">Limited offer</p>
            <h2 className="mt-3 text-3xl font-black text-brand-ink sm:text-5xl">Choose your pair today</h2>
            <p className="mt-4 max-w-2xl leading-8 text-slate-700">
              A clean, comfortable pair of shoes should not feel overpriced. Order your next pair with Cash on Delivery and pay only when it arrives.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {product.images.map((image, index) => (
                <div key={image} className="rounded-lg border border-brand-green/10 bg-[#f7faf5] p-4 shadow-sm">
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    width={700}
                    height={520}
                    className="aspect-[4/3] w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-brand-green/10 bg-[#fbfdf9] p-5 shadow-soft sm:p-7 lg:sticky lg:top-6 lg:self-start">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">Cash on Delivery Available</p>
            <h3 className="mt-3 text-3xl font-black text-brand-ink">{product.name}</h3>
            <p className="mt-3 leading-7 text-slate-700">{product.description}</p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="text-4xl font-black text-brand-green">{formatMoney(product.offerPrice)}</span>
              <span className="pb-1 text-lg text-slate-400 line-through">{formatMoney(product.regularPrice)}</span>
              <span className="rounded-md bg-brand-orange/10 px-3 py-1 text-sm font-bold text-brand-orange">
                Save {formatMoney(product.regularPrice - product.offerPrice)}
              </span>
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {product.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-brand-green" />
                  {benefit}
                </li>
              ))}
            </ul>

            <ProductOrderPanel />
          </div>
        </div>
      </section>

      <section className="bg-brand-mint py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">Why customers choose us</p>
            <h2 className="mt-3 text-3xl font-black text-brand-ink sm:text-5xl">Simple shoes shopping, without confusion</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Feature icon={<ShieldCheck className="h-6 w-6" />} title="Fair price" text="Get stylish shoes without paying more than you need to." />
            <Feature icon={<Truck className="h-6 w-6" />} title="Easy delivery" text="Place your order online and receive a confirmation call." />
            <Feature icon={<PackageCheck className="h-6 w-6" />} title="Cash on Delivery" text="No online payment needed. Pay when your order arrives." />
          </div>
        </div>
      </section>

      <section id="reviews" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">Customer reviews</p>
              <h2 className="mt-3 text-3xl font-black text-brand-ink sm:text-5xl">Loved by everyday customers</h2>
            </div>
            <OrderButton>Order Now</OrderButton>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {product.testimonials.map((quote) => (
              <article key={quote} className="rounded-lg border border-brand-green/10 bg-[#fbfdf9] p-5">
                <div className="flex gap-1 text-brand-orange">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 leading-7 text-slate-700">"{quote}"</p>
                <p className="mt-4 font-bold text-brand-ink">Verified Customer</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfdf9] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">FAQ</p>
          <h2 className="mt-3 text-3xl font-black text-brand-ink sm:text-5xl">Questions before you order</h2>
          <div className="mt-8 grid gap-3">
            {product.faqs.map(([question, answer]) => (
              <details key={question} className="rounded-lg border border-brand-green/10 bg-white px-5 py-4 shadow-sm">
                <summary className="cursor-pointer font-bold text-brand-ink">{question}</summary>
                <p className="mt-3 leading-7 text-slate-700">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="flodesk-form" className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">Get updates first</p>
            <h2 className="mt-3 text-3xl font-black text-brand-ink sm:text-5xl">
              Join the list for offers and new arrivals
            </h2>
            <p className="mt-4 leading-8 text-slate-700">
              Fill the form and Flodesk will safely save your details. After Flodesk confirms the submission, you will be redirected to the thank-you page.
            </p>
            <div className="mt-6 grid gap-3">
              <Trust icon={<CheckCircle2 className="h-5 w-5" />} label="Real Flodesk form" />
              <Trust icon={<ShieldCheck className="h-5 w-5" />} label="Automation preserved" />
              <Trust icon={<PackageCheck className="h-5 w-5" />} label="Redirects after success" />
            </div>
          </div>

          <FlodeskForm />
        </div>
      </section>

      <section className="bg-brand-green py-16 text-white sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">Ready to order?</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-5xl">Find your next pair today, at a price that feels right.</h2>
          <div className="mt-8">
            <OrderButton className="bg-white text-brand-green hover:bg-brand-mint">Buy Now</OrderButton>
          </div>
        </div>
      </section>
    </main>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-md border border-brand-green/10 bg-white px-3 py-3 text-sm font-bold text-brand-ink">
      <span className="text-brand-green">{icon}</span>
      {label}
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-brand-green/10 bg-white p-6 shadow-sm">
      <div className="grid h-12 w-12 place-items-center rounded-md bg-brand-mint text-brand-green">{icon}</div>
      <h3 className="mt-5 text-xl font-black text-brand-ink">{title}</h3>
      <p className="mt-3 leading-7 text-slate-700">{text}</p>
    </div>
  );
}
