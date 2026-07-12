import Link from "next/link";
import PlayerShareList from "@/components/PlayerShareList";
import ShareShell from "@/components/ShareShell";
import { getPlayerTotalPt } from "@/lib/records/stats";
import { getSharedAllGames, getSharedAllPlayers, requireShareAccess } from "@/lib/share/actions";

type Props = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const access = await requireShareAccess(token);
  return {
    title: `${access.email} のプレイヤー | 麻雀成績管理`,
  };
}

export default async function SharePlayersPage({ params }: Props) {
  const { token } = await params;
  await requireShareAccess(token);

  const [players, games] = await Promise.all([
    getSharedAllPlayers(token),
    getSharedAllGames(token),
  ]);
  const basePath = `/share/${token}`;
  const playersWithPt = players.map((player) => ({
    ...player,
    totalPt: getPlayerTotalPt(games, player.id),
  }));

  return (
    <ShareShell token={token} title="プレイヤー">
      <div className="space-y-6">
        <div>
          <Link
            href={basePath}
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← カレンダー
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">プレイヤー</h1>
          <p className="mt-1 text-sm text-stone-600">
            登録済み {players.length} 人 · 名前をタップすると通算成績を表示
          </p>
        </div>
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-stone-700">
              登録済みプレイヤー（{players.length}人）
            </h2>
            {players.length > 0 && (
              <Link
                href={`${basePath}/charts`}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                全員のグラフを一括表示
              </Link>
            )}
          </div>
          <PlayerShareList players={playersWithPt} shareBase={basePath} />
        </section>
      </div>
    </ShareShell>
  );
}
