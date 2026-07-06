import { useState } from "react";
import { Save, RotateCcw, CheckCircle2, AlertCircle, Sparkles, Zap, Download, Upload, FileJson } from "lucide-react";
import { PageShell } from "../components/shared/PageShell";
import { SectionTitle } from "../components/shared/StatBar";
import { useGameStore } from "../store/gameStore";
import { isLLMReady } from "../services/llm";
import type { LLMConfig, NarrativePreference } from "../types";
import { cn } from "../lib/utils";

interface ProviderPreset {
  label: string;
  baseUrl: string;
  flashModel: string;
  proModel: string;
}

const PRESET_PROVIDERS: ProviderPreset[] = [
  {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    flashModel: "gpt-4o-mini",
    proModel: "gpt-4o",
  },
  {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    flashModel: "deepseek-chat",
    proModel: "deepseek-chat",
  },
  {
    label: "Moonshot",
    baseUrl: "https://api.moonshot.cn/v1",
    flashModel: "moonshot-v1-8k",
    proModel: "moonshot-v1-32k",
  },
  {
    label: "自定义",
    baseUrl: "",
    flashModel: "",
    proModel: "",
  },
];

export default function Settings() {
  const llmConfig = useGameStore((s) => s.llmConfig);
  const pref = useGameStore((s) => s.narrativePreference);
  const saveLLMConfig = useGameStore((s) => s.saveLLMConfig);
  const savePref = useGameStore((s) => s.saveNarrativePreference);
  const resetGame = useGameStore((s) => s.resetGame);
  const exportSave = useGameStore((s) => s.exportSave);
  const importSave = useGameStore((s) => s.importSave);

  const [draft, setDraft] = useState<LLMConfig>(llmConfig);
  const [draftPref, setDraftPref] = useState<NarrativePreference>(pref);
  const [saved, setSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<"success" | "error" | null>(null);

  const ready = isLLMReady(draft);

  const onSave = () => {
    saveLLMConfig(draft);
    savePref(draftPref);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const applyPreset = (p: ProviderPreset) => {
    setDraft((d) => ({
      ...d,
      baseUrl: p.baseUrl || d.baseUrl,
      flashModel: p.flashModel || d.flashModel,
      proModel: p.proModel || d.proModel,
      model: undefined,
    }));
  };

  return (
    <PageShell
      title="设置"
      subtitle="LLM 接入与叙事偏好。配置保存在浏览器本地。"
      english="Settings"
    >
      <div className="space-y-6">
        {/* LLM 配置 */}
        <section className="card-edge p-5">
          <SectionTitle
            title="LLM 接入"
            subtitle="兼容 OpenAI Chat Completions 协议。双模型:Flash 做数据筛选与历史总结,Pro 做叙事生成。"
            right={
              <span
                className={cn(
                  "flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2",
                  ready ? "text-sage" : "text-crimson",
                )}
              >
                {ready ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> 已就绪
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" /> 未配置
                  </>
                )}
              </span>
            }
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
                服务商预设
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_PROVIDERS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={cn(
                      "btn-glow border px-2 py-1 font-mono text-[10px] uppercase tracking-wider2 transition",
                      draft.baseUrl === p.baseUrl && p.baseUrl
                        ? "border-amber bg-amber/10 text-amber"
                        : "border-ink-600 text-cream-mute hover:text-cream",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
                Base URL
              </label>
              <input
                type="text"
                value={draft.baseUrl}
                onChange={(e) => setDraft((d) => ({ ...d, baseUrl: e.target.value }))}
                placeholder="https://api.openai.com/v1"
                className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-mono text-xs text-cream placeholder:text-cream-fade"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
                API Key
              </label>
              <input
                type="password"
                value={draft.apiKey}
                onChange={(e) => setDraft((d) => ({ ...d, apiKey: e.target.value }))}
                placeholder="sk-..."
                className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-mono text-xs text-cream placeholder:text-cream-fade"
              />
              <p className="mt-1 font-mono text-[9px] text-cream-fade">
                密钥只保存在浏览器 localStorage,不会上传任何服务器。
              </p>
            </div>

            <div>
              <label className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
                <Zap className="h-3 w-3 text-amber" /> Flash 模型
              </label>
              <input
                type="text"
                value={draft.flashModel}
                onChange={(e) => setDraft((d) => ({ ...d, flashModel: e.target.value }))}
                placeholder="gpt-4o-mini"
                className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-mono text-xs text-cream placeholder:text-cream-fade"
              />
              <p className="mt-1 font-mono text-[9px] text-cream-fade">
                数据筛选与历史总结,选便宜快的。
              </p>
            </div>

            <div>
              <label className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
                <Sparkles className="h-3 w-3 text-amber" /> Pro 模型
              </label>
              <input
                type="text"
                value={draft.proModel}
                onChange={(e) => setDraft((d) => ({ ...d, proModel: e.target.value }))}
                placeholder="gpt-4o"
                className="input-edge mt-1 w-full border border-ink-600 bg-ink-800/60 px-3 py-2 font-mono text-xs text-cream placeholder:text-cream-fade"
              />
              <p className="mt-1 font-mono text-[9px] text-cream-fade">
                叙事与判定,选会写故事的大模型。
              </p>
            </div>
          </div>
        </section>

        {/* 叙事偏好 */}
        <section className="card-edge p-5">
          <SectionTitle
            title="叙事偏好"
            subtitle="控制 Pro 模型生成正文的风格与长度。"
            right={<Sparkles className="h-4 w-4 text-amber" />}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
                叙事风格
              </label>
              <div className="mt-2 flex flex-col gap-1.5">
                {(["realistic", "playful", "literary"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDraftPref((p) => ({ ...p, style: s }))}
                    className={cn(
                      "border px-3 py-2 text-left font-body text-xs transition",
                      draftPref.style === s
                        ? "border-amber bg-amber/10 text-amber"
                        : "border-ink-600 text-cream-mute hover:text-cream",
                    )}
                  >
                    {s === "realistic" && "写实 · 白描细节"}
                    {s === "playful" && "戏谑 · 黑色幽默"}
                    {s === "literary" && "文艺 · 比喻与留白"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider2 text-cream-mute">
                叙事长度
              </label>
              <div className="mt-2 flex flex-col gap-1.5">
                {(["short", "medium", "long"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setDraftPref((p) => ({ ...p, length: l }))}
                    className={cn(
                      "border px-3 py-2 text-left font-body text-xs transition",
                      draftPref.length === l
                        ? "border-amber bg-amber/10 text-amber"
                        : "border-ink-600 text-cream-mute hover:text-cream",
                    )}
                  >
                    {l === "short" && "短 · ~150 字"}
                    {l === "medium" && "中 · ~220 字"}
                    {l === "long" && "长 · ~300 字"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 存档管理 */}
        <section className="card-edge p-5">
          <SectionTitle
            title="存档管理"
            subtitle="导入/导出 JSON 格式存档,方便备份或迁移。"
            right={<FileJson className="h-4 w-4 text-amber" />}
          />

          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const json = exportSave();
                  const blob = new Blob([json], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `lifetime-band-save-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="btn-glow flex items-center gap-2 border border-amber bg-amber/10 px-4 py-2 font-mono text-xs uppercase tracking-wider2 text-amber transition hover:bg-amber/20"
              >
                <Download className="h-3.5 w-3.5" />
                导出存档
              </button>
              <span className="font-mono text-[10px] text-cream-fade">
                导出为 JSON 文件
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!importText.trim()) return;
                    const success = importSave(importText);
                    setImportResult(success ? "success" : "error");
                    setTimeout(() => setImportResult(null), 2000);
                    if (success) setImportText("");
                  }}
                  className="btn-glow flex items-center gap-2 border border-ink-600 px-4 py-2 font-mono text-xs uppercase tracking-wider2 text-cream-mute transition hover:border-amber hover:text-amber"
                >
                  <Upload className="h-3.5 w-3.5" />
                  导入存档
                </button>
                {importResult === "success" && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-sage">
                    <CheckCircle2 className="h-3 w-3" /> 导入成功
                  </span>
                )}
                {importResult === "error" && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-crimson">
                    <AlertCircle className="h-3 w-3" /> 格式错误
                  </span>
                )}
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="粘贴 JSON 存档内容..."
                className="input-edge w-full h-32 border border-ink-600 bg-ink-800/60 px-3 py-2 font-mono text-xs text-cream placeholder:text-cream-fade resize-none"
              />
              <p className="font-mono text-[9px] text-cream-fade">
                导入将覆盖当前进度,请先导出备份。
              </p>
            </div>
          </div>
        </section>

        {/* 保存与重置 */}
        <section className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            className="btn-glow flex items-center gap-2 border border-amber bg-amber px-5 py-2.5 font-mono text-xs uppercase tracking-wider2 text-ink-900 transition hover:bg-amber-soft"
          >
            <Save className="h-3.5 w-3.5" />
            {saved ? "已保存" : "保存配置"}
          </button>

          <div className="ml-auto">
            {showReset ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-crimson">
                  确认重置所有进度?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    resetGame();
                    setShowReset(false);
                    setDraft(llmConfig);
                    setDraftPref(pref);
                  }}
                  className="border border-crimson px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 text-crimson transition hover:bg-crimson hover:text-cream"
                >
                  确认重置
                </button>
                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className="border border-ink-600 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 text-cream-mute transition hover:text-cream"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="flex items-center gap-2 border border-ink-600 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider2 text-cream-mute transition hover:border-crimson hover:text-crimson"
              >
                <RotateCcw className="h-3 w-3" />
                重置游戏
              </button>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
