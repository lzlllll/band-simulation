import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AIChanges,
  ChatMessage,
  GameState,
  IncrementalUpdate,
  LLMConfig,
  Member,
  NarrativeLog,
  NarrativePreference,
  NewContent,
  ParsedAIResponse,
  TurnSnapshot,
} from "../types";
import { INITIAL_MEMBERS } from "../data/members";
import { INITIAL_SONGS } from "../data/songs";
import { INITIAL_STYLES } from "../data/styles";
import { INITIAL_SOCIAL } from "../data/social";
import { INITIAL_GIGS } from "../data/gigs";
import { INITIAL_PLAYER } from "../data/player";
import {
  generateProResponse,
  isLLMReady,
  selectRelevantData,
} from "../services/llm";
import { buildHistorySummary } from "../services/historySummary";

const INITIAL_DATE = "2026-01-05";
const INITIAL_MONEY = 50000;
const INITIAL_FAME = 10;
const INITIAL_COHESION = 75;
const CONTEXT_WINDOW = 4;
const SUMMARY_MAX_CHARS = 1000;

const DEFAULT_LLM: LLMConfig = {
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  flashModel: "gpt-4o-mini",
  proModel: "gpt-4o",
  model: "gpt-4o",
};

const DEFAULT_PREF: NarrativePreference = {
  style: "literary",
  length: "medium",
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && dateStr === d.toISOString().slice(0, 10);
}

function applyChangesToMembers(
  members: Member[],
  changes: AIChanges,
): Member[] {
  let next = members.map((m) => ({
    ...m,
    mood: clamp(m.mood + (changes.mood ?? 0)),
    cohesion: clamp(m.cohesion + (changes.cohesion ?? 0)),
  }));

  if (changes.members) {
    next = next.map((m) => {
      const delta = changes.members?.[m.name];
      if (!delta) return m;
      
      let updated = { ...m };
      if (delta.mood !== undefined) {
        updated.mood = clamp(m.mood + delta.mood);
      }
      
      if (delta.skillChanges) {
        updated.skills = m.skills.map((s) => {
          const change = delta.skillChanges[s.name];
          if (change === undefined) return s;
          return { ...s, level: clamp(s.level + change, 0, 100) };
        });
      }
      
      return updated;
    });
  }
  return next;
}

