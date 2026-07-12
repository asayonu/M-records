import Link from "next/link";

type Props = {
  token: string;
  align?: "center" | "end";
};

export default function ShareNavLinks({ token, align = "center" }: Props) {
  const basePath = `/share/${token}`;
  const linkClass =
    "text-sm font-medium text-emerald-700 transition hover:text-emerald-800";

  return (
    <nav
      className={`flex flex-col gap-1 ${align === "end" ? "items-end text-right" : "items-center text-center"}`}
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
