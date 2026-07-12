"use client";

import type { ChartPeriodFilter } from "@/lib/records/chartPeriodFilter";

type Props = {
  filters: ChartPeriodFilter[];
  value: string;
  onChange: (periodId: string) => void;
};

export default function ChartPeriodFilterBar({ filters, value, onChange }: Props) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      <label htmlFor="chart-period-filter" className="text-xs text-stone-500">
        表示期間
      </label>
      <select
        id="chart-period-filter"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        aria-label="グラフ表示期間"
      >
        {filters.map((filter) => (
          <option key={filter.id} value={filter.id}>
            {filter.label}
          </option>
        ))}
      </select>
    </div>
  );
}
