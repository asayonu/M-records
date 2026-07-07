import { formatMoney } from "@/lib/records/ruleScoring";
import { pointDiffToneClass } from "@/lib/records/types";

type Props = {
  dayCount: number;
  totalPt: number;
  hanchanCount: number;
  averageRank: number;
  firstRate: number;
  secondRate: number;
  thirdRate: number;
};

function StatCard({
  label,
  value,
  sub,
  valueClassName = "text-stone-900",
}: {
  label: string;
  value: string;
  sub?: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-sm shadow-stone-200/40">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className={`mt-1 text-xl font-bold tabular-nums ${valueClassName}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-stone-500">{sub}</p>}
    </div>
  );
}

export default function StatsSummary({
  dayCount,
  totalPt,
  hanchanCount,
  averageRank,
  firstRate,
  secondRate,
  thirdRate,
}: Props) {
  const averagePtPerHanchan =
    hanchanCount > 0 ? totalPt / hanchanCount : 0;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-stone-700">通算成績</h2>

      <div className="flex items-center justify-center gap-3 rounded-xl border border-stone-200/80 bg-white px-5 py-4 shadow-sm shadow-stone-200/40">
        <p className="text-sm font-medium text-stone-500">通算pt</p>
        <p
          className={`text-2xl font-bold tabular-nums ${pointDiffToneClass(totalPt)}`}
        >
          {formatMoney(totalPt)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="参加日数" value={`${dayCount} 日`} />
        <StatCard label="半荘数" value={`${hanchanCount} 半荘`} />
        <StatCard
          label="平均順位"
          value={averageRank.toFixed(2)}
          sub={`1位:${firstRate.toFixed(0)}% / 2位:${secondRate.toFixed(0)}% / 3位:${thirdRate.toFixed(0)}%`}
        />
        <StatCard
          label="平均収支/半荘"
          value={formatMoney(averagePtPerHanchan)}
          valueClassName={pointDiffToneClass(averagePtPerHanchan)}
        />
      </div>
    </section>
  );
}
