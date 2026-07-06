import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Users,
  Music2,
  CalendarDays,
  Megaphone,
  Share2,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface NavItem {
  to: string;
  label: string;
  sub: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { to: "/", label: "主舞台", sub: "Stage", icon: BookOpen },
  { to: "/roster", label: "乐队档案", sub: "Roster", icon: Users },
  { to: "/songs", label: "曲目库", sub: "Songs", icon: Music2 },
  { to: "/activities", label: "活动中心", sub: "Actions", icon: CalendarDays },
  { to: "/gigs", label: "演出邀约", sub: "Gigs", icon: Megaphone },
  { to: "/social", label: "社交帐号", sub: "Social", icon: Share2 },
  { to: "/settings", label: "设置", sub: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="relative z-10 flex w-[208px] shrink-0 flex-col border-r border-ink-600 bg-ink-900/60">
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-4 px-2">
          <div className="tape-divider mb-3" />
          <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-fade">
            Navigation
          </div>
        </div>
        <nav className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "group relative flex items-center gap-3 border border-transparent px-3 py-2.5 transition",
                    isActive
                      ? "border-amber/40 bg-amber-glow text-amber"
                      : "text-cream-dim hover:border-ink-500 hover:bg-ink-800/50 hover:text-cream",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-amber" : "text-cream-mute group-hover:text-cream",
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-body text-sm leading-none">{item.label}</div>
                      <div className="mt-1 font-mono text-[9px] uppercase tracking-wider2 text-cream-fade">
                        {item.sub}
                      </div>
                    </div>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 bg-amber" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-ink-600 px-4 py-3">
        <div className="tape-divider mb-3" />
        <p className="font-display text-[11px] italic leading-snug text-cream-fade">
          "走到哪算哪,<br />唱到死为止。"
        </p>
        <p className="mt-2 font-mono text-[8px] uppercase tracking-wider2 text-cream-fade">
          v0.1 · 2026
        </p>
      </div>
    </aside>
  );
}
