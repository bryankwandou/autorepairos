import { NextResponse } from "next/server";
import { verifyAndRecordProof } from "@/lib/verification-store";
export async function POST(request:Request){try{const body=await request.json();return NextResponse.json(await verifyAndRecordProof(String(body.signature||""),String(body.publicKey||"")),{status:201});}catch(error){return NextResponse.json({message:error instanceof Error?error.message:"Verification failed."},{status:400});}}
