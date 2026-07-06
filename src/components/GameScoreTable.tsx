import Link from "next/link";
import ScaleToFit from "@/components/ScaleToFit";
import type { GameRuleConfig } from "@/lib/records/gameConfig";
import {
  calcAdjustedHanchanDiff,
  calcMoneyFromPoints,
  formatMoney,
} from "@/lib/records/ruleScoring";
import { formatScoreShort, pointDiffToneClass } from "@/lib/records/types";

type Player = {
  id: string;
  seat: number;
  playerId: string;
  player: { name: string };
};

type Row = {
  number: number;
  scores: number[];
};

type Props = {
  rows: Row[];
  moneyTotals: number[];
  config: GameRuleConfig;
  players: Player[];
  playerHref?: (playerId: string) => string;
};

export default function GameScoreTable({
  rows,
  moneyTotals,
  config,
  players,
  playerHref,
}: Props) {
  const sortedPlayers = [...players].sort((a, b) => a.seat - b.seat);
  const scoringFlags = { useUma: config.useUma, useOka: config.useOka };

  function renderPlayerName(gp: Player) {
    const name = gp.player.name;
    if (playerHref) {
      return (
        <Link href={playerHref(gp.playerId)} className="hover:text-emerald-800">
          {name}
        </Link>
      );
    }
    return name;
  }

  return (
    <ScaleToFit>
      <div className="overflow-hidden rounded-xl border border-stone-200/80">
        <table className="w-full min-w-[26rem] table-fixed text-sm">
          <colgroup>
            <col className="w-[2.75rem]" />
            {sortedPlayers.map((gp) => (
              <col key={gp.id} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-stone-300 bg-white text-stone-500">
              <th className="px-1 py-2 text-center text-xs font-medium">半荘</th>
              {sortedPlayers.map((gp) => (
                <th
                  key={gp.id}
                  className="border-l-2 border-stone-800 px-2 py-2 text-center text-sm font-semibold text-stone-800"
                >
                  {renderPlayerName(gp)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const rowPts = row.scores.map((_, seat) =>
                calcMoneyFromPoints(
                  calcAdjustedHanchanDiff(
                    row.scores,
                    seat,
                    config.startingScore,
                    config.scoring,
                    scoringFlags,
                    config.playerCount,
                  ),
                  config.scoring.ratePer1000,
                ),
              );
              const isLastRow = rowIndex === rows.length - 1;

              return (
                <tr
                  key={row.number}
                  className={`bg-white ${isLastRow ? "" : "border-b border-stone-300"}`}
                >
                  <td className="px-1 py-2 text-center text-xs font-medium text-stone-700">
                    {row.number}
                  </td>
                  {sortedPlayers.map((gp) => {
                    const score = row.scores[gp.seat];
                    const hanchanPt = rowPts[gp.seat];
                    return (
                      <td
                        key={gp.id}
                        className="border-l-2 border-stone-800 px-2 py-2 text-center"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="w-[3.1rem] shrink-0 text-center font-semibold tabular-nums">
                            {formatScoreShort(score)}
                          </span>
                          <span
                            className={`w-[2.75rem] shrink-0 text-center text-[10px] font-semibold leading-tight ${pointDiffToneClass(hanchanPt)}`}
                          >
                            {formatMoney(hanchanPt)}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-stone-800 bg-sky-200 font-semibold">
              <td className="px-1 py-2.5 text-xs font-semibold text-stone-800">
                合計pt
              </td>
              {sortedPlayers.map((gp) => {
                const money = moneyTotals[gp.seat];
                return (
                  <td
                    key={gp.id}
                    className={`border-l-2 border-stone-800 px-2 py-3 text-center text-base font-bold ${pointDiffToneClass(money)}`}
                  >
                    {formatMoney(money)}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </ScaleToFit>
  );
}
