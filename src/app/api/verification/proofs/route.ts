import { NextResponse } from "next/server";
import { getDevnetProofs } from "@/lib/verification-store";
export async function GET(){return NextResponse.json({network:"devnet",proofs:getDevnetProofs()})}
