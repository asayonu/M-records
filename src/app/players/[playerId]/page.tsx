import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import StatsSummary from "@/components/StatsSummary";
import FilterablePlayerPtChart from "@/components/FilterablePlayerPtChart";
import { getPlayerById, getAllPlayers } from "@/lib/players/actions";
import { getGamesForPlayer } from "@/lib/records/actions";
import { getPlayerPtHistory, getPlayerRoundData } from "@/lib/records/stats";
import { resolveChartColor } from "@/lib/players/chartColors";
import { calcPlayerStats, toDateString } from "@/lib/records/types";

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
  const allPlayers = await getAllPlayers();
  const playerIndex = allPlayers.findIndex((item) => item.id === playerId);
  const chartColor = resolveChartColor(
    player.chartColor,
    playerIndex >= 0 ? playerIndex : 0,
  );

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
              dayCount={
                new Set(games.map((game) => toDateString(game.playedAt))).size
              }
              totalPt={
                ptHistory.length > 0
                  ? ptHistory[ptHistory.length - 1].cumulativePt
                  : 0
              }
              hanchanCount={stats.hanchanCount}
              averageRank={stats.averageRank}
              firstRate={stats.firstRate}
              secondRate={stats.secondRate}
              thirdRate={stats.thirdRate}
            />
            <FilterablePlayerPtChart points={ptHistory} lineColor={chartColor} />
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-600">
            まだ対局記録がありません
          </p>
        )}
      </div>
    </AppShell>
  );
}
