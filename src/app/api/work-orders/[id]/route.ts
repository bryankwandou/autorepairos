import { NextRequest, NextResponse } from "next/server";
import { getWorkOrder } from "@/lib/autorepair";
import { requireStaff } from "@/lib/staff-auth";
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){const unauthorized=await requireStaff(request);if(unauthorized)return unauthorized;const {id}=await params;const order=getWorkOrder(id);return order?NextResponse.json(order):NextResponse.json({message:"Work order not found."},{status:404});}