function applyIncrementalUpdates(
  state: GameState,
  updates: IncrementalUpdate,
): Partial<GameState> {
  const patch: Partial<GameState> = {};

  if (updates.modifySong) {
    const { title, fields, addReview } = updates.modifySong;
    patch.songs = state.songs.map((song) => {
      if (song.title !== title) return song;
      const updated = { ...song };
      if (fields) {
        if (fields.style !== undefined) updated.style = fields.style;
        if (fields.bpm !== undefined) updated.bpm = fields.bpm;
        if (fields.difficulty !== undefined) updated.difficulty = fields.difficulty;
        if (fields.popularity !== undefined) {
          updated.popularity = clamp(song.popularity + fields.popularity, 0, 100);
        }
        if (fields.description !== undefined) updated.description = fields.description;
        if (fields.tags !== undefined) updated.tags = fields.tags;
        if (fields.lyricSnippet !== undefined) updated.lyricSnippet = fields.lyricSnippet;
      }
      if (addReview) {
        updated.reviews = [...(song.reviews || []), addReview];
      }
      return updated;
    });
  }

  if (updates.deleteSong) {
    patch.songs = state.songs.filter((s) => s.title !== updates.deleteSong);
  }

  if (updates.modifyMember) {
    const { name, fields, addSkill, updateSkill, removeSkill } = updates.modifyMember;
    patch.members = state.members.map((m) => {
      if (m.name !== name) return m;
      let updated = { ...m };
      
      if (fields) {
        if (fields.mood !== undefined) updated.mood = clamp(m.mood + fields.mood);
        if (fields.cohesion !== undefined) updated.cohesion = clamp(m.cohesion + fields.cohesion);
        if (fields.personality !== undefined) updated.personality = fields.personality;
        if (fields.signature !== undefined) updated.signature = fields.signature;
      }
      
      if (addSkill) {
        updated.skills = [...m.skills, {
          id: genId("skill"),
          name: addSkill.name,
          level: addSkill.level,
          description: addSkill.description,
        }];
      }
      
      if (updateSkill) {
        updated.skills = m.skills.map((s) => {
          if (s.name !== updateSkill.name) return s;
          return {
            ...s,
            level: clamp(s.level + updateSkill.levelChange, 0, 100),
            description: updateSkill.description ?? s.description,
          };
        });
      }
      
      if (removeSkill) {
        updated.skills = m.skills.filter((s) => s.name !== removeSkill);
      }
      
      return updated;
    });
  }

  if (updates.modifySkill) {
    const { name, levelChange, description } = updates.modifySkill;
    patch.members = state.members.map((m) => {
      const skillIdx = m.skills.findIndex((s) => s.name === name);
      if (skillIdx < 0) return m;
      const updatedSkills = [...m.skills];
      updatedSkills[skillIdx] = {
        ...updatedSkills[skillIdx],
        level: clamp(updatedSkills[skillIdx].level + levelChange, 0, 100),
        description: description ?? updatedSkills[skillIdx].description,
      };
      return { ...m, skills: updatedSkills };
    });
  }

  if (updates.addSkill) {
    const { name, level, description } = updates.addSkill;
    const targetMember = state.members[0];
    if (targetMember) {
      patch.members = state.members.map((m, idx) => {
        if (idx !== 0) return m;
        if (m.skills.some((s) => s.name === name)) return m;
        return {
          ...m,
          skills: [...m.skills, {
            id: genId("skill"),
            name,
            level,
            description,
          }],
        };
      });
    }
  }

  if (updates.removeSkill) {
    const skillName = updates.removeSkill;
    const targetMember = state.members[0];
    if (targetMember) {
      patch.members = state.members.map((m, idx) => {
        if (idx !== 0) return m;
        return {
          ...m,
          skills: m.skills.filter((s) => s.name !== skillName),
        };
      });
    }
  }

  if (updates.modifyGig) {
    const { venue, fields } = updates.modifyGig;
    if (fields) {
      patch.gigInvites = state.gigInvites.map((g) => {
        if (g.venue !== venue) return g;
        const updated = { ...g };
        if (fields.date !== undefined) updated.date = fields.date;
        if (fields.ticketPrice !== undefined) updated.ticketPrice = fields.ticketPrice;
        if (fields.audienceEstimate !== undefined) updated.audienceEstimate = fields.audienceEstimate;
        if (fields.fee !== undefined) updated.fee = fields.fee;
        if (fields.riskLevel !== undefined) updated.riskLevel = fields.riskLevel;
        if (fields.note !== undefined) updated.note = fields.note;
        return updated;
      });
    }
  }

  if (updates.deleteGig) {
    patch.gigInvites = state.gigInvites.filter((g) => g.venue !== updates.deleteGig);
  }

  if (updates.modifySocial) {
    const { platform, fields } = updates.modifySocial;
    if (fields) {
      patch.social = state.social.map((acc) => {
        if (acc.platform !== platform) return acc;
        const updated = { ...acc };
        if (fields.followers !== undefined) updated.followers = acc.followers + fields.followers;
        if (fields.engagement !== undefined) updated.engagement = fields.engagement;
        if (fields.recentPost !== undefined) updated.recentPost = fields.recentPost;
        return updated;
      });
    }
  }

  return patch;
}

function applyNewContent(
  state: GameState,
  nc: NewContent,
): Partial<GameState> {
  const patch: Partial<GameState> = {};

  if (nc.newSong) {
    patch.songs = [
      ...state.songs,
      {
        id: genId("song"),
        title: nc.newSong.title,
        style: nc.newSong.style,
        bpm: nc.newSong.bpm,
        difficulty: nc.newSong.difficulty,
        popularity: nc.newSong.popularity,
        releaseDate: state.date,
        durationSec: 180 + Math.floor(Math.random() * 120),
        lyricSnippet: nc.newSong.lyricSnippet || "",
        description: nc.newSong.description || undefined,
        tags: nc.newSong.tags || undefined,
        reviews: [],
      },
    ];
  }

  if (nc.newEvent) {
    patch.pendingEvent = {
      id: genId("evt"),
      title: nc.newEvent.title,
      desc: nc.newEvent.desc,
      narrativeHint: nc.newEvent.narrativeHint,
    };
  }

  if (nc.newGig) {
    const g = nc.newGig;
    patch.gigInvites = [
      ...state.gigInvites,
      {
        id: genId("gig"),
        venue: g.venue,
        city: g.city,
        date: g.date || addDays(state.date, 14),
        ticketPrice: g.ticketPrice,
        audienceEstimate: g.audienceEstimate,
        fee: g.fee,
        riskLevel: g.riskLevel,
        note: g.note,
      },
    ];
  }

  if (nc.newPost) {
    const idx = state.social.findIndex(
      (s) => s.platform === nc.newPost?.platform,
    );
    if (idx >= 0) {
      patch.social = state.social.map((acc, i) =>
        i === idx
          ? {
              ...acc,
              followers: acc.followers + (nc.newPost!.followersGain ?? Math.floor(Math.random() * 200) + 30),
              engagement: Math.min(15, acc.engagement + (nc.newPost!.engagementDelta ?? 0)),
              recentPost: nc.newPost!.content,
            }
          : acc,
      );
    }
  }

  return patch;
}

