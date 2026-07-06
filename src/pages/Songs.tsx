import { PageShell } from "../components/shared/PageShell";
import { SongRow } from "../components/songs/SongRow";
import { useGameStore } from "../store/gameStore";
import { Disc3 } from "lucide-react";

export default function Songs() {
  const songs = useGameStore((s) => s.songs);
  const avgPop = songs.length
    ? Math.round(songs.reduce((s, x) => s + x.popularity, 0) / songs.length)
    : 0;

  return (
    <PageShell
      title="曲目库"
      subtitle="乐队已发行的曲目。点击展开查看歌词片段与详情。"
      english="Songs"
      right={
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
            Tracks · Avg Pop
          </div>
          <div className="mt-1 flex items-baseline justify-end gap-2">
            <Disc3 className="h-4 w-4 animate-spin-slow text-amber" />
            <span className="nums font-mono text-3xl text-cream">{songs.length}</span>
            <span className="font-mono text-sm text-cream-mute">
              · {avgPop}/100
            </span>
          </div>
        </div>
      }
    >
      <div className="space-y-2">
        {songs.map((song, i) => (
          <SongRow key={song.id} song={song} index={i} />
        ))}
      </div>
    </PageShell>
  );
}
