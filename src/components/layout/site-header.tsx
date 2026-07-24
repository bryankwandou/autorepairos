"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, LogIn, Wrench } from "lucide-react";
export function SiteHeader(){const path=usePathname();if(path.startsWith("/approve/"))return null;const staff=["/dashboard","/work-orders","/agent-lab","/authorization-agent","/verification"].some(prefix=>path.startsWith(prefix));return <header className="site-header"><div className="shell nav-shell"><Link className="brand" href="/"><span className="brand-icon"><Wrench/><Check/></span>AutoRepairOS</Link><nav><Link href="/dashboard">Dashboard</Link><Link href="/agent-lab">Diagnostic AI</Link><Link href="/authorization-agent">Authorization AI</Link><Link href="/verification">Wallet Proof</Link><Link href="/system-proof">System Proof</Link></nav><Link className="button button-primary button-small" href={staff?"/":"/login"}><LogIn/> {staff?"Public site":"Staff sign in"}</Link></div></header>}
