import { WalletVerificationClient } from "@/components/wallet-verification-client";
import { getDevnetProofs } from "@/lib/verification-store";
export const dynamic="force-dynamic";
export default function VerificationPage(){return <WalletVerificationClient initialProofs={getDevnetProofs()}/>}
