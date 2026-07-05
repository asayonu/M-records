"use client";

import { useTransition } from "react";
import { setRegularMemberAction } from "@/lib/players/actions";

type Props = {
  playerId: string;
  checked: boolean;
};

export default function RegularMemberCheckbox({ playerId, checked }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex shrink-0 items-center gap-2 text-xs text-stone-600">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(e) => {
          startTransition(() =>
            setRegularMemberAction(playerId, e.target.checked),
          );
        }}
        className="size-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
      />
      いつものメンバー
    </label>
  );
}
