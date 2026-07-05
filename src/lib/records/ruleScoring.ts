import { type GameMode } from "@/lib/records/mode";

export type RuleScoring = {
  umaFirst: number;
  umaSecond: number;
  umaThird: number;
  umaFourth: number;
  oka: number;
  ratePer1000: number;
};

export const DEFAULT_SCORING: Record<GameMode, RuleScoring> = {
  sanma: {
    umaFirst: 15,
    umaSecond: 0,
    umaThird: -15,
    umaFourth: 0,
    oka: 10,
    ratePer1000: 1,
  },
  yonma: {
    umaFirst: 20,
    umaSecond: 10,
    umaThird: -10,
    umaFourth: -20,
    oka: 10,
    ratePer1000: 1,
  },
};

export function umaValuesForMode(
  scoring: RuleScoring,
  playerCount: number,
): number[] {
  const values = [
    scoring.umaFirst,
    scoring.umaSecond,
    scoring.umaThird,
    scoring.umaFourth,
  ];
  return values.slice(0, playerCount);
}

export function formatUmaLabel(
  scoring: RuleScoring,
  playerCount: number,
): string {
  return umaValuesForMode(scoring, playerCount)
    .map((v) => (v > 0 ? `+${v}` : String(v)))
    .join(" / ");
}

export function formatOkaLabel(oka: number): string {
  return `${oka * 1000}点`;
}

export function formatRateLabel(ratePer1000: number): string {
  if (Number.isInteger(ratePer1000)) {
    return `${ratePer1000}pt / 1000点`;
  }
  return `${ratePer1000}pt / 1000点`;
}

export type RuleScoringFlags = {
  useUma: boolean;
  useOka: boolean;
};

export function formatRuleSettingsSummary(
  flags: RuleScoringFlags,
  scoring: RuleScoring,
  playerCount: number,
): string {
  const parts: string[] = [];
  if (flags.useUma) {
    parts.push(`ウマ ${formatUmaLabel(scoring, playerCount)}`);
  } else {
    parts.push("ウマなし");
  }
  if (flags.useOka) {
    parts.push(`オカ ${formatOkaLabel(scoring.oka)}`);
  } else {
    parts.push("オカなし");
  }
  parts.push(`レート ${formatRateLabel(scoring.ratePer1000)}`);
  return parts.join(" · ");
}

export function getUmaBonus(scoring: RuleScoring, rank: number): number {
  const values = [
    scoring.umaFirst,
    scoring.umaSecond,
    scoring.umaThird,
    scoring.umaFourth,
  ];
  return (values[rank - 1] ?? 0) * 1000;
}

function averageUmaForTiedRanks(
  umaValues: number[],
  startRank: number,
  groupSize: number,
): number {
  let sum = 0;
  for (let rank = startRank; rank < startRank + groupSize; rank++) {
    sum += umaValues[rank - 1] ?? 0;
  }
  return (sum / groupSize) * 1000;
}

export function getUmaBonusForSeat(
  scores: number[],
  seat: number,
  scoring: RuleScoring,
  playerCount: number,
): number {
  const umaValues = umaValuesForMode(scoring, playerCount);
  const sorted = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].score === sorted[i].score) {
      j++;
    }
    const groupSize = j - i;
    const startRank = i + 1;
    for (let k = i; k < j; k++) {
      if (sorted[k].index === seat) {
        return averageUmaForTiedRanks(umaValues, startRank, groupSize);
      }
    }
    i = j;
  }
  return 0;
}

export function getOkaBonus(scoring: RuleScoring, rank: number): number {
  return rank === 1 ? scoring.oka * 1000 : 0;
}

export function getOkaBonusForSeat(
  scores: number[],
  seat: number,
  scoring: RuleScoring,
): number {
  const maxScore = Math.max(...scores);
  if (scores[seat] !== maxScore) return 0;
  const topCount = scores.filter((score) => score === maxScore).length;
  return (scoring.oka * 1000) / topCount;
}

export function calcAdjustedHanchanDiff(
  scores: number[],
  seat: number,
  startingScore: number,
  scoring: RuleScoring,
  flags: RuleScoringFlags,
  playerCount: number,
): number {
  const score = scores[seat];
  let adjusted = score - startingScore;
  if (flags.useUma) {
    adjusted += getUmaBonusForSeat(scores, seat, scoring, playerCount);
  }
  if (flags.useOka) {
    adjusted += getOkaBonusForSeat(scores, seat, scoring);
  }
  return adjusted;
}

export function hasScoreAdjustment(flags: RuleScoringFlags): boolean {
  return flags.useUma || flags.useOka;
}

export function calcMoneyFromPoints(
  pointDiff: number,
  ratePer1000: number,
): number {
  return (pointDiff / 1000) * ratePer1000;
}

export function formatMoney(amount: number): string {
  const rounded = Math.round(amount * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  if (Number.isInteger(rounded)) {
    return `${sign}${rounded.toLocaleString()}pt`;
  }
  return `${sign}${rounded.toLocaleString()}pt`;
}

export function parseRuleScoringInput(formData: FormData): {
  useUma: boolean;
  useOka: boolean;
  scoring: RuleScoring;
} {
  const useUma = formData.get("useUma") === "on";
  const useOka = formData.get("useOka") === "on";
  const scoring: RuleScoring = {
    umaFirst: Number(formData.get("umaFirst") ?? 0),
    umaSecond: Number(formData.get("umaSecond") ?? 0),
    umaThird: Number(formData.get("umaThird") ?? 0),
    umaFourth: Number(formData.get("umaFourth") ?? 0),
    oka: Number(formData.get("oka") ?? 0),
    ratePer1000: Number(formData.get("ratePer1000") ?? 0),
  };

  if (!useUma) {
    scoring.umaFirst = 0;
    scoring.umaSecond = 0;
    scoring.umaThird = 0;
    scoring.umaFourth = 0;
  }
  if (!useOka) {
    scoring.oka = 0;
  }

  return { useUma, useOka, scoring };
}

export function validateRuleScoring(
  scoring: RuleScoring,
  playerCount: number,
  flags: RuleScoringFlags,
): string | null {
  if (
    !Number.isFinite(scoring.ratePer1000) ||
    scoring.ratePer1000 < 0
  ) {
    return "レートは0以上の数値で入力してください";
  }

  if (flags.useUma) {
    const umaValues = umaValuesForMode(scoring, playerCount);
    for (const value of umaValues) {
      if (!Number.isInteger(value)) {
        return "ウマは整数（千点単位）で入力してください";
      }
    }
    const umaSum = umaValues.reduce((a, b) => a + b, 0);
    if (umaSum !== 0) {
      return "ウマの合計は0になるように設定してください";
    }
  }

  if (flags.useOka) {
    if (!Number.isInteger(scoring.oka) || scoring.oka < 0) {
      return "オカは0以上の整数（千点単位）で入力してください";
    }
  }

  return null;
}
