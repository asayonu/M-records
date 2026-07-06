import Link from "next/link";
import { notFound } from "next/navigation";
import GameScoreTable from "@/components/GameScoreTable";
import ShareShell from "@/components/ShareShell";
import { getGameDetailRows, getGameTotals } from "@/lib/records/stats";
import {
  toDateString,
  formatJapaneseDate,
} from "@/lib/records/types";
import { formatRuleSettingsSummary } from "@/lib/records/ruleScoring";
import {
  getSharedGameById,
  requireShareAccess,
} from "@/lib/share/actions";

type Props = {
  params: Promise<{ token: string; id: string }>;
};

export async function generateMetadata() {
  return { title: "対局詳細 | 麻雀成績管理" };
}

export default async function ShareGameDetailPage({ params }: Props) {
  const { token, id } = await params;
  await requireShareAccess(token);

  const game = await getSharedGameById(token, id);
  if (!game) {
    notFound();
  }

  const dateStr = toDateString(game.playedAt);
  const rows = getGameDetailRows(game);
  const { moneyTotals, hanchanCount, config } = getGameTotals(game);
  const sortedPlayers = [...game.players].sort((a, b) => a.seat - b.seat);
  const scoringFlags = { useUma: config.useUma, useOka: config.useOka };
  const shareBase = `/share/${token}`;

  return (
    <ShareShell token={token} title="対局詳細">
      <div className="space-y-6">
        <div>
          <Link
            href={`${shareBase}/dates/${dateStr}`}
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← {formatJapaneseDate(dateStr)}
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              {config.modeLabel}
            </span>
            <span className="text-sm font-medium text-stone-700">
              {config.ruleName}
            </span>
            <span className="text-sm text-stone-500">
              {hanchanCount}半荘 · 持ち点
              {config.startingScore.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {formatRuleSettingsSummary(
              scoringFlags,
              config.scoring,
              config.playerCount,
            )}
          </p>
          <p className="mt-2 text-base font-medium text-stone-900">
            {sortedPlayers.map((gp) => gp.player.name).join(" · ")}
          </p>
        </div>

        <GameScoreTable
          rows={rows}
          moneyTotals={moneyTotals}
          config={config}
          players={sortedPlayers}
          playerHref={(playerId) => `${shareBase}/players/${playerId}`}
        />
      </div>
    </ShareShell>
  );
}
