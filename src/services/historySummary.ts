import type { LLMConfig, NarrativeLog } from "../types";
import { callChatInternal } from "./llm";

// 复用 llm.ts 内部的 callChat(此处导出一个稳定接口)
// 为避免循环依赖,直接在此处实现一个轻量调用。

async function callFlash(
  cfg: LLMConfig,
  system: string,
  user: string,
  maxTokens: number,
): Promise<string> {
  return callChatInternal(cfg, system, user, {
    temperature: 0.4,
    maxTokens,
    timeoutMs: 20000,
  });
}

const SUMMARY_SYSTEM = `你是乐队经营模拟游戏的历史总结器。
任务:把若干回合的编年史条目压缩成一份连贯的概要,保留:
- 关键事件与转折
- 重要的人物状态变化(成员心情/凝聚力)
- 资金/名气/凝聚力的演变轨迹
- 未解决的伏笔

要求:
- 用中文,第三人称
- 简洁,流水账式即可,不要抒情
- 只输出总结正文,不要标题、不要 markdown、不要解释`;

const RE_SUMMARY_SYSTEM = `你是乐队经营模拟游戏的历史总结压缩器。
任务:把已有的总结进一步压缩,保留最关键的事件与状态,控制在 800 字以内。
- 用中文,第三人称
- 只输出压缩后的总结,不要解释`;

function entriesToText(entries: NarrativeLog[]): string {
  return entries
    .map(
      (n) =>
        `[T${n.turn} ${n.date}] 决策:${n.userInput}\n结果:${n.narrative.slice(0, 160)}`,
    )
    .join("\n\n");
}

export async function summarizeEntries(
  newEntries: NarrativeLog[],
  existingSummary: string,
  cfg: LLMConfig,
): Promise<string> {
  if (newEntries.length === 0 && !existingSummary) return "";

  const parts: string[] = [];
  if (existingSummary) {
    parts.push(`【已有总结】\n${existingSummary}`);
  }
  if (newEntries.length) {
    parts.push(`【新增回合】\n${entriesToText(newEntries)}`);
  }

  const user = `${parts.join("\n\n")}\n\n请生成更新后的总结(目标 600-800 字)。`;
  return callFlash(cfg, SUMMARY_SYSTEM, user, 1200);
}

export async function reSummarize(
  summary: string,
  cfg: LLMConfig,
): Promise<string> {
  const user = `请压缩以下总结,保留最关键信息,不超过 800 字:\n\n${summary}`;
  return callFlash(cfg, RE_SUMMARY_SYSTEM, user, 1200);
}

// 主入口:接收需要总结的新条目 + 旧总结,返回新总结,自动处理超长
export async function buildHistorySummary(
  newEntries: NarrativeLog[],
  existingSummary: string,
  cfg: LLMConfig,
): Promise<string> {
  let summary = await summarizeEntries(newEntries, existingSummary, cfg);

  // 第二轮:如果仍超过 1000 字,触发再压缩
  if (summary.length > 1000) {
    summary = await reSummarize(summary, cfg);
  }

  // 兜底:如果还是太长,硬截断(不应该发生,但保命)
  if (summary.length > 1200) {
    summary = summary.slice(0, 1190) + "…";
  }

  return summary;
}
