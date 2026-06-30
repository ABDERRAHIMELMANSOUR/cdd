import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import Sunburst from "@/components/Sunburst";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("impactnow");
  return {
    title: page.metaTitle || "ImpactNow — Smart Business Platform",
    description: page.metaDesc || undefined,
  };
}

export default async function ImpactNowPage() {
  const page = await getPage("impactnow");
  const c = page.content as any;

  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-brand-dark text-white">
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 opacity-10">
        <Sunburst className="h-[600px] w-[600px]" />
      </div>
      <div className="container-cdd relative py-24 text-center">
        <span className="inline-block rounded-full bg-accent px-4 py-1 text-sm font-bold uppercase tracking-wider text-white">
          {c.status || "Coming Soon"}
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          {c.title || "ImpactNow — Smart Business Platform"}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">{c.subtitle}</p>
        {c.body && <p className="mx-auto mt-4 max-w-2xl text-white/60">{c.body}</p>}

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { t: "IA", d: "Mise en relation intelligente" },
            { t: "Networking", d: "Connexions à fort impact" },
            { t: "Knowledge", d: "Partage d'expertise" },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border border-white/15 bg-white/5 p-6">
              <p className="font-display text-xl font-bold text-accent">{f.t}</p>
              <p className="mt-1 text-sm text-white/70">{f.d}</p>
            </div>
          ))}
        </div>

        <a href="/network/contact" className="btn-accent mt-12">
          Être informé du lancement
        </a>
      </div>
    </section>
  );
}
