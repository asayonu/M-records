import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import DayGameList from "@/components/DayGameList";
import { getGamesByDate } from "@/lib/records/actions";
import { summarizeGame } from "@/lib/records/stats";
import { formatJapaneseDate } from "@/lib/records/types";

type Props = {
  params: Promise<{ date: string }>;
};

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

export async function generateMetadata({ params }: Props) {
  const { date } = await params;
  if (!isValidDate(date)) return { title: "対局記録 | 麻雀成績管理" };
  return { title: `${formatJapaneseDate(date)} | 麻雀成績管理` };
}

export default async function DatePage({ params }: Props) {
  const { date } = await params;
  if (!isValidDate(date)) {
    notFound();
  }

  const games = await getGamesByDate(date);
  const summaries = games.map((game) => ({
    id: game.id,
    ...summarizeGame(game),
  }));

  return (
    <AppShell title={formatJapaneseDate(date)}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              ← カレンダー
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-stone-900">
              {formatJapaneseDate(date)}
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              {games.length} 件の対局記録
            </p>
          </div>
          {games.length > 0 && (
            <Link
              href={`/games/new?date=${date}`}
              className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              ＋ 記録
            </Link>
          )}
        </div>

        <DayGameList date={date} games={summaries} />
      </div>
    </AppShell>
  );
}
