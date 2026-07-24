import { SystemProofClient } from "@/components/system-proof-client";
import { getSystemStatus } from "@/lib/system-status";

export const dynamic = "force-dynamic";

export default function SystemProofPage() {
  return <SystemProofClient status={getSystemStatus()}/>;
}
