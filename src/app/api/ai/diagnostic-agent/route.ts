import { NextRequest,NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff-auth";
import { runDiagnosticAgent } from "@/lib/groq-agent";
export async function POST(request:NextRequest){const unauthorized=await requireStaff(request);if(unauthorized)return unauthorized;try{const body=await request.json();const notes=String(body.notes||"").trim();if(notes.length<12)throw new Error("Provide specific measured technician findings.");return NextResponse.json(await runDiagnosticAgent(notes));}catch(error){return NextResponse.json({message:error instanceof Error?error.message:"Agent request failed."},{status:400});}}
