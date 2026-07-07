import type {
  GameState,
  LLMConfig,
  NarrativeLog,
  NarrativePreference,
} from "../types";
import { parseAIResponse, parseRelevantTypes } from "./markupParser";

export function isLLMReady(cfg: LLMConfig): boolean {
  return Boolean(cfg.baseUrl && cfg.apiKey && (cfg.proModel || cfg.model) && (cfg.flashModel || cfg.model));
}

function resolveProModel(cfg: LLMConfig): string {
  return cfg.proModel || cfg.model || "gpt-4o-mini";
}

function resolveFlashModel(cfg: LLMConfig): string {
  return cfg.flashModel || cfg.model || "gpt-4o-mini";
}

export async function callChatInternal(
  cfg: LLMConfig,
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number; timeoutMs?: number; model?: string } = {},
): Promise<string> {
  const model = opts.model || resolveFlashModel(cfg);
  return callChat(cfg, model, system, user, opts);
}

async function callChat(
  cfg: LLMConfig,
  model: string,
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number; timeoutMs?: number } = {},
): Promise<string> {
  const base = cfg.baseUrl.replace(/\/+$/, "");
  const url = `${base}/chat/completions`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: opts.temperature ?? 0.85,
        max_tokens: opts.maxTokens ?? 800,
        stream: false,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    const content: string =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.delta?.content ??
      "";
    const cleaned = content.trim();
    if (!cleaned) throw new Error("返回为空");
    return cleaned;
  } finally {
    clearTimeout(timeout);
  }
}

function sliceMembers(s: GameState): string {
  return s.members
    .map(
      (m) => {
        const skills = m.skills.map((s) => `${s.name}${s.level}`).join("/");
        return `${m.name}(${m.role},${m.age}岁,契合${m.cohesion},心情${m.mood},月薪¥${m.salary})技能:[${skills}]${m.personality ? ` 人设:${m.personality}` : ""}`;
      },
    )
    .join(";\n");
}

function sliceSongs(s: GameState): string {
  return s.songs
    .map(
      (x) =>
        `《${x.title}》[${x.style}] ${x.bpm}BPM 难度${x.difficulty} 人气${x.popularity} 发行${x.releaseDate}${x.description ? ` 描述:${x.description.slice(0, 80)}` : ""}${x.tags?.length ? ` 标签:${x.tags.join(",")}` : ""}`,
    )
    .join(";\n");
}

function sliceStyles(s: GameState): string {
  return s.styles.map((x) => `${x.style}:${x.level}`).join("、");
}

function sliceSocial(s: GameState): string {
  return s.social
    .map((x) => `${x.platform} ${x.followers}粉 互动${x.engagement}%`)
    .join(";\n");
}

function sliceGigs(s: GameState): string {
  return s.gigInvites
    .map(
      (g) =>
        `${g.venue}(${g.city},${g.date}) 票价¥${g.ticketPrice} 观众~${g.audienceEstimate} 酬劳¥${g.fee} 风险${g.riskLevel}`,
    )
    .join(";\n");
}

function sliceStats(s: GameState): string {
  return `资金¥${s.money} 名气${s.fame}/100 凝聚力${s.cohesion}/100 回合${s.turn} 日期${s.date}`;
}

const SLICERS: Record<string, (s: GameState) => string> = {
  members: sliceMembers,
  songs: sliceSongs,
  styles: sliceStyles,
  social: sliceSocial,
  gigs: sliceGigs,
  stats: sliceStats,
};

export const ALL_DATA_TYPES = ["members", "songs", "styles", "social", "gigs", "stats"];

const FLASH_SYSTEM = `你是乐队经营模拟游戏的数据筛选器。
任务:根据玩家的决策,判断这次行动涉及哪些数据类型,只返回相关的类型名。
可用数据类型:
- members: 成员状态(姓名/定位/技巧/心情/人设等)
- songs: 已有曲目(标题/风格/BPM/描述/标签/乐评)
- styles: 风格熟练度
- social: 社交帐号数据
- gigs: 演出邀约
- stats: 当前资金/名气/凝聚力/回合/日期(始终相关)

输出格式:用 <relevant> 标签包裹,每行一个类型名。不要解释,不要输出其他内容。
示例:
<relevant>
members
songs
stats
</relevant>`;

