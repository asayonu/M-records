"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/lib/auth/actions";

type AppProps = {
  variant?: "app";
  user: { email: string } | null;
};

type ShareProps = {
  variant: "share";
  token: string;
};

type Props = AppProps | ShareProps;

function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="true"
      aria-label="メニュー"
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition hover:bg-stone-50"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 4.5h14M2 9h14M2 13.5h14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

export default function NavMenu(props: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  const linkClass =
    "block rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100";

  if (props.variant === "share") {
    const basePath = `/share/${props.token}`;
    return (
      <div ref={rootRef} className="relative">
        <MenuButton open={open} onClick={() => setOpen((prev) => !prev)} />
        {open && (
          <div className="absolute right-0 z-50 mt-2 min-w-[11rem] rounded-xl border border-stone-200/80 bg-white py-1.5 shadow-lg">
            <nav className="px-1.5" aria-label="閲覧メニュー">
              <Link
                href={`${basePath}/players`}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                プレイヤー
              </Link>
              <Link
                href={`${basePath}/games`}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                過去の対局
              </Link>
            </nav>
          </div>
        )}
      </div>
    );
  }

  const { user } = props;

  return (
    <div ref={rootRef} className="relative">
      <MenuButton open={open} onClick={() => setOpen((prev) => !prev)} />
      {open && (
        <div className="absolute right-0 z-50 mt-2 min-w-[11rem] rounded-xl border border-stone-200/80 bg-white py-1.5 shadow-lg">
          {user ? (
            <>
              <p className="truncate px-3 py-2 text-xs text-stone-400">
                {user.email}
              </p>
              <div className="my-1 border-t border-stone-100" />
              <nav className="px-1.5" aria-label="アカウントメニュー">
                <Link
                  href="/admin/players"
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  プレイヤー
                </Link>
                <Link
                  href="/games"
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  過去の対局
                </Link>
                <Link
                  href="/admin/rules"
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  ルール
                </Link>
                <Link
                  href="/admin/share"
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  共有
                </Link>
              </nav>
              <div className="my-1 border-t border-stone-900" />
              <form action={logoutAction} className="px-1.5 pb-0.5">
                <button
                  type="submit"
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  ログアウト
                </button>
              </form>
            </>
          ) : (
            <nav className="px-1.5" aria-label="アカウントメニュー">
              <Link
                href="/login"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                新規登録
              </Link>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
