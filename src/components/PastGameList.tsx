import Link from "next/link";

export type PastGameItem = {
  id: string;
  dateLabel: string;
  modeLabel: string;
  ruleName: string;
  hanchanCount: number;
  playerNames: string[];
};

type Props = {
  games: PastGameItem[];
  /** 共有閲覧用。例: `/share/abc123` */
  shareBase?: string;
};

export default function PastGameList({ games, shareBase }: Props) {
  const gameHref = (id: string) =>
    shareBase ? `${shareBase}/games/${id}` : `/games/${id}`;

  if (games.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 bg-white/60 px-4 py-8 text-center text-sm text-stone-600">
        まだ対局記録がありません
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {games.map((game) => (
        <li key={game.id}>
          <Link
            href={gameHref(game.id)}
            className="block rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30"
          >
            <p className="text-xs font-medium text-stone-500">{game.dateLabel}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                {game.modeLabel}
              </span>
              <span className="text-xs font-medium text-stone-600">
                {game.ruleName}
              </span>
              <span className="text-xs text-stone-400">
                {game.hanchanCount}半荘
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-stone-900">
              {game.playerNames.join(" · ")}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
