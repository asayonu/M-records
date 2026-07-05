import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import GameForm from "@/components/GameForm";
import { getAllPlayers } from "@/lib/players/actions";
import { getGameById } from "@/lib/records/actions";
import { resolveGameConfig } from "@/lib/records/gameConfig";
import {
  formatJapaneseDate,
  toDateString,
} from "@/lib/records/types";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata() {
  return { title: "対局編集 | 麻雀成績管理" };
}

export default async function EditGamePage({ params }: Props) {
  const { id } = await params;
  const game = await getGameById(id);
  if (!game) {
    notFound();
  }

  const config = resolveGameConfig(game);
  const dateStr = toDateString(game.playedAt);
  const sortedPlayers = [...game.players].sort((a, b) => a.seat - b.seat);
  const scores = game.rounds.map((round) => {
    const row = Array.from({ length: config.playerCount }, () => 0);
    for (const rs of round.roundScores) {
      row[rs.gamePlayer.seat] = rs.score;
    }
    return row;
  });

  const allPlayers = await getAllPlayers();

  const lockedRule = {
    id: game.ruleId ?? id,
    name: config.ruleName,
    mode: config.mode,
    startingScore: config.startingScore,
    umaFirst: config.scoring.umaFirst,
    umaSecond: config.scoring.umaSecond,
    umaThird: config.scoring.umaThird,
    umaFourth: config.scoring.umaFourth,
    oka: config.scoring.oka,
    ratePer1000: config.scoring.ratePer1000,
    useUma: config.useUma,
    useOka: config.useOka,
    isDefault: false,
  };

  return (
    <AppShell title="対局編集">
      <div className="mb-6">
        <Link
          href={`/games/${id}`}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          ← 対局詳細
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">対局を編集</h1>
        <p className="mt-1 text-sm text-stone-600">
          {formatJapaneseDate(dateStr)} · 対局者とスコアを修正できます
        </p>
      </div>

      <GameForm
        date={dateStr}
        players={allPlayers}
        rules={[lockedRule]}
        edit={{
          gameId: id,
          playerIds: sortedPlayers.map((gp) => gp.playerId),
          scores,
        }}
      />
    </AppShell>
  );
}
