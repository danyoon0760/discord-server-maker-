"use client";

import Link from "next/link";
import { useState } from "react";

const templates = {
  valorant: {
    name: "발로란트 서버",
    channels: [
      "#공지",
      "#서버규칙",
      "#자기소개",
      "#파티모집",
      "#내전신청",
      "#클립자랑",
      "#자유채팅",
      "#음성대기방",
    ],
    roles: [
      "서버장",
      "관리자",
      "내전관리자",
      "성인",
      "미자",
      "아이언~브론즈",
      "실버~골드",
      "플래~다이아",
      "초월자 이상",
    ],
    rules: [
      "욕설, 패드립, 성희롱은 금지입니다.",
      "파티 모집 채널은 목적에 맞게 사용해주세요.",
      "내전 중 고의 트롤, 탈주, 소통 차단은 제재될 수 있습니다.",
      "분쟁 발생 시 관리자 판단에 따라 경고가 부여됩니다.",
    ],
    bots: ["Carl-bot", "Ticket Tool", "Statbot", "TTS Bot"],
  },
  league: {
    name: "롤 서버",
    channels: [
      "#공지",
      "#서버규칙",
      "#자기소개",
      "#듀오모집",
      "#자랭모집",
      "#내전신청",
      "#자유채팅",
      "#음성대기방",
    ],
    roles: [
      "서버장",
      "관리자",
      "탑",
      "정글",
      "미드",
      "원딜",
      "서폿",
      "브실골",
      "플다에",
      "마스터 이상",
    ],
    rules: [
      "랭크 비하, 티어 조롱은 금지입니다.",
      "듀오 모집 시 티어와 포지션을 적어주세요.",
      "내전 중 고의 트롤과 탈주는 제재 대상입니다.",
      "분쟁은 개인 DM이 아니라 관리자에게 문의해주세요.",
    ],
    bots: ["Carl-bot", "MEE6", "Ticket Tool", "Statbot"],
  },
  community: {
    name: "친목 서버",
    channels: [
      "#공지",
      "#규칙",
      "#자기소개",
      "#자유수다",
      "#사진공유",
      "#게임모집",
      "#질문방",
      "#음성채팅",
    ],
    roles: ["서버장", "관리자", "인증멤버", "신입", "활동멤버", "부스터"],
    rules: [
      "타인을 불쾌하게 만드는 발언은 금지입니다.",
      "개인정보 공유를 강요하지 마세요.",
      "도배, 광고, 분쟁 유도는 제재될 수 있습니다.",
      "문제가 생기면 관리자에게 먼저 알려주세요.",
    ],
    bots: ["Carl-bot", "MEE6", "Dyno", "Ticket Tool"],
  },
};

type TemplateKey = keyof typeof templates;

export default function TemplatePage() {
  const [type, setType] = useState<TemplateKey>("valorant");
  const selected = templates[type];

  const resultText = `
[${selected.name} 추천 템플릿]

추천 채널:
${selected.channels.join("\n")}

추천 역할:
${selected.roles.join("\n")}

규칙 예시:
${selected.rules.map((rule, index) => `${index + 1}. ${rule}`).join("\n")}

추천 봇:
${selected.bots.join(", ")}
`.trim();

  async function copyResult() {
    await navigator.clipboard.writeText(resultText);
    alert("복사했습니다.");
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          홈으로
        </Link>

        <h1 className="mt-6 text-4xl font-bold">
          디스코드 서버 템플릿 생성기
        </h1>
        <p className="mt-3 text-zinc-400">
          서버 종류를 선택하면 채널, 역할, 규칙, 추천 봇을 자동으로
          정리합니다.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <label className="text-sm font-semibold text-zinc-300">
            서버 종류
          </label>

          <select
            value={type}
            onChange={(event) => setType(event.target.value as TemplateKey)}
            className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
          >
            <option value="valorant">발로란트 서버</option>
            <option value="league">롤 서버</option>
            <option value="community">친목 서버</option>
          </select>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold">{selected.name}</h2>
            <button
              onClick={copyResult}
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400"
            >
              결과 복사
            </button>
          </div>

          <pre className="whitespace-pre-wrap rounded-xl bg-zinc-950 p-5 text-sm leading-6 text-zinc-200">
            {resultText}
          </pre>
        </div>
      </section>
    </main>
  );
}
