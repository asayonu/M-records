export const DEFAULT_CHART_COLORS = [
  "#059669",
  "#2563eb",
  "#d97706",
  "#7c3aed",
  "#e11d48",
  "#0891b2",
  "#ea580c",
  "#65a30d",
] as const;

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function isValidChartColor(value: string): boolean {
  return HEX_COLOR_PATTERN.test(value);
}

export function resolveChartColor(
  chartColor: string | null | undefined,
  index: number,
): string {
  if (chartColor && isValidChartColor(chartColor)) {
    return chartColor;
  }
  return DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length];
}
