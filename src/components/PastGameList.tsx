import Link from "next/link";
import { formatMoney } from "@/lib/records/ruleScoring";
import { pointDiffToneClass } from "@/lib/records/types";

export type PastGameItem = {
  id: string;
  dateLabel: string;
  modeLabel: string;
  ruleName: string;
  hanchanCount: number;
  playerNames: string[];
  playerPtTotals: number[];
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
            className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30"
          >
            <div className="min-w-0 flex-1">
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
            </div>
            <div className="flex shrink-0 items-center justify-center gap-x-4">
              {game.playerNames.map((name, index) => {
                const pt = game.playerPtTotals[index];
                return (
                  <div
                    key={`${game.id}-player-${index}`}
                    className="min-w-[3.25rem] text-center"
                  >
                    <p className="truncate text-xs font-medium text-stone-800">
                      {name}
                    </p>
                    <p
                      className={`mt-0.5 text-xs font-semibold tabular-nums ${pointDiffToneClass(pt)}`}
                    >
                      {formatMoney(pt)}
                    </p>
                  </div>
                );
              })}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
