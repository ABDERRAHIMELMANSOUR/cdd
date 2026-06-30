import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import { PageHeader } from "@/components/ui";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("membership");
  return { title: page.metaTitle || "Devenir membre", description: page.metaDesc || undefined };
}

export default async function MembershipPage() {
  const page = await getPage("membership");
  const c = page.content as any;
  const benefits: string[] = c.benefits ?? [];

  return (
    <>
      <PageHeader eyebrow="Rejoignez-nous" title="Devenir membre" subtitle={c.intro} />
      <section className="section">
        <div className="container-cdd grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-brand">Vos avantages</h2>
            <ul className="mt-6 space-y-3">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L9 11.6l6.3-6.3a1 1 0 0 1 1.4 0Z" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-8">
            <h2 className="mb-6 font-display text-xl font-bold text-brand">Demande d'adhésion</h2>
            <ContactForm type="membership" />
          </div>
        </div>
      </section>
    </>
  );
}
