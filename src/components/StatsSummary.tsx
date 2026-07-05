import { formatPointDiff, formatScore } from "@/lib/records/types";

type Props = {
  gameCount: number;
  averageStartingScore: number;
  hanchanCount: number;
  totalDiff: number;
  averageDiff: number;
  averageRank: number;
  firstRate: number;
  topTwoRate: number;
  lastRate: number;
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm shadow-stone-200/40">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-stone-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-stone-500">{sub}</p>}
    </div>
  );
}

export default function StatsSummary({
  gameCount,
  averageStartingScore,
  hanchanCount,
  totalDiff,
  averageDiff,
  averageRank,
  firstRate,
  topTwoRate,
  lastRate,
}: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-stone-700">通算成績</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="参加対局" value={`${gameCount} 局`} />
        <StatCard label="半荘数" value={`${hanchanCount} 半荘`} />
        <StatCard
          label="合計収支"
          value={formatPointDiff(totalDiff)}
          sub={`1半荘平均 ${formatPointDiff(Math.round(averageDiff))}`}
        />
        <StatCard
          label="平均順位"
          value={averageRank.toFixed(2)}
          sub={`トップ ${firstRate.toFixed(0)}% / ラス ${lastRate.toFixed(0)}%`}
        />
        <StatCard
          label="連対率"
          value={`${topTwoRate.toFixed(0)}%`}
          sub={`参考持ち点 ${averageStartingScore.toLocaleString()}点`}
        />
        <StatCard
          label="平均収支/半荘"
          value={formatPointDiff(Math.round(averageDiff))}
          sub={formatScore(
            averageStartingScore + Math.round(averageDiff),
            averageStartingScore,
          )}
        />
      </div>
    </section>
  );
}
