import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";
import "./autorepair.css";
import "./auth-overrides.css";
import "./workflow-overrides.css";
import "./integration-overrides.css";

export const metadata: Metadata = {
  title: "UMKM Pintar — Asisten AI untuk Usaha Kecil Indonesia",
  description:
    "Platform AI yang membantu UMKM Indonesia membuat konten pemasaran, mencatat keuangan, dan menganalisis bisnis — cukup dengan bahasa sehari-hari.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
