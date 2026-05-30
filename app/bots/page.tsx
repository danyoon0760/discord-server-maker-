import Link from "next/link";

const botCategories = [
  {
    title: "역할 / 인증",
    bots: [
      {
        name: "Carl-bot",
        desc: "역할 지급, 리액션 역할, 기본 관리 기능에 많이 쓰입니다.",
      },
      {
        name: "Dyno",
        desc: "서버 관리, 자동 제재, 역할 관리용으로 무난합니다.",
      },
    ],
  },
  {
    title: "티켓 / 문의",
    bots: [
      {
        name: "Ticket Tool",
        desc: "문의방, 신고방, 신청방을 자동으로 만들 때 사용합니다.",
      },
      {
        name: "Helper.gg",
        desc: "운영진 문의 접수와 처리 흐름을 정리할 때 사용할 수 있습니다.",
      },
    ],
  },
  {
    title: "레벨 / 활동",
    bots: [
      {
        name: "MEE6",
        desc: "레벨, 환영 메시지, 간단한 자동화 기능에 자주 쓰입니다.",
      },
      {
        name: "Statbot",
        desc: "서버 활동량, 메시지 수, 음성 활동 통계를 볼 때 좋습니다.",
      },
    ],
  },
  {
    title: "관리 / 로그",
    bots: [
      {
        name: "Logger",
        desc: "메시지 삭제, 수정, 입퇴장 같은 서버 이벤트 기록에 사용합니다.",
      },
      {
        name: "YAGPDB",
        desc: "자동 역할, 관리 명령, 로그 기능을 넓게 설정할 수 있습니다.",
      },
    ],
  },
];

export default function BotsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          홈으로
        </Link>

        <h1 className="mt-6 text-4xl font-bold">디스코드 봇 추천</h1>
        <p className="mt-3 text-zinc-400">
          서버 운영 목적별로 자주 쓰이는 봇을 정리했습니다.
        </p>

        <div className="mt-8 grid gap-5">
          {botCategories.map((category) => (
            <div
              key={category.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <h2 className="text-2xl font-bold">{category.title}</h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {category.bots.map((bot) => (
                  <div
                    key={bot.name}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <h3 className="font-bold">{bot.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {bot.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
