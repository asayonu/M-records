"use client";

import { useTransition } from "react";
import { updatePlayerChartColorAction } from "@/lib/players/actions";

type Props = {
  playerId: string;
  color: string;
};

export default function PlayerChartColorPicker({ playerId, color }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex shrink-0 items-center gap-1.5 text-xs text-stone-600">
      <span className="sr-only">グラフ色</span>
      <input
        type="color"
        value={color}
        disabled={pending}
        onChange={(event) => {
          const nextColor = event.target.value;
          startTransition(() =>
            updatePlayerChartColorAction(playerId, nextColor),
          );
        }}
        className="size-8 cursor-pointer rounded-lg border border-stone-200 bg-white p-0.5 disabled:cursor-wait disabled:opacity-50"
        title="グラフの色"
        aria-label="グラフの色"
      />
    </label>
  );
}
