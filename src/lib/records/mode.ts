export type GameMode = "sanma" | "yonma";

export const DEFAULT_GAME_MODE: GameMode = "sanma";

export type ModeConfig = {
  label: string;
  playerCount: number;
  seatLabels: readonly string[];
  startingScore: number;
  totalScorePerRound: number;
};

export const MODE_CONFIG: Record<GameMode, ModeConfig> = {
  sanma: {
    label: "三麻",
    playerCount: 3,
    seatLabels: ["東", "南", "西"],
    startingScore: 35000,
    totalScorePerRound: 105000,
  },
  yonma: {
    label: "四麻",
    playerCount: 4,
    seatLabels: ["東", "南", "西", "北"],
    startingScore: 25000,
    totalScorePerRound: 100000,
  },
};

export function getModeConfig(mode: string): ModeConfig {
  if (mode === "yonma") return MODE_CONFIG.yonma;
  return MODE_CONFIG.sanma;
}

export function parseGameMode(value: string): GameMode {
  return value === "yonma" ? "yonma" : "sanma";
}

export function minPlayersForMode(mode: GameMode): number {
  return MODE_CONFIG[mode].playerCount;
}

export function defaultStartingScore(mode: GameMode): number {
  return MODE_CONFIG[mode].startingScore;
}
