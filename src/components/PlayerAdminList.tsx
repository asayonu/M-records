import Link from "next/link";
import PlayerChartColorPicker from "@/components/PlayerChartColorPicker";
import PlayerTotalPtDisplay from "@/components/PlayerTotalPtDisplay";
import RegularMemberCheckbox from "@/components/RegularMemberCheckbox";
import { resolveChartColor } from "@/lib/players/chartColors";
import { deletePlayerAction } from "@/lib/players/actions";

type PlayerItem = {
  id: string;
  name: string;
  isRegularMember: boolean;
  chartColor: string | null;
  totalPt: number;
  _count: { gamePlayers: number };
};

type Props = {
  players: PlayerItem[];
};

export default function PlayerAdminList({ players }: Props) {
  if (players.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 bg-white/60 px-4 py-8 text-center text-sm text-stone-600">
        まだプレイヤーが登録されていません
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {players.map((player, index) => (
        <li
          key={player.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white px-4 py-3 shadow-sm transition hover:border-emerald-200"
        >
          <Link
            href={`/players/${player.id}`}
            className="min-w-0 flex-1 rounded-lg py-0.5 text-left transition hover:bg-emerald-50/60"
          >
            <span className="font-semibold text-stone-900">{player.name}</span>
            <p className="mt-0.5 text-xs text-stone-500">
              参加 {player._count.gamePlayers} 回
              <span className="ml-2 font-medium text-emerald-700">
                成績を見る →
              </span>
            </p>
          </Link>
          <PlayerTotalPtDisplay totalPt={player.totalPt} />
          <PlayerChartColorPicker
            playerId={player.id}
            color={resolveChartColor(player.chartColor, index)}
          />
          <RegularMemberCheckbox
            playerId={player.id}
            checked={player.isRegularMember}
          />
          <form action={deletePlayerAction.bind(null, player.id)}>
            <button
              type="submit"
              disabled={player._count.gamePlayers > 0}
              className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              title={
                player._count.gamePlayers > 0
                  ? "対局記録があるプレイヤーは削除できません"
                  : undefined
              }
            >
              削除
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
