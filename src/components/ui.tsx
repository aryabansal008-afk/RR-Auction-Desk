import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function PageHeader({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
  return (
    <header className="mb-8 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pink">{eyebrow}</p>
      <h1 className="display mt-2 text-4xl text-ink md:text-5xl">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">{lede}</p>
    </header>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`glass p-5 ${className}`}>{children}</section>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="display mt-2 text-3xl text-ink">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-relaxed text-muted">{hint}</p> : null}
    </Card>
  );
}

export function Status({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "gap" }) {
  const tones = {
    neutral: "border-line text-muted",
    good: "border-gold/40 text-gold",
    warn: "border-pink/40 text-pink",
    gap: "border-pink/50 bg-pink/10 text-pink",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs capitalize ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <h2 className="text-lg text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </Card>
  );
}

export function Loading() {
  return (
    <div className="grid gap-4 md:grid-cols-3" role="status" aria-live="polite">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="glass h-28 animate-pulse" />
      ))}
      <span className="sr-only">Loading validated results</span>
    </div>
  );
}

export function Failure({ message }: { message: string }) {
  return (
    <Card>
      <h1 className="display text-3xl">Data file unavailable</h1>
      <p className="mt-3 text-muted">{message}</p>
      <p className="mt-3 text-sm text-muted">
        From the workspace root, run <code className="text-gold">python3 analysis/export/export_dashboard.py</code> and
        reload.
      </p>
    </Card>
  );
}

export function PlayerLink({ playerKey, children }: { playerKey: string; children: ReactNode }) {
  const [group, role, id] = playerKey.split("|");
  return (
    <Link className="text-ink underline-offset-4 hover:text-pink hover:underline" to={`/reports/${group}/${role}/${id}`}>
      {children}
    </Link>
  );
}