function snapshotState(s: GameState, userInput: string): TurnSnapshot {
  return {
    money: s.money,
    fame: s.fame,
    cohesion: s.cohesion,
    members: s.members.map((m) => ({ ...m, chatHistory: m.chatHistory?.map((c) => ({ ...c })) })),
    songs: s.songs.map((x) => ({ ...x, reviews: x.reviews?.map((r) => ({ ...r })) })),
    styles: s.styles.map((x) => ({ ...x })),
    social: s.social.map((x) => ({ ...x })),
    gigInvites: s.gigInvites.map((x) => ({ ...x })),
    date: s.date,
    turn: s.turn,
    pendingEvent: s.pendingEvent ? { ...s.pendingEvent } : undefined,
    historySummary: s.historySummary,
    summarizedUpTo: s.summarizedUpTo,
    userInput,
  };
}

function restoreFromSnapshot(snap: TurnSnapshot): Partial<GameState> {
  return {
    money: snap.money,
    fame: snap.fame,
    cohesion: snap.cohesion,
    members: snap.members.map((m) => ({ ...m, chatHistory: m.chatHistory?.map((c) => ({ ...c })) })),
    songs: snap.songs.map((x) => ({ ...x, reviews: x.reviews?.map((r) => ({ ...r })) })),
    styles: snap.styles.map((x) => ({ ...x })),
    social: snap.social.map((x) => ({ ...x })),
    gigInvites: snap.gigInvites.map((x) => ({ ...x })),
    date: snap.date,
    turn: snap.turn,
    pendingEvent: snap.pendingEvent ? { ...snap.pendingEvent } : undefined,
    historySummary: snap.historySummary,
    summarizedUpTo: snap.summarizedUpTo,
    lastDelta: undefined,
  };
}

interface Actions {
  processTurn: (userInput: string) => Promise<void>;
  regenerateTurn: () => Promise<void>;
  applySuggestion: (text: string) => Promise<void>;
  saveLLMConfig: (cfg: LLMConfig) => void;
  saveNarrativePreference: (pref: NarrativePreference) => void;
  resolvePendingEvent: () => void;
  resetGame: () => void;
  exportSave: () => string;
  importSave: (json: string) => boolean;
  startChat: (memberName: string) => void;
  endChat: () => void;
  sendChatMessage: (memberName: string, text: string) => Promise<void>;
}

export type GameStore = GameState & Actions;

const initial: GameState = {
  bandName: "夜行列车",
  motto: "走到哪算哪,唱到死为止。",
  date: INITIAL_DATE,
  turn: 1,
  money: INITIAL_MONEY,
  fame: INITIAL_FAME,
  cohesion: INITIAL_COHESION,
  player: INITIAL_PLAYER,
  members: INITIAL_MEMBERS,
  songs: INITIAL_SONGS,
  styles: INITIAL_STYLES,
  social: INITIAL_SOCIAL,
  gigInvites: INITIAL_GIGS,
  narratives: [
    {
      turn: 0,
      date: INITIAL_DATE,
      action: "intro",
      actionLabel: "故事开始",
      userInput: "",
      narrative:
        "夜行列车是一支签不出去也散不了伙的独立乐队。五个住在不同城市的人,被一首没发出去的 demo 绑在一起。今天,他们要在排练室里决定,接下来的一年怎么过。\n\n你,是其中之一。在右侧输入你想做的事,乐队的故事就会往下走。",
      delta: {},
      suggestions: [
        { text: "召集大家进棚排练《夜行列车》", kind: "action" },
        { text: "给成员群发一条消息聊聊近况", kind: "action" },
        { text: "看看最近有什么演出邀约", kind: "gig" },
      ],
      newContent: {},
      source: "llm",
      rawResponse: "",
    },
  ],
  pendingEvent: undefined,
  schedule: [],
  llmConfig: DEFAULT_LLM,
  narrativePreference: DEFAULT_PREF,
  isGenerating: false,
  isRegenerating: false,
  lastDelta: undefined,
  historySummary: "",
  summarizedUpTo: 0,
  lastTurnSnapshot: undefined,
  isChattingWith: undefined,
};

