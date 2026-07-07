import Link from "next/link";

type Props = {
  token: string;
};

export default function ShareNavLinks({ token }: Props) {
  const basePath = `/share/${token}`;
  const linkClass =
    "text-sm font-medium text-emerald-700 transition hover:text-emerald-800";

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
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
