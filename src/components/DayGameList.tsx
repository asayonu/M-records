import Link from "next/link";
import { formatMoney } from "@/lib/records/ruleScoring";
import { pointDiffToneClass } from "@/lib/records/types";

type GameItem = {
  id: string;
  modeLabel: string;
  ruleName: string;
  hanchanCount: number;
  playerNames: string[];
  playerPtTotals: number[];
};

type Props = {
  date: string;
  games: GameItem[];
  /** 共有閲覧用。例: `/share/abc123` */
  shareBase?: string;
};

export default function DayGameList({ date, games, shareBase }: Props) {
  const gameHref = (id: string) =>
    shareBase ? `${shareBase}/games/${id}` : `/games/${id}`;
  const readOnly = Boolean(shareBase);

  if (games.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-10 text-center">
        <p className="text-sm text-stone-600">この日の対局記録はありません</p>
        {!readOnly && (
          <Link
            href={`/games/new?date=${date}`}
            className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            対局を記録する
          </Link>
        )}
      </div>
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
              <div className="flex flex-wrap items-center gap-2">
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
