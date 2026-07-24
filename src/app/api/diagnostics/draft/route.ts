import { NextRequest, NextResponse } from "next/server";
import { draftDiagnostic } from "@/lib/autorepair";
import { requireStaff } from "@/lib/staff-auth";
import { runDiagnosticAgent } from "@/lib/groq-agent";
export async function POST(request:NextRequest){const unauthorized=await requireStaff(request);if(unauthorized)return unauthorized;try{const body=await request.json();const notes=String(body.notes||"");const agent=await runDiagnosticAgent(notes);if(agent.unsupportedUrgencyDetected)throw new Error("Agent output introduced unsupported urgency and was rejected.");const summary=agent.finding+" "+agent.customerExplanation+" "+agent.recommendedAction;return NextResponse.json({...draftDiagnostic(String(body.workOrderId||""),notes,summary),agent},{status:201});}catch(error){return NextResponse.json({message:error instanceof Error?error.message:"Unable to draft diagnostic."},{status:400});}}
