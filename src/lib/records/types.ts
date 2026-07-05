import { type GameMode } from "@/lib/records/mode";

export type GameInput = {
  mode: GameMode;
  playedAt: string;
  playerCount: number;
  startingScore: number;
  totalScorePerRound: number;
  players: PlayerInput[];
  rounds: RoundInput[];
};

export type PlayerInput = {
  playerId: string;
  seat: number;
};

export type RoundInput = {
  scores: number[];
};

export function validateGameInput(input: GameInput): string | null {
  const { playerCount, totalScorePerRound, startingScore } = input;

  if (!input.playedAt) {
    return "対局日を入力してください";
  }

  if (input.players.length !== playerCount) {
    return `プレイヤーは${playerCount}人必要です`;
  }

  const playerIds = input.players.map((p) => p.playerId);
  if (playerIds.some((id) => !id)) {
    return "全席にプレイヤーを選択してください";
  }

  if (new Set(playerIds).size !== playerCount) {
    return "同じプレイヤーを2席以上に割り当てることはできません";
  }

  if (startingScore * playerCount !== totalScorePerRound) {
    return "ルール設定が不正です";
  }

  if (input.rounds.length === 0) {
    return "半荘を1つ以上入力してください";
  }

  for (let i = 0; i < input.rounds.length; i++) {
    const round = input.rounds[i];
    if (round.scores.length !== playerCount) {
      return `第${i + 1}半荘の点数が${playerCount}人分必要です`;
    }
    for (let seat = 0; seat < round.scores.length; seat++) {
      const score = round.scores[seat];
      if (score < 0) {
        return `第${i + 1}半荘の点数をすべて入力してください`;
      }
      if (!Number.isInteger(score)) {
        return `第${i + 1}半荘の点数は0以上の整数で入力してください`;
      }
    }
    const sum = round.scores.reduce((a, b) => a + b, 0);
    if (sum !== totalScorePerRound) {
      return `第${i + 1}半荘の合計は${formatScoreShort(totalScorePerRound)}である必要があります（現在: ${formatScoreShort(sum)}）`;
    }
  }

  return null;
}

export function formatScoreShort(score: number): string {
  return (score / 100).toLocaleString();
}

export function scoreShortInputValue(score: number): string {
  if (score < 0) return "";
  return String(score / 100);
}

export function parseScoreShortInput(value: string): number {
  if (value === "") return 0;
  return Number(value) * 100;
}

export function formatScore(score: number, startingScore: number): string {
  const diff = score - startingScore;
  const sign = diff > 0 ? "+" : "";
  return `${score.toLocaleString()} (${sign}${diff.toLocaleString()})`;
}

export function formatPointDiff(diff: number): string {
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff.toLocaleString()}`;
}

export function pointDiffToneClass(diff: number): string {
  if (diff > 0) return "text-emerald-600";
  if (diff < 0) return "text-red-600";
  return "text-stone-600";
}

export function calcRoundRankings(scores: number[]): number[] {
  const ranks = new Array<number>(scores.length);
  const sorted = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].score === sorted[i].score) {
      j++;
    }
    const tieRank = i + 1;
    for (let k = i; k < j; k++) {
      ranks[sorted[k].index] = tieRank;
    }
    i = j;
  }
  return ranks;
}

export function countSameScore(scores: number[], seat: number): number {
  const target = scores[seat];
  return scores.filter((score) => score === target).length;
}

export function formatRankLabel(
  rank: number,
  scores: number[],
  seat: number,
): string {
  if (countSameScore(scores, seat) > 1) {
    return `${rank}位同着`;
  }
  return `${rank}位`;
}

export function calcPlayerStats(
  rounds: {
    scores: number[];
    playerIndex: number;
    startingScore: number;
    playerCount: number;
  }[],
) {
  if (rounds.length === 0) {
    return {
      hanchanCount: 0,
      totalDiff: 0,
      averageDiff: 0,
      averageRank: 0,
      firstRate: 0,
      topTwoRate: 0,
      lastRate: 0,
    };
  }

  let totalDiff = 0;
  let rankSum = 0;
  let firstCount = 0;
  let topTwoCount = 0;
  let lastCount = 0;

  for (const round of rounds) {
    const score = round.scores[round.playerIndex];
    const diff = score - round.startingScore;
    totalDiff += diff;

    const ranks = calcRoundRankings(round.scores);
    const rank = ranks[round.playerIndex];
    rankSum += rank;
    if (rank === 1) firstCount++;
    if (rank <= 2) topTwoCount++;
    if (rank === round.playerCount) lastCount++;
  }

  const count = rounds.length;
  return {
    hanchanCount: count,
    totalDiff,
    averageDiff: totalDiff / count,
    averageRank: rankSum / count,
    firstRate: (firstCount / count) * 100,
    topTwoRate: (topTwoCount / count) * 100,
    lastRate: (lastCount / count) * 100,
  };
}

const APP_TIMEZONE = "Asia/Tokyo";

function getDatePartsInAppTimeZone(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)!.value);

  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
  };
}

export function toDateString(date: Date): string {
  const { year, month, day } = getDatePartsInAppTimeZone(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getTodayDateString(): string {
  return toDateString(new Date());
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const { year, month } = getDatePartsInAppTimeZone(new Date());
  return { year, month };
}

export function parseDateAtNoon(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00+09:00`);
}

export function parseDateString(dateStr: string): Date {
  return parseDateAtNoon(dateStr);
}

export function getMonthRange(year: number, month: number) {
  const monthLabel = String(month).padStart(2, "0");
  const start = new Date(`${year}-${monthLabel}-01T00:00:00+09:00`);
  const lastDay = new Date(year, month, 0).getDate();
  const end = new Date(
    `${year}-${monthLabel}-${String(lastDay).padStart(2, "0")}T23:59:59.999+09:00`,
  );
  return { start, end };
}

export function getDayRange(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00+09:00`);
  const end = new Date(`${dateStr}T23:59:59.999+09:00`);
  return { start, end };
}

export function formatJapaneseDate(dateStr: string): string {
  const date = parseDateString(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export { parseGameMode, getModeConfig, DEFAULT_GAME_MODE } from "@/lib/records/mode";
export type { GameMode } from "@/lib/records/mode";
