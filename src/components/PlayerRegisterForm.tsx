"use client";

import { useActionState } from "react";
import {
  createPlayerAction,
  type PlayerActionState,
} from "@/lib/players/actions";

type Props = {
  returnTo?: string;
};

const initialState: PlayerActionState = {};

export default function PlayerRegisterForm({ returnTo }: Props) {
  const [state, formAction, pending] = useActionState(
    createPlayerAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
      <label className="flex flex-col gap-1.5 text-left">
        <span className="text-sm font-medium text-stone-700">名前</span>
        <input
          name="name"
          type="text"
          required
          placeholder="例: たろう"
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
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
        {pending ? "登録中..." : "プレイヤーを登録"}
      </button>
    </form>
  );
}