async function runTurn(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void,
  userInput: string,
  isRegenerate: boolean,
): Promise<void> {
  const state = get();
  if (state.isGenerating) return;
  if (!userInput.trim()) return;

  const ready = isLLMReady(state.llmConfig);
  if (!ready) {
    set({
      isGenerating: false,
      narratives: [
        ...state.narratives,
        {
          turn: state.turn,
          date: state.date,
          action: "error",
          actionLabel: "未配置 LLM",
          userInput,
          narrative:
            "尚未配置 LLM。请到「设置」页填写 Base URL、API Key、Flash 模型与 Pro 模型后再继续。",
          delta: {},
          suggestions: [],
          newContent: {},
          source: "error",
        },
      ],
    });
    return;
  }

  if (!isRegenerate) {
    set({
      isGenerating: true,
      lastTurnSnapshot: snapshotState(state, userInput),
    });
  } else {
    set({ isGenerating: true, isRegenerating: true });
  }

  const cur = get();

  let relevantTypes: string[] = ["stats", "members"];
  try {
    relevantTypes = await selectRelevantData(userInput, cur.llmConfig);
  } catch (err) {
    console.warn("Flash 筛选失败,使用默认数据集:", err);
  }

  const recentNarratives = cur.narratives.slice(-CONTEXT_WINDOW);

  let raw = "";
  let parsed: ParsedAIResponse;
  let source: "llm" | "error" = "llm";
  let errMsg = "";

  try {
    const res = await generateProResponse(
      {
        userInput,
        relevantTypes,
        state: cur,
        recentNarratives,
        summary: cur.historySummary,
      },
      cur.llmConfig,
      cur.narrativePreference,
    );
    raw = res.raw;
    parsed = res.parsed;
  } catch (err) {
    console.error("Pro 生成失败:", err);
    source = "error";
    errMsg = (err as Error).message || String(err);
    parsed = {
      narrative: `(本轮叙事生成失败:${errMsg}\n\n可以在「设置」检查 Pro 模型配置,或点击「重新生成本回合」再试一次。`,
      changes: { days: 0 },
      newContent: {},
      updates: {},
      suggestions: [
        { text: "重新生成本回合", kind: "action" },
        { text: "去设置页检查 LLM 配置", kind: "explore" },
      ],
      raw: "",
    };
  }

  const changes = parsed.changes;
  
  let newDate = cur.date;
  let newTurn = cur.turn;
  
  if (changes.date && isValidDate(changes.date)) {
    newDate = changes.date;
    newTurn = cur.turn + 1;
  } else {
    const days = Math.max(0, changes.days ?? 1);
    newDate = days > 0 ? addDays(cur.date, days) : cur.date;
    newTurn = cur.turn + (days > 0 ? 1 : 0);
  }

  const basePatch: Partial<GameState> = {
    date: newDate,
    turn: newTurn,
    money: cur.money + (changes.money ?? 0),
    fame: clamp(cur.fame + (changes.fame ?? 0)),
    cohesion: clamp(cur.cohesion + (changes.cohesion ?? 0)),
    members: applyChangesToMembers(cur.members, changes),
    lastDelta: changes,
  };

  const updatesPatch = applyIncrementalUpdates({ ...cur, ...basePatch } as GameState, parsed.updates);
  const contentPatch = applyNewContent({ ...cur, ...basePatch, ...updatesPatch } as GameState, parsed.newContent);
  
  set({ ...basePatch, ...updatesPatch, ...contentPatch });

  const afterApply = get();
  const log: NarrativeLog = {
    turn: newTurn,
    date: newDate,
    action: isRegenerate ? `regen:${userInput.slice(0, 24)}` : `turn:${userInput.slice(0, 24)}`,
    actionLabel: userInput.length > 40 ? `${userInput.slice(0, 38)}…` : userInput,
    userInput,
    narrative: parsed.narrative,
    delta: changes,
    suggestions: parsed.suggestions,
    newContent: parsed.newContent,
    source,
    eventTitle: parsed.newContent.newEvent?.title,
    rawResponse: raw,
  };

  const newNarratives = [...afterApply.narratives, log];
  set({ narratives: newNarratives });

  await maybeUpdateSummary(get, set);

  set({ isGenerating: false, isRegenerating: false });
}

