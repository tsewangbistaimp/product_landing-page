import Image from "next/image";
import { CheckCircle2, Headphones, PackageCheck, Star, Truck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { OrderButton } from "@/components/OrderButton";
import { ProductOrderPanel } from "@/components/ProductOrderPanel";
import { formatMoney, product } from "@/lib/product";

export default function Home() {
  return (
    <main className="product-shell min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
        <OrderButton>Order Now</OrderButton>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-orange">Premium daily wear shoes</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight text-brand-ink sm:text-6xl">{product.headline}</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">{product.description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <OrderButton>Purchase Now</OrderButton>
            <a href="#showcase" className="inline-flex min-h-12 items-center justify-center rounded-md border border-brand-green/20 bg-white px-6 py-3 text-sm font-semibold text-brand-green">View Details</a>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Trust icon={<PackageCheck className="h-5 w-5" />} label="Cash on Delivery" />
            <Trust icon={<Truck className="h-5 w-5" />} label="Fast delivery" />
            <Trust icon={<Headphones className="h-5 w-5" />} label="Customer support" />
          </div>
        </div>
        <div className="rounded-lg border border-brand-green/10 bg-white p-6 shadow-soft">
          <Image src={product.images[0]} alt={product.name} width={1000} height={800} priority loading="eager" className="aspect-[4/3] w-full object-contain" />
          <div className="mt-5 flex items-center justify-between border-t border-brand-green/10 pt-5">
            <div><p className="text-sm text-slate-500">Offer price</p><p className="text-2xl font-bold text-brand-green">{formatMoney(product.offerPrice)}</p></div>
            <p className="rounded-md bg-brand-orange/10 px-3 py-2 text-sm font-semibold text-brand-orange">Free delivery</p>
          </div>
        </div>
      </section>

      <section id="showcase" className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {product.images.map((image, index) => (
              <div key={image} className="rounded-lg border border-brand-green/10 bg-[#f7faf5] p-4 shadow-sm">
                <Image src={image} alt={`${product.name} ${index + 1}`} width={700} height={520} className="aspect-[4/3] w-full object-contain" />
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-orange">Cash on Delivery Available</p>
            <h2 className="mt-3 text-4xl font-bold text-brand-ink">{product.name}</h2>
            <p className="mt-4 leading-7 text-slate-700">{product.description}</p>
            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="text-4xl font-bold text-brand-green">{formatMoney(product.offerPrice)}</span>
              <span className="pb-1 text-lg text-slate-400 line-through">{formatMoney(product.regularPrice)}</span>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {product.benefits.map((benefit) => <li key={benefit} className="flex items-center gap-2 text-sm font-medium text-slate-700"><CheckCircle2 className="h-4 w-4 text-brand-green" />{benefit}</li>)}
            </ul>
            <ProductOrderPanel />
          </div>
        </div>
      </section>

      <section className="bg-[#fbfdf9] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-brand-ink sm:text-4xl">Made for daily comfort and style</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {product.benefits.map((benefit) => <div key={benefit} className="rounded-lg border border-brand-green/10 bg-white p-5 shadow-sm"><CheckCircle2 className="h-6 w-6 text-brand-green" /><p className="mt-4 font-semibold">{benefit}</p></div>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-brand-ink sm:text-4xl">Loved by everyday customers</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {product.testimonials.map((quote) => (
              <article key={quote} className="rounded-lg border border-brand-green/10 bg-[#fbfdf9] p-5">
                <div className="flex gap-1 text-brand-orange">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <p className="mt-4 leading-7 text-slate-700">"{quote}"</p>
                <p className="mt-4 font-semibold">Verified Customer</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-mint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-brand-ink sm:text-4xl">Questions before you order</h2>
          <div className="mt-8 grid gap-3">
            {product.faqs.map(([question, answer]) => <details key={question} className="rounded-lg border border-brand-green/10 bg-white px-5 py-4 shadow-sm"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-3 leading-7 text-slate-700">{answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="bg-brand-green py-16 text-white sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-orange">Cash on Delivery</p><h2 className="mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">Order today and pay only when it arrives.</h2></div>
          <OrderButton className="bg-white text-brand-green hover:bg-brand-mint">Purchase Now</OrderButton>
        </div>
      </section>
    </main>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex items-center gap-2 rounded-md border border-brand-green/10 bg-white/80 px-3 py-3 text-sm font-semibold"><span className="text-brand-green">{icon}</span>{label}</div>;
}
