import { resolveChartColor } from "@/lib/players/chartColors";
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
  const { moneyTotals } = computeScoresTotals(
    rounds.map((r) => r.scores),
    config,
  );
  return {
    modeLabel: config.modeLabel,
    ruleName: config.ruleName,
    hanchanCount: rounds.length,
    playerNames: sorted.map((p) => p.player.name),
    playerPtTotals: moneyTotals,
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

  if (points.length > 0) {
    points.unshift({
      index: 0,
      label: "0半荘",
      playedAt: points[0].playedAt,
      deltaPt: 0,
      cumulativePt: 0,
    });
  }

  return points;
}

export function getPlayerTotalPt(
  games: GameWithDetails[],
  playerId: string,
): number {
  const points = getPlayerPtHistory(games, playerId);
  return points.length > 0 ? points[points.length - 1].cumulativePt : 0;
}

export type CombinedPtHistoryPoint = {
  globalIndex: number;
  cumulativePt: number;
  label: string;
  deltaPt: number;
};

export type CombinedPtSeries = {
  playerId: string;
  playerName: string;
  chartColor: string;
  points: CombinedPtHistoryPoint[];
};

export function getCombinedPlayerPtSeries(
  games: GameWithDetails[],
  players: { id: string; name: string; chartColor: string | null }[],
): { series: CombinedPtSeries[]; totalHanchan: number; hanchanDates: string[] } {
  const playerIds = new Set(players.map((player) => player.id));
  const cumulative = new Map<string, number>();
  const pointsByPlayer = new Map<string, CombinedPtHistoryPoint[]>();
  for (const player of players) {
    cumulative.set(player.id, 0);
    pointsByPlayer.set(player.id, []);
  }

  const sortedGames = [...games].sort((a, b) => {
    const byDate = a.playedAt.getTime() - b.playedAt.getTime();
    if (byDate !== 0) return byDate;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  let globalIndex = 0;
  const hanchanDates: string[] = [];

  for (const game of sortedGames) {
    const config = resolveGameConfig(game);
    const rounds = extractRoundScores(game, config.playerCount);
    const dateStr = toDateString(game.playedAt);
    const flags = { useUma: config.useUma, useOka: config.useOka };

    for (const [roundIndex, round] of rounds.entries()) {
      hanchanDates[globalIndex] = dateStr;

      for (const gp of game.players) {
        if (!playerIds.has(gp.playerId)) continue;

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
        const nextTotal = (cumulative.get(gp.playerId) ?? 0) + deltaPt;
        cumulative.set(gp.playerId, nextTotal);

        pointsByPlayer.get(gp.playerId)!.push({
          globalIndex,
          cumulativePt: Math.round(nextTotal * 10) / 10,
          label: `${dateStr.slice(5).replace("-", "/")} ${roundIndex + 1}半荘`,
          deltaPt: Math.round(deltaPt * 10) / 10,
        });
      }
      globalIndex += 1;
    }
  }

  if (globalIndex > 0) {
    hanchanDates.unshift(hanchanDates[0]);

    for (const player of players) {
      const playerPoints = pointsByPlayer.get(player.id)!;
      if (playerPoints.length === 0) continue;
      for (const point of playerPoints) {
        point.globalIndex += 1;
      }
      playerPoints.unshift({
        globalIndex: 0,
        cumulativePt: 0,
        label: "0半荘",
        deltaPt: 0,
      });
    }
  }

  return {
    series: players.map((player, index) => ({
      playerId: player.id,
      playerName: player.name,
      chartColor: resolveChartColor(player.chartColor, index),
      points: pointsByPlayer.get(player.id) ?? [],
    })),
    totalHanchan: globalIndex > 0 ? globalIndex + 1 : 0,
    hanchanDates,
  };
}
