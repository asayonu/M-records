import Link from "next/link";
import PlayerShareList from "@/components/PlayerShareList";
import ShareShell from "@/components/ShareShell";
import { getSharedAllPlayers, requireShareAccess } from "@/lib/share/actions";

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

  const players = await getSharedAllPlayers(token);
  const basePath = `/share/${token}`;

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
        <PlayerShareList players={players} shareBase={basePath} />
      </div>
    </ShareShell>
  );
}
