import type { CombinedPtSeries, PlayerPtHistoryPoint } from "@/lib/records/stats";
import { parseDateString } from "@/lib/records/types";

export type ChartPeriodFilter = {
  id: string;
  label: string;
};

const MONTH_PERIOD_DEFS = [
  { id: "months-1", label: "直近1か月", months: 1, minSpanDays: 31 },
  { id: "months-3", label: "直近3か月", months: 3, minSpanDays: 92 },
  { id: "months-12", label: "直近1年", months: 12, minSpanDays: 366 },
] as const;

const HANCHAN_PERIOD_DEFS = [10, 30, 50, 100, 200] as const;

function daysBetween(firstDate: string, lastDate: string): number {
  const start = parseDateString(firstDate);
  const end = parseDateString(lastDate);
  return Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)),
  );
}

function subtractMonths(dateStr: string, months: number): string {
  const date = parseDateString(dateStr);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)!.value);

  let year = pick("year");
  let month = pick("month");
  const day = pick("day");

  month -= months;
  while (month <= 0) {
    month += 12;
    year -= 1;
  }

  const lastDay = new Date(year, month, 0).getDate();
  const safeDay = Math.min(day, lastDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
}

function roundPt(value: number): number {
  return Math.round(value * 10) / 10;
}

function parsePeriodId(periodId: string): { kind: "all" } | { kind: "months"; months: number } | { kind: "hanchan"; count: number } {
  if (periodId === "all") return { kind: "all" };
  const monthMatch = periodId.match(/^months-(\d+)$/);
  if (monthMatch) {
    return { kind: "months", months: Number(monthMatch[1]) };
  }
  const hanchanMatch = periodId.match(/^hanchan-(\d+)$/);
  if (hanchanMatch) {
    return { kind: "hanchan", count: Number(hanchanMatch[1]) };
  }
  return { kind: "all" };
}

export function getAvailableChartPeriodFilters(
  firstDate: string,
  lastDate: string,
  realHanchanCount: number,
): ChartPeriodFilter[] {
  const filters: ChartPeriodFilter[] = [];

  if (realHanchanCount > 0) {
    for (const count of HANCHAN_PERIOD_DEFS) {
      if (realHanchanCount > count) {
        filters.push({
          id: `hanchan-${count}`,
          label: `直近${count}半荘`,
        });
      }
    }

    if (firstDate && lastDate) {
      const spanDays = daysBetween(firstDate, lastDate);
      for (const period of MONTH_PERIOD_DEFS) {
        if (spanDays >= period.minSpanDays) {
          filters.push({ id: period.id, label: period.label });
        }
      }
    }
  }

  filters.push({ id: "all", label: "全て" });
  return filters;
}

export function filterPlayerPtHistoryByPeriod(
  points: PlayerPtHistoryPoint[],
  periodId: string,
  today: string,
): PlayerPtHistoryPoint[] {
  const period = parsePeriodId(periodId);
  if (period.kind === "all" || points.length === 0) {
    return points;
  }

  const realPoints = points.filter((point) => point.index > 0);
  if (realPoints.length === 0) return points;

  let selected = realPoints;

  if (period.kind === "months") {
    const cutoff = subtractMonths(today, period.months);
    selected = realPoints.filter((point) => point.playedAt >= cutoff);
  } else {
    selected = realPoints.slice(-period.count);
  }

  if (selected.length === 0) return [];

  let baseline = 0;
  const firstSelectedIndex = selected[0].index;
  for (const point of points) {
    if (point.index === 0) continue;
    if (point.index >= firstSelectedIndex) break;
    baseline = point.cumulativePt;
  }

  const rebased = selected.map((point) => ({
    ...point,
    cumulativePt: roundPt(point.cumulativePt - baseline),
  }));

  return [
    {
      index: 0,
      label: "0半荘",
      playedAt: rebased[0].playedAt,
      deltaPt: 0,
      cumulativePt: 0,
    },
    ...rebased,
  ];
}

export function filterCombinedPtSeriesByPeriod(
  series: CombinedPtSeries[],
  hanchanDates: string[],
  periodId: string,
  today: string,
): {
  series: CombinedPtSeries[];
  hanchanDates: string[];
  maxGlobalIndex: number;
} {
  const period = parsePeriodId(periodId);
  if (period.kind === "all" || hanchanDates.length === 0) {
    return {
      series,
      hanchanDates,
      maxGlobalIndex: hanchanDates.length,
    };
  }

  const realIndices = hanchanDates
    .map((_, index) => index)
    .filter((index) => index > 0);

  let keptIndices: number[];

  if (period.kind === "months") {
    const cutoff = subtractMonths(today, period.months);
    keptIndices = realIndices.filter((index) => hanchanDates[index] >= cutoff);
  } else {
    keptIndices = realIndices.slice(-period.count);
  }

  if (keptIndices.length === 0) {
    return { series: [], hanchanDates: [], maxGlobalIndex: 0 };
  }

  const indexMap = new Map<number, number>();
  keptIndices.forEach((oldIndex, offset) => {
    indexMap.set(oldIndex, offset + 1);
  });

  const filteredDates = [
    hanchanDates[keptIndices[0]],
    ...keptIndices.map((index) => hanchanDates[index]),
  ];

  const filteredSeries = series
    .map((item) => {
      if (item.points.length === 0) return item;

      const beforeStart = item.points.filter(
        (point) => point.globalIndex < keptIndices[0],
      );
      const baselinePt =
        beforeStart.length > 0
          ? beforeStart[beforeStart.length - 1].cumulativePt
          : 0;

      const inRange = item.points.filter((point) =>
        indexMap.has(point.globalIndex),
      );
      if (inRange.length === 0) return { ...item, points: [] };

      const remapped = inRange.map((point) => ({
        ...point,
        globalIndex: indexMap.get(point.globalIndex)!,
        cumulativePt: roundPt(point.cumulativePt - baselinePt),
      }));

      remapped.unshift({
        globalIndex: 0,
        cumulativePt: 0,
        label: "0半荘",
        deltaPt: 0,
      });

      return { ...item, points: remapped };
    })
    .filter((item) => item.points.length > 0);

  return {
    series: filteredSeries,
    hanchanDates: filteredDates,
    maxGlobalIndex: filteredDates.length,
  };
}

export function getChartDataDateRange(
  hanchanDates: string[],
): { firstDate: string; lastDate: string; realHanchanCount: number } {
  const realDates = hanchanDates.filter((_, index) => index > 0);
  if (realDates.length === 0) {
    return { firstDate: "", lastDate: "", realHanchanCount: 0 };
  }

  return {
    firstDate: realDates[0],
    lastDate: realDates[realDates.length - 1],
    realHanchanCount: realDates.length,
  };
}

export function getPlayerChartDateRange(points: PlayerPtHistoryPoint[]): {
  firstDate: string;
  lastDate: string;
  realHanchanCount: number;
} {
  const realPoints = points.filter((point) => point.index > 0);
  if (realPoints.length === 0) {
    return { firstDate: "", lastDate: "", realHanchanCount: 0 };
  }

  return {
    firstDate: realPoints[0].playedAt,
    lastDate: realPoints[realPoints.length - 1].playedAt,
    realHanchanCount: realPoints.length,
  };
}
