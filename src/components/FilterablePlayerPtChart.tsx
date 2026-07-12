"use client";

import { useEffect, useMemo, useState } from "react";
import ChartPeriodFilterBar from "@/components/ChartPeriodFilterBar";
import PlayerPtChart from "@/components/PlayerPtChart";
import {
  filterPlayerPtHistoryByPeriod,
  getAvailableChartPeriodFilters,
  getPlayerChartDateRange,
} from "@/lib/records/chartPeriodFilter";
import type { PlayerPtHistoryPoint } from "@/lib/records/stats";
import { getTodayDateString } from "@/lib/records/types";

type Props = {
  points: PlayerPtHistoryPoint[];
  lineColor?: string;
  heading?: string | null;
  showFooter?: boolean;
};

export default function FilterablePlayerPtChart({
  points,
  lineColor,
  heading,
  showFooter,
}: Props) {
  const today = getTodayDateString();
  const { firstDate, lastDate, realHanchanCount } =
    getPlayerChartDateRange(points);
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

  const filteredPoints = useMemo(
    () => filterPlayerPtHistoryByPeriod(points, periodId, today),
    [points, periodId, today],
  );

  if (points.length === 0) return null;

  const filterBar = (
    <ChartPeriodFilterBar
      filters={filters}
      value={periodId}
      onChange={setPeriodId}
    />
  );

  if (filteredPoints.length === 0) {
    return (
      <section className="space-y-3">
        {heading !== null && heading !== undefined && (
          <h2 className="text-sm font-semibold text-stone-700">{heading}</h2>
        )}
        {filterBar}
        <p className="rounded-xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-600">
          選択した期間にデータがありません
        </p>
      </section>
    );
  }

  return (
    <PlayerPtChart
      points={filteredPoints}
      lineColor={lineColor}
      heading={heading}
      showFooter={showFooter}
      periodFilter={filterBar}
    />
  );
}