async function maybeUpdateSummary(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void,
): Promise<void> {
  const s = get();
  const total = s.narratives.length;
  const summaryBoundary = total - CONTEXT_WINDOW;
  if (summaryBoundary <= 0) return;
  if (s.summarizedUpTo >= summaryBoundary) return;

  const toSummarize = s.narratives.slice(s.summarizedUpTo, summaryBoundary)
    .filter((n) => n.turn > 0);

  if (toSummarize.length === 0) {
    set({ summarizedUpTo: summaryBoundary });
    return;
  }

  try {
    const summary = await buildHistorySummary(
      toSummarize,
      s.historySummary,
      s.llmConfig,
    );
    set({
      historySummary: summary,
      summarizedUpTo: summaryBoundary,
    });
  } catch (err) {
    console.warn("历史总结失败,稍后再试:", err);
  }
}

const CHAT_SYSTEM = `你是乐队成员「{member_name}」({member_role}),正在与玩家私聊。
人设:{member_personality}
签名:{member_signature}

规则:
1. 用第一人称回复,符合人设性格
2. 回复简短自然,像是真实聊天(50-150字)
3. 不要推进时间,只专注当下对话
4. 可以表达心情、吐槽、给建议,但不要做重大决策
5. 如果玩家聊与乐队无关的话题,按人设自然回应

当前乐队状态:资金¥{money} 名气{fame} 凝聚力{cohesion}
当前日期:{date}

聊天记录:
{chat_history}`;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initial,

      processTurn: async (userInput) => {
        await runTurn(get, set, userInput, false);
      },

      regenerateTurn: async () => {
        const state = get();
        if (state.isGenerating || !state.lastTurnSnapshot) return;

        const restored = restoreFromSnapshot(state.lastTurnSnapshot);
        const userInput = state.lastTurnSnapshot.userInput;

        const trimmedNarratives = state.narratives.slice(0, -1);
        set({
          ...restored,
          narratives: trimmedNarratives,
          isGenerating: true,
          isRegenerating: true,
          lastTurnSnapshot: undefined,
        });

        await runTurn(get, set, userInput, true);
      },

      applySuggestion: async (text) => {
        await get().processTurn(text);
      },

      saveLLMConfig: (cfg) => set({ llmConfig: cfg }),
      saveNarrativePreference: (pref) => set({ narrativePreference: pref }),

      resolvePendingEvent: () => set({ pendingEvent: undefined }),

      resetGame: () =>
        set({
          ...initial,
          narratives: [...initial.narratives],
          lastTurnSnapshot: undefined,
          isChattingWith: undefined,
        }),

      exportSave: () => {
        const state = get();
        const saveData = {
          version: "2.1",
          savedAt: new Date().toISOString(),
          data: {
            bandName: state.bandName,
            motto: state.motto,
            date: state.date,
            turn: state.turn,
            money: state.money,
            fame: state.fame,
            cohesion: state.cohesion,
            player: state.player,
            members: state.members,
            songs: state.songs,
            styles: state.styles,
            social: state.social,
            gigInvites: state.gigInvites,
            narratives: state.narratives,
            pendingEvent: state.pendingEvent,
            schedule: state.schedule,
            historySummary: state.historySummary,
            summarizedUpTo: state.summarizedUpTo,
          },
        };
        return JSON.stringify(saveData, null, 2);
      },

      importSave: (json) => {
        try {
          const saveData = JSON.parse(json);
          if (!saveData.data) return false;
          
          const d = saveData.data;
          set({
            bandName: d.bandName ?? initial.bandName,
            motto: d.motto ?? initial.motto,
            date: d.date ?? initial.date,
            turn: d.turn ?? initial.turn,
            money: d.money ?? initial.money,
            fame: d.fame ?? initial.fame,
            cohesion: d.cohesion ?? initial.cohesion,
            player: d.player ?? initial.player,
            members: d.members ?? initial.members,
            songs: d.songs ?? initial.songs,
            styles: d.styles ?? initial.styles,
            social: d.social ?? initial.social,
            gigInvites: d.gigInvites ?? initial.gigInvites,
            narratives: d.narratives ?? initial.narratives,
            pendingEvent: d.pendingEvent,
            schedule: d.schedule ?? [],
            historySummary: d.historySummary ?? "",
            summarizedUpTo: d.summarizedUpTo ?? 0,
            lastTurnSnapshot: undefined,
            isChattingWith: undefined,
          });
          return true;
        } catch {
          return false;
        }
      },

      startChat: (memberName) => {
        const state = get();
        const member = state.members.find((m) => m.name === memberName);
        if (!member) return;
        
        if (!member.personality) {
          member.personality = "暂无详细人设";
        }
        if (!member.prompt) {
          member.prompt = `你是${member.name},${member.role},${member.age}岁。${member.bio}`;
        }
        if (!member.chatHistory) {
          member.chatHistory = [];
        }
        
        set({ isChattingWith: memberName });
      },

      endChat: () => {
        set({ isChattingWith: undefined });
      },

      sendChatMessage: async (memberName, text) => {
        const state = get();
        const ready = isLLMReady(state.llmConfig);
        if (!ready) return;

        const member = state.members.find((m) => m.name === memberName);
        if (!member) return;

        if (!member.personality) {
          member.personality = "沉默寡言的音乐人";
        }
        if (!member.chatHistory) {
          member.chatHistory = [];
        }

        const playerMsg: ChatMessage = {
          id: genId("msg"),
          sender: "player",
          content: text,
          timestamp: new Date().toISOString(),
        };

        member.chatHistory.push(playerMsg);
        set({ members: [...state.members] });

        const chatHistoryText = member.chatHistory.slice(-6).map((m) =>
          `${m.sender === "player" ? "玩家" : member.name}: ${m.content}`
        ).join("\n");

        const system = CHAT_SYSTEM
          .replace("{member_name}", member.name)
          .replace("{member_role}", member.role)
          .replace("{member_personality}", member.personality)
          .replace("{member_signature}", member.signature)
          .replace("{money}", String(state.money))
          .replace("{fame}", String(state.fame))
          .replace("{cohesion}", String(state.cohesion))
          .replace("{date}", state.date)
          .replace("{chat_history}", chatHistoryText);

        try {
          const response = await callChatInternal(state.llmConfig, system, text, {
            temperature: 0.9,
            maxTokens: 300,
            timeoutMs: 20000,
            model: state.llmConfig.flashModel || state.llmConfig.model,
          });

          const memberMsg: ChatMessage = {
            id: genId("msg"),
            sender: "member",
            content: response,
            timestamp: new Date().toISOString(),
          };

          member.chatHistory.push(memberMsg);
          set({ members: [...state.members] });
        } catch (err) {
          console.error("私聊失败:", err);
          const memberMsg: ChatMessage = {
            id: genId("msg"),
            sender: "member",
            content: "(消息发送失败,请稍后再试)",
            timestamp: new Date().toISOString(),
          };
          member.chatHistory.push(memberMsg);
          set({ members: [...state.members] });
        }
      },
    }),
    {
      name: "lifetime-band-save",
      partialize: (s) => ({
        bandName: s.bandName,
        motto: s.motto,
        date: s.date,
        turn: s.turn,
        money: s.money,
        fame: s.fame,
        cohesion: s.cohesion,
        members: s.members,
        songs: s.songs,
        styles: s.styles,
        social: s.social,
        gigInvites: s.gigInvites,
        narratives: s.narratives,
        pendingEvent: s.pendingEvent,
        llmConfig: s.llmConfig,
        narrativePreference: s.narrativePreference,
        historySummary: s.historySummary,
        summarizedUpTo: s.summarizedUpTo,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameState>;
        return {
          ...current,
          ...p,
          llmConfig: {
            ...current.llmConfig,
            ...(p.llmConfig ?? {}),
          },
          narrativePreference: {
            ...current.narrativePreference,
            ...(p.narrativePreference ?? {}),
          },
        };
      },
    },
  ),
);

async function callChatInternal(
  cfg: LLMConfig,
  system: string,
  user: string,
  opts: { temperature?: number; maxTokens?: number; timeoutMs?: number; model?: string } = {},
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
        model: opts.model || cfg.flashModel || cfg.model || "gpt-4o-mini",
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
