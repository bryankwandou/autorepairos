"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, LogIn, Wrench } from "lucide-react";
export function SiteHeader(){const path=usePathname();if(path.startsWith("/approve/"))return null;const staff=path.startsWith("/dashboard")||path.startsWith("/work-orders")||path.startsWith("/agent-lab")||path.startsWith("/verification");return <header className="site-header"><div className="shell nav-shell"><Link className="brand" href="/"><span className="brand-icon"><Wrench/><Check/></span>AutoRepairOS</Link><nav><Link href="/">Product</Link><Link href="/dashboard">Dashboard</Link><Link href="/agent-lab">Agent Lab</Link><Link href="/verification">Devnet Proof</Link></nav><Link className="button button-primary button-small" href={staff?"/":"/login"}><LogIn/> {staff?"Public site":"Staff sign in"}</Link></div></header>}
