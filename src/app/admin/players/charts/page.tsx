import Link from "next/link";
import FilterableAllPlayersPtChart from "@/components/FilterableAllPlayersPtChart";
import AppShell from "@/components/AppShell";
import { getAllPlayers } from "@/lib/players/actions";
import { getAllGames } from "@/lib/records/actions";
import { getCombinedPlayerPtSeries } from "@/lib/records/stats";

export const metadata = {
  title: "全員のグラフ | 麻雀成績管理",
};

export default async function AllPlayersChartsPage() {
  const [players, games] = await Promise.all([getAllPlayers(), getAllGames()]);
  const { series, hanchanDates } = getCombinedPlayerPtSeries(
    games,
    players.map((player) => ({
      id: player.id,
      name: player.name,
      chartColor: player.chartColor,
    })),
  );
  const withHistory = series.filter((player) => player.points.length > 0);
  const withoutHistory = series.filter((player) => player.points.length === 0);

  return (
    <AppShell title="全員のグラフ">
      <div className="space-y-8">
        <div>
          <Link
            href="/admin/players"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← プレイヤー管理
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">
            全員のグラフ
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            登録済み {players.length} 人 · グラフ表示 {withHistory.length} 人
          </p>
        </div>

        {withHistory.length > 0 ? (
          <FilterableAllPlayersPtChart
            series={withHistory}
            hanchanDates={hanchanDates}
          />
        ) : (
          <p className="rounded-xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-600">
            まだ対局記録がありません
          </p>
        )}

        {withoutHistory.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-stone-700">
              対局記録なし（{withoutHistory.length}人）
            </h2>
            <ul className="space-y-1 text-sm text-stone-500">
              {withoutHistory.map((player) => (
                <li key={player.playerId}>{player.playerName}</li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-xs text-stone-500">
          横軸は対局日。ウマ・オカ・レート込みの累積pt（各点にホバーで詳細）
        </p>
      </div>
    </AppShell>
  );
}
