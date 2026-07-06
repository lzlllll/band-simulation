import { useState } from "react";
import { Calendar, User, Heart, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { cn } from "../lib/utils";

function getScheduleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    practice: "排练",
    gig: "演出",
    meeting: "会议",
    social: "社交",
    rest: "休息",
    other: "其他",
  };
  return labels[type] || "其他";
}

function getScheduleTypeColor(type: string): string {
  const colors: Record<string, string> = {
    practice: "#7BA05B",
    gig: "#E8A33D",
    meeting: "#6B8FB8",
    social: "#C5303A",
    rest: "#8B7E6E",
    other: "#524038",
  };
  return colors[type] || "#524038";
}

export function PlayerPanel() {
  const { player, schedule, date } = useGameStore();
  const [expanded, setExpanded] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const todaySchedule = schedule.filter((item) => item.date === date);
  const upcomingSchedule = schedule
    .filter((item) => item.date > date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const today = new Date(date);
  const weekDaysList = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    weekDaysList.push({
      date: d.toISOString().slice(0, 10),
      day: weekDays[d.getDay()],
      dayNum: d.getDate(),
      isToday: i === 0,
      hasEvent: schedule.some((s) => s.date === d.toISOString().slice(0, 10)),
    });
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-80">
      <div className="card-edge rounded-xl overflow-hidden">
        <div
          className="p-4 cursor-pointer hover:bg-[#2a201c]/50 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <span className="font-display text-xl font-bold text-black">{player.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-cream truncate">
                  {player.name}
                </h3>
                <span className="px-2 py-0.5 bg-[#2a201c] rounded text-xs font-mono text-amber">
                  {player.role}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-xs text-cream-mute">
                  {player.age}岁 · {player.gender}
                </span>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-crimson" />
                  <span className="font-mono text-xs text-crimson">{player.mood}</span>
                </div>
              </div>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-cream-mute" />
            ) : (
              <ChevronDown className="w-5 h-5 text-cream-mute" />
            )}
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            expanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="px-4 py-3 border-t border-[#2a201c]">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-amber" />
              <span className="font-mono text-xs text-amber uppercase">背景</span>
            </div>
            <p className="font-body text-xs text-cream-dim leading-relaxed">
              {player.bio}
            </p>
          </div>

          <div className="px-4 py-3 border-t border-[#2a201c]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber" />
              <span className="font-mono text-xs text-amber uppercase">外貌</span>
            </div>
            <p className="font-body text-xs text-cream-dim leading-relaxed">
              {player.appearance}
            </p>
          </div>

          <div className="px-4 py-3 border-t border-[#2a201c]">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-amber" />
              <span className="font-mono text-xs text-amber uppercase">性格</span>
            </div>
            <p className="font-body text-xs text-cream-dim leading-relaxed">
              {player.personality}
            </p>
          </div>

          <div className="px-4 py-3 border-t border-[#2a201c]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber" />
              <span className="font-mono text-xs text-amber uppercase">技能特长</span>
            </div>
            <div className="space-y-2">
              {player.skills.map((skill) => (
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
                  {skill.description && (
                    <p className="font-body text-[10px] text-cream-fade mt-1">
                      {skill.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-[#2a201c]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSchedule(!showSchedule);
              }}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber" />
                <span className="font-mono text-xs text-amber uppercase">日程表</span>
              </div>
              {showSchedule ? (
                <ChevronUp className="w-4 h-4 text-cream-mute" />
              ) : (
                <ChevronDown className="w-4 h-4 text-cream-mute" />
              )}
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                showSchedule ? "max-h-[400px] opacity-100 mt-3" : "max-h-0 opacity-0",
              )}
            >
              <div className="grid grid-cols-7 gap-1 mb-3">
                {weekDaysList.map((d) => (
                  <div
                    key={d.date}
                    className={cn(
                      "text-center py-1 rounded text-xs",
                      d.isToday
                        ? "bg-amber/20 text-amber font-semibold"
                        : d.hasEvent
                        ? "text-cream"
                        : "text-cream-fade",
                    )}
                  >
                    <div className="font-mono">{d.dayNum}</div>
                  </div>
                ))}
              </div>

              {todaySchedule.length > 0 && (
                <div className="mb-3">
                  <div className="font-mono text-[10px] text-amber mb-2">今天 · {date}</div>
                  <div className="space-y-1">
                    {todaySchedule.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-2 py-1.5 bg-[#2a201c] rounded"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getScheduleTypeColor(item.type) }}
                        />
                        <span className="font-mono text-xs text-cream-mute">{item.time}</span>
                        <span className="font-body text-xs text-cream flex-1 truncate">
                          {item.title}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${getScheduleTypeColor(item.type)}20`,
                            color: getScheduleTypeColor(item.type),
                          }}
                        >
                          {getScheduleTypeLabel(item.type)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {upcomingSchedule.length > 0 && (
                <div>
                  <div className="font-mono text-[10px] text-amber mb-2">近期安排</div>
                  <div className="space-y-1">
                    {upcomingSchedule.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-2 py-1.5 bg-[#2a201c]/50 rounded"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getScheduleTypeColor(item.type) }}
                        />
                        <span className="font-mono text-[10px] text-cream-fade">
                          {item.date.slice(5)}
                        </span>
                        <span className="font-mono text-[10px] text-cream-mute">
                          {item.time}
                        </span>
                        <span className="font-body text-xs text-cream flex-1 truncate">
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {todaySchedule.length === 0 && upcomingSchedule.length === 0 && (
                <div className="text-center py-4 text-cream-fade text-xs">
                  暂无日程安排
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
