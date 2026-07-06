import { useState } from "react";
import {
  Music2,
  Users,
  User,
  Sparkles,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Plus,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { isLLMReady } from "../services/llm";
import type { CharacterCreationData, GeneratedOpening } from "../types/characterCreation";
import { cn } from "../lib/utils";

const DEFAULT_STYLES = ["摇滚", "朋克", "独立", "电子", "民谣", "金属", "后摇", "流行", "爵士", "实验"];
const DEFAULT_ROLES = ["主唱", "吉他手", "贝斯手", "鼓手", "键盘手", "乐队经理", "词曲作者", "制作人"];
const DEFAULT_GENDERS = ["男", "女", "其他"];

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function CharacterCreation() {
  const navigate = useNavigate();
  const { saveLLMConfig, llmConfig, narrativePreference, saveNarrativePreference } = useGameStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState<CharacterCreationData>({
    bandName: "",
    bandStyle: "独立",
    bandMotto: "",
    bandHistory: "",
    playerName: "",
    playerAge: 25,
    playerGender: "男",
    playerRole: "乐队经理",
    playerAvatar: "",
    playerAppearance: "",
    playerPersonality: "",
    playerBackground: "",
    playerSkills: [{ name: "", level: 50, description: "" }],
    members: [
      { name: "", role: "主唱", age: 27, avatar: "", skills: [{ name: "", level: 70 }] },
      { name: "", role: "吉他手", age: 29, avatar: "", skills: [{ name: "", level: 75 }] },
      { name: "", role: "贝斯手", age: 25, avatar: "", skills: [{ name: "", level: 70 }] },
      { name: "", role: "鼓手", age: 31, avatar: "", skills: [{ name: "", level: 75 }] },
      { name: "", role: "键盘手", age: 26, avatar: "", skills: [{ name: "", level: 65 }] },
    ],
    customPrompt: "",
  });

  const [activeSection, setActiveSection] = useState<"llm" | "band" | "player" | "members" | "ai">("llm");
  const [generatedData, setGeneratedData] = useState<GeneratedOpening | null>(null);

  const ready = isLLMReady(llmConfig);

  const updateLLMConfig = (key: keyof typeof llmConfig, value: string) => {
    saveLLMConfig({ ...llmConfig, [key]: value });
  };

  const updateForm = (key: keyof CharacterCreationData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updatePlayerSkill = (index: number, field: "name" | "level" | "description", value: string | number) => {
    setFormData((prev) => {
      const skills = [...prev.playerSkills];
      skills[index] = { ...skills[index], [field]: value };
      return { ...prev, playerSkills: skills };
    });
  };

  const addPlayerSkill = () => {
    setFormData((prev) => ({
      ...prev,
      playerSkills: [...prev.playerSkills, { name: "", level: 50, description: "" }],
    }));
  };

  const removePlayerSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      playerSkills: prev.playerSkills.filter((_, i) => i !== index),
    }));
  };

  const updateMember = (index: number, field: "name" | "role" | "age" | "avatar", value: string | number) => {
    setFormData((prev) => {
      const members = [...prev.members];
      members[index] = { ...members[index], [field]: value };
      return { ...prev, members };
    });
  };

  const updateMemberSkill = (memberIndex: number, skillIndex: number, field: "name" | "level" | "description", value: string | number) => {
    setFormData((prev) => {
      const members = [...prev.members];
      const skills = [...members[memberIndex].skills];
      skills[skillIndex] = { ...skills[skillIndex], [field]: value };
      members[memberIndex] = { ...members[memberIndex], skills };
      return { ...prev, members };
    });
  };

  const addMemberSkill = (memberIndex: number) => {
    setFormData((prev) => {
      const members = [...prev.members];
      members[memberIndex] = {
        ...members[memberIndex],
        skills: [...members[memberIndex].skills, { name: "", level: 50 }],
      };
      return { ...prev, members };
    });
  };

  const removeMemberSkill = (memberIndex: number, skillIndex: number) => {
    setFormData((prev) => {
      const members = [...prev.members];
      members[memberIndex] = {
        ...members[memberIndex],
        skills: members[memberIndex].skills.filter((_, i) => i !== skillIndex),
      };
      return { ...prev, members };
    });
  };

  const addMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, {
        name: "",
        role: "其他",
        age: 25,
        avatar: "",
        skills: [{ name: "", level: 50 }],
      }],
    }));
  };

  const removeMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const randomAvatar = (name: string) => {
    if (!name) return "";
    return name.charAt(0);
  };

  const generateWithAI = async () => {
    if (!ready) return;
    setIsGenerating(true);

    const prompt = `你是一个乐队经营游戏的开局生成器。请根据玩家提供的信息，生成一个完整的乐队开局。

玩家输入:
${formData.customPrompt || "使用表单中的配置"}

表单配置:
- 乐队名称: ${formData.bandName || "未指定"}
- 风格: ${formData.bandStyle}
- 理念: ${formData.bandMotto || "未指定"}
- 过往经历: ${formData.bandHistory || "未指定"}
- 玩家姓名: ${formData.playerName || "未指定"}
- 玩家年龄: ${formData.playerAge}
- 玩家性别: ${formData.playerGender}
- 玩家角色: ${formData.playerRole}
- 玩家外貌: ${formData.playerAppearance || "未指定"}
- 玩家性格: ${formData.playerPersonality || "未指定"}
- 玩家背景: ${formData.playerBackground || "未指定"}
- 玩家技能: ${formData.playerSkills.map(s => `${s.name}:${s.level}`).join(", ") || "未指定"}
- 成员数量: ${formData.members.length}

请返回JSON格式数据，包含以下字段:
{
  "bandName": "乐队名称",
  "motto": "乐队理念",
  "styles": [{"style": "风格名", "level": 0-100, "color": "#颜色代码"}],
  "player": {
    "name": "姓名",
    "age": 年龄,
    "gender": "性别",
    "role": "角色",
    "avatar": "首字",
    "bio": "背景故事",
    "appearance": "外貌描述",
    "personality": "性格描述",
    "skills": [{"name": "技能名", "level": 0-100, "description": "技能描述"}],
    "mood": 70
  },
  "members": [{
    "name": "姓名",
    "age": 年龄,
    "role": "角色",
    "avatar": "首字",
    "skills": [{"name": "技能名", "level": 0-100, "description": "技能描述"}],
    "cohesion": 60-85,
    "mood": 50-80,
    "salary": 3000-6000,
    "bio": "简短背景",
    "signature": "一句个性签名"
  }],
  "openingNarrative": "一段精彩的开场叙事(200-300字)"
}

要求:
1. 每个成员必须有独特的人设和技能
2. 风格至少包含3种，与乐队风格匹配
3. 开场叙事要引人入胜，介绍乐队的现状和未来的挑战
4. 技能名称要具体，如"和弦编排""电吉他solo""人际关系处理"等
`;

    try {
      const base = llmConfig.baseUrl.replace(/\/+$/, "");
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${llmConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: llmConfig.proModel || llmConfig.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
          max_tokens: 3000,
          stream: false,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || "";
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("无法解析AI返回的JSON");
      }

      const result = JSON.parse(jsonMatch[0]) as GeneratedOpening;
      setGeneratedData(result);
    } catch (err) {
      console.error("AI生成失败:", err);
      alert(`生成失败: ${(err as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const startGame = () => {
    const { initializeGame } = useGameStore.getState();
    
    let newPlayer: any;
    let newMembers: any[];
    let newBandName = "";
    let newMotto = "";
    let newStyles: any[] | undefined;
    let newOpening = "";

    if (generatedData) {
      newPlayer = generatedData.player;
      newMembers = generatedData.members;
      newBandName = generatedData.bandName;
      newMotto = generatedData.motto;
      newStyles = generatedData.styles;
      newOpening = generatedData.openingNarrative;
    } else {
      newPlayer = {
        name: formData.playerName || "你",
        age: formData.playerAge,
        gender: formData.playerGender,
        role: formData.playerRole,
        avatar: formData.playerAvatar || randomAvatar(formData.playerName),
        bio: formData.playerBackground || "热爱音乐的年轻人",
        appearance: formData.playerAppearance || "普通的音乐人",
        personality: formData.playerPersonality || "热情开朗",
        skills: formData.playerSkills.filter(s => s.name).map((s, i) => ({ ...s, id: `p${i + 1}` })),
        mood: 70,
      };

      newMembers = formData.members.filter(m => m.name).map((m, i) => ({
        ...m,
        cohesion: Math.floor(Math.random() * 25) + 60,
        mood: Math.floor(Math.random() * 30) + 50,
        salary: Math.floor(Math.random() * 3000) + 3000,
        bio: m.bio || `${m.name}, ${m.age}岁，${m.role}。`,
        signature: m.signature || "暂无签名",
        skills: m.skills.filter(s => s.name).map((s, j) => ({ ...s, id: `s${i + 1}_${j + 1}` })),
      }));

      newBandName = formData.bandName || "无名乐队";
      newMotto = formData.bandMotto || "追逐音乐梦想";
    }

    initializeGame({
      bandName: newBandName,
      motto: newMotto,
      player: newPlayer,
      members: newMembers.length > 0 ? newMembers : [],
      styles: newStyles,
      openingNarrative: newOpening,
    });

    navigate("/");
  };

  const useDefaultConfig = () => {
    setFormData((prev) => ({
      ...prev,
      bandName: "夜行列车",
      bandStyle: "独立",
      bandMotto: "走到哪算哪,唱到死为止。",
      bandHistory: "签不出去也散不了伙的独立乐队。五个住在不同城市的人,被一首没发出去的 demo 绑在一起。",
      playerName: "你",
      playerAge: 25,
      playerGender: "男",
      playerRole: "乐队经理",
      playerAvatar: "你",
      playerAppearance: "中等身材,留着干净利落的短发,眼神中透着对音乐的热爱和执着。",
      playerPersonality: "热情、果断、善于沟通,有时候会过于理想化。",
      playerBackground: "热爱音乐的年轻人,梦想打造一支传奇乐队。",
      playerSkills: [
        { name: "乐队管理", level: 65, description: "协调乐队成员和日常事务" },
        { name: "音乐鉴赏", level: 78, description: "对音乐风格和质量有敏锐的判断力" },
        { name: "人际关系", level: 72, description: "与人沟通和建立关系的能力" },
      ],
      members: [
        { name: "林墨", role: "主唱", age: 27, avatar: "墨", skills: [{ name: "沙哑嗓音", level: 82 }], bio: "原地下乐队主唱", signature: "这首歌再快一点我就咬舌了。" },
        { name: "周野", role: "吉他手", age: 29, avatar: "野", skills: [{ name: "电吉他Solo", level: 88 }], bio: "技术派,练琴成瘾", signature: "等我换个效果器再说。" },
        { name: "苏晚", role: "贝斯手", age: 25, avatar: "晚", skills: [{ name: "和弦编写", level: 81 }], bio: "乐队里最稳的人", signature: "低音不够,故事来凑。" },
        { name: "陈一", role: "鼓手", age: 31, avatar: "一", skills: [{ name: "节拍控制", level: 90 }], bio: "老炮儿,玩过三支乐队", signature: "节拍器都不准,我能怎么办。" },
        { name: "何夕", role: "键盘手", age: 26, avatar: "夕", skills: [{ name: "和弦色彩", level: 87 }], bio: "学院派出身,古典底子", signature: "这个和弦我加个七音试试。" },
      ],
    }));
  };

  return (
    <div className="min-h-screen bg-vinyl bg-grain text-cream">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-8 text-center">
          <div className="font-mono text-xs uppercase tracking-wider2 text-amber mb-2">Character Creation</div>
          <h1 className="font-display text-4xl font-semibold text-cream">创建你的乐队</h1>
          <p className="mt-2 font-body text-sm text-cream-mute">自定义开局配置,或让AI为你生成独特的乐队故事</p>
        </header>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {([
            { key: "llm", label: "API配置", icon: Zap },
            { key: "band", label: "乐队信息", icon: Music2 },
            { key: "player", label: "玩家角色", icon: User },
            { key: "members", label: "乐队成员", icon: Users },
            { key: "ai", label: "AI生成", icon: Sparkles },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={cn(
                "flex items-center gap-2 border px-4 py-2 font-mono text-xs uppercase tracking-wider2 transition",
                activeSection === key
                  ? "border-amber bg-amber/10 text-amber"
                  : "border-ink-600 text-cream-mute hover:text-cream",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeSection === "llm" && (
            <section className="card-edge p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber" />
                <h2 className="font-display text-xl text-cream">LLM 配置</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">Base URL</label>
                  <input
                    type="text"
                    value={llmConfig.baseUrl}
                    onChange={(e) => updateLLMConfig("baseUrl", e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-mono text-sm text-cream placeholder:text-cream-fade"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">API Key</label>
                  <input
                    type="password"
                    value={llmConfig.apiKey}
                    onChange={(e) => updateLLMConfig("apiKey", e.target.value)}
                    placeholder="sk-..."
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-mono text-sm text-cream placeholder:text-cream-fade"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">Flash 模型</label>
                  <input
                    type="text"
                    value={llmConfig.flashModel}
                    onChange={(e) => updateLLMConfig("flashModel", e.target.value)}
                    placeholder="gpt-4o-mini"
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-mono text-sm text-cream placeholder:text-cream-fade"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">Pro 模型</label>
                  <input
                    type="text"
                    value={llmConfig.proModel}
                    onChange={(e) => updateLLMConfig("proModel", e.target.value)}
                    placeholder="gpt-4o"
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-mono text-sm text-cream placeholder:text-cream-fade"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {ready ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                    <span className="font-mono text-xs text-sage">LLM 已就绪</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-crimson" />
                    <span className="font-mono text-xs text-crimson">请填写完整的 API 配置</span>
                  </>
                )}
              </div>
            </section>
          )}

          {activeSection === "band" && (
            <section className="card-edge p-6">
              <div className="flex items-center gap-2 mb-4">
                <Music2 className="w-5 h-5 text-amber" />
                <h2 className="font-display text-xl text-cream">乐队信息</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">乐队名称</label>
                  <input
                    type="text"
                    value={formData.bandName}
                    onChange={(e) => updateForm("bandName", e.target.value)}
                    placeholder="例如:夜行列车"
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-display text-sm text-cream placeholder:text-cream-fade"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">主风格</label>
                  <select
                    value={formData.bandStyle}
                    onChange={(e) => updateForm("bandStyle", e.target.value)}
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-body text-sm text-cream"
                  >
                    {DEFAULT_STYLES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">乐队理念</label>
                  <input
                    type="text"
                    value={formData.bandMotto}
                    onChange={(e) => updateForm("bandMotto", e.target.value)}
                    placeholder="例如:走到哪算哪,唱到死为止"
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-display text-sm text-cream italic placeholder:text-cream-fade"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">过往经历</label>
                  <textarea
                    value={formData.bandHistory}
                    onChange={(e) => updateForm("bandHistory", e.target.value)}
                    placeholder="描述乐队的起源、经历过的事情..."
                    rows={4}
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-body text-sm text-cream placeholder:text-cream-fade resize-none"
                  />
                </div>
              </div>
            </section>
          )}

          {activeSection === "player" && (
            <section className="card-edge p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-amber" />
                <h2 className="font-display text-xl text-cream">玩家角色</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">姓名</label>
                  <input
                    type="text"
                    value={formData.playerName}
                    onChange={(e) => updateForm("playerName", e.target.value)}
                    placeholder="你的名字"
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-display text-sm text-cream placeholder:text-cream-fade"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">年龄</label>
                  <input
                    type="number"
                    value={formData.playerAge}
                    onChange={(e) => updateForm("playerAge", parseInt(e.target.value) || 25)}
                    min={16}
                    max={60}
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-mono text-sm text-cream"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">性别</label>
                  <select
                    value={formData.playerGender}
                    onChange={(e) => updateForm("playerGender", e.target.value)}
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-body text-sm text-cream"
                  >
                    {DEFAULT_GENDERS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">职位</label>
                  <select
                    value={formData.playerRole}
                    onChange={(e) => updateForm("playerRole", e.target.value)}
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-body text-sm text-cream"
                  >
                    {DEFAULT_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">头像(首字)</label>
                  <input
                    type="text"
                    value={formData.playerAvatar}
                    onChange={(e) => updateForm("playerAvatar", e.target.value.charAt(0))}
                    maxLength={1}
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-display text-xl text-center text-cream"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">外貌描述</label>
                  <textarea
                    value={formData.playerAppearance}
                    onChange={(e) => updateForm("playerAppearance", e.target.value)}
                    placeholder="描述你的外貌特征..."
                    rows={3}
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-body text-sm text-cream placeholder:text-cream-fade resize-none"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">性格特点</label>
                  <textarea
                    value={formData.playerPersonality}
                    onChange={(e) => updateForm("playerPersonality", e.target.value)}
                    placeholder="描述你的性格..."
                    rows={3}
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-body text-sm text-cream placeholder:text-cream-fade resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">背景故事</label>
                  <textarea
                    value={formData.playerBackground}
                    onChange={(e) => updateForm("playerBackground", e.target.value)}
                    placeholder="讲述你的音乐故事..."
                    rows={4}
                    className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-body text-sm text-cream placeholder:text-cream-fade resize-none"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">技能特长</label>
                <div className="space-y-2 mt-2">
                  {formData.playerSkills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updatePlayerSkill(index, "name", e.target.value)}
                        placeholder="技能名称"
                        className="flex-1 border border-ink-600 bg-ink-800/60 px-3 py-1.5 font-body text-xs text-cream placeholder:text-cream-fade"
                      />
                      <input
                        type="number"
                        value={skill.level}
                        onChange={(e) => updatePlayerSkill(index, "level", parseInt(e.target.value) || 50)}
                        min={0}
                        max={100}
                        className="w-16 border border-ink-600 bg-ink-800/60 px-2 py-1.5 font-mono text-xs text-cream text-center"
                      />
                      <input
                        type="text"
                        value={skill.description || ""}
                        onChange={(e) => updatePlayerSkill(index, "description", e.target.value)}
                        placeholder="描述"
                        className="flex-1 border border-ink-600 bg-ink-800/60 px-3 py-1.5 font-body text-xs text-cream placeholder:text-cream-fade"
                      />
                      <button
                        onClick={() => removePlayerSkill(index)}
                        className="p-1.5 text-crimson hover:bg-crimson/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addPlayerSkill}
                    className="flex items-center gap-2 text-amber hover:text-amber/80 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-mono text-xs">添加技能</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeSection === "members" && (
            <section className="card-edge p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber" />
                  <h2 className="font-display text-xl text-cream">乐队成员</h2>
                </div>
                <button
                  onClick={addMember}
                  className="flex items-center gap-2 text-amber hover:text-amber/80 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-mono text-xs">添加成员</span>
                </button>
              </div>
              <div className="space-y-4">
                {formData.members.map((member, mIndex) => (
                  <div key={mIndex} className="border border-ink-600 bg-ink-800/30 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-5 flex-1">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateMember(mIndex, "name", e.target.value)}
                          placeholder="姓名"
                          className="border border-ink-600 bg-ink-800/60 px-3 py-1.5 font-display text-sm text-cream placeholder:text-cream-fade"
                        />
                        <select
                          value={member.role}
                          onChange={(e) => updateMember(mIndex, "role", e.target.value)}
                          className="border border-ink-600 bg-ink-800/60 px-3 py-1.5 font-body text-sm text-cream"
                        >
                          {DEFAULT_ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={member.age}
                          onChange={(e) => updateMember(mIndex, "age", parseInt(e.target.value) || 25)}
                          min={16}
                          max={60}
                          placeholder="年龄"
                          className="border border-ink-600 bg-ink-800/60 px-3 py-1.5 font-mono text-sm text-cream text-center"
                        />
                        <input
                          type="text"
                          value={member.avatar}
                          onChange={(e) => updateMember(mIndex, "avatar", e.target.value.charAt(0))}
                          maxLength={1}
                          placeholder="首字"
                          className="border border-ink-600 bg-ink-800/60 px-3 py-1.5 font-display text-lg text-center text-cream"
                        />
                        <button
                          onClick={() => removeMember(mIndex)}
                          className="border border-crimson px-3 py-1.5 font-mono text-xs text-crimson hover:bg-crimson/10 transition"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">技能</label>
                      <div className="space-y-2 mt-1">
                        {member.skills.map((skill, sIndex) => (
                          <div key={sIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => updateMemberSkill(mIndex, sIndex, "name", e.target.value)}
                              placeholder="技能名称"
                              className="flex-1 border border-ink-600 bg-ink-800/60 px-3 py-1 font-body text-xs text-cream placeholder:text-cream-fade"
                            />
                            <input
                              type="number"
                              value={skill.level}
                              onChange={(e) => updateMemberSkill(mIndex, sIndex, "level", parseInt(e.target.value) || 50)}
                              min={0}
                              max={100}
                              className="w-14 border border-ink-600 bg-ink-800/60 px-2 py-1 font-mono text-xs text-cream text-center"
                            />
                            <button
                              onClick={() => removeMemberSkill(mIndex, sIndex)}
                              className="p-1 text-crimson hover:bg-crimson/10 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addMemberSkill(mIndex)}
                          className="flex items-center gap-1 text-amber hover:text-amber/80 transition"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="font-mono text-[10px]">添加技能</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 mt-3 md:grid-cols-2">
                      <input
                        type="text"
                        value={member.bio || ""}
                        onChange={(e) => updateMember(mIndex, "bio" as any, e.target.value)}
                        placeholder="背景简介"
                        className="border border-ink-600 bg-ink-800/60 px-3 py-1 font-body text-xs text-cream placeholder:text-cream-fade"
                      />
                      <input
                        type="text"
                        value={member.signature || ""}
                        onChange={(e) => updateMember(mIndex, "signature" as any, e.target.value)}
                        placeholder="个性签名"
                        className="border border-ink-600 bg-ink-800/60 px-3 py-1 font-display text-xs text-cream italic placeholder:text-cream-fade"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === "ai" && (
            <section className="card-edge p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber" />
                <h2 className="font-display text-xl text-cream">AI 生成开局</h2>
              </div>
              <div className="mb-4">
                <label className="font-mono text-xs uppercase tracking-wider2 text-cream-mute">自定义开场描述</label>
                <textarea
                  value={formData.customPrompt}
                  onChange={(e) => updateForm("customPrompt", e.target.value)}
                  placeholder="粘贴一段文字描述你想要的乐队开局...

例如:
我想要一支90年代风格的摇滚乐队，成员们都来自北京的胡同，经历过地下摇滚的黄金时代，现在重组想要再创辉煌。玩家是乐队的新贝斯手，年轻但充满热情。"
                  rows={6}
                  className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-body text-sm text-cream placeholder:text-cream-fade resize-none"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={generateWithAI}
                  disabled={!ready || isGenerating}
                  className={cn(
                    "flex items-center gap-2 border px-4 py-2 font-mono text-xs uppercase tracking-wider2 transition",
                    ready && !isGenerating
                      ? "border-amber bg-amber/10 text-amber hover:bg-amber/20"
                      : "border-ink-600 text-cream-fade cursor-not-allowed",
                  )}
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-amber border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  {isGenerating ? "生成中..." : "让AI生成开局"}
                </button>
                <button
                  onClick={useDefaultConfig}
                  className="flex items-center gap-2 border border-ink-600 px-4 py-2 font-mono text-xs uppercase tracking-wider2 text-cream-mute hover:text-cream transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  使用默认配置
                </button>
              </div>

              {generatedData && (
                <div className="mt-6 border border-amber/30 bg-amber/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-amber" />
                    <span className="font-mono text-xs text-amber">AI 生成完成</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">乐队名称</div>
                      <div className="font-display text-lg text-cream">{generatedData.bandName}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">理念</div>
                      <div className="font-display text-sm italic text-amber">{generatedData.motto}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">开场叙事</div>
                    <p className="font-body text-sm text-cream-dim leading-relaxed mt-1">
                      {generatedData.openingNarrative}
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">成员列表</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {generatedData.members.map((m) => (
                        <span key={m.name} className="px-2 py-1 bg-ink-600/50 rounded text-xs font-body text-cream">
                          {m.name} ({m.role})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={useDefaultConfig}
            className="flex items-center gap-2 border border-ink-600 px-6 py-3 font-mono text-xs uppercase tracking-wider2 text-cream-mute hover:text-cream transition"
          >
            <RotateCcw className="w-4 h-4" />
            重置为默认
          </button>
          <button
            onClick={startGame}
            className="flex items-center gap-2 border border-amber bg-amber/10 px-6 py-3 font-mono text-xs uppercase tracking-wider2 text-amber hover:bg-amber/20 transition"
          >
            <Save className="w-4 h-4" />
            开始游戏
          </button>
        </div>
      </div>
    </div>
  );
}
