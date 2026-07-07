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
    <ul className="space-y-2">
      {players.map((player) => (
        <li key={player.id}>
          <Link
            href={playerHref(player.id)}
            className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white px-4 py-3 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30"
          >
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-stone-900">{player.name}</span>
              <p className="mt-0.5 text-xs text-stone-500">
                参加 {player._count.gamePlayers} 試合
                <span className="ml-2 font-medium text-emerald-700">
                  成績を見る →
                </span>
              </p>
            </div>
            <PlayerTotalPtDisplay totalPt={player.totalPt} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
