"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth/session";
import {
  DEFAULT_CHART_COLORS,
  isValidChartColor,
} from "@/lib/players/chartColors";
import { prisma } from "@/lib/db/prisma";
import {
  getAllPlayersForUser,
  getPlayerByIdForUser,
} from "@/lib/records/queries";

export type PlayerActionState = {
  error?: string;
};

function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return "名前を入力してください";
  }
  if (trimmed.length > 32) {
    return "名前は32文字以内にしてください";
  }
  return null;
}

export async function createPlayerAction(
  _prev: PlayerActionState,
  formData: FormData,
): Promise<PlayerActionState> {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "");
  const nameError = validateName(name);
  if (nameError) return { error: nameError };

  await prisma.player.create({
    data: {
      name: name.trim(),
      userId,
      chartColor:
        DEFAULT_CHART_COLORS[
          (await prisma.player.count({ where: { userId } })) %
            DEFAULT_CHART_COLORS.length
        ],
    },
  });

  const returnTo = String(formData.get("returnTo") ?? "").trim();

  revalidatePath("/admin/players");
  revalidatePath("/");
  revalidatePath("/games/new");

  if (returnTo && returnTo.startsWith("/")) {
    redirect(returnTo);
  }
  redirect("/admin/players");
}

export async function setRegularMemberAction(
  playerId: string,
  isRegularMember: boolean,
): Promise<void> {
  const userId = await requireUserId();
  const result = await prisma.player.updateMany({
    where: { id: playerId, userId },
    data: { isRegularMember },
  });
  if (result.count === 0) return;

  revalidatePath("/admin/players");
  revalidatePath("/games/new");
}

export async function updatePlayerChartColorAction(
  playerId: string,
  chartColor: string,
): Promise<void> {
  if (!isValidChartColor(chartColor)) return;

  const userId = await requireUserId();
  const result = await prisma.player.updateMany({
    where: { id: playerId, userId },
    data: { chartColor },
  });
  if (result.count === 0) return;

  revalidatePath("/admin/players");
  revalidatePath("/admin/players/charts");
  revalidatePath(`/players/${playerId}`);
}

export async function deletePlayerAction(playerId: string): Promise<void> {
  const userId = await requireUserId();
  const player = await prisma.player.findFirst({
    where: { id: playerId, userId },
    include: { _count: { select: { gamePlayers: true } } },
  });
  if (!player) {
    redirect("/admin/players");
  }
  if (player._count.gamePlayers > 0) {
    redirect("/admin/players?error=in-use");
  }
  await prisma.player.delete({ where: { id: playerId } });
  revalidatePath("/admin/players");
  redirect("/admin/players");
}

export async function getAllPlayers() {
  const userId = await requireUserId();
  return getAllPlayersForUser(userId);
}

export async function getPlayerById(playerId: string) {
  const userId = await requireUserId();
  return getPlayerByIdForUser(userId, playerId);
}
