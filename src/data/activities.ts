import type { Activity } from "../types";

// 行动芯片:仅作为玩家输入的灵感提示,不再携带固定效果
export const ACTIVITIES: Activity[] = [
  { id: "rehearse", name: "排练", hint: "进棚打磨现有曲目的细节" },
  { id: "record", name: "录音", hint: "把新动机做成正式 demo" },
  { id: "promote", name: "宣传", hint: "联系媒体、做内容、铺分发" },
  { id: "rest", name: "休息", hint: "全员休整,消化情绪" },
  { id: "tour", name: "巡演", hint: "多城连演,曝光换收入" },
  { id: "writesong", name: "写新歌", hint: "尝试创作一首新作品" },
  { id: "meetup", name: "团建", hint: "一起吃饭喝酒聊近况" },
  { id: "scout", name: "看别人演出", hint: "去 livehouse 找灵感" },
];

export const ACTIVITY_MAP: Record<string, Activity> = Object.fromEntries(
  ACTIVITIES.map((a) => [a.id, a]),
);