export async function selectRelevantData(
  userInput: string,
  cfg: LLMConfig,
): Promise<string[]> {
  const raw = await callChat(
    cfg,
    resolveFlashModel(cfg),
    FLASH_SYSTEM,
    `玩家决策:${userInput}`,
    { temperature: 0.2, maxTokens: 200, timeoutMs: 15000 },
  );
  return parseRelevantTypes(raw);
}

const STYLE_HINT = {
  realistic: "用克制的现实主义笔法,白描细节,不抒情,贴近真实乐队日常。",
  playful: "用略带戏谑的口吻,可以有黑色幽默和成员间的拌嘴,语气松弛。",
  literary: "用偏文学化的笔法,可以有比喻和留白,情绪克制,不要过度修饰。",
} as const;

const LENGTH_HINT = {
  short: "150 字左右",
  medium: "220 字左右",
  long: "300 字左右",
} as const;

const PRO_SYSTEM = `你是一款文字向「乐队经营模拟」游戏的叙事者与裁判。
你需要根据玩家的决策,生成这一回合的全部内容,包括:叙事正文、数值变化、时间推进、增量更新(修改/新增/删除)、新内容、下一步建议。

# 文风
## 核心
- 第三人称叙事视角
- 禁止过度解释。文风以"展示"为唯一手段。禁止任何形式来解释人物动机、事件原因、情感状态或世界设定。一切信息必须通过人物的行为、对话、以及环境的具体变化来传递给读者。
- 禁止过度概括。禁止抽象总结。必须具体描写：在做什么，什么东西在交易，哪些细节体现了什么。
- 禁止直接心理描写。严禁使用"他想"、"他觉得"、"他意识到"、"他回忆起"等句式直接侵入人物内心。人物的内心世界只能通过其外在行为（面部表情、小动作、生理反应、沉默、对话中的犹豫）和所处的环境来暗示。
- 拒绝议论文与说明文腔调。叙事不是为了证明一个观点或阐释一个概念。叙事只是呈现一个正在发生的事件切片。无需过多的数据堆叠如数字和具体单位。
## 环境描写：作为叙事主体
- 原则：环境不是背景板，而是商业和社会变迁的"物证"，是另一种形式的叙事。
### 融入规则：
- 通过人物活动和感知来呈现，不采用列举。
- 赋予环境以功能性：环境必须对剧情有影响。但环境不跟随剧情的主观意愿进行贴合。
- 展现时间与变化的痕迹：通过具体细节，展现社会环境和历史脉络的演变。
## 对话设计：自然主义对白
- 风格：高度生活化的口语。
- 功能三原则：
    1. 推进经营：讨价还价、协商、下达指令、汇报工作。
    2. 展示人际关系与权力博弈
    3. 侧写社会背景：通过对话内容，传递当时的物价、政策、传闻等信息，而不是由作者直接说明。
    4. 避免大量的逻辑说明，尽可能避免“不是。。。是。。。”等句式。

【硬性规则】
1. 用中文,第三人称,聚焦本回合一个具体场景
2. 必须用以下标记块格式输出,严禁使用 JSON
3. 数值变化要合理克制(资金单次 ±5000 以内,名气 ±8 以内,凝聚力 ±8 以内)
4. 增量更新优先修改现有数据,其次新增数据,最后删除数据
5. AI 需要返回完整的新日期,而不是天数增量
6. 新内容和增量更新都是可选的,只有当玩家行为自然产生时才输出,不要强行生成
7. 建议给 2-4 条,每条是一句具体可操作的话
8. 叙事风格:{style_hint}
9. 叙事长度:{length_hint}

【输出格式】
<narrative>
叙事正文...
</narrative>

<changes>
资金: ±N
名气: ±N
凝聚力: ±N
心情: ±N
日期: YYYY-MM-DD
</changes>

(可选,仅当需要按成员单独调整时)
<member_changes>
林墨: 心情+5 沙哑嗓音+3
周野: 心情-3 电吉他Solo+2
</member_changes>

(增量更新:优先修改,其次新增,最后删除)
(可选,修改现有曲目)
<modify_song>
标题: 曲名
风格: 摇滚
BPM: 120
难度: 3
人气: +10
描述: 新的描述文本
标签: 标签1,标签2
歌词: 新歌词片段
</modify_song>

(可选,为曲目添加乐评)
<add_review>
来源: 媒体名
作者: 乐评人
内容: 乐评正文
评分: 8
日期: YYYY-MM-DD
</add_review>

(可选,删除曲目)
<delete_song>
标题: 曲名
</delete_song>

(可选,修改成员属性)
<modify_member>
姓名: 林墨
心情: +5
契合度: +3
人设: 新的人设描述
签名: 新签名
</modify_member>

(可选,修改成员技能)
<modify_skill>
姓名: 林墨
技能: 即兴填词
变化: +5
描述: 更新后的技能描述
</modify_skill>

(可选,为成员添加新技能)
<add_skill>
姓名: 周野
技能: 人际关系处理
等级: 45
描述: 与人沟通和协调的能力
</add_skill>

(可选,删除成员技能)
<remove_skill>
姓名: 陈一
技能: 旧技能名
</remove_skill>

(可选,修改演出邀约)
<modify_gig>
场地: 场地名
日期: YYYY-MM-DD
票价: 100
观众: 200
酬劳: 5000
风险: low|mid|high
备注: 新备注
</modify_gig>

(可选,删除演出邀约)
<delete_gig>
场地: 场地名
</delete_gig>

(可选,修改社交帐号)
<modify_social>
平台: 微博
粉丝: +120
互动: +0.5
动态: 新动态内容
</modify_social>

(新增内容:以下都是可选块,按需输出)
<new_song>
标题: 曲名
风格: 摇滚
BPM: 120
难度: 3
人气: 0
歌词: 一句歌词
描述: AI生成的曲目描述
标签: 风格标签1,标签2
</new_song>

<new_event>
标题: 事件名
描述: 一句描述
提示: 一句叙事化的细节
</new_event>

<new_gig>
场地: 场地名
城市: 城市
日期: YYYY-MM-DD
票价: 100
观众: 200
酬劳: 5000
风险: low|mid|high
备注: 一句备注
</new_gig>

<new_post>
平台: 微博|抖音|小红书
内容: 帖子内容
涨粉: 120
互动: +0.5
</new_post>

<suggestions>
- 建议1
- 建议2
- 建议3
</suggestions>`;

