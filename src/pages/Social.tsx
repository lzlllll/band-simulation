import { PageShell } from "../components/shared/PageShell";
import { SocialCard } from "../components/social/SocialCard";
import { useGameStore } from "../store/gameStore";

export default function Social() {
  const social = useGameStore((s) => s.social);
  const totalFollowers = social.reduce((s, x) => s + x.followers, 0);
  const avgEng = social.length
    ? social.reduce((s, x) => s + x.engagement, 0) / social.length
    : 0;

  return (
    <PageShell
      title="社交帐号"
      subtitle="在算法里游泳。发动态可以涨粉,也烧时间。"
      english="Social"
      right={
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase tracking-wider2 text-cream-mute">
            Total Followers · Avg Engagement
          </div>
          <div className="mt-1 flex items-baseline justify-end gap-2">
            <span className="nums font-mono text-2xl text-amber">
              {(totalFollowers / 10000).toFixed(2)}w
            </span>
            <span className="font-mono text-sm text-cream-mute">
              · {avgEng.toFixed(1)}%
            </span>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {social.map((acc) => (
          <SocialCard key={acc.platform} account={acc} />
        ))}
      </div>
    </PageShell>
  );
}
