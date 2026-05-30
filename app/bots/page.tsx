"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type BotItem = {
  id: number;
  name: string;
  description: string;
  tags: string[];
  category?: string;
  link: string;
};

type BotFormState = {
  name: string;
  description: string;
  tags: string[];
  link: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const canUseSupabase = Boolean(supabaseUrl && supabaseAnonKey);
const adminStorageKey = "discord-server-maker-admin-password";

const botTags = [
  "역할",
  "인증",
  "관리",
  "티켓",
  "문의",
  "신고",
  "레벨",
  "활동",
  "로그",
  "보안",
  "음악",
  "TTS",
  "통계",
  "자동화",
  "환영",
  "경고",
  "백업",
  "게임",
  "홍보",
  "카운터",
  "한국어",
];

const initialBots: BotItem[] = [
  {
    id: -1,
    name: "Bump Buddy",
    description: "서버 bump와 홍보 흐름을 관리할 때 쓰기 좋은 서버 성장 보조 봇입니다.",
    tags: ["홍보", "자동화", "관리"],
    category: "홍보",
    link: "https://discord.com/discovery/applications",
  },
  {
    id: -2,
    name: "DISBOARD",
    description: "디스코드 서버 홍보와 검색에 많이 쓰이는 대표적인 서버 리스트 봇입니다.",
    tags: ["홍보", "서버", "커뮤니티"],
    category: "홍보",
    link: "https://disboard.org/",
  },
  {
    id: -3,
    name: "Dyno",
    description: "자동 제재, 관리 명령어, 로그, 역할 관리 등 기본 운영 기능이 강한 종합 관리 봇입니다.",
    tags: ["관리", "로그", "자동화", "경고"],
    category: "관리",
    link: "https://dyno.gg/",
  },
  {
    id: -4,
    name: "eTeBot",
    description: "모드 서버나 커뮤니티에서 사용할 수 있는 서버 운영 보조 봇입니다.",
    tags: ["관리", "자동화", "한국어"],
    category: "관리",
    link: "https://discord.com/discovery/applications",
  },
  {
    id: -5,
    name: "Jockie Music",
    description: "여러 음악 봇을 함께 운영할 수 있는 디스코드 음악 재생 봇입니다.",
    tags: ["음악"],
    category: "음악",
    link: "https://www.jockiemusic.com/",
  },
  {
    id: -6,
    name: "LeaderBoard",
    description: "서버 활동량과 순위표를 보여주는 리더보드 기능용 봇입니다.",
    tags: ["레벨", "활동", "통계"],
    category: "활동",
    link: "https://leaderboard.run/",
  },
  {
    id: -7,
    name: "ServerStats",
    description: "멤버 수, 온라인 수, 서버 통계 등을 카운터 채널로 표시할 때 쓰는 봇입니다.",
    tags: ["통계", "카운터", "관리"],
    category: "통계",
    link: "https://serverstatsbot.com/",
  },
  {
    id: -8,
    name: "만냥",
    description: "한국 서버에서 자주 쓰이는 종합 기능 봇입니다. 명령어 기반 운영 보조용으로 정리해둘 만합니다.",
    tags: ["한국어", "관리", "자동화"],
    category: "한국어",
    link: "https://discord.com/discovery/applications",
  },
  {
    id: -9,
    name: "알로항",
    description: "서버에서 함께하기, 안내, 편의 기능을 제공하는 한국어 봇입니다.",
    tags: ["한국어", "관리", "자동화"],
    category: "한국어",
    link: "https://discord.com/discovery/applications",
  },
  {
    id: -10,
    name: "연홍",
    description: "디스코드 음성 채널에서 텍스트를 읽어주는 한국어 TTS 봇입니다.",
    tags: ["TTS", "한국어", "음성"],
    category: "TTS",
    link: "https://discord.com/discovery/applications",
  },
  {
    id: -11,
    name: "티토커",
    description: "텍스트를 음성으로 읽어주는 TTS 봇입니다. 음성방 안내나 대화 보조용으로 사용할 수 있습니다.",
    tags: ["TTS", "한국어", "음성"],
    category: "TTS",
    link: "https://discord.com/discovery/applications",
  },
];

const emptyForm: BotFormState = {
  name: "",
  description: "",
  tags: [],
  link: "",
};

function uniqueTags(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

function normalizeBot(bot: BotItem): BotItem {
  return {
    ...bot,
    tags: uniqueTags(Array.isArray(bot.tags) ? bot.tags : []),
    description: bot.description || "설명이 아직 없습니다.",
    link: bot.link || "https://discord.com",
  };
}

function mergeBots(databaseBots: BotItem[]) {
  const seen = new Set(databaseBots.map((bot) => bot.name.trim().toLowerCase()));
  const defaults = initialBots.filter((bot) => !seen.has(bot.name.trim().toLowerCase()));
  return [...databaseBots, ...defaults];
}

function makeBotSummary(bot: BotItem) {
  return bot.description || "설명이 아직 없습니다.";
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

async function verifyAdminPassword(password: string) {
  try {
    await adminRequest("/api/admin/check", password, { method: "POST" });
    return true;
  } catch {
    return false;
  }
}

export default function BotsPage() {
  const [bots, setBots] = useState<BotItem[]>(initialBots);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<BotFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedBot, setSelectedBot] = useState<BotItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isAdmin = Boolean(adminPassword);

  const loadBots = useCallback(async () => {
    if (!canUseSupabase) {
      setErrorMessage("Supabase 환경변수를 넣으면 모든 사용자에게 같은 데이터가 보입니다.");
      setBots(initialBots);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await supabaseRequest<BotItem[]>("discord_bots?select=*&order=id.desc");
      setBots(mergeBots(data.map(normalizeBot)));
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "봇 목록을 불러오지 못했습니다.");
      setBots(initialBots);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedPassword = window.localStorage.getItem(adminStorageKey) || "";

    if (savedPassword) {
      verifyAdminPassword(savedPassword).then((ok) => {
        if (ok) {
          setAdminPassword(savedPassword);
        } else {
          window.localStorage.removeItem(adminStorageKey);
          setAdminPassword("");
        }
      });
    }

    loadBots();
  }, [loadBots]);

  const filteredBots = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return bots;

    return bots.filter((bot) => {
      const target = [bot.name, bot.description, bot.tags.join(" ")]
        .join(" ")
        .toLowerCase();

      return target.includes(keyword);
    });
  }, [query, bots]);

  function updateForm(field: keyof BotFormState, value: string) {
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

  async function loginAdmin() {
    if (isAdmin) {
      window.localStorage.removeItem(adminStorageKey);
      setAdminPassword("");
      return;
    }

    const password = window.prompt("관리자 비밀번호");
    if (!password) return;

    const ok = await verifyAdminPassword(password);

    if (!ok) {
      window.localStorage.removeItem(adminStorageKey);
      setAdminPassword("");
      alert("관리자 비밀번호가 틀렸습니다.");
      return;
    }

    window.localStorage.setItem(adminStorageKey, password);
    setAdminPassword(password);
  }

  async function saveBot() {
    if (!adminPassword) {
      alert("관리자 로그인이 필요합니다.");
      return;
    }

    if (!form.name.trim()) {
      alert("봇 이름을 입력해주세요.");
      return;
    }

    const cleanedTags = uniqueTags(form.tags);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || "설명이 아직 없습니다.",
      tags: cleanedTags,
      category: cleanedTags[0] || "기타",
      link: form.link.trim() || "https://discord.com",
    };

    setIsSaving(true);

    try {
      if (editingId) {
        await adminRequest("/api/admin/bots", adminPassword, {
          method: "PATCH",
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        await adminRequest("/api/admin/bots", adminPassword, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      await loadBots();
      resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  function editBot(bot: BotItem) {
    if (!isAdmin || bot.id < 0) return;

    setEditingId(bot.id);
    setForm({
      name: bot.name,
      description: bot.description,
      tags: uniqueTags(bot.tags),
      link: bot.link,
    });
    setIsFormOpen(true);
  }

  async function deleteBot(id: number) {
    if (id < 0) return;

    if (!adminPassword) {
      alert("관리자 로그인이 필요합니다.");
      return;
    }

    if (!confirm("이 봇을 삭제할까요?")) return;

    try {
      await adminRequest(`/api/admin/bots?id=${id}`, adminPassword, { method: "DELETE" });
      await loadBots();
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
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-300">BOT DIRECTORY</p>
              <h1 className="mt-3 text-4xl font-black md:text-5xl">
                디스코드 봇 추천
              </h1>
              <p className="mt-4 max-w-2xl text-zinc-400">
                디스코드 운영에 쓰기 좋은 봇을 태그와 설명으로 정리합니다.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={openCreateForm}
                className="rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-400"
              >
                봇 추가
              </button>
            )}
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {errorMessage}
            </p>
          )}

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="봇 이름, 태그, 목적 검색"
            className="mt-6 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400"
          />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && <p className="text-zinc-400">봇 목록을 불러오는 중입니다.</p>}
          {!isLoading && filteredBots.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 text-sm text-zinc-400">
              아직 등록된 봇이 없습니다.
            </div>
          )}
          {!isLoading && filteredBots.map((bot) => (
            <article key={bot.id} className="flex h-[270px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70">
              <div className="border-b border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold">{bot.name}</h2>
                  </div>
                  <a href={bot.link} target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-indigo-500 px-4 py-2 text-sm font-bold hover:bg-indigo-400">
                    초대 링크
                  </a>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5 text-sm text-zinc-300">
                <p className="line-clamp-3 min-h-[84px] leading-7 text-zinc-300">
                  {makeBotSummary(bot)}
                </p>

                <div className="flex gap-2 pt-4">
                  <button onClick={() => setSelectedBot(bot)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-indigo-200 hover:bg-white/5">
                    자세히 보기
                  </button>
                  {isAdmin && bot.id > 0 && (
                    <button onClick={() => editBot(bot)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5">
                      수정
                    </button>
                  )}
                  {isAdmin && bot.id > 0 && (
                    <button onClick={() => deleteBot(bot.id)} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10">
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {isFormOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0c12] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-indigo-300">BOT FORM</p>
                <h2 className="mt-2 text-3xl font-black">{editingId ? "봇 수정" : "봇 추가"}</h2>
              </div>
              <button onClick={resetForm} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
                닫기
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              <input className="rounded-xl border border-white/10 bg-black/40 px-4 py-3" placeholder="봇 이름" value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="mb-2 text-sm font-semibold text-zinc-300">태그 선택</p>
                <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
                  {botTags.map((tag) => (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${form.tags.includes(tag) ? "bg-indigo-500 text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <input className="rounded-xl border border-white/10 bg-black/40 px-4 py-3" placeholder="초대 링크 또는 공식 링크" value={form.link} onChange={(event) => updateForm("link", event.target.value)} />
              <textarea className="min-h-28 rounded-xl border border-white/10 bg-black/40 px-4 py-3" placeholder="봇 설명" value={form.description} onChange={(event) => updateForm("description", event.target.value)} />
            </div>

            <div className="mt-5 flex gap-2">
              <button disabled={isSaving} onClick={saveBot} className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? "저장 중" : editingId ? "수정 저장" : "추가"}
              </button>
              {editingId && (
                <button onClick={resetForm} className="rounded-xl border border-white/10 px-4 py-3 text-zinc-300 hover:bg-white/5">
                  취소
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0c12] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-indigo-300">봇 상세</p>
                <h2 className="mt-2 text-3xl font-black">{selectedBot.name}</h2>
              </div>
              <button onClick={() => setSelectedBot(null)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
                닫기
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedBot.tags.map((tag) => (
                <span key={tag} className="rounded-lg bg-indigo-500/10 px-2 py-1 text-xs font-semibold text-indigo-200">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-zinc-300">
              {selectedBot.description}
            </div>

            <a href={selectedBot.link} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-xl bg-indigo-500 px-4 py-3 text-sm font-bold hover:bg-indigo-400">
              초대 링크 열기
            </a>
          </div>
        </div>
      )}

      <button onClick={loginAdmin} className="fixed bottom-3 right-3 z-40 text-[10px] text-zinc-700 transition hover:text-zinc-400">
        {isAdmin ? "admin on" : "admin"}
      </button>
    </main>
  );
}
