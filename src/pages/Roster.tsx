import { PageShell } from "../components/shared/PageShell";
import { MemberCard } from "../components/roster/MemberCard";
import { SectionTitle, StatBar, Tag } from "../components/shared/StatBar";
import { useGameStore } from "../store/gameStore";
import { INITIAL_STYLES } from "../data/styles";

function cohesionState(v: number) {
  if (v >= 85) return { label: "完美", color: "#7BA05B" };
  if (v >= 65) return { label: "良好", color: "#E8A33D" };
  if (v >= 40) return { label: "紧张", color: "#D8902A" };
  return { label: "破裂", color: "#C5303A" };
}

export default function Roster() {
  const members = useGameStore((s) => s.members);
  const cohesion = useGameStore((s) => s.cohesion);
  const styles = useGameStore((s) => s.styles);

  const state = cohesionState(cohesion);

  return (
    <PageShell
      title="乐队档案"
      subtitle="五个人,五种性格,一支签不出去也散不掉的乐队。"
      english="Roster"
      right={
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
            Current Cohesion
          </div>
          <div className="mt-1 flex items-baseline gap-2 justify-end">
            <span className="nums font-mono text-3xl text-cream">{cohesion}</span>
            <span className="font-display text-sm" style={{ color: state.color }}>
              · {state.label}
            </span>
          </div>
        </div>
      }
    >
      {/* 凝聚力状态条 */}
      <section className="mb-6 card-edge p-4">
        <SectionTitle
          title="凝聚力"
          subtitle="乐队的整体默契,影响排练效率与成员心情。"
        />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
              <span>当前状态</span>
              <span style={{ color: state.color }}>{state.label}</span>
            </div>
            <div className="bar-track mt-2 h-2">
              <div
                className="bar-fill"
                style={{
                  width: `${cohesion}%`,
                  background: `linear-gradient(90deg, ${state.color}88, ${state.color})`,
                }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[9px] text-cream-fade">
              <span>破裂 0</span>
              <span>完美 100</span>
            </div>
          </div>
          <div className="space-y-1 border-l border-ink-600 pl-4">
            <p className="font-body text-[11px] leading-relaxed text-cream-mute">
              凝聚力 ≥ 85:排练效率翻倍
              <br />
              凝聚力 ≥ 65:正常发挥
              <br />
              凝聚力 &lt; 40:成员可能离队
            </p>
          </div>
        </div>
      </section>

      {/* 成员网格 */}
      <section className="mb-6">
        <SectionTitle
          title="成员"
          subtitle={`${members.length} 位固定成员`}
          right={<span className="font-mono text-[10px] text-cream-fade">FIXED</span>}
        />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      </section>

      {/* 风格熟练度 */}
      <section className="card-edge p-4">
        <SectionTitle
          title="风格熟练度"
          subtitle="乐队对不同音乐风格的驾驭程度。"
        />
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
          {styles.map((s) => {
            const color = INITIAL_STYLES.find((x) => x.style === s.style)?.color ?? "#8B7E6E";
            return (
              <div key={s.style} className="flex items-center gap-3">
                <Tag color={color}>{s.style}</Tag>
                <div className="flex-1">
                  <StatBar
                    label={s.style}
                    value={s.level}
                    color={color}
                    className="[&>div:first-child>span:first-child]:sr-only"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
