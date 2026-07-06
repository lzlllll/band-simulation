import { Disc3, Coins, Star, Heart, Users } from "lucide-react";
import { useGameStore } from "../../store/gameStore";

function StatCard({
  icon,
  label,
  value,
  accent,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="group relative flex items-center gap-2 border border-ink-600 bg-ink-800/60 px-3 py-1.5 transition hover:border-amber/60">
      <span style={{ color: accent }} className="shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
          {label}
        </div>
        <div className="nums font-mono text-sm leading-none text-cream">
          {value}
        </div>
      </div>
      {sub && (
        <span className="ml-1 font-mono text-[9px] text-cream-fade">{sub}</span>
      )}
    </div>
  );
}

export function HUD() {
  const bandName = useGameStore((s) => s.bandName);
  const motto = useGameStore((s) => s.motto);
  const date = useGameStore((s) => s.date);
  const turn = useGameStore((s) => s.turn);
  const money = useGameStore((s) => s.money);
  const fame = useGameStore((s) => s.fame);
  const cohesion = useGameStore((s) => s.cohesion);
  const members = useGameStore((s) => s.members);

  const avgMood = members.length
    ? Math.round(members.reduce((s, m) => s + m.mood, 0) / members.length)
    : 0;

  const dateObj = new Date(date + "T00:00:00");
  const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][dateObj.getDay()];

  return (
    <header className="relative z-20 flex h-16 items-center justify-between gap-6 border-b border-ink-600 bg-ink-900/85 px-6 backdrop-blur">
      {/* 左:乐队标识 */}
      <div className="flex min-w-[220px] items-center gap-3">
        <Disc3 className="h-7 w-7 animate-spin-slow text-amber" />
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="neon-amber font-display text-xl font-semibold leading-none">
              {bandName}
            </h1>
            <span className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
              A Lifetime Band
            </span>
          </div>
          <p className="mt-0.5 font-display text-[11px] italic text-cream-mute">
            {motto}
          </p>
        </div>
      </div>

      {/* 中:日期与回合 */}
      <div className="flex flex-col items-center">
        <div className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
          TURN {String(turn).padStart(3, "0")}
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="font-display text-lg text-cream">{date}</span>
          <span className="font-body text-[11px] text-cream-mute">{weekday}</span>
        </div>
      </div>

      {/* 右:数值卡片 */}
      <div className="flex items-center gap-2">
        <StatCard
          icon={<Coins className="h-4 w-4" />}
          label="资金"
          value={`¥${money.toLocaleString()}`}
          accent="#E8A33D"
        />
        <StatCard
          icon={<Star className="h-4 w-4" />}
          label="名气"
          value={String(fame)}
          accent="#7BA05B"
          sub="/100"
        />
        <StatCard
          icon={<Heart className="h-4 w-4" />}
          label="凝聚力"
          value={String(cohesion)}
          accent="#C5303A"
          sub="/100"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="平均心情"
          value={String(avgMood)}
          accent="#B88A6B"
          sub="/100"
        />
      </div>
    </header>
  );
}
