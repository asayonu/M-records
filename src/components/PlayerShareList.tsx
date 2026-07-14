import Link from "next/link";
import PlayerTotalPtDisplay from "@/components/PlayerTotalPtDisplay";
type PlayerItem = {
  id: string;
  name: string;
  totalPt: number;
  _count: { gamePlayers: number };
};

type Props = {
  players: PlayerItem[];
  /** 共有閲覧用。例: `/share/abc123` */
  shareBase?: string;
};

export default function PlayerShareList({ players, shareBase }: Props) {
  const playerHref = (id: string) =>
    shareBase ? `${shareBase}/players/${id}` : `/players/${id}`;

  if (players.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 bg-white/60 px-4 py-8 text-center text-sm text-stone-600">
        まだプレイヤーが登録されていません
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {players.map((player) => (
        <li key={player.id}>
          <Link
            href={playerHref(player.id)}
            className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white px-4 py-3.5 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              <span className="truncate text-lg font-semibold text-stone-900">
                {player.name}
              </span>
              <span className="shrink-0 whitespace-nowrap text-sm font-medium text-emerald-700">
                成績を見る →
              </span>
            </div>
            <PlayerTotalPtDisplay totalPt={player.totalPt} size="large" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
