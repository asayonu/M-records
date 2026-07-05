import Link from "next/link";
import LoginForm from "@/components/LoginForm";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export const metadata = {
  title: "ログイン | 麻雀成績管理",
};

function safeNextPath(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-8">
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium tracking-wider text-emerald-700 uppercase">
          Mahjong Records
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">ログイン</h1>
        <p className="mt-2 text-sm text-stone-600">
          アカウントごとに対局記録を管理できます
        </p>
        <div className="mt-6">
          <LoginForm nextPath={nextPath} />
        </div>
        <p className="mt-6 text-center text-sm text-stone-600">
          アカウントをお持ちでない方は{" "}
          <Link
            href={`/register${nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            新規登録
          </Link>
        </p>
      </div>
    </main>
  );
}
