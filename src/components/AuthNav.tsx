import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AuthNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="shrink-0 text-stone-500 hover:text-stone-700"
        >
          ログイン
        </Link>
        <span className="text-stone-300" aria-hidden>
          |
        </span>
        <Link
          href="/register"
          className="shrink-0 text-stone-500 hover:text-stone-700"
        >
          登録
        </Link>
      </>
    );
  }

  return (
    <>
      <span
        className="hidden max-w-[8rem] truncate text-stone-400 sm:inline"
        title={user.email}
      >
        {user.email}
      </span>
      <span className="hidden text-stone-300 sm:inline" aria-hidden>
        |
      </span>
      <Link
        href="/admin/players"
        className="text-stone-500 hover:text-stone-700"
      >
        プレイヤー
      </Link>
      <span className="text-stone-300" aria-hidden>
        |
      </span>
      <Link href="/admin/rules" className="text-stone-500 hover:text-stone-700">
        ルール
      </Link>
      <span className="text-stone-300" aria-hidden>
        |
      </span>
      <Link href="/admin/share" className="text-stone-500 hover:text-stone-700">
        共有
      </Link>
      <span className="text-stone-300" aria-hidden>
        |
      </span>
      <form action={logoutAction}>
        <button
          type="submit"
          className="text-stone-500 hover:text-stone-700"
        >
          ログアウト
        </button>
      </form>
    </>
  );
}
