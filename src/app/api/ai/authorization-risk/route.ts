import { NextRequest, NextResponse } from "next/server";
import { runAuthorizationRiskAgent } from "@/lib/authorization-agent";
import { requireStaff } from "@/lib/staff-auth";

export async function POST(request: NextRequest) {
  const unauthorized = await requireStaff(request);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json();
    return NextResponse.json(await runAuthorizationRiskAgent({
      diagnosticNotes: String(body.diagnosticNotes || ""),
      lineItemDescription: String(body.lineItemDescription || ""),
      customerExplanation: String(body.customerExplanation || ""),
      partsEstimate: Number(body.partsEstimate),
      laborEstimate: Number(body.laborEstimate),
    }));
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Authorization audit failed." }, { status: 400 });
  }
}
