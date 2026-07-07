import { useState } from "react";
import { ChevronDown, ChevronUp, Disc3 } from "lucide-react";
import type { Song } from "../../types";
import { Tag } from "../shared/StatBar";
import { StatBar } from "../shared/StatBar";
import { cn } from "../../lib/utils";

const FALLBACK_STYLE_COLORS: Record<string, string> = {
  "摇滚": "#E8A33D",
  "朋克": "#C5303A",
  "独立": "#7BA05B",
  "电子": "#6B8FB8",
  "民谣": "#B88A6B",
  "金属": "#4A4A4A",
  "爵士": "#A67C52",
  "流行": "#E8A33D",
  "嘻哈": "#7BA05B",
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SongRow({ song, index }: { song: Song; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const color = FALLBACK_STYLE_COLORS[song.style] ?? "#8B7E6E";

  return (
    <article className="card-edge overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-ink-800/40"
      >
        {/* 序号 + 唱片图标 */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-cream-fade">
            {String(index + 1).padStart(2, "0")}
          </span>
          <Disc3
            className="h-4 w-4 transition-transform duration-700 group-hover:rotate-90"
            style={{ color }}
          />
        </div>

        {/* 曲名 */}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base leading-none text-cream">
            {song.title}
          </h3>
          <div className="mt-1 flex items-center gap-3">
            <Tag color={color}>{song.style}</Tag>
            <span className="font-mono text-[10px] text-cream-mute">
              {song.bpm} BPM
            </span>
            <span className="font-mono text-[10px] text-cream-mute">
              {formatDuration(song.durationSec)}
            </span>
          </div>
        </div>

        {/* 难度 */}
        <div className="hidden md:flex md:items-center md:gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="h-2 w-2"
              style={{
                backgroundColor: i < song.difficulty ? color : "#2A201C",
              }}
            />
          ))}
        </div>

        {/* 人气 */}
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
            POP
          </div>
          <div className="nums font-mono text-sm text-cream">{song.popularity}</div>
        </div>

        {/* 日期 */}
        <div className="hidden text-right lg:block">
          <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
            RELEASED
          </div>
          <div className="font-mono text-[11px] text-cream-dim">
            {song.releaseDate}
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-cream-mute" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-cream-mute" />
        )}
      </button>

      <div
        className={cn(
          "overflow-hidden border-t border-ink-600 transition-all duration-300",
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="px-4 py-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <div className="mb-1 font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
                歌词片段
              </div>
              <p className="font-display text-sm italic leading-relaxed text-cream-dim">
                「{song.lyricSnippet}」
              </p>
            </div>
            <div>
              <StatBar
                label="人气"
                value={song.popularity}
                color={color}
              />
              <div className="mt-2 font-mono text-[10px] text-cream-mute">
                难度 {song.difficulty}/5
              </div>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
                详情
              </div>
              <div className="mt-1 space-y-1 font-mono text-[11px] text-cream-dim">
                <div>BPM · {song.bpm}</div>
                <div>时长 · {formatDuration(song.durationSec)}</div>
                <div>发行 · {song.releaseDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
