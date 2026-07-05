import { getModeConfig, type GameMode } from "@/lib/records/mode";
import {
  DEFAULT_SCORING,
  type RuleScoring,
} from "@/lib/records/ruleScoring";

export type GameRuleConfig = {
  mode: GameMode;
  modeLabel: string;
  ruleName: string;
  playerCount: number;
  startingScore: number;
  totalScorePerRound: number;
  useUma: boolean;
  useOka: boolean;
  scoring: RuleScoring;
};

type GameWithRule = {
  mode: string;
  startingScore: number;
  totalScorePerRound: number;
  umaFirst: number;
  umaSecond: number;
  umaThird: number;
  umaFourth: number;
  oka: number;
  ratePer1000: number;
  useUma: boolean;
  useOka: boolean;
  rule?: { name: string } | null;
};

type RuleLike = {
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
};

function scoringFromFields(fields: {
  umaFirst: number;
  umaSecond: number;
  umaThird: number;
  umaFourth: number;
  oka: number;
  ratePer1000: number;
}): RuleScoring {
  return {
    umaFirst: fields.umaFirst,
    umaSecond: fields.umaSecond,
    umaThird: fields.umaThird,
    umaFourth: fields.umaFourth,
    oka: fields.oka,
    ratePer1000: fields.ratePer1000,
  };
}

export function resolveGameConfig(game: GameWithRule): GameRuleConfig {
  const mode = game.mode === "yonma" ? "yonma" : "sanma";
  const modeMeta = getModeConfig(mode);
  return {
    mode,
    modeLabel: modeMeta.label,
    ruleName: game.rule?.name ?? modeMeta.label,
    playerCount: modeMeta.playerCount,
    startingScore: game.startingScore,
    totalScorePerRound: game.totalScorePerRound,
    useUma: game.useUma,
    useOka: game.useOka,
    scoring: scoringFromFields(game),
  };
}

export function configFromRule(rule: RuleLike): GameRuleConfig {
  const mode = rule.mode === "yonma" ? "yonma" : "sanma";
  const modeMeta = getModeConfig(mode);
  return {
    mode,
    modeLabel: modeMeta.label,
    ruleName: rule.name,
    playerCount: modeMeta.playerCount,
    startingScore: rule.startingScore,
    totalScorePerRound: rule.startingScore * modeMeta.playerCount,
    useUma: rule.useUma,
    useOka: rule.useOka,
    scoring: scoringFromFields(rule),
  };
}

export function defaultScoringForMode(mode: GameMode): RuleScoring {
  return { ...DEFAULT_SCORING[mode] };
}
