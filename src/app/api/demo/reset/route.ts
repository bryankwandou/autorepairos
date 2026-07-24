import { NextRequest, NextResponse } from "next/server";
import { resetDemo } from "@/lib/autorepair";
import { requireStaff } from "@/lib/staff-auth";
export async function POST(request:NextRequest){const unauthorized=await requireStaff(request);if(unauthorized)return unauthorized;resetDemo();return NextResponse.json({reset:true});}
