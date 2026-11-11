import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#191919]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          NeuralSpeech
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/app/sign-in"
            className="text-sm font-medium text-neutral-600 transition hover:text-black"
          >
            Log in
          </Link>
          <Link
            href="/app/sign-up"
            className="rounded-full bg-[#191919] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-32 lg:pt-28">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-xs font-medium text-neutral-700">
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            Your ideas, in a natural voice
          </p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Give your words a <span className="text-black">voice.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
            Turn text into expressive speech and explore new voices, all in one
            simple studio.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/app/sign-up"
              className="rounded-full bg-[#191919] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              Start creating <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/app/sign-in"
              className="px-3 py-3.5 text-sm font-medium text-neutral-600 transition hover:text-black"
            >
              I already have an account
            </Link>
          </div>
          <p className="mt-5 text-xs text-neutral-500">
            Sign up to open your NeuralSpeech studio.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="relative rounded-[2rem] border border-black/5 bg-white p-5 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.18)] sm:p-7">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                  NeuralSpeech studio
                </p>
                <h2 className="mt-1 text-lg font-semibold">Text to speech</h2>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                Ready to create
              </span>
            </div>

            <div className="mt-6 rounded-2xl bg-neutral-50 p-5 sm:p-6">
              <p className="text-xs font-medium text-neutral-500">
                YOUR SCRIPT
              </p>
              <p className="mt-3 text-lg leading-8 text-neutral-800">
                “Every great story starts with a single word. Let’s find the
                voice that brings yours to life.”
              </p>
              <div
                className="mt-6 flex items-end justify-center gap-1.5"
                aria-hidden="true"
              >
                {[
                  20, 32, 24, 42, 30, 52, 35, 44, 26, 48, 34, 56, 27, 40, 22,
                  36, 48, 29, 42, 25, 34, 19, 30, 22,
                ].map((height, index) => (
                  <span
                    key={index}
                    className={`w-1.5 rounded-full ${index > 16 ? "bg-neutral-300" : "bg-black"}`}
                    style={{ height }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">
                  A
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Aria</p>
                  <p className="text-xs text-neutral-500">Warm · Expressive</p>
                </div>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white shadow-lg shadow-black/20">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 translate-x-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M6 3.8c0-.7.8-1.1 1.4-.7l8.1 5.2a2 2 0 0 1 0 3.4l-8.1 5.2c-.6.4-1.4 0-1.4-.7V3.8Z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="relative mt-6 grid grid-cols-3 gap-3">
            {[
              ["01", "Write"],
              ["02", "Choose a voice"],
              ["03", "Create"],
            ].map(([number, label]) => (
              <div
                key={number}
                className="rounded-2xl border border-black/5 bg-white/80 px-3 py-4 text-center shadow-sm"
              >
                <p className="text-[10px] font-semibold tracking-widest text-black">
                  {number}
                </p>
                <p className="mt-1 text-xs font-medium text-neutral-700 sm:text-sm">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/5 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-3 lg:px-10 lg:py-16">
          {[
            {
              title: "Natural-sounding speech",
              text: "Bring scripts and stories to life with expressive AI voices.",
            },
            {
              title: "Find your voice",
              text: "Explore voice options and choose the sound that fits your words.",
            },
            {
              title: "More ways to create",
              text: "Use the studio for speech generation and voice changing.",
            },
          ].map(({ title, text }) => (
            <div key={title}>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p>NeuralSpeech — a studio for voice.</p>
        <Link
          href="/app/sign-up"
          className="font-medium text-neutral-700 transition hover:text-black"
        >
          Create your account <span aria-hidden="true">→</span>
        </Link>
      </footer>
    </main>
  );
}
