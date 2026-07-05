import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import GameForm from "@/components/GameForm";
import PlayerRegisterForm from "@/components/PlayerRegisterForm";
import { getAllPlayers } from "@/lib/players/actions";
import { DEFAULT_GAME_MODE, getModeConfig } from "@/lib/records/mode";
import { getAllRules } from "@/lib/rules/actions";
import { formatJapaneseDate, getTodayDateString } from "@/lib/records/types";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function NewGamePage({ searchParams }: Props) {
  const params = await searchParams;
  const date = params.date ?? getTodayDateString();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  const [players, rules] = await Promise.all([getAllPlayers(), getAllRules()]);
  const defaultRule =
    rules.find((r) => r.mode === DEFAULT_GAME_MODE && r.isDefault) ??
    rules.find((r) => r.mode === DEFAULT_GAME_MODE);
  const minPlayers = defaultRule
    ? getModeConfig(defaultRule.mode).playerCount
    : getModeConfig(DEFAULT_GAME_MODE).playerCount;

  return (
    <AppShell title="対局記録">
      <div className="mb-6">
        <Link
          href={`/dates/${date}`}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          ← {formatJapaneseDate(date)}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">対局を記録</h1>
        <p className="mt-1 text-sm text-stone-600">
          {formatJapaneseDate(date)} · ルールを選んで対局者とスコアを入力
        </p>
      </div>

      {rules.length === 0 && (
        <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-900">
            ルールが未登録です。{" "}
            <Link href="/admin/rules" className="font-semibold underline">
              ルール管理
            </Link>
            から追加してください。
          </p>
        </section>
      )}

      {players.length < minPlayers && (
        <section className="mb-6 space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm text-amber-900">
            プレイヤーが {players.length} 人です。あと{" "}
            {minPlayers - players.length} 人登録してください。
          </p>
          <PlayerRegisterForm returnTo={`/games/new?date=${date}`} />
        </section>
      )}

      <GameForm date={date} players={players} rules={rules} />
    </AppShell>
  );
}
