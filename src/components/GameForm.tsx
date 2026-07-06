"use client";

import { useActionState, useMemo, useState } from "react";
import {
  createGameAction,
  updateGameAction,
  type GameActionState,
} from "@/lib/records/actions";
import { configFromRule } from "@/lib/records/gameConfig";
import {
  calcAdjustedHanchanDiff,
  calcMoneyFromPoints,
  formatMoney,
  formatRuleSettingsSummary,
} from "@/lib/records/ruleScoring";
import { computeScoresTotals } from "@/lib/records/stats";
import {
  formatScoreShort,
  parseScoreShortInput,
  scoreShortInputValue,
  pointDiffToneClass,
} from "@/lib/records/types";
import ScaleToFit from "@/components/ScaleToFit";
import { DEFAULT_GAME_MODE } from "@/lib/records/mode";

type PlayerOption = {
  id: string;
  name: string;
  isRegularMember: boolean;
};

type RuleOption = {
  id: string;
  name: string;
  mode: string;
  startingScore: number;
  umaFirst: number;
  umaSecond: number;
  umaThird: number;
  umaFourth: number;
  oka: number;
  ratePer1000: number;
  useUma: boolean;
  useOka: boolean;
  isDefault: boolean;
};

export type EditGameData = {
  gameId: string;
  playerIds: string[];
  scores: number[][];
};

type Props = {
  date: string;
  players: PlayerOption[];
  rules: RuleOption[];
  edit?: EditGameData;
};

const initialState: GameActionState = {};

function pickDefaultRule(rules: RuleOption[]): RuleOption | undefined {
  return (
    rules.find((r) => r.mode === DEFAULT_GAME_MODE && r.isDefault) ??
    rules.find((r) => r.mode === DEFAULT_GAME_MODE) ??
    rules[0]
  );
}

const UNSET_SCORE = -1;

function blankScores(playerCount: number, roundCount: number) {
  return Array.from({ length: roundCount }, () =>
    Array.from({ length: playerCount }, () => UNSET_SCORE),
  );
}

function pickDefaultPlayerIds(
  players: PlayerOption[],
  playerCount: number,
): string[] {
  const regularIds = players
    .filter((p) => p.isRegularMember)
    .map((p) => p.id);
  return Array.from(
    { length: playerCount },
    (_, seat) => regularIds[seat] ?? "",
  );
}

