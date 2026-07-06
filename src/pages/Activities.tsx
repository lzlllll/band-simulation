import { PageShell } from "../components/shared/PageShell";
import { ActivityCard } from "../components/activities/ActivityCard";
import { ACTIVITIES } from "../data/activities";
import { useGameStore } from "../store/gameStore";

export default function Activities() {
  const isGenerating = useGameStore((s) => s.isGenerating);

  return (
    <PageShell
      title="活动中心"
      subtitle="每一次行动都会推进时间、改变数值,并触发一段叙事。"
      english="Activities"
      right={
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
            State
          </div>
          <div className="mt-1 font-mono text-sm text-cream">
            {isGenerating ? "进行中..." : "待命"}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIVITIES.map((a) => (
          <ActivityCard key={a.id} activity={a} />
        ))}
      </div>

      <p className="mt-6 border-t border-ink-600 pt-4 text-center font-display text-sm italic text-cream-fade">
        · 每一次选择都会成为编年史里的一笔 ·
      </p>
    </PageShell>
  );
}
