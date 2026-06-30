import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return { title: page.metaTitle || "À propos", description: page.metaDesc || undefined };
}

export default async function AboutPage() {
  const page = await getPage("about");
  const c = page.content as any;
  const values: { title: string; text: string }[] = c.values ?? [];

  return (
    <>
      <PageHeader eyebrow="Qui sommes-nous" title="CDD Pays-Bas" subtitle={c.intro} />
      <section className="section">
        <div className="container-cdd max-w-3xl">
          {c.intro && <p className="text-lg leading-relaxed text-gray-700">{c.intro}</p>}
          {c.body && (
            <div className="prose mt-6 max-w-none whitespace-pre-line text-gray-600">{c.body}</div>
          )}
        </div>
      </section>

      {values.length > 0 && (
        <section className="section bg-brand-50">
          <div className="container-cdd">
            <h2 className="heading mb-10 text-center">Nos valeurs</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {values.map((v, i) => (
                <div key={i} className="card p-7 text-center">
                  <h3 className="font-display text-xl font-bold text-brand">{v.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
