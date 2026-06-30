import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "CDD Pays-Bas — Club des Dirigeants",
    template: "%s — CDD Pays-Bas",
  },
  description:
    "Le Club des Dirigeants aux Pays-Bas : un réseau d'affaires francophone qui rassemble entrepreneurs et dirigeants.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "CDD Pays-Bas",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
