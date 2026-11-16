import { Suspense } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useData } from "../lib/data";
import { Failure, Loading } from "./ui";

const links = [
  ["/", "Overview"],
  ["/explorer", "Explorer"],
  ["/pressure", "Pressure"],
  ["/compare", "Compare"],
  ["/war-room", "War room"],
  ["/reports", "Reports"],
  ["/method", "Method"],
] as const;

export function Shell() {
  const data = useData();
  return (
    <div className="md:grid md:grid-cols-[15.5rem_1fr]">
      <aside className="border-b border-line bg-navy/70 px-4 py-4 backdrop-blur md:sticky md:top-0 md:h-screen md:border-r md:border-b-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold">Rajasthan Royals</p>
        <p className="display mt-1 text-2xl leading-none">Auction desk</p>
        <p className="mt-1 text-xs text-muted">IPL 2027 intelligence</p>
        <nav className="mt-4 flex flex-wrap gap-2 md:mt-8 md:flex-col" aria-label="Sections">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm whitespace-nowrap transition md:rounded-xl ${
                  isActive ? "bg-pink text-navy" : "text-muted hover:bg-white/5 hover:text-ink"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 md:px-8 md:py-10">
        {data.status === "loading" ? <Loading /> : null}
        {data.status === "error" ? <Failure message={data.message} /> : null}
        {data.status === "ready" ? (
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        ) : null}
      </main>
    </div>
  );
}
