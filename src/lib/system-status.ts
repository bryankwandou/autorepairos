import { getDevnetProofs } from "@/lib/verification-store";

export function getSystemStatus() {
  const proofs = getDevnetProofs();
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://autorepairos.vercel.app";
  return {
    product: "AutoRepairOS",
    status: "operational" as const,
    productionUrl,
    repositoryUrl: "https://github.com/bryankwandou/autorepairos",
    commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_BUILD_COMMIT || "local-development",
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    region: process.env.VERCEL_REGION || "local",
    ai: {
      configured: Boolean(process.env.GROQ_API_KEY),
      provider: "Groq",
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      agents: ["Diagnostic grounding", "Authorization risk"],
    },
    solana: {
      network: "devnet" as const,
      rpcConfigured: Boolean(process.env.NEXT_PUBLIC_SOLANA_RPC_URL),
      verifiedProofs: proofs.length,
      latestProof: proofs[0] || null,
    },
    controls: {
      customerApprovalGate: true,
      staffSessionProtection: true,
      serverSideDevnetVerification: true,
      midRepairReapproval: true,
    },
    checkedAt: new Date().toISOString(),
  };
}
