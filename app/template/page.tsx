"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type TemplateItem = {
  id: number;
  name: string;
  description: string;
  tags: string[];
  category?: string;
  link: string;
  channels: string;
  roles: string;
  rules?: string;
};

type ParsedDiscordTemplate = {
  name: string;
  categories: string[];
  channels: string[];
  roles: string[];
};

type FormState = {
  name: string;
  summary: string;
  link: string;
  categories: string;
  channels: string;
  roles: string;
};

type ChannelGroup = {
  name: string;
  channels: string[];
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const canUseSupabase = Boolean(supabaseUrl && supabaseAnonKey);
const adminStorageKey = "discord-server-maker-admin-password";

const emptyForm: FormState = {
  name: "",
  summary: "",
  link: "",
  categories: "",
  channels: "",
  roles: "",
};

const oldTagValues = new Set([
  "발로란트",
  "롤",
  "게임",
  "친목",
  "커뮤니티",
  "내전",
  "파티모집",
  "수다",
  "음성",
  "학급",
  "공부",
  "팬서버",
  "운영",
  "인증",
  "성인",
  "미자",
  "소규모",
  "기타",
]);

function normalizeTemplate(template: TemplateItem): TemplateItem {
  return {
    ...template,
    tags: [],
    category: template.category || "",
    description: template.description || "",
    channels: template.channels || "",
    roles: template.roles || "",
    link: template.link || "https://discord.com",
  };
}

function getTemplateSummary(template: TemplateItem) {
  const value = (template.category || "").trim();
  if (!value || oldTagValues.has(value)) return "설명이 아직 없습니다.";
  return value;
}

function joinList(values: string[]) {
  return values.filter(Boolean).join("\n");
}

function splitList(value: string) {
  return value
    .split(/\n|,(?=\s*[^#🔊📢🧵])/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function previewList(value: string, max = 2) {
  const items = splitList(value);
  if (items.length === 0) return "없음";

  const shown = items.slice(0, max).join(", ");
  const hiddenCount = items.length - max;
  return hiddenCount > 0 ? `${shown} 외 ${hiddenCount}개` : shown;
}

function countText(value: string, label: string) {
  return `${label} ${splitList(value).length}개`;
}

function cleanChannelName(channel: string) {
  return channel
    .replace(/^#\s*/, "")
    .replace(/^🔊\s*/, "")
    .replace(/^📢\s*/, "")
    .replace(/^🧵\s*/, "")
    .trim();
}

function getChannelIcon(channel: string) {
  if (channel.includes("🔊")) return "🔊";
  if (channel.includes("📢")) return "#";
  if (channel.includes("🧵")) return "#";
  return "#";
}

function getChannelGroups(template: TemplateItem): ChannelGroup[] {
  const categories = splitList(template.description);
  const channels = splitList(template.channels);
  const groups = new Map<string, string[]>();

  categories.forEach((category) => groups.set(category, []));

  channels.forEach((channel) => {
    const slashIndex = channel.indexOf(" / ");
    const hasCategory = slashIndex > -1;
    const categoryName = hasCategory ? channel.slice(0, slashIndex).trim() : categories[0] || "기타";
    const channelName = hasCategory ? channel.slice(slashIndex + 3).trim() : channel;

    if (!groups.has(categoryName)) groups.set(categoryName, []);
    groups.get(categoryName)?.push(channelName);
  });

  return Array.from(groups.entries())
    .map(([name, groupChannels]) => ({ name, channels: groupChannels }))
    .filter((group) => group.name || group.channels.length > 0);
}

function DiscordChannelPreview({ template }: { template: TemplateItem }) {
  const groups = getChannelGroups(template);
  const channelCount = splitList(template.channels).length;
  const categoryCount = splitList(template.description).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#11131a] p-4">
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-indigo-300">
          <span>채널 기능 {channelCount}개</span>
          <span className="text-zinc-500">카테고리 {categoryCount}개</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-4/5 rounded-full bg-emerald-400" />
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-[#0b0c12] p-3">
        {groups.length ? (
          groups.map((group) => (
            <div key={group.name}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                ˅ {group.name}
              </p>
              <div className="space-y-2">
                {group.channels.length ? (
                  group.channels.map((channel) => (
                    <div key={`${group.name}-${channel}`} className="flex items-center gap-2 text-sm text-zinc-300">
                      <span className="w-5 shrink-0 text-center text-zinc-500">{getChannelIcon(channel)}</span>
                      <span className="truncate">{cleanChannelName(channel)}</span>
                      <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-600">채널 없음</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-zinc-500">채널 정보가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

function RolePreview({ roles }: { roles: string }) {
  const roleItems = splitList(roles);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#11131a] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold text-white">역할 구성</p>
        <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-zinc-400">{roleItems.length}개</span>
      </div>
      {roleItems.length ? (
        <div className="flex max-h-[430px] flex-wrap content-start gap-2 overflow-y-auto pr-1">
          {roleItems.map((role) => (
            <span key={role} className="rounded-lg bg-white/5 px-2 py-1 text-xs text-zinc-300">
              {role}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">역할 정보가 없습니다.</p>
      )}
    </div>
  );
}

async function supabaseRequest<T>(path: string, options: RequestInit = {}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Supabase 요청에 실패했습니다.");
  }

  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

async function adminRequest(path: string, password: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": password,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "관리자 요청에 실패했습니다.");
  }

  return data;
}

export default function TemplatePage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isAdmin = Boolean(adminPassword);

  const loadTemplates = useCallback(async () => {
    if (!canUseSupabase) {
      setErrorMessage("Supabase 환경변수를 넣으면 모든 사용자에게 같은 데이터가 보입니다.");
      setTemplates([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await supabaseRequest<TemplateItem[]>("server_templates?select=*&order=id.desc");
      setTemplates(data.map(normalizeTemplate));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "템플릿을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setAdminPassword(window.localStorage.getItem(adminStorageKey) || "");
    loadTemplates();
  }, [loadTemplates]);

  const filteredTemplates = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return templates;

    return templates.filter((template) => {
      const target = [template.name, getTemplateSummary(template), template.description, template.channels, template.roles]
        .join(" ")
        .toLowerCase();
      return target.includes(keyword);
    });
  }, [query, templates]);

  function updateForm(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(true);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  }

  function loginAdmin() {
    if (isAdmin) {
      window.localStorage.removeItem(adminStorageKey);
      setAdminPassword("");
      return;
    }

    const password = window.prompt("관리자 비밀번호");
    if (!password) return;

    window.localStorage.setItem(adminStorageKey, password);
    setAdminPassword(password);
  }

  async function parseTemplateLink() {
    if (!form.link.trim()) {
      alert("서버 템플릿 링크를 먼저 입력해주세요.");
      return;
    }

    setIsParsing(true);

    try {
      const response = await fetch(`/api/discord-template?template=${encodeURIComponent(form.link)}`);
      const data = (await response.json()) as ParsedDiscordTemplate | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "템플릿 정보를 가져오지 못했습니다.");
      }

      setForm((prev) => ({
        ...prev,
        name: prev.name.trim() || data.name,
        categories: joinList(data.categories),
        channels: joinList(data.channels),
        roles: joinList(data.roles),
      }));
    } catch (error) {
      alert(error instanceof Error ? error.message : "템플릿 정보를 가져오지 못했습니다.");
    } finally {
      setIsParsing(false);
    }
  }

  async function saveTemplate() {
    if (!form.name.trim()) {
      alert("템플릿 이름을 입력해주세요.");
      return;
    }

    if (!form.link.trim()) {
      alert("서버 템플릿 링크를 입력해주세요.");
      return;
    }

    if (!form.categories.trim() && !form.channels.trim() && !form.roles.trim()) {
      alert("템플릿 정보 가져오기를 먼저 눌러주세요.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.categories.trim(),
      tags: [],
      category: form.summary.trim(),
      link: form.link.trim(),
      channels: form.channels.trim(),
      roles: form.roles.trim(),
      rules: "",
    };

    setIsSaving(true);

    try {
      if (editingId) {
        if (!adminPassword) {
          alert("수정은 관리자 로그인이 필요합니다.");
          return;
        }

        await adminRequest("/api/admin/templates", adminPassword, {
          method: "PATCH",
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        await supabaseRequest<TemplateItem[]>("server_templates", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      await loadTemplates();
      resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  function editTemplate(template: TemplateItem) {
    if (!isAdmin) return;

    const summary = getTemplateSummary(template);
    setEditingId(template.id);
    setForm({
      name: template.name,
      summary: summary === "설명이 아직 없습니다." ? "" : summary,
      link: template.link,
      categories: template.description,
      channels: template.channels,
      roles: template.roles,
    });
    setIsFormOpen(true);
  }

  async function deleteTemplate(id: number) {
    if (!adminPassword) {
      alert("관리자 로그인이 필요합니다.");
      return;
    }

    if (!confirm("이 템플릿을 삭제할까요?")) return;

    try {
      await adminRequest(`/api/admin/templates?id=${id}`, adminPassword, { method: "DELETE" });
      await loadTemplates();
      if (editingId === id) resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    }
  }

  return (
    <main className="min-h-screen bg-[#07080d] px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">홈으로</Link>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-zinc-950/70 p-8 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-300">TEMPLATE DIRECTORY</p>
              <h1 className="mt-3 text-4xl font-black md:text-5xl">디스코드 서버 템플릿</h1>
              <p className="mt-4 max-w-2xl text-zinc-400">템플릿 링크를 넣으면 카테고리, 채널, 역할을 자동으로 요약합니다.</p>
            </div>
            <button onClick={openCreateForm} className="rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-400">템플릿 추가</button>
          </div>

          {errorMessage && <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{errorMessage}</p>}

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="설명, 서버 이름, 채널 검색"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400"
          />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && <p className="text-zinc-400">템플릿을 불러오는 중입니다.</p>}
          {!isLoading && filteredTemplates.length === 0 && <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 text-sm text-zinc-400">아직 등록된 템플릿이 없습니다.</div>}
          {!isLoading && filteredTemplates.map((template) => (
            <article key={template.id} className="flex h-[270px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70">
              <div className="border-b border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0"><h2 className="truncate text-xl font-bold">{template.name}</h2></div>
                  <a href={template.link} target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-indigo-500 px-4 py-2 text-sm font-bold hover:bg-indigo-400">템플릿 링크</a>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-5 text-sm text-zinc-300">
                <p className="line-clamp-3 min-h-[84px] whitespace-pre-line leading-7 text-zinc-300">{getTemplateSummary(template)}</p>
                <div className="flex gap-2 pt-4">
                  <button onClick={() => setSelectedTemplate(template)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-indigo-200 hover:bg-white/5">자세히 보기</button>
                  {isAdmin && <button onClick={() => editTemplate(template)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5">수정</button>}
                  {isAdmin && <button onClick={() => deleteTemplate(template.id)} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10">삭제</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0c12] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-semibold text-indigo-300">TEMPLATE FORM</p><h2 className="mt-2 text-3xl font-black">{editingId ? "템플릿 수정" : "템플릿 추가"}</h2></div>
              <button onClick={resetForm} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">닫기</button>
            </div>
            <div className="mt-6 grid gap-3">
              <input className="rounded-xl border border-white/10 bg-black/40 px-4 py-3" placeholder="템플릿 이름" value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
              <textarea className="min-h-24 rounded-xl border border-white/10 bg-black/40 px-4 py-3" placeholder="설명" value={form.summary} onChange={(event) => updateForm("summary", event.target.value)} />
              <input className="rounded-xl border border-white/10 bg-black/40 px-4 py-3" placeholder="서버 템플릿 링크" value={form.link} onChange={(event) => updateForm("link", event.target.value)} />
              <button onClick={parseTemplateLink} disabled={isParsing} className="rounded-xl border border-indigo-400/40 bg-indigo-500/10 px-4 py-3 font-semibold text-indigo-100 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60">{isParsing ? "가져오는 중" : "템플릿 정보 가져오기"}</button>
              {(form.categories || form.channels || form.roles) && <div className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-zinc-300"><p><span className="font-bold text-white">카테고리</span> {previewList(form.categories, 2)}</p><p><span className="font-bold text-white">채널</span> {countText(form.channels, "채널")}</p><p><span className="font-bold text-white">역할</span> {countText(form.roles, "역할")}</p></div>}
            </div>
            <div className="mt-5 flex gap-2">
              <button disabled={isSaving} onClick={saveTemplate} className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "저장 중" : editingId ? "수정 저장" : "추가"}</button>
              {editingId && <button onClick={resetForm} className="rounded-xl border border-white/10 px-4 py-3 text-zinc-300 hover:bg-white/5">취소</button>}
            </div>
          </div>
        </div>
      )}

      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0c12] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-indigo-300">템플릿 상세</p>
                <h2 className="mt-2 text-3xl font-black">{selectedTemplate.name}</h2>
              </div>
              <button onClick={() => setSelectedTemplate(null)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">닫기</button>
            </div>

            <p className="mt-5 whitespace-pre-line rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-zinc-300">{getTemplateSummary(selectedTemplate)}</p>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
              <DiscordChannelPreview template={selectedTemplate} />
              <RolePreview roles={selectedTemplate.roles} />
            </div>

            <div className="mt-5 flex justify-end">
              <a href={selectedTemplate.link} target="_blank" rel="noreferrer" className="rounded-xl bg-indigo-500 px-4 py-3 text-sm font-bold hover:bg-indigo-400">템플릿 링크 열기</a>
            </div>
          </div>
        </div>
      )}

      <button onClick={loginAdmin} className="fixed bottom-3 right-3 z-40 text-[10px] text-zinc-700 transition hover:text-zinc-400">
        {isAdmin ? "admin on" : "admin"}
      </button>
    </main>
  );
}
