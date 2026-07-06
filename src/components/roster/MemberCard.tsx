import { useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import type { Member } from "../../types";
import { StatBar, Tag } from "../shared/StatBar";
import { cn } from "../../lib/utils";
import { useGameStore } from "../../store/gameStore";

function roleColor(role: string): string {
  if (role.includes("主唱")) return "#E8A33D";
  if (role.includes("吉他")) return "#C5303A";
  if (role.includes("贝斯")) return "#7BA05B";
  if (role.includes("鼓")) return "#B88A6B";
  if (role.includes("键盘")) return "#6B8FB8";
  return "#8B7E6E";
}

export function MemberCard({ member }: { member: Member }) {
  const [expanded, setExpanded] = useState(false);
  const color = roleColor(member.role);
  const { startChat } = useGameStore();
  const moodLabel =
    member.mood >= 75 ? "愉悦" : member.mood >= 50 ? "稳定" : member.mood >= 30 ? "低落" : "崩溃";

  return (
    <article className="card-edge group relative overflow-hidden">
      <div
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}44)` }}
      />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center border font-display text-xl font-semibold"
            style={{
              borderColor: `${color}88`,
              backgroundColor: `${color}1a`,
              color,
            }}
          >
            {member.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-display text-lg leading-none text-cream">
                {member.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-cream-mute">
                  {member.age}岁
                </span>
                <button
                  onClick={() => startChat(member.name)}
                  className="p-1.5 text-gray-500 hover:text-amber hover:bg-[#2a2523] rounded-lg transition-colors"
                  title="私聊"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Tag color={color}>{member.role}</Tag>
              <span className="font-mono text-[10px] text-cream-fade">
                ¥{member.salary}/月
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <StatBar label="凝聚力" value={member.cohesion} color={color} />
          <StatBar
            label="心情"
            value={member.mood}
            color={color}
            hint={moodLabel}
          />
        </div>

        <div className="mt-3">
          <div className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute mb-2">
            技能
          </div>
          <div className="space-y-2">
            {member.skills.slice(0, 3).map((skill) => (
              <div key={skill.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-xs text-cream">{skill.name}</span>
                  <span className="font-mono text-xs text-amber">{skill.level}</span>
                </div>
                <div className="h-1.5 bg-[#2a201c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-soft to-amber transition-all duration-500"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
            {member.skills.length > 3 && (
              <div className="font-mono text-[10px] text-cream-fade text-center">
                +{member.skills.length - 3} 项技能
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex w-full items-center justify-between border-t border-ink-600 pt-2 font-mono text-[10px] uppercase tracking-wider2 text-cream-mute transition hover:text-amber"
        >
          <span>{expanded ? "收起" : "更多"}</span>
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            expanded ? "max-h-[96px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <p className="mt-2 font-body text-xs leading-relaxed text-cream-dim">
            {member.bio}
          </p>
          <p className="mt-2 font-display text-sm italic text-amber">
            「{member.signature}」
          </p>
          {member.personality && (
            <p className="mt-2 font-body text-xs text-cream-dim">
              <span className="text-amber">人设:</span> {member.personality}
            </p>
          )}
          {member.skills.length > 3 && (
            <div className="mt-3 space-y-2">
              {member.skills.slice(3).map((skill) => (
                <div key={skill.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body text-xs text-cream">{skill.name}</span>
                    <span className="font-mono text-xs text-amber">{skill.level}</span>
                  </div>
                  <div className="h-1.5 bg-[#2a201c] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-soft to-amber transition-all duration-500"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
