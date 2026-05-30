"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BotItem = {
  id: number;
  name: string;
  description: string;
  tags: string[];
  category: string;
  link: string;
};

type BotFormState = Omit<BotItem, "id">;

const STORAGE_KEY = "discord-server-maker-bots";

const botCategories = [
  "역할 / 인증",
  "티켓 / 문의",
  "레벨 / 활동",
  "관리 / 로그",
  "음악",
  "TTS",
  "보안",
  "통계",
  "기타",
];

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
];

const initialBots: BotItem[] = [
  {
    id: 1,
    name: "Carl-bot",
    description:
      "리액션 역할, 자동 역할, 기본 관리 기능에 많이 쓰이는 운영 봇입니다.",
    tags: ["역할", "인증", "관리"],
    category: "역할 / 인증",
    link: "https://carl.gg/",
  },
  {
    id: 2,
    name: "Ticket Tool",
    description:
      "문의방, 신고방, 신청방을 자동으로 열고 닫을 수 있는 티켓 봇입니다.",
    tags: ["티켓", "문의", "신고"],
    category: "티켓 / 문의",
    link: "https://tickettool.xyz/",
  },
  {
    id: 3,
    name: "Statbot",
    description:
      "메시지 수, 음성 활동, 서버 활동량을 통계로 확인할 수 있는 봇입니다.",
    tags: ["통계", "활동", "분석"],
    category: "레벨 / 활동",
    link: "https://statbot.net/",
  },
  {
    id: 4,
    name: "YAGPDB",
    description:
      "자동 역할, 관리 명령어, 로그 기능을 세밀하게 설정할 수 있는 봇입니다.",
    tags: ["관리", "로그", "자동화"],
    category: "관리 / 로그",
    link: "https://yagpdb.xyz/",
  },
];

const emptyForm: BotFormState = {
  name: "",
  description: "",
  tags: [],
  category: "역할 / 인증",
  link: "",
};

function readStoredBots() {
  if (typeof window === "undefined") return initialBots;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialBots;

    const parsed = JSON.parse(saved) as BotItem[];
    return Array.isArray(parsed) ? parsed : initialBots;
  } catch {
    return initialBots;
  }
}

export default function BotsPage() {
  const [bots, setBots] = useState<BotItem[]>(initialBots);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<BotFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setBots(readStoredBots());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bots));
  }, [bots, isLoaded]);

  const filteredBots = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return bots;

    return bots.filter((bot) => {
      const target = [bot.name, bot.description, bot.category, bot.tags.join(" ")]
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

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function saveBot() {
    if (!form.name.trim()) {
      alert("봇 이름을 입력해주세요.");
      return;
    }

    const nextBot: BotItem = {
      id: editingId ?? Date.now(),
      name: form.name.trim(),
      description: form.description.trim() || "설명이 아직 없습니다.",
      tags: form.tags,
      category: form.category,
      link: form.link.trim() || "https://discord.com",
    };

    setBots((prev) => {
      if (editingId) {
        return prev.map((item) => (item.id === editingId ? nextBot : item));
      }

      return [nextBot, ...prev];
    });

    resetForm();
  }

  function editBot(bot: BotItem) {
    setEditingId(bot.id);
    setForm({
      name: bot.name,
      description: bot.description,
      tags: bot.tags,
      category: bot.category,
      link: bot.link,
    });
  }

  function deleteBot(id: number) {
    setBots((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  }

  function resetAllBots() {
    if (!confirm("저장된 봇 목록을 초기 데이터로 되돌릴까요?")) return;
    setBots(initialBots);
    resetForm();
  }

  return (
    <main className="min-h-screen bg-[#07080d] px-6 py-10 text-white">
      <section className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          홈으로
        </Link>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-zinc-950/70 p-8 shadow-2xl">
          <p className="text-sm font-semibold text-indigo-300">BOT DIRECTORY</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">
            디스코드 봇 추천
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            추가·수정·삭제한 봇 목록은 이 브라우저에 저장됩니다. 같은
            기기에서 새로고침해도 유지됩니다.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="봇 이름, 태그, 목적 검색"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-indigo-400"
            />
            <button
              onClick={resetAllBots}
              className="rounded-2xl border border-white/10 px-5 py-4 text-sm font-semibold text-zinc-300 hover:bg-white/5"
            >
              초기화
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
            <h2 className="text-xl font-bold">{editingId ? "봇 수정" : "봇 추가"}</h2>
            <p className="mt-2 text-sm text-zinc-500">
              분류와 태그는 직접 입력이 아니라 선택 방식으로 바꿨습니다.
            </p>

            <div className="mt-5 grid gap-3">
              <input className="rounded-xl border border-white/10 bg-black/40 px-4 py-3" placeholder="봇 이름" value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
              <select className="rounded-xl border border-white/10 bg-black/40 px-4 py-3" value={form.category} onChange={(event) => updateForm("category", event.target.value)}>
                {botCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <p className="mb-2 text-sm font-semibold text-zinc-300">태그 선택</p>
                <div className="flex flex-wrap gap-2">
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

            <div className="mt-4 flex gap-2">
              <button onClick={saveBot} className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400">
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
            {filteredBots.map((bot) => (
              <article key={bot.id} className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70">
                <div className="border-b border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-emerald-300">● {bot.category}</p>
                      <h2 className="mt-2 text-xl font-bold">{bot.name}</h2>
                    </div>
                    <a href={bot.link} target="_blank" rel="noreferrer" className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-bold hover:bg-indigo-400">
                      초대 링크
                    </a>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {bot.tags.map((tag) => (
                      <span key={tag} className="rounded-lg bg-indigo-500/10 px-2 py-1 text-xs font-semibold text-indigo-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 p-5 text-sm leading-6 text-zinc-300">
                  <p>{bot.description}</p>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => editBot(bot)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5">
                      수정
                    </button>
                    <button onClick={() => deleteBot(bot.id)} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10">
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