function buildProUserPrompt(args: {
  userInput: string;
  relevantData: string;
  recent4: string;
  summary: string;
  bandName: string;
  pref: NarrativePreference;
}): string {
  const lines = [
    `【乐队】${args.bandName}`,
    "",
    "【玩家本轮决策】",
    args.userInput,
    "",
    "【相关数据】",
    args.relevantData || "(无)",
    "",
    "【最近 4 回合编年史】",
    args.recent4 || "(尚无历史)",
  ];
  if (args.summary) {
    lines.push("", "【更早历史总结】", args.summary);
  }
  lines.push(
    "",
    "请基于以上信息生成本回合内容。严格按标记块格式输出,不要用 JSON,不要解释。",
  );
  return lines.join("\n");
}

export interface ProResponse {
  raw: string;
  parsed: ReturnType<typeof parseAIResponse>;
}

export async function generateProResponse(
  args: {
    userInput: string;
    relevantTypes: string[];
    state: GameState;
    recentNarratives: NarrativeLog[];
    summary: string;
  },
  cfg: LLMConfig,
  pref: NarrativePreference,
): Promise<ProResponse> {
  const relevantData = args.relevantTypes
    .map((t) => {
      const slicer = SLICERS[t];
      if (!slicer) return "";
      const content = slicer(args.state);
      return content ? `[${t}]\n${content}` : "";
    })
    .filter(Boolean)
    .join("\n\n");

  const recent4 = args.recentNarratives
    .map(
      (n) =>
        `[T${n.turn} ${n.date}] 决策:${n.userInput}\n叙事:${n.narrative.slice(0, 180)}`,
    )
    .join("\n---\n");

  const system = PRO_SYSTEM.replace("{style_hint}", STYLE_HINT[pref.style]).replace(
    "{length_hint}",
    LENGTH_HINT[pref.length],
  );
  const user = buildProUserPrompt({
    userInput: args.userInput,
    relevantData,
    recent4,
    summary: args.summary,
    bandName: args.state.bandName,
    pref,
  });

  const raw = await callChat(cfg, resolveProModel(cfg), system, user, {
    temperature: 0.9,
    maxTokens: 1500,
    timeoutMs: 45000,
  });

  return { raw, parsed: parseAIResponse(raw) };
}
