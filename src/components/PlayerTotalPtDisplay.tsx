import { formatMoney } from "@/lib/records/ruleScoring";
import { pointDiffToneClass } from "@/lib/records/types";

type Props = {
  totalPt: number;
  size?: "default" | "large";
};

export default function PlayerTotalPtDisplay({
  totalPt,
  size = "default",
}: Props) {
  const isLarge = size === "large";

  return (
    <div
      className={`flex shrink-0 items-center justify-end gap-1.5 ${isLarge ? "w-[8.5rem]" : "w-[7.5rem]"}`}
    >
      <span
        className={`shrink-0 font-medium text-stone-500 ${isLarge ? "text-sm" : "text-xs"}`}
      >
        通算pt
      </span>
      <span
        className={`shrink-0 text-right font-bold tabular-nums ${isLarge ? "w-[5.75rem] text-base" : "w-[5.25rem] text-sm"} ${pointDiffToneClass(totalPt)}`}
      >
        {formatMoney(totalPt)}
      </span>
    </div>
  );
}
