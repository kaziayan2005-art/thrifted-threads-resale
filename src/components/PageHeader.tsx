import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="mx-auto max-w-6xl px-4 pb-8 pt-14">
      <p className="type-eyebrow text-muted-foreground">{eyebrow}</p>
      <h1 className="type-h1 mt-3">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl text-base leading-relaxed">{intro}</p>}
      <div className="ink-rule mt-8" />
    </header>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 pb-16 text-base leading-relaxed [&_h2]:type-h3 [&_h2]:mt-10 [&_li]:mb-2 [&_ul]:list-disc [&_ul]:pl-5">
      {children}
    </div>
  );
}
