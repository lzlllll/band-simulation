import { PageShell } from "../components/shared/PageShell";
import { useGameStore } from "../store/gameStore";

export default function Activities() {
  const isGenerating = useGameStore((s) => s.isGenerating);

  return (
    <PageShell
      title="活动中心"
      subtitle="每一次行动都会推进时间、改变数值,并触发一段叙事。"
      english="Activities"
      right={
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
            State
          </div>
          <div className="mt-1 font-mono text-sm text-cream">
            {isGenerating ? "进行中..." : "待命"}
          </div>
        </div>
      }
    >
      <div className="card-edge p-6 text-center">
        <p className="font-body text-sm text-cream-mute">
          在右侧行动面板中自由输入你的决策,AI 将根据你的选择生成相应的叙事和后果。
        </p>
        <p className="mt-4 font-display text-sm italic text-amber">
          "每一次选择都会成为编年史里的一笔"
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "排练", hint: "进棚打磨现有曲目的细节" },
          { name: "录音", hint: "把新动机做成正式 demo" },
          { name: "宣传", hint: "联系媒体、做内容、铺分发" },
          { name: "休息", hint: "全员休整,消化情绪" },
          { name: "巡演", hint: "多城连演,曝光换收入" },
          { name: "写新歌", hint: "尝试创作一首新作品" },
          { name: "团建", hint: "一起吃饭喝酒聊近况" },
          { name: "看别人演出", hint: "去 livehouse 找灵感" },
        ].map((a, i) => (
          <div key={i} className="card-edge p-4">
            <h3 className="font-display text-lg text-cream">{a.name}</h3>
            <p className="mt-2 font-body text-xs text-cream-mute">{a.hint}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
