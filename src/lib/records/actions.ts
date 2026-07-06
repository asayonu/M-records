"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { configFromRule, resolveGameConfig } from "@/lib/records/gameConfig";
import {
  getGameByIdForUser,
  getGamesByDateForUser,
  getGamesByMonthForUser,
  getGamesForPlayerForUser,
  getAllGamesForUser,
} from "@/lib/records/queries";
import {
  parseDateAtNoon,
  toDateString,
  validateGameInput,
  type GameInput,
} from "@/lib/records/types";
import { getRuleById } from "@/lib/rules/actions";

export type GameActionState = {
  error?: string;
};

function parseGameFormData(formData: FormData, playerCount: number) {
  const roundCount = Number(formData.get("roundCount") ?? 0);
  const players = Array.from({ length: playerCount }, (_, seat) => ({
    playerId: String(formData.get(`player_${seat}_id`) ?? ""),
    seat,
  }));
  const rounds = Array.from({ length: roundCount }, (_, i) => ({
    scores: Array.from({ length: playerCount }, (_, seat) =>
      Number(formData.get(`round_${i}_score_${seat}`) ?? 0),
    ),
  }));
  return { players, rounds, roundCount };
}

async function saveGameRounds(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  gameId: string,
  players: { playerId: string; seat: number }[],
  rounds: { scores: number[] }[],
) {
  await tx.round.deleteMany({ where: { gameId } });
  await tx.gamePlayer.deleteMany({ where: { gameId } });

  const createdPlayers = await Promise.all(
    players.map((p) =>
      tx.gamePlayer.create({
        data: {
          gameId,
          playerId: p.playerId,
          seat: p.seat,
        },
      }),
    ),
  );

  for (let i = 0; i < rounds.length; i++) {
    await tx.round.create({
      data: {
        gameId,
        number: i + 1,
        roundScores: {
          create: rounds[i].scores.map((score, seat) => {
            const gp = createdPlayers.find((p) => p.seat === seat)!;
            return {
              gamePlayerId: gp.id,
              score,
            };
          }),
        },
      },
    });
  }
}

export async function createGameAction(
  _prev: GameActionState,
  formData: FormData,
): Promise<GameActionState> {
  const userId = await requireUserId();
  const ruleId = String(formData.get("ruleId") ?? "");
  const playedAt = String(formData.get("playedAt") ?? "");

  if (!ruleId) {
    return { error: "ルールを選択してください" };
  }

  const rule = await getRuleById(ruleId);
  if (!rule) {
    return { error: "選択したルールが見つかりません" };
  }

  const config = configFromRule(rule);
  const { players, rounds } = parseGameFormData(formData, config.playerCount);

  const input: GameInput = {
    mode: config.mode,
    playedAt,
    playerCount: config.playerCount,
    startingScore: config.startingScore,
    totalScorePerRound: config.totalScorePerRound,
    players,
    rounds,
  };

  const validationError = validateGameInput(input);
  if (validationError) {
    return { error: validationError };
  }

  const playerRecords = await prisma.player.findMany({
    where: {
      userId,
      id: { in: players.map((p) => p.playerId) },
    },
  });
  if (playerRecords.length !== config.playerCount) {
    return { error: "選択したプレイヤーが見つかりません" };
  }

  const game = await prisma.$transaction(async (tx) => {
    const created = await tx.game.create({
      data: {
        userId,
        mode: config.mode,
        ruleId: rule.id,
        startingScore: config.startingScore,
        totalScorePerRound: config.totalScorePerRound,
        umaFirst: config.scoring.umaFirst,
        umaSecond: config.scoring.umaSecond,
        umaThird: config.scoring.umaThird,
        umaFourth: config.scoring.umaFourth,
        oka: config.scoring.oka,
        ratePer1000: config.scoring.ratePer1000,
        useUma: config.useUma,
        useOka: config.useOka,
        playedAt: parseDateAtNoon(playedAt),
        players: {
          create: players.map((p) => ({
            playerId: p.playerId,
            seat: p.seat,
          })),
        },
      },
      include: { players: true },
    });

    for (let i = 0; i < rounds.length; i++) {
      await tx.round.create({
        data: {
          gameId: created.id,
          number: i + 1,
          roundScores: {
            create: rounds[i].scores.map((score, seat) => {
              const gp = created.players.find((p) => p.seat === seat)!;
              return {
                gamePlayerId: gp.id,
                score,
              };
            }),
          },
        },
      });
    }

    return created;
  });

  revalidatePath("/");
  revalidatePath(`/dates/${playedAt}`);
  redirect(`/games/${game.id}`);
}

export async function updateGameAction(
  gameId: string,
  _prev: GameActionState,
  formData: FormData,
): Promise<GameActionState> {
  const userId = await requireUserId();
  const game = await getGameById(gameId);
  if (!game) {
    return { error: "対局が見つかりません" };
  }

  const config = resolveGameConfig(game);
  const { players, rounds } = parseGameFormData(formData, config.playerCount);
  const playedAt = String(formData.get("playedAt") ?? "");

  const input: GameInput = {
    mode: config.mode,
    playedAt: playedAt || toDateString(game.playedAt),
    playerCount: config.playerCount,
    startingScore: config.startingScore,
    totalScorePerRound: config.totalScorePerRound,
    players,
    rounds,
  };

  const validationError = validateGameInput(input);
  if (validationError) {
    return { error: validationError };
  }

  const playerRecords = await prisma.player.findMany({
    where: {
      userId,
      id: { in: players.map((p) => p.playerId) },
    },
  });
  if (playerRecords.length !== config.playerCount) {
    return { error: "選択したプレイヤーが見つかりません" };
  }

  const dateStr = input.playedAt;

  await prisma.$transaction(async (tx) => {
    await saveGameRounds(tx, gameId, players, rounds);
  });

  revalidatePath("/");
  revalidatePath(`/dates/${dateStr}`);
  revalidatePath(`/games/${gameId}`);
  for (const gp of game.players) {
    revalidatePath(`/players/${gp.playerId}`);
  }
  for (const p of players) {
    revalidatePath(`/players/${p.playerId}`);
  }
  redirect(`/games/${gameId}`);
}

export async function deleteGameAction(
  gameId: string,
  returnDate: string,
): Promise<void> {
  const userId = await requireUserId();
  const game = await prisma.game.findFirst({
    where: { id: gameId, userId },
  });
  if (!game) {
    redirect(`/dates/${returnDate}`);
  }
  await prisma.game.delete({ where: { id: gameId } });
  revalidatePath("/");
  revalidatePath(`/dates/${returnDate}`);
  redirect(`/dates/${returnDate}`);
}

export async function getGamesByMonth(year: number, month: number) {
  const userId = await requireUserId();
  return getGamesByMonthForUser(userId, year, month);
}

export async function getGamesByDate(dateStr: string) {
  const userId = await requireUserId();
  return getGamesByDateForUser(userId, dateStr);
}

export async function getGameById(gameId: string) {
  const userId = await requireUserId();
  return getGameByIdForUser(userId, gameId);
}

export async function getGamesForPlayer(playerId: string) {
  const userId = await requireUserId();
  return getGamesForPlayerForUser(userId, playerId);
}

export async function getAllGames() {
  const userId = await requireUserId();
  return getAllGamesForUser(userId);
}
