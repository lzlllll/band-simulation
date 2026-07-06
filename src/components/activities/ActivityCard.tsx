import { Loader2, Sparkles } from "lucide-react";
import type { Activity } from "../../types";
import { useGameStore } from "../../store/gameStore";

export function ActivityCard({ activity }: { activity: Activity }) {
  const isGenerating = useGameStore((s) => s.isGenerating);
  const processTurn = useGameStore((s) => s.processTurn);

  return (
    <article className="card-edge group flex flex-col p-4 transition hover:border-amber/50">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center border border-amber/40 bg-amber-glow">
          <Sparkles className="h-5 w-5 text-amber" />
        </div>
        <h3 className="font-display text-lg leading-none text-cream">
          {activity.name}
        </h3>
      </header>

      <p className="mt-3 flex-1 font-body text-xs leading-relaxed text-cream-dim">
        {activity.hint}
      </p>

      <p className="mt-3 border-t border-ink-600 pt-2 font-mono text-[9px] uppercase tracking-wider2 text-cream-fade">
        AI 将根据现状判定具体效果
      </p>

      <button
        type="button"
        disabled={isGenerating}
        onClick={() => processTurn(activity.name)}
        className="btn-glow mt-3 flex w-full items-center justify-center gap-2 border border-amber/60 bg-amber/10 px-3 py-2 font-mono text-xs uppercase tracking-wider2 text-amber transition hover:bg-amber hover:text-ink-900 disabled:cursor-not-allowed disabled:border-ink-600 disabled:bg-transparent disabled:text-cream-fade"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> 生成中
          </>
        ) : (
          <>以「{activity.name}」推进一回合</>
        )}
      </button>
    </article>
  );
}
