import Link from "next/link";
import AppShell from "@/components/AppShell";
import PastGameList from "@/components/PastGameList";
import { getAllGames } from "@/lib/records/actions";
import { summarizeGame } from "@/lib/records/stats";
import { formatJapaneseDate, toDateString } from "@/lib/records/types";

export const metadata = {
  title: "過去の対局 | 麻雀成績管理",
};

export default async function PastGamesPage() {
  const games = await getAllGames();
  const items = games.map((game) => ({
    id: game.id,
    dateLabel: formatJapaneseDate(toDateString(game.playedAt)),
    ...summarizeGame(game),
  }));

  return (
    <AppShell title="過去の対局">
      <div className="space-y-6">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← カレンダー
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">過去の対局</h1>
          <p className="mt-1 text-sm text-stone-600">
            {items.length} 試合の記録
          </p>
        </div>
        <PastGameList games={items} />
      </div>
    </AppShell>
  );
}
