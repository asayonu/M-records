import Link from "next/link";
import { notFound } from "next/navigation";
import DayGameList from "@/components/DayGameList";
import ShareShell from "@/components/ShareShell";
import { summarizeGame } from "@/lib/records/stats";
import { formatJapaneseDate } from "@/lib/records/types";
import {
  getSharedGamesByDate,
  requireShareAccess,
} from "@/lib/share/actions";

type Props = {
  params: Promise<{ token: string; date: string }>;
};

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

export async function generateMetadata({ params }: Props) {
  const { date } = await params;
  if (!isValidDate(date)) return { title: "対局記録 | 麻雀成績管理" };
  return { title: `${formatJapaneseDate(date)} | 麻雀成績管理` };
}

export default async function ShareDatePage({ params }: Props) {
  const { token, date } = await params;
  if (!isValidDate(date)) {
    notFound();
  }

  await requireShareAccess(token);
  const games = await getSharedGamesByDate(token, date);
  const summaries = games.map((game) => ({
    id: game.id,
    ...summarizeGame(game),
  }));
  const shareBase = `/share/${token}`;

  return (
    <ShareShell token={token} title={formatJapaneseDate(date)}>
      <div className="space-y-6">
        <div>
          <Link
            href={shareBase}
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

        <DayGameList date={date} games={summaries} shareBase={shareBase} />
      </div>
    </ShareShell>
  );
}
