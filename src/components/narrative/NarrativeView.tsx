import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  CornerDownRight,
  AlertCircle,
} from "lucide-react";
import { useGameStore } from "../../store/gameStore";
import type { AIChanges, NarrativeLog, Suggestion } from "../../types";
import { cn } from "../../lib/utils";

const DELTA_LABELS: Record<string, string> = {
  money: "资金",
  fame: "名气",
  cohesion: "凝聚力",
  mood: "心情",
  days: "天数",
};

const SUGGESTION_KIND_LABEL: Record<string, string> = {
  action: "行动",
  social: "社交",
  gig: "演出",
  rest: "休整",
  explore: "探索",
};

function DeltaRow({ delta }: { delta: AIChanges }) {
  const entries = (Object.entries(delta) as [string, unknown][])
    .filter(([k, v]) => k !== "members" && v !== undefined && v !== 0);
  if (!entries.length) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {entries.map(([k, v]) => {
        const label = DELTA_LABELS[k] ?? k;
        const num = Number(v);
        const sign = num > 0 ? "+" : "";
        const color = num > 0 ? "#7BA05B" : "#C5303A";
        return (
          <span key={k} className="font-mono text-[11px]">
            <span className="text-cream-mute">{label} </span>
            <span style={{ color }}>
              {sign}
              {num}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function SuggestionButtons({ suggestions }: { suggestions: Suggestion[] }) {
  const applySuggestion = useGameStore((s) => s.applySuggestion);
  const isGenerating = useGameStore((s) => s.isGenerating);
  if (!suggestions.length) return null;
  return (
    <div className="mt-4 border-t border-ink-600 pt-3">
      <div className="mb-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider2 text-cream-fade">
        <CornerDownRight className="h-3 w-3 text-amber" />
        下一步 · SUGGESTIONS
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            disabled={isGenerating}
            onClick={() => applySuggestion(s.text)}
            className="btn-glow group flex items-center gap-2 border border-ink-500 bg-ink-800/40 px-3 py-1.5 text-left font-body text-xs text-cream-dim transition hover:border-amber/60 hover:bg-amber/10 hover:text-amber disabled:cursor-not-allowed disabled:opacity-40"
          >
            {s.kind && (
              <span className="font-mono text-[8px] uppercase tracking-wider2 text-cream-fade group-hover:text-amber">
                {SUGGESTION_KIND_LABEL[s.kind] ?? s.kind}
              </span>
            )}
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function NarrativeEntry({ log, isLatest }: { log: NarrativeLog; isLatest?: boolean }) {
  const isError = log.source === "error";
  return (
    <article className={cn("group relative", isLatest && "animate-slide-up")}>
      <header className="mb-3 flex items-baseline gap-3 border-b border-ink-600 pb-2">
        <span className="vertical-stamp font-mono text-[10px] text-cream-fade">
          T{String(log.turn).padStart(3, "0")}
        </span>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider2 text-amber">
              {log.date}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider2",
                isError ? "text-crimson" : "text-cream-fade",
              )}
            >
              {isError && <AlertCircle className="h-2.5 w-2.5" />}
              {isError ? "ERROR · 失败回退" : "AI NARRATIVE"}
            </span>
          </div>
          <h3 className="mt-0.5 font-display text-lg italic text-cream">
            {log.actionLabel}
          </h3>
        </div>
        {log.eventTitle && (
          <span className="border border-crimson/50 bg-crimson-soft/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider2 text-crimson">
            {log.eventTitle}
          </span>
        )}
      </header>

      <div
        className={cn(
          "prose-narrative relative pl-2",
          isLatest && !isError && "drop-cap",
        )}
      >
        {log.narrative.split(/\n\n+/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {isLatest && <DeltaRow delta={log.delta} />}
      {isLatest && <SuggestionButtons suggestions={log.suggestions} />}
    </article>
  );
}

export function NarrativeView() {
  const narratives = useGameStore((s) => s.narratives);
  const isGenerating = useGameStore((s) => s.isGenerating);
  const isRegenerating = useGameStore((s) => s.isRegenerating);
  const [showHistory, setShowHistory] = useState(false);

  const latestRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (latestRef.current && !showHistory) {
      latestRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [narratives, showHistory]);

  const latest = narratives[narratives.length - 1];
  const history = narratives.slice(0, -1).reverse();

  return (
    <div className="bg-vinyl relative flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ink-600 px-8 py-3">
        <div className="flex items-center gap-3">
          <Clock className="h-3.5 w-3.5 text-amber" />
          <span className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
            Chronicle
          </span>
          <span className="font-display text-sm italic text-cream-fade">
            · 编年史
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-cream-mute transition hover:text-amber"
        >
          {showHistory ? (
            <>
              <ChevronUp className="h-3 w-3" /> 收起历史
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> 历史({history.length})
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showHistory && history.length > 0 && (
          <div className="border-b border-ink-600 bg-ink-900/60 px-8 py-5">
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-wider2 text-cream-fade">
                  Archive
                </span>
                <div className="tape-divider h-px flex-1" />
              </div>
              <div className="space-y-6 opacity-70">
                {history.map((log) => (
                  <NarrativeEntry key={log.turn} log={log} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={latestRef} className="px-8 py-8">
          <div className="mx-auto max-w-3xl">
            {latest ? (
              <NarrativeEntry log={latest} isLatest />
            ) : (
              <p className="font-display text-cream-mute">还没有发生任何事。</p>
            )}

            {isGenerating && (
              <div className="mt-6 flex items-center gap-2 border border-amber/30 bg-amber-glow px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-amber" />
                <span className="font-mono text-xs uppercase tracking-wider2 text-amber">
                  {isRegenerating ? "正在重新生成本回合..." : "正在生成叙事..."}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 pb-6">
          <div className="mx-auto max-w-3xl">
            <div className="tape-divider mb-2" />
            <p className="text-center font-display text-[11px] italic text-cream-fade">
              · 一直唱下去 · A LIFETIME BAND ·
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
