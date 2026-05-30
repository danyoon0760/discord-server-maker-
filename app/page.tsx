"use client";

import { useEffect, useMemo, useState } from "react";

type TemplateItem = {
  id: number;
  name: string;
  category?: string;
  link: string;
};

type BotItem = {
  id: number;
  name: string;
  description: string;
  link: string;
};

type HomeCard = {
  id: string;
  type: "bot" | "template";
  title: string;
  description: string;
  href: string;
  buttonText: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const canUseSupabase = Boolean(supabaseUrl && supabaseAnonKey);

const fallbackBots: BotItem[] = [
  {
    id: -1,
    name: "Bump Buddy",
    description: "서버 bump와 홍보 흐름을 관리할 때 쓰기 좋은 서버 성장 보조 봇입니다.",
    link: "https://discord.com/discovery/applications",
  },
  {
    id: -2,
    name: "DISBOARD",
    description: "디스코드 서버 홍보와 검색에 많이 쓰이는 대표적인 서버 리스트 봇입니다.",
    link: "https://disboard.org/",
  },
  {
    id: -3,
    name: "Dyno",
    description: "자동 제재, 관리 명령어, 로그, 역할 관리 등 기본 운영 기능이 강한 종합 관리 봇입니다.",
    link: "https://dyno.gg/",
  },
];

async function supabaseRequest<T>(path: string) {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    cache: "no-store",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("목록을 불러오지 못했습니다.");
  return (await response.json()) as T;
}

function getSummary(value?: string) {
  return value?.trim() || "설명이 아직 없습니다.";
}

export default function Home() {
  const [recentTemplates, setRecentTemplates] = useState<TemplateItem[]>([]);
  const [recentBots, setRecentBots] = useState<BotItem[]>(fallbackBots);

  useEffect(() => {
    if (!canUseSupabase) return;

    Promise.all([
      supabaseRequest<TemplateItem[]>("server_templates?select=id,name,category,link&order=id.desc&limit=6"),
      supabaseRequest<BotItem[]>("discord_bots?select=id,name,description,link&order=id.desc&limit=6"),
    ])
      .then(([templates, bots]) => {
        setRecentTemplates(templates);
        setRecentBots(bots.length ? bots : fallbackBots);
      })
      .catch(() => {
        setRecentTemplates([]);
        setRecentBots(fallbackBots);
      });
  }, []);

  const cards = useMemo<HomeCard[]>(() => {
    const botCards = recentBots.slice(0, 3).map((bot) => ({
      id: `bot-${bot.id}`,
      type: "bot" as const,
      title: bot.name,
      description: getSummary(bot.description),
      href: bot.link || "/bots",
      buttonText: "초대 링크",
    }));

    const templateCards = recentTemplates.slice(0, 6).map((template) => ({
      id: `template-${template.id}`,
      type: "template" as const,
      title: template.name,
      description: getSummary(template.category),
      href: template.link || "/template",
      buttonText: "템플릿 링크",
    }));

    return [...botCards, ...templateCards];
  }, [recentBots, recentTemplates]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#07080d] text-white">
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <section className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16">
        <div className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-8 shadow-2xl backdrop-blur md:p-10">
          <p className="mb-3 text-sm font-semibold text-indigo-300">디스코드 서버 운영 도구</p>

          <h1 className="text-5xl font-black tracking-tight md:text-7xl">디스코드 서버 메이커</h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300">
            디스코드 서버 템플릿과 운영 봇을 한곳에서 찾는 사이트입니다.
            서버 템플릿 링크를 통해 채널·역할 구조를 미리 확인하고,
            목적에 맞는 봇을 빠르게 비교할 수 있습니다.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/template" className="rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-400">
              서버 템플릿 보기
            </a>
            <a href="/bots" className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-zinc-200 hover:bg-white/10">
              봇 추천 보기
            </a>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article key={card.id} className="flex h-[250px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur">
              <div className="border-b border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="min-w-0 truncate text-xl font-bold">{card.title}</h2>
                  <a
                    href={card.href}
                    target={card.href.startsWith("http") ? "_blank" : undefined}
                    rel={card.href.startsWith("http") ? "noreferrer" : undefined}
                    className="shrink-0 rounded-full bg-indigo-500 px-4 py-2 text-sm font-bold hover:bg-indigo-400"
                  >
                    {card.buttonText}
                  </a>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-5 text-sm text-zinc-300">
                <p className="line-clamp-3 leading-7 text-zinc-300">{card.description}</p>
                <a href={card.type === "bot" ? "/bots" : "/template"} className="w-fit rounded-lg border border-white/10 px-3 py-2 text-xs text-indigo-200 hover:bg-white/5">
                  자세히 보기
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
