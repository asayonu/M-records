import { formatMoney } from "@/lib/records/ruleScoring";
import { pointDiffToneClass } from "@/lib/records/types";

type Props = {
  totalPt: number;
};

export default function PlayerTotalPtDisplay({ totalPt }: Props) {
  return (
    <div className="flex w-[7.5rem] shrink-0 items-center justify-end gap-1.5">
      <span className="shrink-0 text-xs font-medium text-stone-500">通算pt</span>
      <span
        className={`w-[5.25rem] shrink-0 text-right text-sm font-bold tabular-nums ${pointDiffToneClass(totalPt)}`}
      >
        {formatMoney(totalPt)}
      </span>
    </div>
  );
}
