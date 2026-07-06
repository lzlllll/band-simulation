import type {
  AIChanges,
  IncrementalUpdate,
  ModifyGig,
  ModifyMember,
  ModifySocial,
  ModifySong,
  NewContent,
  ParsedAIResponse,
  Review,
  Suggestion,
} from "../types";

function extractBlock(raw: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = raw.match(re);
  return m ? m[1].trim() : null;
}

function parseKeyValueBlock(block: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of block.split(/\n+/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIdx = trimmed.search(/[:：]/);
    if (colonIdx < 0) continue;
    const key = trimmed.slice(0, colonIdx).trim().toLowerCase();
    const val = trimmed.slice(colonIdx + 1).trim();
    if (key) map.set(key, val);
  }
  return map;
}

function parseSignedInt(s: string): number | undefined {
  if (!s) return undefined;
  const m = s.trim().match(/^([+-]?\d+(?:\.\d+)?)$/);
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  return Number.isFinite(n) ? Math.round(n) : undefined;
}

function parseSafeFloat(s: string): number | undefined {
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

const CHANGE_KEY_MAP: Record<string, keyof AIChanges> = {
  资金: "money",
  钱: "money",
  money: "money",
  名气: "fame",
  知名度: "fame",
  fame: "fame",
  凝聚力: "cohesion",
  默契: "cohesion",
  cohesion: "cohesion",
  心情: "mood",
  mood: "mood",
  天数: "days",
  推进: "days",
  days: "days",
  日期: "date",
  date: "date",
};

function parseChanges(raw: string): AIChanges {
  const changes: AIChanges = {};
  const block = extractBlock(raw, "changes");
  if (!block) return changes;
  const map = parseKeyValueBlock(block);
  for (const [k, v] of map) {
    const field = CHANGE_KEY_MAP[k];
    if (field && field !== "members") {
      if (field === "date") {
        changes[field] = v;
      } else {
        const n = parseSignedInt(v);
        if (n !== undefined) changes[field] = n;
      }
    }
  }

  const memberBlock = extractBlock(raw, "member_changes");
  if (memberBlock) {
    const members: AIChanges["members"] = {};
    for (const line of memberBlock.split(/\n+/)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const colonIdx = trimmed.search(/[:：]/);
      if (colonIdx < 0) continue;
      const name = trimmed.slice(0, colonIdx).trim();
      const rest = trimmed.slice(colonIdx + 1).trim();
      if (!name) continue;
      const entry: { mood?: number; skillChanges?: Record<string, number> } = {};
      const tokens = rest.split(/[\s,，]+/).filter(Boolean);
      for (const tok of tokens) {
        const m = tok.match(/(.+?)([+-]?\d+(?:\.\d+)?)$/);
        if (!m) continue;
        const n = parseInt(m[2], 10);
        if (!Number.isFinite(n)) continue;
        const label = m[1].trim().toLowerCase();
        if (label.includes("心情") || label.includes("mood")) {
          entry.mood = (entry.mood ?? 0) + n;
        } else {
          if (!entry.skillChanges) entry.skillChanges = {};
          const skillName = m[1].trim();
          entry.skillChanges[skillName] = (entry.skillChanges[skillName] ?? 0) + n;
        }
      }
      if (Object.keys(entry).length) members[name] = entry;
    }
    if (Object.keys(members).length) changes.members = members;
  }

  return changes;
}

function parseReview(block: string): Review | undefined {
  const map = parseKeyValueBlock(block);
  const content = map.get("内容") || map.get("review") || map.get("content") || "";
  if (!content) return undefined;
  return {
    source: map.get("来源") || map.get("source") || "",
    author: map.get("作者") || map.get("author") || "",
    content,
    rating: parseSignedInt(map.get("评分") || map.get("rating") || "") ?? undefined,
    date: map.get("日期") || map.get("date") || undefined,
  };
}

function parseModifySong(raw: string): ModifySong | undefined {
  const block = extractBlock(raw, "modify_song");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  const title = map.get("标题") || map.get("title") || "";
  if (!title) return undefined;

  const fields: ModifySong["fields"] = {};
  const style = map.get("风格") || map.get("style");
  if (style) fields.style = style;
  const bpm = parseSignedInt(map.get("bpm") || map.get("节奏") || "");
  if (bpm !== undefined) fields.bpm = bpm;
  const difficulty = parseSignedInt(map.get("难度") || map.get("difficulty") || "");
  if (difficulty !== undefined) fields.difficulty = difficulty;
  const popularity = parseSignedInt(map.get("人气") || map.get("popularity") || "");
  if (popularity !== undefined) fields.popularity = popularity;
  const description = map.get("描述") || map.get("description");
  if (description) fields.description = description;
  const tagsStr = map.get("标签") || map.get("tags");
  if (tagsStr) fields.tags = tagsStr.split(/[,，、\s]+/).filter(Boolean);
  const lyric = map.get("歌词") || map.get("lyric");
  if (lyric) fields.lyricSnippet = lyric;

  const reviewBlock = extractBlock(raw, "add_review");
  const addReview = reviewBlock ? parseReview(reviewBlock) : undefined;

  return { title, fields: Object.keys(fields).length ? fields : undefined, addReview };
}

function parseDeleteSong(raw: string): string | undefined {
  const block = extractBlock(raw, "delete_song");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  return map.get("标题") || map.get("title") || block.trim();
}

function parseModifyMember(raw: string): ModifyMember | undefined {
  const block = extractBlock(raw, "modify_member");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  const name = map.get("姓名") || map.get("name") || "";
  if (!name) return undefined;

  const fields: ModifyMember["fields"] = {};
  const mood = parseSignedInt(map.get("心情") || map.get("mood") || "");
  if (mood !== undefined) fields.mood = mood;
  const cohesion = parseSignedInt(map.get("凝聚力") || map.get("cohesion") || map.get("契合度") || "");
  if (cohesion !== undefined) fields.cohesion = cohesion;
  const personality = map.get("人设") || map.get("personality");
  if (personality) fields.personality = personality;
  const signature = map.get("签名") || map.get("signature");
  if (signature) fields.signature = signature;

  return { name, fields: Object.keys(fields).length ? fields : undefined };
}

function parseModifySkill(raw: string): { name: string; levelChange: number; description?: string } | undefined {
  const block = extractBlock(raw, "modify_skill");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  const skillName = map.get("技能") || map.get("skill") || "";
  if (!skillName) return undefined;
  const levelChange = parseSignedInt(map.get("变化") || map.get("level") || map.get("change") || "");
  if (levelChange === undefined) return undefined;
  return {
    name: skillName,
    levelChange,
    description: map.get("描述") || map.get("description") || undefined,
  };
}

function parseAddSkill(raw: string): { name: string; level: number; description?: string } | undefined {
  const block = extractBlock(raw, "add_skill");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  const skillName = map.get("技能") || map.get("skill") || "";
  if (!skillName) return undefined;
  const level = parseSignedInt(map.get("等级") || map.get("level") || "");
  if (level === undefined) return undefined;
  return {
    name: skillName,
    level: Math.max(0, Math.min(100, level)),
    description: map.get("描述") || map.get("description") || undefined,
  };
}

function parseRemoveSkill(raw: string): string | undefined {
  const block = extractBlock(raw, "remove_skill");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  return map.get("技能") || map.get("skill") || block.trim();
}

function parseDeleteGig(raw: string): string | undefined {
  const block = extractBlock(raw, "delete_gig");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  return map.get("场地") || map.get("venue") || block.trim();
}

function parseModifyGig(raw: string): ModifyGig | undefined {
  const block = extractBlock(raw, "modify_gig");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  const venue = map.get("场地") || map.get("venue") || "";
  if (!venue) return undefined;

  const fields: ModifyGig["fields"] = {};
  const date = map.get("日期") || map.get("date");
  if (date) fields.date = date;
  const ticketPrice = parseSignedInt(map.get("票价") || map.get("ticket") || "");
  if (ticketPrice !== undefined) fields.ticketPrice = ticketPrice;
  const audience = parseSignedInt(map.get("观众") || map.get("audience") || "");
  if (audience !== undefined) fields.audienceEstimate = audience;
  const fee = parseSignedInt(map.get("酬劳") || map.get("fee") || "");
  if (fee !== undefined) fields.fee = fee;
  const risk = map.get("风险") || map.get("risk");
  if (risk) {
    const r = risk.toLowerCase();
    const riskLevel: "low" | "mid" | "high" = ["low", "mid", "high"].includes(r)
      ? (r as "low" | "mid" | "high")
      : r.includes("低") ? "low" : r.includes("高") ? "high" : "mid";
    fields.riskLevel = riskLevel;
  }
  const note = map.get("备注") || map.get("note");
  if (note) fields.note = note;

  return { venue, fields: Object.keys(fields).length ? fields : undefined };
}

function parseModifySocial(raw: string): ModifySocial | undefined {
  const block = extractBlock(raw, "modify_social");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  const platform = map.get("平台") || map.get("platform") || "";
  if (!platform) return undefined;

  const fields: ModifySocial["fields"] = {};
  const followers = parseSignedInt(map.get("粉丝") || map.get("followers") || "");
  if (followers !== undefined) fields.followers = followers;
  const engagement = parseSafeFloat(map.get("互动") || map.get("engagement") || "");
  if (engagement !== undefined) fields.engagement = engagement;
  const recentPost = map.get("动态") || map.get("post") || map.get("recentPost");
  if (recentPost) fields.recentPost = recentPost;

  return { platform, fields: Object.keys(fields).length ? fields : undefined };
}

function parseIncrementalUpdates(raw: string): IncrementalUpdate {
  return {
    modifySong: parseModifySong(raw),
    deleteSong: parseDeleteSong(raw),
    modifyMember: parseModifyMember(raw),
    modifySkill: parseModifySkill(raw),
    addSkill: parseAddSkill(raw),
    removeSkill: parseRemoveSkill(raw),
    deleteGig: parseDeleteGig(raw),
    modifyGig: parseModifyGig(raw),
    modifySocial: parseModifySocial(raw),
  };
}

function parseNewSong(raw: string): NewContent["newSong"] {
  const block = extractBlock(raw, "new_song");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  const title = map.get("标题") || map.get("title") || "";
  if (!title) return undefined;
  return {
    title,
    style: map.get("风格") || map.get("style") || "独立",
    bpm: parseSignedInt(map.get("bpm") || map.get("节奏") || "") ?? 100,
    difficulty: Math.max(1, Math.min(5, parseSignedInt(map.get("难度") || map.get("difficulty") || "") ?? 3)),
    popularity: Math.max(0, Math.min(100, parseSignedInt(map.get("人气") || map.get("popularity") || "") ?? 0)),
    lyricSnippet: map.get("歌词") || map.get("lyric") || map.get("片段") || "",
    description: map.get("描述") || map.get("description") || undefined,
    tags: (map.get("标签") || map.get("tags"))?.split(/[,，、\s]+/).filter(Boolean) || undefined,
  };
}

function parseNewEvent(raw: string): NewContent["newEvent"] {
  const block = extractBlock(raw, "new_event");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  const title = map.get("标题") || map.get("title") || "";
  if (!title) return undefined;
  return {
    title,
    desc: map.get("描述") || map.get("desc") || map.get("说明") || "",
    narrativeHint: map.get("提示") || map.get("hint") || map.get("叙事") || "",
  };
}

function parseNewGig(raw: string): NewContent["newGig"] {
  const block = extractBlock(raw, "new_gig");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  const venue = map.get("场地") || map.get("venue") || "";
  if (!venue) return undefined;
  const risk = (map.get("风险") || map.get("risk") || "mid").toLowerCase();
  const riskLevel: "low" | "mid" | "high" = ["low", "mid", "high"].includes(risk)
    ? (risk as "low" | "mid" | "high")
    : risk.includes("低") ? "low" : risk.includes("高") ? "high" : "mid";
  return {
    venue,
    city: map.get("城市") || map.get("city") || "未知",
    date: map.get("日期") || map.get("date") || "",
    ticketPrice: parseSignedInt(map.get("票价") || map.get("ticket") || "") ?? 80,
    audienceEstimate: parseSignedInt(map.get("观众") || map.get("audience") || "") ?? 200,
    fee: parseSignedInt(map.get("酬劳") || map.get("fee") || "") ?? 5000,
    riskLevel,
    note: map.get("备注") || map.get("note") || "",
  };
}

function parseNewPost(raw: string): NewContent["newPost"] {
  const block = extractBlock(raw, "new_post");
  if (!block) return undefined;
  const map = parseKeyValueBlock(block);
  const platform = map.get("平台") || map.get("platform") || "";
  if (!platform) return undefined;
  return {
    platform,
    content: map.get("内容") || map.get("content") || "",
    followersGain: parseSignedInt(map.get("涨粉") || map.get("followers") || ""),
    engagementDelta: parseSafeFloat(map.get("互动") || map.get("engagement") || "") ?? undefined,
  };
}

function parseSuggestions(raw: string): Suggestion[] {
  const block = extractBlock(raw, "suggestions");
  if (!block) return [];
  const lines = block
    .split(/\n+/)
    .map((l) => l.replace(/^[-•*\d.、\s]+/, "").trim())
    .filter(Boolean);
  return lines.slice(0, 4).map((text) => {
    const kind: Suggestion["kind"] = /演出|巡演|gig|live/i.test(text)
      ? "gig"
      : /发帖|微博|抖音|小红书|social/i.test(text)
        ? "social"
        : /休息|睡|放空|rest/i.test(text)
          ? "rest"
          : /探索|找|联系|试|explore/i.test(text)
            ? "explore"
            : "action";
    return { text, kind };
  });
}

function parseNarrative(raw: string): string {
  const block = extractBlock(raw, "narrative");
  if (block) return block.trim();
  const idx = raw.search(/<changes|<suggestions|<new_|<modify_|<delete_/i);
  const fallback = idx >= 0 ? raw.slice(0, idx) : raw;
  return fallback.trim();
}

export function parseAIResponse(raw: string): ParsedAIResponse {
  const narrative = parseNarrative(raw);
  const changes = parseChanges(raw);
  const newContent: NewContent = {
    newSong: parseNewSong(raw),
    newEvent: parseNewEvent(raw),
    newGig: parseNewGig(raw),
    newPost: parseNewPost(raw),
  };
  const updates = parseIncrementalUpdates(raw);
  const suggestions = parseSuggestions(raw);
  return { narrative, changes, newContent, updates, suggestions, raw };
}

export function parseRelevantTypes(raw: string): string[] {
  const block = extractBlock(raw, "relevant");
  const text = block ?? raw;
  const known = ["members", "songs", "styles", "social", "gigs", "stats"];
  const found: string[] = [];
  for (const k of known) {
    if (new RegExp(`\\b${k}\\b`, "i").test(text)) found.push(k);
  }
  if (!found.includes("stats")) found.push("stats");
  return found.length ? found : ["stats", "members"];
}
