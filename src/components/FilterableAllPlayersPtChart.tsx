"use client";

import { useEffect, useMemo, useState } from "react";
import AllPlayersPtChart from "@/components/AllPlayersPtChart";
import ChartPeriodFilterBar from "@/components/ChartPeriodFilterBar";
import {
  filterCombinedPtSeriesByPeriod,
  getAvailableChartPeriodFilters,
  getChartDataDateRange,
} from "@/lib/records/chartPeriodFilter";
import type { CombinedPtSeries } from "@/lib/records/stats";
import { getTodayDateString } from "@/lib/records/types";

type Props = {
  series: CombinedPtSeries[];
  hanchanDates: string[];
  shareBase?: string;
};

export default function FilterableAllPlayersPtChart({
  series,
  hanchanDates,
  shareBase,
}: Props) {
  const today = getTodayDateString();
  const { firstDate, lastDate, realHanchanCount } =
    getChartDataDateRange(hanchanDates);
  const filters = useMemo(
    () => getAvailableChartPeriodFilters(firstDate, lastDate, realHanchanCount),
    [firstDate, lastDate, realHanchanCount],
  );
  const [periodId, setPeriodId] = useState("all");

  useEffect(() => {
    if (!filters.some((filter) => filter.id === periodId)) {
      setPeriodId("all");
    }
  }, [filters, periodId]);

  const filtered = useMemo(
    () =>
      filterCombinedPtSeriesByPeriod(series, hanchanDates, periodId, today),
    [series, hanchanDates, periodId, today],
  );

  const hasData =
    filtered.series.some((item) => item.points.length > 0) &&
    filtered.maxGlobalIndex > 0;

  const filterBar = (
    <ChartPeriodFilterBar
      filters={filters}
      value={periodId}
      onChange={setPeriodId}
    />
  );

  if (!hasData) {
    return (
      <section className="space-y-3">
        {filterBar}
        <p className="rounded-xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-600">
          選択した期間にデータがありません
        </p>
      </section>
    );
  }

  return (
    <AllPlayersPtChart
      series={filtered.series}
      maxGlobalIndex={filtered.maxGlobalIndex}
      hanchanDates={filtered.hanchanDates}
      shareBase={shareBase}
      periodFilter={filterBar}
    />
  );
}
