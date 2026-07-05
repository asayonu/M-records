import { getModeConfig } from "@/lib/records/mode";
import { formatRuleSettingsSummary } from "@/lib/records/ruleScoring";
import {
  deleteRuleAction,
  setDefaultRuleAction,
} from "@/lib/rules/actions";

type RuleItem = {
  id: string;
  name: string;
  mode: string;
  startingScore: number;
  umaFirst: number;
  umaSecond: number;
  umaThird: number;
  umaFourth: number;
  oka: number;
  ratePer1000: number;
  useUma: boolean;
  useOka: boolean;
  isDefault: boolean;
  _count: { games: number };
};

type Props = {
  rules: RuleItem[];
};

export default function RuleAdminList({ rules }: Props) {
  if (rules.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 bg-white/60 px-4 py-8 text-center text-sm text-stone-600">
        まだルールが登録されていません
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {rules.map((rule) => {
        const modeConfig = getModeConfig(rule.mode);
        const modeLabel = modeConfig.label;
        const total = rule.startingScore * modeConfig.playerCount;
        const scoring = {
          umaFirst: rule.umaFirst,
          umaSecond: rule.umaSecond,
          umaThird: rule.umaThird,
          umaFourth: rule.umaFourth,
          oka: rule.oka,
          ratePer1000: rule.ratePer1000,
        };

        return (
          <li
            key={rule.id}
            className="rounded-xl border border-stone-200/80 bg-white px-4 py-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-stone-900">
                    {rule.name}
                  </span>
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                    {modeLabel}
                  </span>
                  {rule.isDefault && (
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      デフォルト
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  持ち点 {rule.startingScore.toLocaleString()} · 半荘合計{" "}
                  {total.toLocaleString()} · 使用 {rule._count.games} 局
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {formatRuleSettingsSummary(
                    { useUma: rule.useUma, useOka: rule.useOka },
                    scoring,
                    modeConfig.playerCount,
                  )}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {!rule.isDefault && (
                <form action={setDefaultRuleAction.bind(null, rule.id)}>
                  <button
                    type="submit"
                    className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                  >
                    デフォルトにする
                  </button>
                </form>
              )}
              <form action={deleteRuleAction.bind(null, rule.id)}>
                <button
                  type="submit"
                  disabled={rule._count.games > 0}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  title={
                    rule._count.games > 0
                      ? "対局記録があるルールは削除できません"
                      : undefined
                  }
                >
                  削除
                </button>
              </form>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
