export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-xl">
          <p className="mb-3 text-sm font-semibold text-indigo-400">
            디스코드 서버 운영 도구
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            디코서버메이커
          </h1>

          <p className="mt-6 max-w-2xl text-zinc-300">
            디스코드 서버 운영자를 위한 템플릿, 봇 추천, 문구 생성 도구입니다.
            게임 서버와 친목 서버에 맞는 채널 구조, 역할 이름, 규칙 문구를
            빠르게 정리해보세요.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/template"
              className="rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white hover:bg-indigo-400"
            >
              템플릿 만들기
            </a>

            <a
              href="/bots"
              className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-200 hover:bg-zinc-800"
            >
              봇 추천 보기
            </a>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="font-bold">서버 템플릿</h2>
            <p className="mt-2 text-sm text-zinc-400">
              서버 종류에 맞춰 채널과 역할 구조를 추천합니다.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="font-bold">봇 추천</h2>
            <p className="mt-2 text-sm text-zinc-400">
              인증, 티켓, 레벨, 관리, 로그 등 목적별 봇을 정리합니다.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="font-bold">문구 생성기</h2>
            <p className="mt-2 text-sm text-zinc-400">
              공지, 규칙, 파티모집, 내전 규정을 복붙용으로 만듭니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
