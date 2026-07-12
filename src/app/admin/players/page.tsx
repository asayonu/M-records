import Link from "next/link";
import AppShell from "@/components/AppShell";
import PlayerAdminList from "@/components/PlayerAdminList";
import PlayerRegisterForm from "@/components/PlayerRegisterForm";
import { getAllPlayers } from "@/lib/players/actions";
import { getAllGames } from "@/lib/records/actions";
import { getPlayerTotalPt } from "@/lib/records/stats";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata = {
  title: "プレイヤー管理 | 麻雀成績管理",
};

export default async function AdminPlayersPage({ searchParams }: Props) {
  const params = await searchParams;
  const [players, games] = await Promise.all([getAllPlayers(), getAllGames()]);
  const playersWithPt = players.map((player) => ({
    ...player,
    totalPt: getPlayerTotalPt(games, player.id),
  }));

  return (
    <AppShell title="プレイヤー管理">
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              ← カレンダー
            </Link>
            <Link
              href="/admin/rules"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              ルール管理 →
            </Link>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-stone-900">
            プレイヤー管理
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            対局に参加するプレイヤーを登録・管理します
          </p>
          <p className="mt-1 text-xs text-stone-500">
            プレイヤー名をタップすると通算成績を表示します。「いつものメンバー」にチェックしたプレイヤーは、対局記録時に自動で選択されます。色アイコンでグラフの色を変更できます
          </p>
        </div>

        {params.error === "in-use" && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            対局記録があるプレイヤーは削除できません
          </p>
        )}

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-stone-700">
              登録済みプレイヤー（{players.length}人）
            </h2>
            {players.length > 0 && (
              <Link
                href="/admin/players/charts"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                全員のグラフを一括表示
              </Link>
            )}
          </div>
          <PlayerAdminList players={playersWithPt} />
        </section>

        <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-stone-700">
            新規プレイヤー登録
          </h2>
          <PlayerRegisterForm />
        </section>
      </div>
    </AppShell>
  );
}
