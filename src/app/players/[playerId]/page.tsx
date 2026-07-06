import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import StatsSummary from "@/components/StatsSummary";
import PlayerPtChart from "@/components/PlayerPtChart";
import { getPlayerById } from "@/lib/players/actions";
import { getGamesForPlayer } from "@/lib/records/actions";
import { getPlayerPtHistory, getPlayerRoundData } from "@/lib/records/stats";
import { resolveGameConfig } from "@/lib/records/gameConfig";
import { calcPlayerStats, toDateString, formatJapaneseDate } from "@/lib/records/types";

type Props = {
  params: Promise<{ playerId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { playerId } = await params;
  const player = await getPlayerById(playerId);
  return {
    title: player
      ? `${player.name} の成績 | 麻雀成績管理`
      : "成績 | 麻雀成績管理",
  };
}

export default async function PlayerStatsPage({ params }: Props) {
  const { playerId } = await params;
  const player = await getPlayerById(playerId);
  if (!player) {
    notFound();
  }

  const games = await getGamesForPlayer(playerId);
  const roundData = getPlayerRoundData(games, playerId);
  const ptHistory = getPlayerPtHistory(games, playerId);
  const stats = calcPlayerStats(roundData);

  return (
    <AppShell title={`${player.name} の成績`}>
      <div className="space-y-8">
        <div>
          <Link
            href="/admin/players"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← プレイヤー管理
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            {player.name}
          </h1>
          <p className="mt-1 text-sm text-stone-600">通算成績</p>
        </div>

        {roundData.length > 0 ? (
          <>
            <StatsSummary
              gameCount={games.length}
              averageStartingScore={Math.round(
                roundData.reduce((s, r) => s + r.startingScore, 0) /
                  roundData.length,
              )}
              {...stats}
            />
            <PlayerPtChart points={ptHistory} />
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-600">
            まだ対局記録がありません
          </p>
        )}

        {games.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-stone-700">参加対局</h2>
            <ul className="space-y-2">
              {games.map((game) => (
                <li key={game.id}>
                  <Link
                    href={`/games/${game.id}`}
                    className="block rounded-xl border border-stone-200/80 bg-white px-4 py-3 text-sm shadow-sm hover:border-emerald-200"
                  >
                    <span className="font-medium text-stone-900">
                      {resolveGameConfig(game).ruleName}
                    </span>
                    <span className="ml-2 text-stone-500">
                      {resolveGameConfig(game).modeLabel} ·{" "}
                      {formatJapaneseDate(toDateString(game.playedAt))}
                    </span>
                    <span className="ml-2 text-stone-400">
                      {game.players
                        .sort((a, b) => a.seat - b.seat)
                        .map((gp) => gp.player.name)
                        .join(" · ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </AppShell>
  );
}
