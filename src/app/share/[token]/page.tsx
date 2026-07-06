import Link from "next/link";
import Calendar from "@/components/Calendar";
import ShareShell from "@/components/ShareShell";
import { hanchanCountByDate } from "@/lib/records/calendar";
import { getCurrentYearMonth, getTodayDateString } from "@/lib/records/types";
import {
  getSharedGamesByMonth,
  requireShareAccess,
} from "@/lib/share/actions";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const access = await requireShareAccess(token);
  return {
    title: `${access.email} の対局記録 | 麻雀成績管理`,
  };
}

export default async function ShareCalendarPage({ params, searchParams }: Props) {
  const { token } = await params;
  await requireShareAccess(token);

  const query = await searchParams;
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth();
  const year = query.year ? Number(query.year) : currentYear;
  const month = query.month ? Number(query.month) : currentMonth;

  const games = await getSharedGamesByMonth(token, year, month);
  const gamesByDate = hanchanCountByDate(games);

  const todayStr = getTodayDateString();
  const basePath = `/share/${token}`;

  return (
    <ShareShell token={token} title="対局カレンダー">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-emerald-700 uppercase">
            Mahjong Records
          </p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900">
            対局カレンダー
          </h1>
          <p className="mt-1 text-sm text-stone-500">閲覧専用 · 編集できません</p>
        </div>

        <Calendar
          year={year}
          month={month}
          gamesByDate={gamesByDate}
          basePath={basePath}
        />

        <div className="flex justify-center">
          <Link
            href={`${basePath}/dates/${todayStr}`}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            今日の対局を見る
          </Link>
        </div>
      </div>
    </ShareShell>
  );
}
