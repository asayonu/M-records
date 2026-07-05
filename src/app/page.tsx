import Link from "next/link";
import Calendar from "@/components/Calendar";
import AuthNav from "@/components/AuthNav";
import { getGamesByMonth } from "@/lib/records/actions";
import { groupGamesByDate } from "@/lib/records/calendar";
import { toDateString } from "@/lib/records/types";

type Props = {
  searchParams: Promise<{ year?: string; month?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;

  const games = await getGamesByMonth(year, month);
  const grouped = groupGamesByDate(games);
  const gamesByDate = new Map<string, number>();
  for (const [date, list] of grouped) {
    gamesByDate.set(date, list.length);
  }

  const todayStr = toDateString(now);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium tracking-wider text-emerald-700 uppercase">
            Mahjong Records
          </p>
          <h1 className="mt-1 text-2xl font-bold text-stone-900">対局カレンダー</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <AuthNav />
        </div>
      </header>

      <Calendar year={year} month={month} gamesByDate={gamesByDate} />

      <div className="mt-6 flex justify-center">
        <Link
          href={`/dates/${todayStr}`}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          今日の対局を見る
        </Link>
      </div>
    </main>
  );
}
