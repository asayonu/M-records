import { formatMoney } from "@/lib/records/ruleScoring";
import type { PlayerPtHistoryPoint } from "@/lib/records/stats";
import ScaleToFit from "@/components/ScaleToFit";
import type { ReactNode } from "react";

type Props = {
  points: PlayerPtHistoryPoint[];
  /** 省略時は「pt推移」。null で非表示 */
  heading?: string | null;
  showFooter?: boolean;
  /** 指定時は累積ptの正負に関わらずこの色を使う */
  lineColor?: string;
  periodFilter?: ReactNode;
};

function chartCoords(
  points: PlayerPtHistoryPoint[],
  width: number,
  height: number,
) {
  const padding = { top: 16, right: 16, bottom: 36, left: 48 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = points.map((p) => p.cumulativePt);
  const minY = Math.min(0, ...values);
  const maxY = Math.max(0, ...values);
  const paddingY = (maxY - minY) * 0.1 || 1;
  const yMin = minY - paddingY;
  const yMax = maxY + paddingY;
  const rangeY = yMax - yMin || 1;

  const xAt = (i: number) =>
    padding.left +
    (points.length === 1 ? chartW / 2 : (i / (points.length - 1)) * chartW);
  const yAt = (v: number) =>
    padding.top + chartH - ((v - yMin) / rangeY) * chartH;

  return { padding, chartW, chartH, xAt, yAt, yMin, yMax, rangeY };
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

export default function PlayerPtChart({
  points,
  heading = "pt推移",
  showFooter = true,
  lineColor: lineColorProp,
  periodFilter,
}: Props) {
  if (points.length === 0) return null;

  const width = Math.max(320, points.length * 28);
  const height = 220;
  const { padding, chartW, xAt, yAt, yMin, yMax } = chartCoords(points, width, height);
  const zeroY = yAt(0);
  const ticks = yTicks(yMin, yMax);
  const chartBottom = height - padding.bottom;
  const positiveBandHeight = Math.max(0, zeroY - padding.top);
  const negativeBandHeight = Math.max(0, chartBottom - zeroY);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(p.cumulativePt)}`)
    .join(" ");

  const finalPt = points[points.length - 1].cumulativePt;
  const lineColor =
    lineColorProp ?? (finalPt >= 0 ? "#059669" : "#dc2626");

  const dateLabelIndices = points.reduce<number[]>((acc, point, i) => {
    if (i === 0 || point.playedAt !== points[i - 1].playedAt) {
      acc.push(i);
    }
    return acc;
  }, []);

  return (
    <section className="space-y-3">
      {heading !== null && (
        <h2 className="text-sm font-semibold text-stone-700">{heading}</h2>
      )}

      {periodFilter}

      <div className="rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm">
        <ScaleToFit>
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="半荘ごとの累積pt推移グラフ"
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

          {dateLabelIndices.map((i) => (
            <line
              key={`date-line-${points[i].playedAt}-${i}`}
              x1={xAt(i)}
              y1={padding.top}
              x2={xAt(i)}
              y2={height - padding.bottom}
              stroke="#78716c"
              strokeWidth={1.25}
              strokeDasharray="4 3"
            />
          ))}

          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((point, i) => (
            <circle
              key={point.index}
              cx={xAt(i)}
              cy={yAt(point.cumulativePt)}
              r={points.length > 40 ? 2.5 : 3.5}
              fill={lineColor}
            >
              <title>
                {point.label}: {point.deltaPt >= 0 ? "+" : ""}
                {point.deltaPt}pt → 累計 {formatMoney(point.cumulativePt)}
              </title>
            </circle>
          ))}

          {dateLabelIndices.map((i) => (
            <text
              key={points[i].playedAt + i}
              x={xAt(i)}
              y={height - 10}
              textAnchor="middle"
              className="fill-stone-500 text-[9px]"
            >
              {points[i].playedAt.slice(5).replace("-", "/")}
            </text>
          ))}
          </svg>
        </ScaleToFit>
      </div>
      {showFooter && (
        <p className="text-xs text-stone-500">
          ウマ・オカ・レート込みの半荘ptを時系列で累積表示（各点にホバーで詳細）
        </p>
      )}
    </section>
  );
}
