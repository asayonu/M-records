"use client";

import { useTransition } from "react";
import {
  regenerateShareTokenAction,
  setShareEnabledAction,
} from "@/lib/share/actions";

type Props = {
  shareEnabled: boolean;
};

export default function ShareSettingsPanel({ shareEnabled }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-3 text-sm text-stone-700">
        <input
          type="checkbox"
          checked={shareEnabled}
          disabled={pending}
          onChange={(e) => {
            startTransition(() => setShareEnabledAction(e.target.checked));
          }}
          className="size-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
        />
        閲覧専用リンクを有効にする
      </label>
      {shareEnabled && (
        <form action={regenerateShareTokenAction}>
          <button
            type="submit"
            disabled={pending}
            className="text-sm font-medium text-stone-600 underline hover:text-stone-800 disabled:opacity-50"
          >
            リンクを再発行（古いリンクは無効になります）
          </button>
        </form>
      )}
    </div>
  );
}
