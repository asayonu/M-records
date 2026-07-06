import Link from "next/link";
import type { ReactNode } from "react";
import NavMenu from "@/components/NavMenu";

type Props = {
  token: string;
  title: string;
  children: ReactNode;
};

export default function ShareShell({ token, title, children }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <nav
            className="flex min-w-0 items-center gap-1.5 text-sm"
            aria-label="パンくずリスト"
          >
            <Link
              href={`/share/${token}`}
              className="shrink-0 font-medium text-emerald-700 hover:text-emerald-800"
            >
              カレンダー
            </Link>
            <span className="shrink-0 text-stone-400" aria-hidden>
              /
            </span>
            <span className="truncate font-semibold text-stone-800">
              {title}
            </span>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">
              閲覧専用
            </span>
            <NavMenu variant="share" token={token} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  );
}
