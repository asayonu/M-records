import Link from "next/link";
import { notFound } from "next/navigation";
import ShareShell from "@/components/ShareShell";
import { getGameDetailRows, getGameTotals } from "@/lib/records/stats";
import {
  formatScoreShort,
  pointDiffToneClass,
  toDateString,
  formatJapaneseDate,
} from "@/lib/records/types";
import {
  formatMoney,
  formatRuleSettingsSummary,
} from "@/lib/records/ruleScoring";
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

        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-stone-200/80 bg-white shadow-sm">
            <table className="w-full min-w-[360px] table-fixed text-sm">
              <colgroup>
                <col className="w-[4.75rem]" />
                {sortedPlayers.map((gp) => (
                  <col key={gp.id} />
                ))}
              </colgroup>
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                  <th className="px-3 py-3 text-left font-medium">半荘</th>
                  {sortedPlayers.map((gp) => (
                    <th
                      key={gp.id}
                      className="px-2 py-3 text-center font-medium"
                    >
                      <Link
                        href={`${shareBase}/players/${gp.playerId}`}
                        className="hover:text-emerald-800"
                      >
                        {gp.player.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.number} className="border-b border-stone-100">
                    <td className="px-3 py-2.5 font-medium text-stone-700">
                      {row.number}
                    </td>
                    {sortedPlayers.map((gp) => {
                      const score = row.scores[gp.seat];
                      return (
                        <td key={gp.id} className="px-2 py-2.5 text-center">
                          <span className="font-semibold">
                            {formatScoreShort(score)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-sky-300/80 bg-sky-200 shadow-sm">
            <table className="w-full min-w-[360px] table-fixed text-sm">
              <colgroup>
                <col className="w-[4.75rem]" />
                {sortedPlayers.map((gp) => (
                  <col key={gp.id} />
                ))}
              </colgroup>
              <tbody>
                <tr className="font-semibold">
                  <td className="px-3 py-3 text-stone-800">合計pt</td>
                  {sortedPlayers.map((gp) => {
                    const money = moneyTotals[gp.seat];
                    return (
                      <td
                        key={gp.id}
                        className={`px-2 py-3 text-center font-semibold ${pointDiffToneClass(money)}`}
                      >
                        {formatMoney(money)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ShareShell>
  );
}
