import Link from "next/link";
import PastGameList from "@/components/PastGameList";
import ShareShell from "@/components/ShareShell";
import { summarizeGame } from "@/lib/records/stats";
import { formatJapaneseDate, toDateString } from "@/lib/records/types";
import { getSharedAllGames, requireShareAccess } from "@/lib/share/actions";

type Props = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const access = await requireShareAccess(token);
  return {
    title: `${access.email} の過去の対局 | 麻雀成績管理`,
  };
}

export default async function SharePastGamesPage({ params }: Props) {
  const { token } = await params;
  await requireShareAccess(token);

  const games = await getSharedAllGames(token);
  const basePath = `/share/${token}`;
  const items = games.map((game) => ({
    id: game.id,
    dateLabel: formatJapaneseDate(toDateString(game.playedAt)),
    ...summarizeGame(game),
  }));

  return (
    <ShareShell token={token} title="過去の対局">
      <div className="space-y-6">
        <div>
          <Link
            href={basePath}
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← カレンダー
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">過去の対局</h1>
          <p className="mt-1 text-sm text-stone-600">
            {items.length} 試合の記録
          </p>
        </div>
        <PastGameList games={items} shareBase={basePath} />
      </div>
    </ShareShell>
  );
}
