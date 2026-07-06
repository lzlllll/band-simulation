import { Outlet } from "react-router-dom";
import { HUD } from "./HUD";
import { Sidebar } from "./Sidebar";
import { ActionPanel } from "./ActionPanel";
import { MemberChatModal } from "../MemberChatModal";
import { PlayerPanel } from "../PlayerPanel";

export function MainLayout() {
  return (
    <div className="bg-vinyl bg-grain relative flex h-screen flex-col overflow-hidden text-cream">
      <HUD />
      <div className="relative z-10 flex min-h-0 flex-1">
        <Sidebar />
        <main className="relative min-w-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
        <ActionPanel />
      </div>
      <MemberChatModal />
      <PlayerPanel />
    </div>
  );
}
