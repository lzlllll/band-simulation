import { AlertTriangle, X } from "lucide-react";
import { useGameStore } from "../../store/gameStore";

export function EventBanner() {
  const pending = useGameStore((s) => s.pendingEvent);
  const resolve = useGameStore((s) => s.resolvePendingEvent);

  if (!pending) return null;

  return (
    <div className="card-edge animate-slide-up border-crimson-soft/60 bg-gradient-to-br from-crimson-soft/12 to-ink-800/60 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-crimson" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider2 text-crimson">
              触发事件
            </span>
            <button
              type="button"
              onClick={resolve}
              className="text-cream-mute transition hover:text-cream"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h3 className="mt-1 font-display text-lg text-cream">{pending.title}</h3>
          <p className="mt-1 font-body text-xs leading-relaxed text-cream-dim">
            {pending.desc}
          </p>
          <p className="mt-2 font-display text-sm italic text-amber">
            {pending.narrativeHint}
          </p>
          <p className="mt-2 font-mono text-[9px] leading-relaxed text-cream-fade">
            数值后果由 Pro 在下一回合判定,在下方决策里描述如何应对。
          </p>
        </div>
      </div>
    </div>
  );
}
