import type { Metadata } from "next";
import { getPage, getSiteSettings } from "@/lib/content";
import { PageHeader } from "@/components/ui";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("contact");
  return { title: page.metaTitle || "Contact", description: page.metaDesc || undefined };
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPage("contact"), getSiteSettings()]);
  const c = page.content as any;

  return (
    <>
      <PageHeader eyebrow="Échangeons" title="Contact" subtitle={c.intro} />
      <section className="section">
        <div className="container-cdd grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-display text-2xl font-bold text-brand">Nos coordonnées</h2>
            <ul className="mt-6 space-y-4 text-gray-700">
              {settings.email && (
                <li>
                  <span className="block text-sm font-semibold text-gray-400">Email</span>
                  <a href={`mailto:${settings.email}`} className="text-brand hover:underline">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li>
                  <span className="block text-sm font-semibold text-gray-400">Téléphone</span>
                  {settings.phone}
                </li>
              )}
              {settings.address && (
                <li>
                  <span className="block text-sm font-semibold text-gray-400">Adresse</span>
                  {settings.address}
                </li>
              )}
              {settings.linkedin && (
                <li>
                  <span className="block text-sm font-semibold text-gray-400">LinkedIn</span>
                  <a href={settings.linkedin} target="_blank" rel="noreferrer" className="text-brand hover:underline">
                    Notre page LinkedIn
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="card p-8">
            <h2 className="mb-6 font-display text-xl font-bold text-brand">Écrivez-nous</h2>
            <ContactForm type="contact" />
          </div>
        </div>
      </section>
    </>
  );
}
