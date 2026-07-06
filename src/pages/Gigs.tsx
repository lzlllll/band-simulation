import { PageShell } from "../components/shared/PageShell";
import { GigCard } from "../components/gigs/GigCard";
import { useGameStore } from "../store/gameStore";

export default function Gigs() {
  const gigs = useGameStore((s) => s.gigInvites);

  return (
    <PageShell
      title="演出邀约"
      subtitle="场上四十分钟,场下五小时的等。接与不接,都是赌。"
      english="Gigs"
      right={
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
            Pending Invites
          </div>
          <div className="mt-1 nums font-mono text-3xl text-cream">{gigs.length}</div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gigs.map((g) => (
          <GigCard key={g.id} gig={g} />
        ))}
      </div>
      {gigs.length === 0 && (
        <p className="mt-8 text-center font-display text-sm italic text-cream-fade">
          · 暂无邀约,先回去排练吧 ·
        </p>
      )}
    </PageShell>
  );
}
