import Link from "next/link";
import ScaleToFit from "@/components/ScaleToFit";
import { formatMoney } from "@/lib/records/ruleScoring";
import type { CombinedPtSeries } from "@/lib/records/stats";
import { pointDiffToneClass } from "@/lib/records/types";
import type { ReactNode } from "react";

type Props = {
  series: CombinedPtSeries[];
  maxGlobalIndex: number;
  hanchanDates: string[];
  /** 共有閲覧用。例: `/share/abc123` */
  shareBase?: string;
  periodFilter?: ReactNode;
};

function chartCoords(
  maxGlobalIndex: number,
  width: number,
  height: number,
  yMin: number,
  yMax: number,
) {
  const padding = { top: 16, right: 16, bottom: 36, left: 48 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const rangeY = yMax - yMin || 1;

  const xAt = (globalIndex: number) =>
    padding.left +
    (maxGlobalIndex <= 1
      ? chartW / 2
      : (globalIndex / (maxGlobalIndex - 1)) * chartW);
  const yAt = (value: number) =>
    padding.top + chartH - ((value - yMin) / rangeY) * chartH;

  return { padding, chartW, chartH, xAt, yAt };
}

function yTicks(yMin: number, yMax: number): number[] {
  const range = yMax - yMin;
  const step =
    range <= 4 ? 1 : range <= 20 ? 5 : range <= 100 ? 10 : Math.ceil(range / 5);
  const start = Math.floor(yMin / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= yMax; v += step) {
    ticks.push(Math.round(v * 10) / 10);
  }
  return ticks;
}

function buildLinePaths(
  points: CombinedPtSeries["points"],
  xAt: (globalIndex: number) => number,
  yAt: (value: number) => number,
): string[] {
  if (points.length === 0) return [];

  const paths: string[] = [];
  let segment = `M ${xAt(points[0].globalIndex)} ${yAt(points[0].cumulativePt)}`;

  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];
    if (current.globalIndex - prev.globalIndex > 1) {
      paths.push(segment);
      segment = `M ${xAt(current.globalIndex)} ${yAt(current.cumulativePt)}`;
    } else {
      segment += ` L ${xAt(current.globalIndex)} ${yAt(current.cumulativePt)}`;
    }
  }
  paths.push(segment);
  return paths;
}

export default function AllPlayersPtChart({
  series,
  maxGlobalIndex,
  hanchanDates,
  shareBase,
  periodFilter,
}: Props) {
  const activeSeries = series.filter((item) => item.points.length > 0);
  if (activeSeries.length === 0 || maxGlobalIndex === 0) return null;

  const playerHref = (playerId: string) =>
    shareBase ? `${shareBase}/players/${playerId}` : `/players/${playerId}`;

  const rankedSeries = [...activeSeries].sort((a, b) => {
    const aPt = a.points[a.points.length - 1].cumulativePt;
    const bPt = b.points[b.points.length - 1].cumulativePt;
    return bPt - aPt;
  });

  const width = Math.max(320, maxGlobalIndex * 28);
  const height = 260;
  const allValues = activeSeries.flatMap((item) =>
    item.points.map((point) => point.cumulativePt),
  );
  const paddingY =
    (Math.max(0, ...allValues) - Math.min(0, ...allValues)) * 0.1 || 1;
  const yMin = Math.min(0, ...allValues) - paddingY;
  const yMax = Math.max(0, ...allValues) + paddingY;
  const { padding, chartW, xAt, yAt } = chartCoords(
    maxGlobalIndex,
    width,
    height,
    yMin,
    yMax,
  );
  const zeroY = yAt(0);
  const ticks = yTicks(yMin, yMax);
  const chartBottom = height - padding.bottom;
  const positiveBandHeight = Math.max(0, zeroY - padding.top);
  const negativeBandHeight = Math.max(0, chartBottom - zeroY);

  const dateLabelIndices = hanchanDates.reduce<number[]>((acc, playedAt, i) => {
    if (i === 0 || playedAt !== hanchanDates[i - 1]) {
      acc.push(i);
    }
    return acc;
  }, []);

  return (
    <section>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          {periodFilter}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm">
            <ScaleToFit>
              <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label="全プレイヤーの累積pt推移グラフ"
                className="block"
              >
          {positiveBandHeight > 0 && (
            <rect
              x={padding.left}
              y={padding.top}
              width={chartW}
              height={positiveBandHeight}
              fill="#d1fae5"
            />
          )}
          {negativeBandHeight > 0 && (
            <rect
              x={padding.left}
              y={zeroY}
              width={chartW}
              height={negativeBandHeight}
              fill="#fee2e2"
            />
          )}

          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={yAt(tick)}
                x2={width - padding.right}
                y2={yAt(tick)}
                stroke="#e7e5e4"
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={yAt(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-stone-400 text-[10px]"
              >
                {tick}
              </text>
            </g>
          ))}

          <line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            stroke="#a8a29e"
            strokeWidth={1}
            strokeDasharray="4 3"
          />

          {dateLabelIndices.map((index) => (
            <line
              key={`date-line-${hanchanDates[index]}-${index}`}
              x1={xAt(index)}
              y1={padding.top}
              x2={xAt(index)}
              y2={height - padding.bottom}
              stroke="#78716c"
              strokeWidth={1.25}
              strokeDasharray="4 3"
            />
          ))}

          {activeSeries.map((item) => {
            const color = item.chartColor;
            const paths = buildLinePaths(item.points, xAt, yAt);
            return (
              <g key={item.playerId}>
                {paths.map((path, pathIndex) => (
                  <path
                    key={`${item.playerId}-${pathIndex}`}
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ))}
                {item.points.map((point) => (
                  <circle
                    key={`${item.playerId}-${point.globalIndex}`}
                    cx={xAt(point.globalIndex)}
                    cy={yAt(point.cumulativePt)}
                    r={maxGlobalIndex > 40 ? 2.5 : 3}
                    fill={color}
                  >
                    <title>
                      {item.playerName} · {point.label}:{" "}
                      {point.deltaPt >= 0 ? "+" : ""}
                      {point.deltaPt}pt → 累計{" "}
                      {formatMoney(point.cumulativePt)}
                    </title>
                  </circle>
                ))}
              </g>
            );
          })}

          {dateLabelIndices.map((index) => (
            <text
              key={`date-${hanchanDates[index]}-${index}`}
              x={xAt(index)}
              y={height - 10}
              textAnchor="middle"
              className="fill-stone-500 text-[9px]"
            >
              {hanchanDates[index].slice(5).replace("-", "/")}
            </text>
              ))}
              </svg>
            </ScaleToFit>
          </div>
        </div>

        <ol className="w-28 shrink-0 space-y-2 sm:w-36 lg:w-40">
          {rankedSeries.map((item) => {
            const finalPt = item.points[item.points.length - 1].cumulativePt;
            const color = item.chartColor;
            return (
              <li key={item.playerId} className="flex items-start gap-2 text-sm">
                <span
                  className="mt-1.5 inline-block size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={playerHref(item.playerId)}
                    className="block truncate font-medium text-stone-800 hover:text-emerald-800"
                  >
                    {item.playerName}
                  </Link>
                  <span
                    className={`font-semibold tabular-nums ${pointDiffToneClass(finalPt)}`}
                  >
                    {formatMoney(finalPt)}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
