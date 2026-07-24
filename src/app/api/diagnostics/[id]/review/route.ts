import { NextRequest, NextResponse } from "next/server";
import { reviewDiagnostic } from "@/lib/autorepair";
import { requireStaff } from "@/lib/staff-auth";
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){const unauthorized=await requireStaff(request);if(unauthorized)return unauthorized;try{const {id}=await params;return NextResponse.json(reviewDiagnostic(id));}catch(error){return NextResponse.json({message:error instanceof Error?error.message:"Unable to review."},{status:400});}}
