import { useState } from "react";
import { Loader2, RotateCcw, Send, Sparkles, Zap } from "lucide-react";
import { useGameStore } from "../../store/gameStore";
import { EventBanner } from "../shared/EventBanner";
import { cn } from "../../lib/utils";

const INSPIRATION_CHIPS = [
  { name: "排练", hint: "进棚打磨现有曲目的细节" },
  { name: "录音", hint: "把新动机做成正式 demo" },
  { name: "宣传", hint: "联系媒体、做内容、铺分发" },
  { name: "休息", hint: "全员休整,消化情绪" },
  { name: "巡演", hint: "多城连演,曝光换收入" },
  { name: "写新歌", hint: "尝试创作一首新作品" },
  { name: "团建", hint: "一起吃饭喝酒聊近况" },
  { name: "看别人演出", hint: "去 livehouse 找灵感" },
];

export function ActionPanel() {
  const isGenerating = useGameStore((s) => s.isGenerating);
  const isRegenerating = useGameStore((s) => s.isRegenerating);
  const hasSnapshot = useGameStore((s) => Boolean(s.lastTurnSnapshot));
  const processTurn = useGameStore((s) => s.processTurn);
  const regenerateTurn = useGameStore((s) => s.regenerateTurn);
  const [text, setText] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isGenerating) return;
    const t = text;
    setText("");
    await processTurn(t);
  };

  const onChip = (chip: string) => {
    if (isGenerating) return;
    setText((cur) => {
      const base = cur.trim();
      return base ? `${base}\n${chip}` : chip;
    });
  };

  const onRegen = async () => {
    if (isGenerating || !hasSnapshot) return;
    await regenerateTurn();
  };

  return (
    <aside className="relative z-10 flex w-[340px] shrink-0 flex-col border-l border-ink-600 bg-ink-900/70">
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* 标题 */}
        <div className="mb-4">
          <div className="tape-divider mb-3" />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-fade">
                This Turn · 决策
              </div>
              <h3 className="font-display text-xl text-cream">行动面板</h3>
            </div>
            <Sparkles className="h-4 w-4 text-amber" />
          </div>
        </div>

        {/* 待处理事件 */}
        <div className="mb-5">
          <EventBanner />
        </div>

        {/* 决策输入 */}
        <form onSubmit={onSubmit} className="mb-4">
          <label className="mb-2 flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
              你的决策
            </span>
            <span className="font-mono text-[9px] text-cream-fade">
              FREEFORM · FLASH→PRO
            </span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="想做点什么?自由描述你的决策,Flash 会判断相关数据,Pro 会据此生成叙事与后果。"
            disabled={isGenerating}
            rows={5}
            className="input-edge w-full resize-none border border-ink-600 bg-ink-800/60 px-3 py-2 font-body text-sm text-cream placeholder:text-cream-fade disabled:opacity-50"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={isGenerating || !text.trim()}
              className="btn-glow flex flex-1 items-center justify-center gap-2 border border-amber/60 bg-amber/10 px-4 py-2.5 font-mono text-xs uppercase tracking-wider2 text-amber transition hover:bg-amber hover:text-ink-900 disabled:cursor-not-allowed disabled:border-ink-600 disabled:bg-transparent disabled:text-cream-fade"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {isRegenerating ? "重新生成中..." : "生成中..."}
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  推进时间
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onRegen}
              disabled={isGenerating || !hasSnapshot}
              title="删除本回合数据与正文,用相同的输入重新生成"
              className="btn-glow flex items-center justify-center gap-1 border border-ink-500 bg-ink-800/40 px-3 py-2.5 font-mono text-[10px] uppercase tracking-wider2 text-cream-dim transition hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              重生
            </button>
          </div>
        </form>

        {/* 灵感芯片 */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
              <Zap className="h-3 w-3 text-amber" /> 灵感芯片
            </span>
            <span className="font-mono text-[9px] text-cream-fade">点击填入</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {INSPIRATION_CHIPS.map((a, i) => (
              <button
                key={i}
                type="button"
                disabled={isGenerating}
                onClick={() => onChip(a.name)}
                title={a.hint}
                className={cn(
                  "btn-glow border border-ink-600 bg-ink-800/40 px-2 py-1 font-body text-xs text-cream-dim transition hover:border-amber/60 hover:text-amber disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                {a.name}
              </button>
            ))}
          </div>
          <p className="mt-3 border-t border-ink-600 pt-2 font-mono text-[9px] leading-relaxed text-cream-fade">
            芯片只是灵感,效果由 AI 判定。可以叠加多个,也可以自由输入。
          </p>
        </div>
      </div>
    </aside>
  );
}
