"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TemplateItem = {
  id: number;
  name: string;
  description: string;
  tags: string[];
  category?: string;
  link: string;
  channels: string;
  roles: string;
  rules: string;
};

type ParsedDiscordTemplate = {
  name: string;
  categories: string[];
  channels: string[];
  roles: string[];
  bots: string[];
};

type FormState = {
  name: string;
  tags: string[];
  link: string;
  categories: string;
  channels: string;
  roles: string;
  bots: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const canUseSupabase = Boolean(supabaseUrl && supabaseAnonKey);

const templateTags = [
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
  "봇",
  "성인",
  "미자",
  "소규모",
];

const initialTemplates: TemplateItem[] = [
  {
    id: 1,
    name: "발로란트 내전 서버",
    description: "게임 카테고리",
    tags: ["발로란트", "게임", "내전", "파티모집"],
    category: "게임",
    link: "https://discord.com/developers/docs/resources/guild-template",
    channels: "#공지, #서버규칙, #자기소개, #파티모집, #내전신청, #클립자랑, #자유채팅, #음성대기방",
    roles: "서버장, 관리자, 내전관리자, 성인, 미자, 아이언~브론즈, 실버~골드, 플래~다이아, 초월자 이상",
    rules: "Carl-bot, Ticket Tool, Statbot",
  },
  {
    id: 2,
    name: "롤 듀오·내전 서버",
    description: "게임 카테고리",
    tags: ["롤", "게임", "파티모집", "내전"],
    category: "게임",
    link: "https://discord.com/developers/docs/resources/guild-template",
    channels: "#공지, #서버규칙, #자기소개, #듀오모집, #자랭모집, #내전신청, #자유채팅, #음성대기방",
    roles: "서버장, 관리자, 탑, 정글, 미드, 원딜, 서폿, 브실골, 플다에, 마스터 이상",
    rules: "Carl-bot, MEE6, Statbot",
  },
  {
    id: 3,
    name: "친목 커뮤니티 서버",
    description: "커뮤니티 카테고리",
    tags: ["친목", "커뮤니티", "수다"],
    category: "친목",
    link: "https://discord.com/developers/docs/resources/guild-template",
    channels: "#공지, #규칙, #자기소개, #자유수다, #사진공유, #게임모집, #질문방, #음성채팅",
    roles: "서버장, 관리자, 인증멤버, 신입, 활동멤버, 부스터",
    rules: "Carl-bot, Dyno, Ticket Tool",
  },
];

const emptyForm: FormState = {
  name: "",
  tags: [],
  link: "",
  categories: "",
  channels: "",
  roles: "",
  bots: "",
};

function normalizeTemplate(template: TemplateItem): TemplateItem {
  const tags = Array.isArray(template.tags) ? template.tags : [];
  const categoryTag = template.category && !tags.includes(template.category) ? [template.category] : [];

  return {
    ...template,
    tags: [...categoryTag, ...tags],
  };
}

async function supabaseRequest<T>(path: string, options: RequestInit = {}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
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

export default function TemplatePage() {
  const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTemplates() {
      if (!canUseSupabase) {
        setErrorMessage("Supabase 환경변수를 넣으면 모든 사용자에게 같은 데이터가 보입니다.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await supabaseRequest<TemplateItem[]>("server_templates?select=*&order=id.asc");
        setTemplates(data.length ? data.map(normalizeTemplate) : initialTemplates);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "템플릿을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return templates;

    return templates.filter((template) => {
      const target = [template.name, template.description, template.channels, template.roles, template.rules, template.tags.join(" ")]
        .join(" ")
        .toLowerCase();

      return target.includes(keyword);
    });
  }, [query, templates]);

  function updateForm(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTag(tag: string) {
    setForm((prev) => {
      const hasTag = prev.tags.includes(tag);
      return {
        ...prev,
        tags: hasTag ? prev.tags.filter((item) => item !== tag) : [...prev.tags, tag],
      };
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
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
        categories: data.categories.join(", "),
        channels: data.channels.join(", "),
        roles: data.roles.join(", "),
        bots: data.bots.length ? data.bots.join(", ") : "감지된 봇 없음",
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

    const payload = {
      name: form.name.trim(),
      description: form.categories.trim(),
      tags: form.tags,
      category: form.tags[0] || "기타",
      link: form.link.trim() || "https://discord.com",
      channels: form.channels.trim(),
      roles: form.roles.trim(),
      rules: form.bots.trim(),
    };

    try {
      if (canUseSupabase) {
        if (editingId) {
          const [updated] = await supabaseRequest<TemplateItem[]>(
            `server_templates?id=eq.${editingId}`,
            { method: "PATCH", body: JSON.stringify(payload) },
          );
          setTemplates((prev) => prev.map((item) => (item.id === editingId ? normalizeTemplate(updated) : item)));
        } else {
          const [created] = await supabaseRequest<TemplateItem[]>("server_templates", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          setTemplates((prev) => [normalizeTemplate(created), ...prev]);
        }
      } else {
        const localItem: TemplateItem = { id: editingId ?? Date.now(), ...payload };
        setTemplates((prev) => {
          if (editingId) return prev.map((item) => (item.id === editingId ? localItem : item));
          return [localItem, ...prev];
        });
      }

      resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "저장에 실패했습니다.");
    }
  }

  function editTemplate(template: TemplateItem) {
    setEditingId(template.id);
    setForm({
      name: template.name,
      tags: template.tags,
      link: template.link,
      categories: template.description,
      channels: template.channels,
      roles: template.roles,
      bots: template.rules,
    });
  }

  async function deleteTemplate(id: number) {
    if (!confirm("이 템플릿을 삭제할까요?")) return;

    try {
      if (canUseSupabase) {
        await supabaseRequest<null>(`server_templates?id=eq.${id}`, { method: "DELETE" });
      }

      setTemplates((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    }
  }

  return (
    <main className="min-h-screen bg-[#07080d] px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          홈으로
        </Link>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-zinc-950/70 p-8 shadow-2xl">
          <p className="text-sm font-semibold text-indigo-300">TEMPLATE DIRECTORY</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            디스코드 서버 템플릿
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            템플릿 링크를 넣고 정보를 가져오면 카테고리, 채널, 역할, 사용된 봇을 자동으로 정리합니다.
          </p>

          {errorMessage && (
            <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {errorMessage}
            </p>
          )}

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="태그, 게임, 서버 이름 검색"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
            <h2 className="text-xl font-bold">
              {editingId ? "템플릿 수정" : "템플릿 추가"}
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              링크를 넣고 자동 가져오기를 누른 뒤 추가하면 됩니다.
            </p>

            <div className="mt-5 grid gap-3">
              <input className="rounded-xl border border-white/10 bg-black/40 px-4 py-3" placeholder="템플릿 이름" value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="mb-2 text-sm font-semibold text-zinc-300">태그 선택</p>
                <div className="flex flex-wrap gap-2">
                  {templateTags.map((tag) => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${form.tags.includes(tag) ? "bg-indigo-500 text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <input className="rounded-xl border border-white/10 bg-black/40 px-4 py-3" placeholder="서버 템플릿 링크" value={form.link} onChange={(event) => updateForm("link", event.target.value)} />
              <button onClick={parseTemplateLink} disabled={isParsing} className="rounded-xl border border-indigo-400/40 bg-indigo-500/10 px-4 py-3 font-semibold text-indigo-100 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60">
                {isParsing ? "가져오는 중" : "템플릿 정보 가져오기"}
              </button>

              {(form.categories || form.channels || form.roles || form.bots) && (
                <div className="overflow-hidden rounded-xl border border-white/10 text-xs text-zinc-300">
                  <table className="w-full text-left">
                    <tbody>
                      <tr className="border-b border-white/10">
                        <th className="w-20 bg-white/[0.03] px-3 py-2 text-white">카테고리</th>
                        <td className="px-3 py-2">{form.categories || "없음"}</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <th className="w-20 bg-white/[0.03] px-3 py-2 text-white">채널</th>
                        <td className="px-3 py-2">{form.channels || "없음"}</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <th className="w-20 bg-white/[0.03] px-3 py-2 text-white">역할</th>
                        <td className="px-3 py-2">{form.roles || "없음"}</td>
                      </tr>
                      <tr>
                        <th className="w-20 bg-white/[0.03] px-3 py-2 text-white">사용 봇</th>
                        <td className="px-3 py-2">{form.bots || "없음"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={saveTemplate} className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400">
                {editingId ? "수정 저장" : "추가"}
              </button>
              {editingId && (
                <button onClick={resetForm} className="rounded-xl border border-white/10 px-4 py-3 text-zinc-300 hover:bg-white/5">
                  취소
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {isLoading && <p className="text-zinc-400">템플릿을 불러오는 중입니다.</p>}
            {!isLoading && filteredTemplates.map((template) => (
              <article key={template.id} className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70">
                <div className="border-b border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {template.tags.map((tag) => (
                          <span key={tag} className="rounded-lg bg-indigo-500/10 px-2 py-1 text-xs font-semibold text-indigo-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="mt-3 text-xl font-bold">{template.name}</h2>
                    </div>
                    <a href={template.link} target="_blank" rel="noreferrer" className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-bold hover:bg-indigo-400">
                      템플릿 링크
                    </a>
                  </div>
                </div>

                <div className="space-y-4 p-5 text-sm leading-6 text-zinc-300">
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-left text-xs">
                      <tbody>
                        <tr className="border-b border-white/10">
                          <th className="w-20 bg-white/[0.03] px-3 py-2 text-white">카테고리</th>
                          <td className="px-3 py-2">{template.description || "없음"}</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <th className="w-20 bg-white/[0.03] px-3 py-2 text-white">채널</th>
                          <td className="px-3 py-2">{template.channels || "없음"}</td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <th className="w-20 bg-white/[0.03] px-3 py-2 text-white">역할</th>
                          <td className="px-3 py-2">{template.roles || "없음"}</td>
                        </tr>
                        <tr>
                          <th className="w-20 bg-white/[0.03] px-3 py-2 text-white">사용 봇</th>
                          <td className="px-3 py-2">{template.rules || "없음"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => editTemplate(template)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5">
                      수정
                    </button>
                    <button onClick={() => deleteTemplate(template.id)} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10">
                      삭제
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
