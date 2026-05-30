import { NextRequest, NextResponse } from "next/server";

const adminPassword = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  const password = request.headers.get("x-admin-password") || "";

  if (!adminPassword || !password || password !== adminPassword) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