export default function GameForm({ date, players, rules, edit }: Props) {
  const isEdit = Boolean(edit);
  const defaultRule = isEdit
    ? rules[0]
    : pickDefaultRule(rules);
  const [ruleId, setRuleId] = useState(defaultRule?.id ?? "");
  const formAction = isEdit
    ? updateGameAction.bind(null, edit!.gameId)
    : createGameAction;
  const [state, boundAction, pending] = useActionState(
    formAction,
    initialState,
  );

  const selectedRule = rules.find((r) => r.id === ruleId) ?? defaultRule;
  const config = useMemo(
    () => (selectedRule ? configFromRule(selectedRule) : null),
    [selectedRule],
  );

  const [roundCount, setRoundCount] = useState(
    () => edit?.scores.length ?? 1,
  );
  const [scores, setScores] = useState<number[][]>(() => {
    if (edit?.scores.length) return edit.scores.map((row) => [...row]);
    return config ? blankScores(config.playerCount, 1) : [[]];
  });
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(() => {
    if (edit?.playerIds.length) return [...edit.playerIds];
    return config
      ? pickDefaultPlayerIds(players, config.playerCount)
      : [];
  });

  const playerMap = new Map(players.map((p) => [p.id, p.name]));

  const liveTotals = useMemo(() => {
    if (!config || scores.length === 0) return null;
    const completeRows = scores.filter(
      (row) =>
        row.length === config.playerCount &&
        row.every((score) => score >= 0),
    );
    if (completeRows.length === 0) return null;
    return computeScoresTotals(completeRows, config);
  }, [scores, config]);

  function switchRule(nextRuleId: string) {
    if (isEdit) return;
    const rule = rules.find((r) => r.id === nextRuleId);
    if (!rule) return;
    const nextConfig = configFromRule(rule);
    setRuleId(nextRuleId);
    setScores(blankScores(nextConfig.playerCount, roundCount));
    setSelectedPlayerIds(pickDefaultPlayerIds(players, nextConfig.playerCount));
  }

  function updateRoundCount(count: number) {
    if (!config) return;
    const next = Math.max(1, Math.min(20, count));
    setRoundCount(next);
    setScores((prev) => {
      const copy = [...prev];
      while (copy.length < next) {
        copy.push(Array.from({ length: config.playerCount }, () => UNSET_SCORE));
      }
      return copy.slice(0, next);
    });
  }

  function updateScore(roundIndex: number, seat: number, value: string) {
    const fullScore =
      value === "" ? UNSET_SCORE : parseScoreShortInput(value);
    setScores((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[roundIndex][seat] = fullScore;
      return copy;
    });
  }

  function updateSelectedPlayer(seat: number, playerId: string) {
    setSelectedPlayerIds((prev) => {
      const copy = [...prev];
      copy[seat] = playerId;
      return copy;
    });
  }

  function columnLabel(seat: number): string {
    const id = selectedPlayerIds[seat];
    if (id && playerMap.get(id)) return playerMap.get(id)!;
    return `プレイヤー${seat + 1}`;
  }

  if (!config || rules.length === 0) {
    return (
      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        ルールが登録されていません。ルール管理から追加してください。
      </p>
    );
  }

  const minRequired = config.playerCount;
  const needMore = Math.max(0, minRequired - players.length);
  const scoringFlags = { useUma: config.useUma, useOka: config.useOka };

  if (players.length < minRequired) {
    return (
      <div className="space-y-6">
        <section className="space-y-3 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm opacity-60">
          <h2 className="text-sm font-semibold text-stone-700">ルール</h2>
          <p className="text-sm text-stone-600">{selectedRule?.name}</p>
        </section>
        <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm opacity-60">
          <h2 className="text-sm font-semibold text-stone-700">対局者</h2>
          <div className="space-y-3">
            {Array.from({ length: config.playerCount }, (_, i) => (
              <div
                key={i}
                className="rounded-xl border border-dashed border-stone-300 px-4 py-2.5 text-sm text-stone-400"
              >
                プレイヤーを選択
              </div>
            ))}
          </div>
        </section>
        <p className="rounded-lg bg-stone-100 px-4 py-3 text-sm text-stone-600">
          {config.modeLabel}（{selectedRule?.name}）にはあと {needMore}{" "}
          人のプレイヤー登録が必要です。
        </p>
      </div>
    );
  }

  return (
    <form action={boundAction} className="space-y-6">
      <input type="hidden" name="ruleId" value={ruleId} />
      <input name="playedAt" type="hidden" value={date} />

      <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-700">ルール</h2>
        {isEdit ? (
          <div className="rounded-xl border border-emerald-500 bg-emerald-50 px-4 py-3">
            <p className="font-semibold text-stone-900">{selectedRule?.name}</p>
            <p className="mt-0.5 text-xs text-stone-500">
              持ち点 {config.startingScore.toLocaleString()} · 合計{" "}
              {config.totalScorePerRound.toLocaleString()} / 半荘
            </p>
            <p className="mt-0.5 text-xs text-stone-500">
              {formatRuleSettingsSummary(scoringFlags, config.scoring, config.playerCount)}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              編集時はルールを変更できません
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <select
              value={ruleId}
              onChange={(e) => switchRule(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              {rules.map((rule) => {
                const ruleConfig = configFromRule(rule);
                return (
                  <option key={rule.id} value={rule.id}>
                    {rule.name}（{ruleConfig.modeLabel}）
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-stone-500">
              持ち点 {config.startingScore.toLocaleString()} · 合計{" "}
              {config.totalScorePerRound.toLocaleString()} / 半荘
            </p>
            <p className="text-xs text-stone-500">
              {formatRuleSettingsSummary(
                scoringFlags,
                config.scoring,
                config.playerCount,
              )}
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-700">対局者</h2>
        <p className="text-xs text-stone-500">
          {config.playerCount}人を選んでください（同じ人は選べません）
        </p>
        <div className="space-y-3">
          {Array.from({ length: config.playerCount }, (_, seat) => (
            <select
              key={seat}
              name={`player_${seat}_id`}
              required
              value={selectedPlayerIds[seat] ?? ""}
              onChange={(e) => updateSelectedPlayer(seat, e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="" disabled>
                プレイヤーを選択
              </option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-stone-700">半荘スコア</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateRoundCount(roundCount - 1)}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              −
            </button>
            <span className="min-w-12 text-center text-sm font-semibold">
              {roundCount} 半荘
            </span>
            <button
              type="button"
              onClick={() => updateRoundCount(roundCount + 1)}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              ＋
            </button>
          </div>
        </div>
        <p className="text-xs text-stone-500">
          下2桁省略（例: 350 = 35,000点）· 各半荘の合計は{" "}
          {formatScoreShort(config.totalScorePerRound)}
        </p>

        <input type="hidden" name="roundCount" value={roundCount} />

        <ScaleToFit>
          <div className="overflow-hidden rounded-xl border border-stone-200/80">
            <table className="w-full min-w-[26rem] table-fixed text-sm">
              <colgroup>
                <col className="w-[2.75rem]" />
                {Array.from({ length: config.playerCount }, (_, seat) => (
                  <col key={seat} />
                ))}
                <col className="w-[2.5rem]" />
              </colgroup>
              <thead>
                <tr className="border-b border-stone-300 bg-white text-stone-500">
                  <th className="px-1 py-2 text-center text-xs font-medium">
                    半荘
                  </th>
                  {Array.from({ length: config.playerCount }, (_, seat) => (
                    <th
                      key={seat}
                      className="border-l-2 border-stone-800 px-2 py-2 text-center text-sm font-semibold text-stone-800"
                    >
                      {columnLabel(seat)}
                    </th>
                  ))}
                  <th className="border-l-2 border-stone-800 px-1 py-2 text-center text-xs font-medium">
                    合計
                  </th>
                </tr>
              </thead>
              <tbody>
                {scores.map((row, roundIndex) => {
                  const sum = row.reduce(
                    (a, b) => a + (b < 0 ? 0 : b),
                    0,
                  );
                  const rowComplete = row.every((score) => score >= 0);
                  const sumOk =
                    rowComplete && sum === config.totalScorePerRound;
                  const rowPts = rowComplete
                    ? row.map((_, seat) =>
                        calcMoneyFromPoints(
                          calcAdjustedHanchanDiff(
                            row,
                            seat,
                            config.startingScore,
                            config.scoring,
                            scoringFlags,
                            config.playerCount,
                          ),
                          config.scoring.ratePer1000,
                        ),
                      )
                    : null;
                  return (
                    <tr
                      key={roundIndex}
                      className={`bg-white ${liveTotals && roundIndex === scores.length - 1 ? "" : "border-b border-stone-300"}`}
                    >
                      <td className="px-1 py-2 text-center text-xs font-medium text-stone-700">
                        {roundIndex + 1}
                      </td>
                      {row.map((score, seat) => {
                        const hanchanPt = rowPts?.[seat] ?? null;
                        return (
                          <td
                            key={seat}
                            className="border-l-2 border-stone-800 px-2 py-2 text-center"
                          >
                            <input
                              type="hidden"
                              name={`round_${roundIndex}_score_${seat}`}
                              value={score}
                            />
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={0}
                                step={1}
                                placeholder="—"
                                value={scoreShortInputValue(score)}
                                onChange={(e) =>
                                  updateScore(roundIndex, seat, e.target.value)
                                }
                                className="w-[3.1rem] shrink-0 rounded-lg border border-stone-300 px-1 py-1.5 text-center tabular-nums outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                              />
                              <span
                                className={`w-[2.75rem] shrink-0 text-center text-[10px] font-semibold leading-tight ${
                                  hanchanPt === null
                                    ? "text-transparent"
                                    : pointDiffToneClass(hanchanPt)
                                }`}
                                aria-hidden={hanchanPt === null}
                              >
                                {hanchanPt === null ? "—" : formatMoney(hanchanPt)}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                      <td
                        className={`border-l-2 border-stone-800 px-0.5 py-2 text-center text-[11px] font-medium tabular-nums ${!rowComplete ? "text-stone-400" : sumOk ? "text-stone-500" : "text-red-600"}`}
                      >
                        {rowComplete ? formatScoreShort(sum) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {liveTotals && (
                <tfoot>
                  <tr className="border-t-2 border-stone-800 bg-sky-200 font-semibold">
                    <td className="px-1 py-2.5 text-xs font-semibold text-stone-800">
                      合計pt
                    </td>
                    {Array.from({ length: config.playerCount }, (_, seat) => {
                      const money = liveTotals.moneyTotals[seat];
                      return (
                        <td
                          key={seat}
                          className={`border-l-2 border-stone-800 px-2 py-3 text-center text-base font-bold ${pointDiffToneClass(money)}`}
                        >
                          {formatMoney(money)}
                        </td>
                      );
                    })}
                    <td className="border-l-2 border-stone-800 px-0.5 py-2.5" />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </ScaleToFit>
      </section>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
      >
        {pending
          ? "保存中..."
          : isEdit
            ? "変更を保存"
            : "対局を保存"}
      </button>
    </form>
  );
}
