import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { verifyAuthToken } from "@/lib/jwt";

export async function requireStaff(request:NextRequest){const token=request.cookies.get(AUTH_COOKIE_NAME)?.value;const payload=token?await verifyAuthToken(token):null;return payload?null:NextResponse.json({message:"Staff authentication required."},{status:401});}
