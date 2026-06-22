import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "MGD Catálogo PRO", template: "%s | MGD Catálogo PRO" },
  description: "Crie seu catálogo profissional e venda pelo WhatsApp.",
  openGraph: {
    title: "MGD Catálogo PRO",
    description: "Crie seu catálogo profissional e venda pelo WhatsApp.",
    url: siteUrl,
    siteName: "MGD Catálogo PRO",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

