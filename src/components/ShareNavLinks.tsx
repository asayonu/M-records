import Link from "next/link";

type Props = {
  token: string;
  align?: "center" | "end";
};

export default function ShareNavLinks({ token, align = "center" }: Props) {
  const basePath = `/share/${token}`;
  const linkClass =
    "block rounded-lg px-2 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50/70 hover:text-emerald-800 active:bg-emerald-100/70";

  return (
    <nav
      className={`flex flex-col gap-3 ${align === "end" ? "items-end text-right" : "items-center text-center"}`}
      aria-label="閲覧メニュー"
    >
      <Link href={`${basePath}/players`} className={linkClass}>
        プレイヤー情報
      </Link>
      <Link href={`${basePath}/games`} className={linkClass}>
        過去の対局
      </Link>
    </nav>
  );
}
