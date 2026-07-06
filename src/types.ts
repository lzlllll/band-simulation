export interface Skill {
  id: string;
  name: string;
  level: number;
  description?: string;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  gender: string;
  role: string;
  avatar: string;
  bio: string;
  appearance: string;
  personality: string;
  skills: Skill[];
  mood: number;
}

export interface ScheduleItem {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  type: "practice" | "gig" | "meeting" | "social" | "rest" | "other";
}

export interface Member {
  id: string;
  name: string;
  age: number;
  role: string;
  avatar: string;
  skills: Skill[];
  cohesion: number;
  mood: number;
  salary: number;
  bio: string;
  signature: string;
  personality?: string;
  prompt?: string;
  chatHistory?: ChatMessage[];
}

export interface Song {
  id: string;
  title: string;
  style: string;
  bpm: number;
  difficulty: number;
  popularity: number;
  releaseDate: string;
  durationSec: number;
  lyricSnippet: string;
  description?: string;
  reviews?: Review[];
  tags?: string[];
}

export interface Review {
  source: string;
  author: string;
  content: string;
  rating?: number;
  date?: string;
}

export interface StyleProficiency {
  style: string;
  level: number;
  color: string;
}

export interface SocialAccount {
  platform: string;
  handle: string;
  followers: number;
  engagement: number;
  recentPost: string;
  accent: string;
}

export interface GigInvite {
  id: string;
  venue: string;
  city: string;
  date: string;
  ticketPrice: number;
  audienceEstimate: number;
  fee: number;
  riskLevel: "low" | "mid" | "high";
  note: string;
}

export interface Activity {
  id: string;
  name: string;
  hint: string;
}

export interface DynamicEvent {
  id: string;
  title: string;
  desc: string;
  narrativeHint: string;
}

export interface ChatMessage {
  id: string;
  sender: "player" | "member";
  content: string;
  timestamp: string;
}

export interface AIChanges {
  money?: number;
  fame?: number;
  cohesion?: number;
  mood?: number;
  days?: number;
  date?: string;
  members?: Record<string, { mood?: number; skillChanges?: Record<string, number> }>;
}

export interface Suggestion {
  text: string;
  kind?: "action" | "social" | "gig" | "rest" | "explore";
}

export interface ModifySong {
  title: string;
  fields?: Partial<Pick<Song, "style" | "bpm" | "difficulty" | "popularity" | "description" | "tags" | "lyricSnippet">>;
  addReview?: Review;
}

export interface ModifyMember {
  name: string;
  fields?: Partial<Pick<Member, "mood" | "cohesion" | "personality" | "signature">>;
  addSkill?: Skill;
  updateSkill?: { name: string; levelChange: number; description?: string };
  removeSkill?: string;
}

export interface ModifyGig {
  venue: string;
  fields?: Partial<Pick<GigInvite, "date" | "ticketPrice" | "audienceEstimate" | "fee" | "riskLevel" | "note">>;
}

export interface ModifySocial {
  platform: string;
  fields?: Partial<Pick<SocialAccount, "followers" | "engagement" | "recentPost">>;
}

export interface IncrementalUpdate {
  modifySong?: ModifySong;
  deleteSong?: string;
  modifyMember?: ModifyMember;
  modifySkill?: { name: string; levelChange: number; description?: string };
  addSkill?: { name: string; level: number; description?: string };
  removeSkill?: string;
  deleteGig?: string;
  modifyGig?: ModifyGig;
  modifySocial?: ModifySocial;
}

export interface NewContent {
  newSong?: {
    title: string;
    style: string;
    bpm: number;
    difficulty: number;
    popularity: number;
    lyricSnippet: string;
    description?: string;
    tags?: string[];
  };
  newEvent?: {
    title: string;
    desc: string;
    narrativeHint: string;
  };
  newGig?: {
    venue: string;
    city: string;
    date: string;
    ticketPrice: number;
    audienceEstimate: number;
    fee: number;
    riskLevel: "low" | "mid" | "high";
    note: string;
  };
  newPost?: {
    platform: string;
    content: string;
    followersGain?: number;
    engagementDelta?: number;
  };
}

export interface ParsedAIResponse {
  narrative: string;
  changes: AIChanges;
  newContent: NewContent;
  updates: IncrementalUpdate;
  suggestions: Suggestion[];
  raw: string;
}

export interface NarrativeLog {
  turn: number;
  date: string;
  action: string;
  actionLabel: string;
  userInput: string;
  narrative: string;
  delta: AIChanges;
  suggestions: Suggestion[];
  newContent: NewContent;
  source: "llm" | "error";
  eventTitle?: string;
  rawResponse?: string;
}

export interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  flashModel: string;
  proModel: string;
  model?: string;
}

export type NarrativeStyle = "realistic" | "playful" | "literary";
export type NarrativeLength = "short" | "medium" | "long";

export interface NarrativePreference {
  style: NarrativeStyle;
  length: NarrativeLength;
}

export interface TurnSnapshot {
  money: number;
  fame: number;
  cohesion: number;
  members: Member[];
  songs: Song[];
  styles: StyleProficiency[];
  social: SocialAccount[];
  gigInvites: GigInvite[];
  date: string;
  turn: number;
  pendingEvent?: DynamicEvent;
  historySummary: string;
  summarizedUpTo: number;
  userInput: string;
}

export interface GameState {
  bandName: string;
  motto: string;
  date: string;
  turn: number;
  money: number;
  fame: number;
  cohesion: number;
  player: Player;
  members: Member[];
  songs: Song[];
  styles: StyleProficiency[];
  social: SocialAccount[];
  gigInvites: GigInvite[];
  narratives: NarrativeLog[];
  pendingEvent?: DynamicEvent;
  schedule: ScheduleItem[];
  llmConfig: LLMConfig;
  narrativePreference: NarrativePreference;
  isGenerating: boolean;
  isRegenerating: boolean;
  lastDelta?: AIChanges;
  historySummary: string;
  summarizedUpTo: number;
  lastTurnSnapshot?: TurnSnapshot;
  isChattingWith?: string;
}
