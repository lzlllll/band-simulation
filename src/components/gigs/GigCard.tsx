import { MapPin, Users, Ticket, Coins, Check, Loader2 } from "lucide-react";
import type { GigInvite } from "../../types";
import { useGameStore } from "../../store/gameStore";
import { Tag } from "../shared/StatBar";

const RISK_CONFIG = {
  low: { label: "低风险", color: "#7BA05B" },
  mid: { label: "中风险", color: "#E8A33D" },
  high: { label: "高风险", color: "#C5303A" },
} as const;

export function GigCard({ gig }: { gig: GigInvite }) {
  const isGenerating = useGameStore((s) => s.isGenerating);
  const processTurn = useGameStore((s) => s.processTurn);
  const risk = RISK_CONFIG[gig.riskLevel];

  return (
    <article className="card-edge group relative overflow-hidden">
      {/* 风险色条 */}
      <div
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: risk.color }}
      />
      <div className="p-4 pl-5">
        {/* 顶部 */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-cream-mute" />
              <span className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
                {gig.city}
              </span>
            </div>
            <h3 className="mt-1 font-display text-xl leading-tight text-cream">
              {gig.venue}
            </h3>
          </div>
          <Tag color={risk.color} variant="solid">
            {risk.label}
          </Tag>
        </div>

        {/* 日期 */}
        <div className="mt-2 font-mono text-[11px] text-amber">
          {gig.date}
        </div>

        {/* 备注 */}
        <p className="mt-2 font-body text-xs leading-relaxed text-cream-dim">
          {gig.note}
        </p>

        {/* 数据 */}
        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-ink-600 pt-3">
          <div>
            <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
              <Ticket className="h-2.5 w-2.5" /> 票价
            </div>
            <div className="mt-0.5 font-mono text-sm text-cream">
              {gig.ticketPrice > 0 ? `¥${gig.ticketPrice}` : "免票"}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
              <Users className="h-2.5 w-2.5" /> 观众
            </div>
            <div className="mt-0.5 font-mono text-sm text-cream">
              ~{gig.audienceEstimate}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
              <Coins className="h-2.5 w-2.5" /> 酬劳
            </div>
            <div className="mt-0.5 font-mono text-sm text-amber">
              +¥{gig.fee.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 接受按钮 */}
        <button
          type="button"
          disabled={isGenerating}
          onClick={() =>
            processTurn(`接下 ${gig.venue}(${gig.city},${gig.date}) 这场演出`)
          }
          className="btn-glow mt-3 flex w-full items-center justify-center gap-2 border border-amber/60 bg-amber/10 px-3 py-2 font-mono text-xs uppercase tracking-wider2 text-amber transition hover:bg-amber hover:text-ink-900 disabled:cursor-not-allowed disabled:border-ink-600 disabled:bg-transparent disabled:text-cream-fade"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> 处理中
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" /> 接下这场演出
            </>
          )}
        </button>
      </div>
    </article>
  );
}
