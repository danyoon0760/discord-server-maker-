import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

function isAdmin(request: NextRequest) {
  const password = request.headers.get("x-admin-password") || "";
  return Boolean(adminPassword && password && password === adminPassword);
}

async function supabaseAdminRequest<T>(path: string, options: RequestInit = {}) {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("관리자용 Supabase 환경변수가 설정되지 않았습니다.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Supabase 관리자 요청에 실패했습니다.");
  }

  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "관리자 권한이 없습니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = await supabaseAdminRequest("server_templates", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "템플릿 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "관리자 권한이 없습니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...payload } = body;

    if (!id) {
      return NextResponse.json({ error: "수정할 템플릿 id가 없습니다." }, { status: 400 });
    }

    const data = await supabaseAdminRequest(`server_templates?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "템플릿 수정에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "관리자 권한이 없습니다." }, { status: 401 });
  }

  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "삭제할 템플릿 id가 없습니다." }, { status: 400 });
    }

    await supabaseAdminRequest(`server_templates?id=eq.${id}`, { method: "DELETE" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "템플릿 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
