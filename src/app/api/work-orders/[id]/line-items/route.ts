import { NextRequest, NextResponse } from "next/server";
import { createLineItem } from "@/lib/autorepair";
import { requireStaff } from "@/lib/staff-auth";
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){const unauthorized=await requireStaff(request);if(unauthorized)return unauthorized;try{const {id}=await params;const body=await request.json();return NextResponse.json(createLineItem(id,{description:String(body.description||""),explanation:String(body.explanation||""),partsEstimate:Number(body.partsEstimate||0),laborEstimate:Number(body.laborEstimate||0)}),{status:201});}catch(error){return NextResponse.json({message:error instanceof Error?error.message:"Unable to create item."},{status:400});}}
