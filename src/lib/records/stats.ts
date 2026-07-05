import { resolveGameConfig, type GameRuleConfig } from "@/lib/records/gameConfig";
import {
  calcAdjustedHanchanDiff,
  calcMoneyFromPoints,
} from "@/lib/records/ruleScoring";
import { calcRoundRankings, toDateString, type RoundInput } from "@/lib/records/types";

export function computeScoresTotals(
  scores: number[][],
  config: GameRuleConfig,
) {
  const playerCount = config.playerCount;
  const hanchanCount = scores.length;
  const scoringFlags = { useUma: config.useUma, useOka: config.useOka };
  const totals = Array.from({ length: playerCount }, () => 0);
  const adjustedTotals = Array.from({ length: playerCount }, () => 0);

  for (const row of scores) {
    if (row.length !== playerCount) continue;
    row.forEach((score, i) => {
      totals[i] += score;
      adjustedTotals[i] += calcAdjustedHanchanDiff(
        row,
        i,
        config.startingScore,
        config.scoring,
        scoringFlags,
        playerCount,
      );
    });
  }

  const diffs = totals.map(
    (total) => total - config.startingScore * hanchanCount,
  );
  const moneyTotals = adjustedTotals.map((total) =>
    calcMoneyFromPoints(total, config.scoring.ratePer1000),
  );

  return {
    totals,
    diffs,
    adjustedTotals,
    moneyTotals,
    hanchanCount,
    scoringFlags,
  };
}

type GameWithDetails = {
  id: string;
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
  playedAt: Date;
  createdAt: Date;
  rule?: { name: string } | null;
  players: {
    id: string;
    seat: number;
    playerId: string;
    player: { id: string; name: string };
  }[];
  rounds: {
    number: number;
    roundScores: { score: number; gamePlayer: { seat: number } }[];
  }[];
};

function extractRoundScores(
  game: GameWithDetails,
  playerCount: number,
): RoundInput[] {
  return game.rounds.map((round) => {
    const scores = Array.from({ length: playerCount }, () => 0);
    for (const rs of round.roundScores) {
      scores[rs.gamePlayer.seat] = rs.score;
    }
    return { scores };
  });
}

export function summarizeGame(game: GameWithDetails) {
  const config = resolveGameConfig(game);
  const rounds = extractRoundScores(game, config.playerCount);
  const sorted = [...game.players].sort((a, b) => a.seat - b.seat);
  return {
    modeLabel: config.modeLabel,
    ruleName: config.ruleName,
    hanchanCount: rounds.length,
    playerNames: sorted.map((p) => p.player.name),
  };
}

export function getGameDetailRows(game: GameWithDetails) {
  const config = resolveGameConfig(game);
  const rounds = extractRoundScores(game, config.playerCount);
  return rounds.map((round, index) => {
    const ranks = calcRoundRankings(round.scores);
    return {
      number: index + 1,
      scores: round.scores,
      ranks,
    };
  });
}

export function getGameTotals(game: GameWithDetails) {
  const config = resolveGameConfig(game);
  const rounds = extractRoundScores(game, config.playerCount);
  const result = computeScoresTotals(
    rounds.map((r) => r.scores),
    config,
  );
  return { ...result, config };
}

export function getPlayerRoundData(
  games: GameWithDetails[],
  playerId: string,
) {
  const roundData: {
    scores: number[];
    playerIndex: number;
    startingScore: number;
    playerCount: number;
  }[] = [];

  for (const game of games) {
    const gp = game.players.find((p) => p.playerId === playerId);
    if (!gp) continue;
    const config = resolveGameConfig(game);
    const rounds = extractRoundScores(game, config.playerCount);
    for (const round of rounds) {
      roundData.push({
        scores: round.scores,
        playerIndex: gp.seat,
        startingScore: config.startingScore,
        playerCount: config.playerCount,
      });
    }
  }

  return roundData;
}

export type PlayerPtHistoryPoint = {
  index: number;
  label: string;
  playedAt: string;
  deltaPt: number;
  cumulativePt: number;
};

export function getPlayerPtHistory(
  games: GameWithDetails[],
  playerId: string,
): PlayerPtHistoryPoint[] {
  const sorted = [...games].sort((a, b) => {
    const byDate = a.playedAt.getTime() - b.playedAt.getTime();
    if (byDate !== 0) return byDate;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  const points: PlayerPtHistoryPoint[] = [];
  let cumulative = 0;
  let index = 0;

  for (const game of sorted) {
    const gp = game.players.find((p) => p.playerId === playerId);
    if (!gp) continue;

    const config = resolveGameConfig(game);
    const rounds = extractRoundScores(game, config.playerCount);
    const dateStr = toDateString(game.playedAt);
    const flags = { useUma: config.useUma, useOka: config.useOka };

    rounds.forEach((round, roundIndex) => {
      const adjusted = calcAdjustedHanchanDiff(
        round.scores,
        gp.seat,
        config.startingScore,
        config.scoring,
        flags,
        config.playerCount,
      );
      const deltaPt = calcMoneyFromPoints(
        adjusted,
        config.scoring.ratePer1000,
      );
      cumulative += deltaPt;
      index += 1;

      points.push({
        index,
        label: `${dateStr.slice(5).replace("-", "/")} ${roundIndex + 1}半荘`,
        playedAt: dateStr,
        deltaPt: Math.round(deltaPt * 10) / 10,
        cumulativePt: Math.round(cumulative * 10) / 10,
      });
    });
  }

  return points;
}
