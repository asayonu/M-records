import { toDateString } from "@/lib/records/types";

type GameWithDate = { playedAt: Date };

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
