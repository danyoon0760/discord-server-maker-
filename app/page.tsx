export default function Home() {
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
          <p className="mb-3 text-sm font-semibold text-indigo-300">
            디스코드 서버 운영 도구
          </p>

          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            디코서버메이커
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300">
            디스코드 서버 템플릿과 운영 봇을 한곳에서 찾는 사이트입니다.
            서버 템플릿 링크를 통해 채널·역할 구조를 미리 확인하고,
            목적에 맞는 봇을 빠르게 비교할 수 있습니다.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/template"
              className="rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-400"
            >
              서버 템플릿 보기
            </a>

            <a
              href="/bots"
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-zinc-200 hover:bg-white/10"
            >
              봇 추천 보기
            </a>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <a
            href="/template"
            className="group rounded-2xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur hover:border-indigo-400/60"
          >
            <p className="text-sm font-semibold text-indigo-300">SERVER TEMPLATE</p>
            <h2 className="mt-3 text-2xl font-bold">서버 템플릿 보기</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              템플릿 링크를 열기 전에 카테고리, 채널, 역할 구조를 먼저 확인할 수 있습니다.
            </p>
          </a>

          <a
            href="/bots"
            className="group rounded-2xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur hover:border-indigo-400/60"
          >
            <p className="text-sm font-semibold text-indigo-300">BOT DIRECTORY</p>
            <h2 className="mt-3 text-2xl font-bold">봇 추천 보기</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              인증, 티켓, 관리, 로그, 활동 봇을 설명과 태그로 비교하고 초대 링크로 이동할 수 있습니다.
            </p>
          </a>
        </div>
      </section>
    </main>
  );
}
