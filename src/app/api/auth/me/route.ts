import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const payload = await authenticateRequest(request);
  if (!payload) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: payload.userId,
      email: payload.email,
    },
  });
}
