import { notFound } from "next/navigation";
import Link from "next/link";
import { getPage } from "@/lib/content";
import { AdminHeader } from "@/components/admin/ui";
import { Field, TextArea, ImageField, SubmitButton } from "@/components/admin/form";
import { updatePageContent } from "../actions";

export const dynamic = "force-dynamic";

const VALID = ["home", "about", "impactnow", "membership", "contact"];

function toPairLines(arr: any[] | undefined, keys: [string, string]) {
  return (arr ?? []).map((o) => `${o[keys[0]] ?? ""} | ${o[keys[1]] ?? ""}`).join("\n");
}

export default async function PageEditor({ params }: { params: { key: string } }) {
  if (!VALID.includes(params.key)) notFound();
  const page = await getPage(params.key);
  const c = page.content as any;

  return (
    <>
      <AdminHeader title={`Éditer : ${page.title}`} />
      <form action={updatePageContent} className="space-y-6">
        <input type="hidden" name="key" value={params.key} />
        <input type="hidden" name="pageTitle" value={page.title} />

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Contenu</h3>
          <div className="grid gap-5">
            {params.key === "home" && (
              <>
                <Field label="Hero — Titre" name="heroTitle" defaultValue={c.hero?.title} />
                <TextArea label="Hero — Sous-titre" name="heroSubtitle" defaultValue={c.hero?.subtitle} rows={2} />
                <ImageField label="Hero — Image (optionnel)" name="heroImage" defaultValue={c.hero?.image} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Bouton principal — texte" name="primaryLabel" defaultValue={c.hero?.primaryButton?.label} />
                  <Field label="Bouton principal — lien" name="primaryHref" defaultValue={c.hero?.primaryButton?.href} />
                  <Field label="Bouton secondaire — texte" name="secondaryLabel" defaultValue={c.hero?.secondaryButton?.label} />
                  <Field label="Bouton secondaire — lien" name="secondaryHref" defaultValue={c.hero?.secondaryButton?.href} />
                </div>
                <TextArea label="Statistiques" name="stats" defaultValue={toPairLines(c.stats, ["value", "label"])} rows={4} help="Format : valeur | libellé (une par ligne)" />
                <TextArea label="Sections" name="sections" defaultValue={toPairLines(c.sections, ["title", "text"])} rows={4} help="Format : titre | texte (une par ligne)" />
              </>
            )}

            {params.key === "about" && (
              <>
                <TextArea label="Introduction" name="intro" defaultValue={c.intro} rows={3} />
                <TextArea label="Contenu" name="body" defaultValue={c.body} rows={8} />
                <TextArea label="Valeurs" name="values" defaultValue={toPairLines(c.values, ["title", "text"])} rows={4} help="Format : titre | texte (une par ligne)" />
              </>
            )}

            {params.key === "impactnow" && (
              <>
                <Field label="Titre" name="title2" defaultValue={c.title} />
                <TextArea label="Sous-titre" name="subtitle" defaultValue={c.subtitle} rows={2} />
                <TextArea label="Texte" name="body" defaultValue={c.body} rows={3} />
                <Field label="Badge de statut" name="status" defaultValue={c.status ?? "Coming Soon"} />
              </>
            )}

            {params.key === "membership" && (
              <>
                <TextArea label="Introduction" name="intro" defaultValue={c.intro} rows={3} />
                <TextArea label="Avantages" name="benefits" defaultValue={(c.benefits ?? []).join("\n")} rows={5} help="Un avantage par ligne." />
              </>
            )}

            {params.key === "contact" && (
              <TextArea label="Introduction" name="intro" defaultValue={c.intro} rows={3} />
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">SEO</h3>
          <div className="grid gap-5">
            <Field label="Meta title" name="metaTitle" defaultValue={page.metaTitle} />
            <TextArea label="Meta description" name="metaDesc" defaultValue={page.metaDesc} rows={2} />
            <ImageField label="Image Open Graph" name="ogImage" defaultValue={page.ogImage} />
          </div>
        </div>

        <div className="flex gap-3">
          <SubmitButton />
          <Link href="/admin/pages" className="btn-ghost">Annuler</Link>
        </div>
      </form>
    </>
  );
}
