import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  hint?: string;
  className?: string;
}

export function StatBar({
  label,
  value,
  max = 100,
  color = "#E8A33D",
  hint,
  className,
}: StatBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline justify-between text-[10px] uppercase tracking-wider2 text-cream-mute">
        <span>{label}</span>
        <span className="nums text-cream-dim">{value}</span>
      </div>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
      {hint && <div className="text-[10px] text-cream-fade">{hint}</div>}
    </div>
  );
}

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}

export function SectionTitle({ title, subtitle, right, className }: SectionTitleProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 border-b border-ink-600 pb-3", className)}>
      <div>
        <h2 className="font-display text-2xl leading-none text-cream">{title}</h2>
        {subtitle && (
          <p className="mt-1 font-body text-xs text-cream-mute">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

interface TagProps {
  children: ReactNode;
  color?: string;
  variant?: "default" | "solid";
}

export function Tag({ children, color = "#E8A33D", variant = "default" }: TagProps) {
  if (variant === "solid") {
    return (
      <span
        className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider2"
        style={{ backgroundColor: color, color: "#0E0B0A" }}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider2"
      style={{ borderColor: `${color}66`, color }}
    >
      {children}
    </span>
  );
}

export function DeltaChip({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  if (!value) return null;
  const sign = value > 0 ? "+" : "";
  const color = value > 0 ? "#7BA05B" : "#C5303A";
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[11px]">
      <span className="text-cream-mute">{label}</span>
      <span style={{ color }}>{sign}{value}</span>
    </span>
  );
}
