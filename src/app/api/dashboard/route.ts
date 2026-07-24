import { NextRequest, NextResponse } from "next/server";
import { getDashboard } from "@/lib/autorepair";
import { requireStaff } from "@/lib/staff-auth";
export async function GET(request:NextRequest){const unauthorized=await requireStaff(request);if(unauthorized)return unauthorized;return NextResponse.json(getDashboard());}
