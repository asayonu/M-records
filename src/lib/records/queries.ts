import { prisma } from "@/lib/db/prisma";
import { getDayRange, getMonthRange } from "@/lib/records/types";

export const gameInclude = {
  rule: true,
  players: {
    orderBy: { seat: "asc" as const },
    include: { player: true },
  },
  rounds: {
    orderBy: { number: "asc" as const },
    include: {
      roundScores: {
        include: { gamePlayer: true },
      },
    },
  },
};

export async function getGamesByMonthForUser(
  userId: string,
  year: number,
  month: number,
) {
  const { start, end } = getMonthRange(year, month);
  return prisma.game.findMany({
    where: { userId, playedAt: { gte: start, lte: end } },
    orderBy: { playedAt: "asc" },
    include: gameInclude,
  });
}

export async function getGamesByDateForUser(userId: string, dateStr: string) {
  const { start, end } = getDayRange(dateStr);
  return prisma.game.findMany({
    where: { userId, playedAt: { gte: start, lte: end } },
    orderBy: { createdAt: "asc" },
    include: gameInclude,
  });
}

export async function getGameByIdForUser(userId: string, gameId: string) {
  return prisma.game.findFirst({
    where: { id: gameId, userId },
    include: gameInclude,
  });
}

export async function getGamesForPlayerForUser(
  userId: string,
  playerId: string,
) {
  const player = await prisma.player.findFirst({
    where: { id: playerId, userId },
  });
  if (!player) return [];

  return prisma.game.findMany({
    where: {
      userId,
      players: { some: { playerId } },
    },
    orderBy: { playedAt: "desc" },
    include: gameInclude,
  });
}

export async function getPlayerByIdForUser(userId: string, playerId: string) {
  return prisma.player.findFirst({
    where: { id: playerId, userId },
  });
}

export async function getAllGamesForUser(userId: string) {
  return prisma.game.findMany({
    where: { userId },
    orderBy: [{ playedAt: "desc" }, { createdAt: "desc" }],
    include: gameInclude,
  });
}

export async function getAllPlayersForUser(userId: string) {
  return prisma.player.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { gamePlayers: true } },
    },
  });
}
