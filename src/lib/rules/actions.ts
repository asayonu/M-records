"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  DEFAULT_SCORING,
  parseRuleScoringInput,
  validateRuleScoring,
} from "@/lib/records/ruleScoring";
import { parseGameMode, type GameMode } from "@/lib/records/mode";

export type RuleActionState = {
  error?: string;
};

function validateRuleInput(
  name: string,
  mode: string,
  startingScore: number,
  parsed: ReturnType<typeof parseRuleScoringInput>,
  playerCount: number,
): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "ルール名を入力してください";
  if (trimmed.length > 32) return "ルール名は32文字以内にしてください";
  if (mode !== "sanma" && mode !== "yonma") return "モードが不正です";
  if (!Number.isInteger(startingScore) || startingScore <= 0) {
    return "持ち点は1以上の整数で入力してください";
  }
  if (startingScore % 1000 !== 0) {
    return "持ち点は1,000点単位で入力してください";
  }
  return validateRuleScoring(parsed.scoring, playerCount, {
    useUma: parsed.useUma,
    useOka: parsed.useOka,
  });
}

export async function ensureDefaultRulesForUser(userId: string) {
  const count = await prisma.rule.count({ where: { userId } });
  if (count > 0) return;

  await prisma.rule.createMany({
    data: [
      {
        userId,
        name: "標準三麻",
        mode: "sanma",
        startingScore: 35000,
        ...DEFAULT_SCORING.sanma,
        isDefault: true,
      },
      {
        userId,
        name: "標準四麻",
        mode: "yonma",
        startingScore: 25000,
        ...DEFAULT_SCORING.yonma,
        isDefault: true,
      },
    ],
  });
}

async function setDefaultRule(
  ruleId: string,
  mode: GameMode,
  userId: string,
) {
  await prisma.$transaction([
    prisma.rule.updateMany({
      where: { userId, mode, isDefault: true },
      data: { isDefault: false },
    }),
    prisma.rule.updateMany({
      where: { id: ruleId, userId },
      data: { isDefault: true },
    }),
  ]);
}

export async function createRuleAction(
  _prev: RuleActionState,
  formData: FormData,
): Promise<RuleActionState> {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "");
  const mode = parseGameMode(String(formData.get("mode") ?? "sanma"));
  const startingScore = Number(formData.get("startingScore") ?? 0);
  const parsed = parseRuleScoringInput(formData);
  const isDefault = formData.get("isDefault") === "on";
  const returnTo = String(formData.get("returnTo") ?? "").trim();
  const playerCount = mode === "yonma" ? 4 : 3;

  const error = validateRuleInput(
    name,
    mode,
    startingScore,
    parsed,
    playerCount,
  );
  if (error) return { error };

  const rule = await prisma.rule.create({
    data: {
      userId,
      name: name.trim(),
      mode,
      startingScore,
      useUma: parsed.useUma,
      useOka: parsed.useOka,
      ...parsed.scoring,
      isDefault: false,
    },
  });

  if (isDefault) {
    await setDefaultRule(rule.id, mode, userId);
  }

  revalidatePath("/admin/rules");
  revalidatePath("/games/new");

  if (returnTo && returnTo.startsWith("/")) {
    redirect(returnTo);
  }
  redirect("/admin/rules");
}

export async function deleteRuleAction(ruleId: string): Promise<void> {
  const userId = await requireUserId();
  const rule = await prisma.rule.findFirst({
    where: { id: ruleId, userId },
  });
  if (!rule) {
    redirect("/admin/rules");
  }

  const count = await prisma.game.count({ where: { ruleId, userId } });
  if (count > 0) {
    redirect("/admin/rules?error=in-use");
  }

  await prisma.rule.delete({ where: { id: ruleId } });

  if (rule.isDefault) {
    const fallback = await prisma.rule.findFirst({
      where: { userId, mode: rule.mode, id: { not: ruleId } },
      orderBy: { createdAt: "asc" },
    });
    if (fallback) {
      await setDefaultRule(fallback.id, rule.mode as GameMode, userId);
    }
  }

  revalidatePath("/admin/rules");
  revalidatePath("/games/new");
  redirect("/admin/rules");
}

export async function setDefaultRuleAction(ruleId: string): Promise<void> {
  const userId = await requireUserId();
  const rule = await prisma.rule.findFirst({
    where: { id: ruleId, userId },
  });
  if (!rule) {
    redirect("/admin/rules");
  }
  await setDefaultRule(ruleId, rule.mode as GameMode, userId);
  revalidatePath("/admin/rules");
  revalidatePath("/games/new");
  redirect("/admin/rules");
}

export async function getAllRules() {
  const userId = await requireUserId();
  await ensureDefaultRulesForUser(userId);
  return prisma.rule.findMany({
    where: { userId },
    orderBy: [{ mode: "asc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { games: true } },
    },
  });
}

export async function getRuleById(ruleId: string) {
  const userId = await requireUserId();
  return prisma.rule.findFirst({
    where: { id: ruleId, userId },
  });
}

export async function getDefaultRule(mode: GameMode = "sanma") {
  const userId = await requireUserId();
  await ensureDefaultRulesForUser(userId);
  const rule = await prisma.rule.findFirst({
    where: { userId, mode, isDefault: true },
  });
  if (rule) return rule;
  return prisma.rule.findFirst({
    where: { userId, mode },
    orderBy: { createdAt: "asc" },
  });
}
