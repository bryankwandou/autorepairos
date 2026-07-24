import { NextRequest, NextResponse } from "next/server";
import { logLabor, logPart } from "@/lib/autorepair";
import { requireStaff } from "@/lib/staff-auth";
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){const unauthorized=await requireStaff(request);if(unauthorized)return unauthorized;try{const {id}=await params;const body=await request.json();const result=body.type==="parts"?logPart(id,String(body.partName||""),Number(body.actualCost||0)):logLabor(id,Number(body.minutes||30));return NextResponse.json(result,{status:result.allowed?201:409});}catch(error){return NextResponse.json({message:error instanceof Error?error.message:"Unable to log work."},{status:400});}}
