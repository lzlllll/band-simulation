import { Heart, MessageCircle, Repeat2, Send, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { SocialAccount } from "../../types";
import { useGameStore } from "../../store/gameStore";
import { Loader2 } from "lucide-react";

function formatFollowers(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  return n.toLocaleString();
}

export function SocialCard({ account }: { account: SocialAccount }) {
  const isGenerating = useGameStore((s) => s.isGenerating);
  const processTurn = useGameStore((s) => s.processTurn);
  const [draft, setDraft] = useState("");

  const post = () => {
    if (isGenerating) return;
    const content = draft.trim();
    const action = content
      ? `在 ${account.platform} 发一条动态:${content}`
      : `在 ${account.platform} 发一条动态`;
    setDraft("");
    void processTurn(action);
  };

  return (
    <article
      className="card-edge relative overflow-hidden"
      style={{ borderColor: `${account.accent}33` }}
    >
      {/* 顶部条 */}
      <div
        className="flex items-center justify-between border-b border-ink-600 px-4 py-2"
        style={{ background: `${account.accent}10` }}
      >
        <div className="flex items-baseline gap-2">
          <span
            className="font-display text-lg font-semibold"
            style={{ color: account.accent }}
          >
            {account.platform}
          </span>
          <span className="font-mono text-[10px] text-cream-mute">
            {account.handle}
          </span>
        </div>
        <TrendingUp
          className="h-3.5 w-3.5"
          style={{ color: account.accent }}
        />
      </div>

      <div className="p-4">
        {/* 粉丝数与互动率 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
              粉丝
            </div>
            <div
              className="nums font-mono text-2xl leading-none"
              style={{ color: account.accent }}
            >
              {formatFollowers(account.followers)}
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-cream-fade">
              {account.followers.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
              互动率
            </div>
            <div className="nums font-mono text-2xl leading-none text-cream">
              {account.engagement.toFixed(1)}
              <span className="text-base text-cream-mute">%</span>
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-cream-fade">
              / 15.0
            </div>
          </div>
        </div>

        {/* 最近帖子 */}
        <div className="mt-4 border-l-2 pl-3" style={{ borderColor: account.accent }}>
          <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
            最新动态
          </div>
          <p className="mt-1 font-body text-xs leading-relaxed text-cream-dim">
            {account.recentPost}
          </p>
          <div className="mt-2 flex items-center gap-4 font-mono text-[10px] text-cream-fade">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {Math.floor(account.followers * account.engagement / 100 / 10)}
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 className="h-3 w-3" />
              {Math.floor(account.followers * account.engagement / 100 / 30)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {Math.floor(account.followers * account.engagement / 100 / 20)}
            </span>
          </div>
        </div>

        {/* 发帖 */}
        <div className="mt-4 border-t border-ink-600 pt-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`在 ${account.platform} 发点什么?`}
            rows={2}
            className="input-edge w-full resize-none border border-ink-600 bg-ink-800/60 px-3 py-2 font-body text-xs text-cream placeholder:text-cream-fade"
          />
          <button
            type="button"
            onClick={post}
            disabled={isGenerating}
            className="btn-glow mt-2 flex w-full items-center justify-center gap-2 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              borderColor: `${account.accent}66`,
              color: account.accent,
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> 推送中
              </>
            ) : (
              <>
                <Send className="h-3 w-3" /> 发布动态
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
