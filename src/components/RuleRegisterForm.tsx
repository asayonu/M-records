"use client";

import { useActionState, useState } from "react";
import {
  createRuleAction,
  type RuleActionState,
} from "@/lib/rules/actions";
import { defaultScoringForMode } from "@/lib/records/gameConfig";
import {
  DEFAULT_GAME_MODE,
  defaultStartingScore,
  type GameMode,
} from "@/lib/records/mode";
import type { RuleScoring } from "@/lib/records/ruleScoring";

const initialState: RuleActionState = {};

const UMA_LABELS = ["1位", "2位", "3位", "4位"] as const;

const UMA_FIELDS = [
  "umaFirst",
  "umaSecond",
  "umaThird",
  "umaFourth",
] as const;

type UmaField = (typeof UMA_FIELDS)[number];

function scoringToText(scoring: RuleScoring): Record<UmaField, string> {
  return {
    umaFirst: String(scoring.umaFirst),
    umaSecond: String(scoring.umaSecond),
    umaThird: String(scoring.umaThird),
    umaFourth: String(scoring.umaFourth),
  };
}

function isPartialNumber(value: string): boolean {
  return value === "" || value === "-" || /^-?\d+$/.test(value);
}

export default function RuleRegisterForm() {
  const [state, formAction, pending] = useActionState(
    createRuleAction,
    initialState,
  );
  const [mode, setMode] = useState<GameMode>(DEFAULT_GAME_MODE);
  const [scoring, setScoring] = useState<RuleScoring>(() =>
    defaultScoringForMode(DEFAULT_GAME_MODE),
  );
  const [umaText, setUmaText] = useState<Record<UmaField, string>>(() =>
    scoringToText(defaultScoringForMode(DEFAULT_GAME_MODE)),
  );
  const [useUma, setUseUma] = useState(true);
  const [useOka, setUseOka] = useState(true);

  function switchMode(nextMode: GameMode) {
    const nextScoring = defaultScoringForMode(nextMode);
    setMode(nextMode);
    setScoring(nextScoring);
    setUmaText(scoringToText(nextScoring));
  }

  function updateUmaText(field: UmaField, value: string) {
    if (!isPartialNumber(value)) return;
    setUmaText((prev) => ({ ...prev, [field]: value }));
    if (value !== "" && value !== "-") {
      setScoring((prev) => ({ ...prev, [field]: Number(value) }));
    }
  }

  function updateScoring(field: "oka" | "ratePer1000", value: string) {
    if (field === "oka") {
      if (!/^\d*$/.test(value)) return;
      setScoring((prev) => ({
        ...prev,
        oka: value === "" ? 0 : Number(value),
      }));
      return;
    }
    if (value === "" || value === "." || /^\d*\.?\d*$/.test(value)) {
      setScoring((prev) => ({
        ...prev,
        ratePer1000: value === "" || value === "." ? 0 : Number(value),
      }));
    }
  }

  const playerCount = mode === "yonma" ? 4 : 3;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium text-stone-700">ルール名</span>
        <input
          name="name"
          type="text"
          required
          placeholder="例: 友人会三麻"
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium text-stone-700">モード</span>
        <select
          name="mode"
          value={mode}
          onChange={(e) => switchMode(e.target.value as GameMode)}
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        >
          <option value="sanma">三麻</option>
          <option value="yonma">四麻</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium text-stone-700">持ち点</span>
        <input
          name="startingScore"
          type="number"
          required
          min={1000}
          step={1000}
          defaultValue={defaultStartingScore(DEFAULT_GAME_MODE)}
          key={mode}
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <span className="text-xs text-stone-500">
          1,000点単位で入力（三麻の標準35,000点 / 四麻の標準25,000点）
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          name="useUma"
          type="checkbox"
          checked={useUma}
          onChange={(e) => setUseUma(e.target.checked)}
          className="size-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
        />
        ウマを使用する
      </label>

      {useUma ? (
      <fieldset className="space-y-3 rounded-xl border border-stone-200 bg-stone-50/60 p-4">
        <legend className="px-1 text-sm font-medium text-stone-700">
          ウマ（千点単位）
        </legend>
        <p className="text-xs text-stone-500">
          各順位のウマを入力します。合計が0になるように設定してください。
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {UMA_LABELS.slice(0, playerCount).map((label, index) => {
            const field = UMA_FIELDS[index];
            return (
              <label key={field} className="flex flex-col gap-1 text-left">
                <span className="text-xs font-medium text-stone-600">
                  {label}
                </span>
                <input
                  name={field}
                  type="text"
                  inputMode="numeric"
                  required={useUma}
                  value={umaText[field]}
                  onChange={(e) => updateUmaText(field, e.target.value)}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </label>
            );
          })}
        </div>
        {mode === "sanma" && (
          <input type="hidden" name="umaFourth" value={0} />
        )}
      </fieldset>
      ) : (
        <>
          <input type="hidden" name="umaFirst" value={0} />
          <input type="hidden" name="umaSecond" value={0} />
          <input type="hidden" name="umaThird" value={0} />
          <input type="hidden" name="umaFourth" value={0} />
        </>
      )}

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          name="useOka"
          type="checkbox"
          checked={useOka}
          onChange={(e) => setUseOka(e.target.checked)}
          className="size-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
        />
        オカを使用する
      </label>

      {useOka ? (
      <label className="flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium text-stone-700">
          オカ（千点単位）
        </span>
        <input
          name="oka"
          type="number"
          required={useOka}
          min={0}
          step={1}
          value={scoring.oka || ""}
          onChange={(e) => updateScoring("oka", e.target.value)}
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <span className="text-xs text-stone-500">
          1位へのボーナス（10 = 10,000点）
        </span>
      </label>
      ) : (
        <input type="hidden" name="oka" value={0} />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-left sm:col-span-2">
          <span className="text-sm font-medium text-stone-700">
            レート（1000点あたり）
          </span>
          <input
            name="ratePer1000"
            type="number"
            required
            min={0}
            step={0.1}
            value={scoring.ratePer1000 || ""}
            onChange={(e) => updateScoring("ratePer1000", e.target.value)}
            className="rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          <span className="text-xs text-stone-500">
            例: 5 → 1000点差 = 5pt
          </span>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          name="isDefault"
          type="checkbox"
          className="size-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
        />
        このモードのデフォルトルールにする
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "登録中..." : "ルールを登録"}
      </button>
    </form>
  );
}
