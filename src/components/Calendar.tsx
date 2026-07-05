import Link from "next/link";
import { toDateString } from "@/lib/records/types";

type Props = {
  year: number;
  month: number;
  gamesByDate: Map<string, number>;
  /** 共有閲覧用。例: `/share/abc123` */
  basePath?: string;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const startWeekday = firstDay.getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) {
    days.push(null);
  }
  for (let d = 1; d <= lastDate; d++) {
    days.push(d);
  }
  return days;
}

function prevMonth(year: number, month: number) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

function nextMonth(year: number, month: number) {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

export default function Calendar({ year, month, gamesByDate, basePath }: Props) {
  const days = buildCalendarDays(year, month);
  const today = new Date();
  const todayStr = toDateString(today);
  const label = new Date(year, month - 1, 1).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  const prev = prevMonth(year, month);
  const next = nextMonth(year, month);
  const monthHref = (y: number, m: number) =>
    basePath ? `${basePath}?year=${y}&month=${m}` : `/?year=${y}&month=${m}`;
  const dateHref = (dateStr: string) =>
    basePath ? `${basePath}/dates/${dateStr}` : `/dates/${dateStr}`;

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={monthHref(prev.year, prev.month)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
        >
          ←
        </Link>
        <h2 className="text-lg font-bold text-stone-900">{label}</h2>
        <Link
          href={monthHref(next.year, next.month)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
        >
          →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-stone-500">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`py-1 ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : ""}`}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const gameCount = gamesByDate.get(dateStr) ?? 0;
          const isToday = dateStr === todayStr;
          const weekday = new Date(year, month - 1, day).getDay();

          return (
            <Link
              key={dateStr}
              href={dateHref(dateStr)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition hover:bg-emerald-50 ${
                isToday
                  ? "ring-2 ring-emerald-500 ring-offset-1"
                  : gameCount > 0
                    ? "bg-emerald-50/80 font-semibold text-emerald-900"
                    : "text-stone-700 hover:text-emerald-800"
              } ${weekday === 0 ? "text-red-600" : weekday === 6 ? "text-blue-600" : ""}`}
            >
              <span>{day}</span>
              {gameCount > 0 && (
                <span className="mt-0.5 text-[10px] font-medium text-emerald-700">
                  {gameCount}局
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
