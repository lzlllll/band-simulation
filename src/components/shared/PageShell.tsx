import type { ReactNode } from "react";

interface PageShellProps {
  title: string;
  subtitle?: string;
  english?: string;
  right?: ReactNode;
  children: ReactNode;
}

export function PageShell({
  title,
  subtitle,
  english,
  right,
  children,
}: PageShellProps) {
  return (
    <div className="bg-vinyl relative h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-8">
        {/* 标题区 */}
        <header className="mb-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider2 text-amber">
                {english}
              </div>
              <h1 className="mt-1 font-display text-3xl font-semibold leading-none text-cream">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 font-body text-sm text-cream-mute">{subtitle}</p>
              )}
            </div>
            {right}
          </div>
          <div className="tape-divider mt-4" />
        </header>

        <div className="animate-stagger">{children}</div>
      </div>
    </div>
  );
}
