"use client";

import { useTransition } from "react";
import { setRegularMemberAction } from "@/lib/players/actions";

type Props = {
  playerId: string;
  checked: boolean;
  size?: "default" | "large";
};

export default function RegularMemberCheckbox({
  playerId,
  checked,
  size = "default",
}: Props) {
  const [pending, startTransition] = useTransition();
  const isLarge = size === "large";

  return (
    <label
      className={`flex shrink-0 items-center gap-2 text-stone-600 ${isLarge ? "text-sm" : "text-xs"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(e) => {
          startTransition(() =>
            setRegularMemberAction(playerId, e.target.checked),
          );
        }}
        className={`rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50 ${isLarge ? "size-5" : "size-4"}`}
      />
      いつものメンバー
    </label>
  );
}
