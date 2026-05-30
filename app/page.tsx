"use client";

import { useEffect, useState } from "react";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const canUseSupabase = Boolean(supabaseUrl && supabaseAnonKey);

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

  if (!response.ok) throw new Error("최근 목록을 불러오지 못했습니다.");
  return (await response.json()) as T;
}

function getSummary(value?: string) {
  return value?.trim() || "설명이 아직 없습니다.";
}

export default function Home() {
  const [recentTemplates, setRecentTemplates] = useState<TemplateItem[]>([]);
  const [recentBots, setRecentBots] = useState<BotItem[]>([]);

  useEffect(() => {
    if (!canUseSupabase) return;

    Promise.all([
      supabaseRequest<TemplateItem[]>("server_templates?select=id,name,category,link&order=id.desc&limit=3"),
      supabaseRequest<BotItem[]>("discord_bots?select=id,name,description,link&order=id.desc&limit=3"),
    ])
      .then(([templates, bots]) => {
        setRecentTemplates(templates);
        setRecentBots(bots);
      })
      .catch(() => {
        setRecentTemplates([]);
        setRecentBots([]);
      });
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#07080d] text-white">
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <section className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16">
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

        <div className="grid gap-4 md:grid-cols-2">
          <a href="/template" className="group rounded-2xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur hover:border-indigo-400/60">
            <p className="text-sm font-semibold text-indigo-300">SERVER TEMPLATE</p>
            <h2 className="mt-3 text-2xl font-bold">서버 템플릿 보기</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">템플릿 링크를 열기 전에 카테고리, 채널, 역할 구조를 먼저 확인할 수 있습니다.</p>
          </a>

          <a href="/bots" className="group rounded-2xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur hover:border-indigo-400/60">
            <p className="text-sm font-semibold text-indigo-300">BOT DIRECTORY</p>
            <h2 className="mt-3 text-2xl font-bold">봇 추천 보기</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">인증, 티켓, 관리, 로그, 활동 봇을 설명과 태그로 비교하고 초대 링크로 이동할 수 있습니다.</p>
          </a>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-indigo-300">RECENT TEMPLATES</p>
                <h2 className="mt-2 text-2xl font-bold">최근 서버 템플릿</h2>
              </div>
              <a href="/template" className="text-sm text-zinc-400 hover:text-white">전체 보기</a>
            </div>
            <div className="grid gap-3">
              {recentTemplates.length ? recentTemplates.map((template) => (
                <a key={template.id} href="/template" className="rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-white/5">
                  <p className="font-bold text-white">{template.name}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">{getSummary(template.category)}</p>
                </a>
              )) : <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">최근 템플릿이 아직 없습니다.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-indigo-300">RECENT BOTS</p>
                <h2 className="mt-2 text-2xl font-bold">최근 봇</h2>
              </div>
              <a href="/bots" className="text-sm text-zinc-400 hover:text-white">전체 보기</a>
            </div>
            <div className="grid gap-3">
              {recentBots.length ? recentBots.map((bot) => (
                <a key={bot.id} href="/bots" className="rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-white/5">
                  <p className="font-bold text-white">{bot.name}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">{getSummary(bot.description)}</p>
                </a>
              )) : <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">최근 봇이 아직 없습니다.</p>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
