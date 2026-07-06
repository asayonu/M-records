"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  getAllGamesForUser,
  getAllPlayersForUser,
  getGameByIdForUser,
  getGamesByDateForUser,
  getGamesByMonthForUser,
  getGamesForPlayerForUser,
  getPlayerByIdForUser,
} from "@/lib/records/queries";

export type ShareAccess = {
  userId: string;
  email: string;
};

function createShareToken(): string {
  return randomBytes(18).toString("base64url");
}

export async function getShareSettings() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { shareEnabled: true, shareToken: true },
  });
  if (!user) {
    notFound();
  }
  return user;
}

export async function setShareEnabledAction(enabled: boolean): Promise<void> {
  const userId = await requireUserId();
  if (enabled) {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { shareToken: true },
    });
    await prisma.user.update({
      where: { id: userId },
      data: {
        shareEnabled: true,
        shareToken: existing?.shareToken ?? createShareToken(),
      },
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { shareEnabled: false },
    });
  }
  revalidatePath("/admin/share");
}

export async function regenerateShareTokenAction(): Promise<void> {
  const userId = await requireUserId();
  await prisma.user.update({
    where: { id: userId },
    data: {
      shareEnabled: true,
      shareToken: createShareToken(),
    },
  });
  revalidatePath("/admin/share");
}

export async function resolveShareAccess(
  shareToken: string,
): Promise<ShareAccess | null> {
  if (!shareToken || shareToken.length < 8) return null;

  const user = await prisma.user.findFirst({
    where: { shareToken, shareEnabled: true },
    select: { id: true, email: true },
  });
  if (!user) return null;

  return { userId: user.id, email: user.email };
}

export async function requireShareAccess(
  shareToken: string,
): Promise<ShareAccess> {
  const access = await resolveShareAccess(shareToken);
  if (!access) notFound();
  return access;
}

export async function getSharedGamesByMonth(
  shareToken: string,
  year: number,
  month: number,
) {
  const { userId } = await requireShareAccess(shareToken);
  return getGamesByMonthForUser(userId, year, month);
}

export async function getSharedGamesByDate(
  shareToken: string,
  dateStr: string,
) {
  const { userId } = await requireShareAccess(shareToken);
  return getGamesByDateForUser(userId, dateStr);
}

export async function getSharedGameById(shareToken: string, gameId: string) {
  const { userId } = await requireShareAccess(shareToken);
  return getGameByIdForUser(userId, gameId);
}

export async function getSharedPlayerById(
  shareToken: string,
  playerId: string,
) {
  const { userId } = await requireShareAccess(shareToken);
  return getPlayerByIdForUser(userId, playerId);
}

export async function getSharedGamesForPlayer(
  shareToken: string,
  playerId: string,
) {
  const { userId } = await requireShareAccess(shareToken);
  return getGamesForPlayerForUser(userId, playerId);
}

export async function getSharedAllGames(shareToken: string) {
  const { userId } = await requireShareAccess(shareToken);
  return getAllGamesForUser(userId);
}

export async function getSharedAllPlayers(shareToken: string) {
  const { userId } = await requireShareAccess(shareToken);
  return getAllPlayersForUser(userId);
}
