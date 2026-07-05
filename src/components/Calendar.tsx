import Link from "next/link";
import { getTodayDateString } from "@/lib/records/types";

type Props = {
  year: number;
  month: number;
  gamesByDate: Map<string, number>;
  /** 共有閲覧用。例: `/share/abc123` */
  basePath?: string;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function buildCalendarWeeks(year: number, month: number): (number | null)[][] {
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
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function prevMonth(year: number, month: number) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

function nextMonth(year: number, month: number) {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

function columnBackground(weekday: number): string {
  if (weekday === 0) return "bg-red-100";
  if (weekday === 6) return "bg-blue-100";
  return "bg-white";
}

function weekdayHeaderClass(weekday: number): string {
  if (weekday === 0) return "text-red-600";
  if (weekday === 6) return "text-blue-700";
  return "text-stone-500";
}

function weekdayTextClass(weekday: number): string {
  if (weekday === 0) return "text-red-700";
  if (weekday === 6) return "text-blue-700";
  return "text-stone-700";
}

export default function Calendar({ year, month, gamesByDate, basePath }: Props) {
  const weeks = buildCalendarWeeks(year, month);
  const todayStr = getTodayDateString();
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

      <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-stone-200/80">
        {WEEKDAYS.map((w, col) => (
          <div
            key={w}
            className={`flex min-w-0 flex-col ${columnBackground(col)}`}
          >
            <div
              className={`border-b border-stone-200/60 py-2 text-center text-xs font-semibold ${weekdayHeaderClass(col)}`}
            >
              {w}
            </div>

            {weeks.map((week, weekIndex) => {
              const day = week[col];

              if (day === null) {
                return (
                  <div
                    key={`empty-${weekIndex}`}
                    className="aspect-square border-b border-stone-200/40 last:border-b-0"
                  />
                );
              }

              const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const gameCount = gamesByDate.get(dateStr) ?? 0;
              const isToday = dateStr === todayStr;

              return (
                <Link
                  key={dateStr}
                  href={dateHref(dateStr)}
                  className={`relative flex aspect-square flex-col items-center justify-center border-b border-stone-200/40 text-sm transition last:border-b-0 hover:bg-black/5 ${weekdayTextClass(col)} ${
                    isToday
                      ? "ring-2 ring-inset ring-emerald-500"
                      : gameCount > 0
                        ? "font-semibold"
                        : ""
                  }`}
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
        ))}
      </div>
    </div>
  );
}
