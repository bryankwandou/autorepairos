import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";
import "./autorepair.css";
import "./auth-overrides.css";
import "./workflow-overrides.css";
import "./integration-overrides.css";

export const metadata: Metadata = {
  title: "AutoRepairOS — Approval-First Repair Operations",
  description: "Approval-gated repair orders, grounded AI diagnostics, authorization risk review, and verifiable Solana devnet proof for independent auto shops.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader/>{children}</body></html>;
}
