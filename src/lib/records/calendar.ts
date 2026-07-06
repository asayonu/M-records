import { toDateString } from "@/lib/records/types";

type GameWithDate = { playedAt: Date };

type GameWithRounds = GameWithDate & { rounds: unknown[] };

export function groupGamesByDate<T extends GameWithDate>(games: T[]) {
  const map = new Map<string, T[]>();
  for (const game of games) {
    const key = toDateString(game.playedAt);
    const list = map.get(key) ?? [];
    list.push(game);
    map.set(key, list);
  }
  return map;
}

export function hanchanCountByDate(games: GameWithRounds[]) {
  const map = new Map<string, number>();
  for (const game of games) {
    const key = toDateString(game.playedAt);
    map.set(key, (map.get(key) ?? 0) + game.rounds.length);
  }
  return map;
}
