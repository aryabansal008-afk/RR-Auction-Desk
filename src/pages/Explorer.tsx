import { useMemo, useState } from "react";
import { Card, Empty, PageHeader, PlayerLink, Status } from "../components/ui";
import { useData } from "../lib/data";
import { int, num, segmentLabel } from "../lib/format";
import type { Group, Player, Role } from "../types";

type SortKey = "ppi" | "reliability" | "pressureBalls" | "name" | "rank";

export function Explorer() {
  const data = useData();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | Role>("all");
  const [group, setGroup] = useState<"all" | Group>("IPL");
  const [segment, setSegment] = useState("all");
  const [year, setYear] = useState("all");
  const [eligibleOnly, setEligibleOnly] = useState(true);
  const [recentOnly, setRecentOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("ppi");
  const [page, setPage] = useState(0);

  const players = data.status === "ready" ? data.bundle.players : [];
  const segments = useMemo(() => Array.from(new Set(players.map((player) => player.segment).filter(Boolean))).sort(), [players]);
  const years = useMemo(
    () =>
      Array.from(new Set(players.map((player) => player.firstYear).filter((value): value is number => value != null))).sort(),
    [players],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = players.filter((player) => {
      if (role !== "all" && player.role !== role) return false;
      if (group !== "all" && player.group !== group) return false;
      if (segment !== "all" && player.segment !== segment) return false;
      if (year !== "all" && String(player.firstYear) !== year) return false;
      if (eligibleOnly && !player.eligible) return false;
      if (recentOnly && (player.recentShare ?? 0) < 0.5) return false;
      if (needle && !player.name.toLowerCase().includes(needle)) return false;
      return true;
    });
    rows.sort((a, b) => compare(a, b, sort));
    return rows;
  }, [players, query, role, group, segment, year, eligibleOnly, recentOnly, sort]);

  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  if (data.status !== "ready") return null;

  return (
    <>
      <PageHeader
        eyebrow="Player explorer"
        title="Search the validated boards."
        lede="Each row is one player, one format, and one skill. Season control uses the first year in the sample and the share of pressure balls from 2025–26. A season-sliced index was not a Stage 3 output."
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-sm text-muted md:col-span-2">
            Search
            <input
              className="mt-1 w-full rounded-xl border border-line bg-navy/60 px-3 py-2 text-ink"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Player name"
            />
          </label>
          <Select
            label="Competition"
            value={group}
            onChange={(value) => {
              setGroup(value as Group | "all");
              setPage(0);
            }}
            options={[
              ["all", "IPL and T20I"],
              ["IPL", "IPL"],
              ["T20I", "T20I"],
            ]}
          />
          <Select
            label="Role"
            value={role}
            onChange={(value) => {
              setRole(value as Role | "all");
              setPage(0);
            }}
            options={[
              ["all", "Batters and bowlers"],
              ["batter", "Batters"],
              ["bowler", "Bowlers"],
            ]}
          />
          <Select
            label="Segment"
            value={segment}
            onChange={(value) => {
              setSegment(value);
              setPage(0);
            }}
            options={[["all", "All segments"], ...segments.map((item) => [item, segmentLabel(item)] as [string, string])]}
          />
          <Select
            label="First year in sample"
            value={year}
            onChange={(value) => {
              setYear(value);
              setPage(0);
            }}
            options={[["all", "Any year"], ...years.map((item) => [String(item), String(item)] as [string, string])]}
          />
          <Select
            label="Sort"
            value={sort}
            onChange={(value) => setSort(value as SortKey)}
            options={[
              ["ppi", "Pressure index"],
              ["reliability", "Reliability"],
              ["pressureBalls", "Pressure balls"],
              ["rank", "Rank"],
              ["name", "Name"],
            ]}
          />
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={eligibleOnly}
                onChange={(event) => {
                  setEligibleOnly(event.target.checked);
                  setPage(0);
                }}
              />
              Eligible sample only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={recentOnly}
                onChange={(event) => {
                  setRecentOnly(event.target.checked);
                  setPage(0);
                }}
              />
              At least half the pressure balls in 2025–26
            </label>
          </div>
        </div>
      </Card>

      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {filtered.length.toLocaleString("en-US")} rows
      </p>
      {visible.length === 0 ? (
        <div className="mt-4">
          <Empty title="No players match" body="Clear a filter or search a different name. Rows below the floor are hidden while eligible-only is on." />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[52rem] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3">Player</th>
                <th>Format</th>
                <th>Rank</th>
                <th>PPI</th>
                <th>Reliability</th>
                <th>Pressure balls</th>
                <th>Baseline balls</th>
                <th>Segment</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((player) => (
                <tr key={player.key} className="glass">
                  <td className="rounded-l-2xl px-3 py-3">
                    <PlayerLink playerKey={player.key}>{player.name}</PlayerLink>
                    <p className="text-xs text-muted">{player.role}</p>
                  </td>
                  <td>{player.group}</td>
                  <td>{player.rank ?? "—"}</td>
                  <td>{num(player.ppi, 1)}</td>
                  <td>{num(player.reliability, 1)}</td>
                  <td>
                    {int(player.pressureBalls)}{" "}
                    <Status tone={player.eligible ? "good" : "warn"}>{player.eligible ? "floor met" : "thin"}</Status>
                  </td>
                  <td>{int(player.baselineBalls)}</td>
                  <td className="rounded-r-2xl pr-3">{segmentLabel(player.segment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-40"
          disabled={safePage === 0}
          onClick={() => setPage(safePage - 1)}
        >
          Previous
        </button>
        <p className="text-sm text-muted">
          Page {safePage + 1} of {pageCount}
        </p>
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-40"
          disabled={safePage >= pageCount - 1}
          onClick={() => setPage(safePage + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}

function compare(a: Player, b: Player, sort: SortKey): number {
  if (sort === "name") return a.name.localeCompare(b.name);
  if (sort === "rank") return (a.rank ?? 9999) - (b.rank ?? 9999);
  const left = a[sort] ?? -Infinity;
  const right = b[sort] ?? -Infinity;
  return right - left;
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="text-sm text-muted">
      {label}
      <select
        className="mt-1 w-full rounded-xl border border-line bg-navy/60 px-3 py-2 text-ink"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
