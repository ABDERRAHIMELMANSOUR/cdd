import { Suspense } from "react";
import ParticleNetwork from "@/components/ParticleNetwork";
import LanguageSwitcher from "@/components/portal/LanguageSwitcher";
import { getT } from "@/i18n/locale";
import HtmlLang from "@/components/portal/HtmlLang";
import LoginForm from "./LoginForm";

/*
 * A server component, so the locale cookie is read before anything renders and
 * the page arrives already in the reader's language. The form itself stays a
 * client component — it needs state and signIn — and receives the dictionary
 * as a prop rather than reaching for it.
 */
export default function MemberLogin() {
  const { locale, t } = getT();
  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-[#050b16] px-5 py-10">
      <HtmlLang lang={locale} />
      {/*
        The same ground the public site's hero uses, so crossing from
        cddpaysbas.nl into the portal does not feel like arriving somewhere
        else. 100svh rather than 100vh: on mobile Safari 100vh is the height
        WITHOUT the browser chrome, so a full-height panel is taller than the
        visible area and the card sits partly under the toolbar.
      */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#12213f_0%,#050b16_60%)]" />
      <ParticleNetwork className="opacity-90" variant="light" />

      {/* A soft vignette so the nodes thin out behind the card and the form
          never competes with a bright link passing under it. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,11,22,0.55)_0%,transparent_70%)]" />

      {/* Above the card, on the dark ground: someone who cannot read French
          needs the switcher before they read anything else. */}
      <div className="absolute right-4 top-4 z-10">
        <LanguageSwitcher locale={locale} label={t.common.changeLanguage} className="border-white/20 bg-white/10 backdrop-blur" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* useSearchParams needs a Suspense boundary to prerender. */}
        <Suspense fallback={null}>
          <LoginForm locale={locale} t={t} />
        </Suspense>
      </div>
    </main>
  );
}
