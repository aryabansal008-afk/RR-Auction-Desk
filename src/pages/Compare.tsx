import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Empty, PageHeader } from "../components/ui";
import { useData } from "../lib/data";
import { int, num, pct, rateName, segmentLabel } from "../lib/format";
import type { Group, Player, Role } from "../types";

export function Compare() {
  const data = useData();
  const [group, setGroup] = useState<Group>("IPL");
  const [role, setRole] = useState<Role>("batter");
  const [picked, setPicked] = useState<string[]>(["IPL|batter|4708", "IPL|batter|3916"]);
  const [addKey, setAddKey] = useState("");
  const [message, setMessage] = useState("");

  const options = useMemo(() => {
    if (data.status !== "ready") return [];
    return data.bundle.players
      .filter((player) => player.group === group && player.role === role)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, group, role]);

  if (data.status !== "ready") return null;
  const selected = picked.map((key) => data.byKey.get(key)).filter((player): player is Player => player != null);
  const comparable = selected.filter((player) => player.group === group && player.role === role);

  function addPlayer() {
    const player = data.status === "ready" ? data.byKey.get(addKey) : undefined;
    if (!player) return;
    if (player.group !== group || player.role !== role) {
      setMessage("Choose a player in the same format and role. Batting and bowling are not placed on one scale.");
      return;
    }
    if (picked.includes(player.key)) {
      setMessage("That player is already in the comparison.");
      return;
    }
    if (picked.length >= 4) {
      setMessage("Four players is the limit for a readable comparison.");
      return;
    }
    setMessage("");
    setPicked([...picked, player.key]);
  }

  const chart = comparable.map((player) => ({
    name: player.name.split(" ").slice(-1)[0],
    PPI: player.ppi,
    Reliability: player.reliability,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Player comparison"
        title="Same skill, same format."
        lede="The comparison stays inside one role so a strike rate is never drawn as if it were an economy. Uncertainty stays visible as the raw-gap interval."
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-sm text-muted">
            Format
            <select
              className="mt-1 w-full rounded-xl border border-line bg-navy/60 px-3 py-2 text-ink"
              value={group}
              onChange={(event) => {
                setGroup(event.target.value as Group);
                setPicked([]);
                setMessage("");
              }}
            >
              <option value="IPL">IPL</option>
              <option value="T20I">T20I</option>
            </select>
          </label>
          <label className="text-sm text-muted">
            Role
            <select
              className="mt-1 w-full rounded-xl border border-line bg-navy/60 px-3 py-2 text-ink"
              value={role}
              onChange={(event) => {
                setRole(event.target.value as Role);
                setPicked([]);
                setMessage("");
              }}
            >
              <option value="batter">Batter</option>
              <option value="bowler">Bowler</option>
            </select>
          </label>
          <label className="text-sm text-muted md:col-span-2">
            Add a player
            <span className="mt-1 flex gap-2">
              <select
                className="w-full rounded-xl border border-line bg-navy/60 px-3 py-2 text-ink"
                value={addKey}
                onChange={(event) => setAddKey(event.target.value)}
              >
                <option value="">Select</option>
                {options.map((player) => (
                  <option key={player.key} value={player.key}>
                    {player.name}
                    {player.eligible ? "" : " · thin sample"}
                  </option>
                ))}
              </select>
              <button type="button" className="rounded-full bg-pink px-4 text-sm text-navy" onClick={addPlayer}>
                Add
              </button>
            </span>
          </label>
        </div>
        {message ? (
          <p className="mt-3 text-sm text-gold" role="status">
            {message}
          </p>
        ) : null}
      </Card>

      {comparable.length === 0 ? (
        <div className="mt-4">
          <Empty title="Nothing selected" body="Add two players in the same role to compare pressure, reliability, and sample size." />
        </div>
      ) : (
        <>
          <Card className="mt-4">
            <h2 className="text-lg">Index and reliability</h2>
            <div className="mt-3 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid stroke="rgba(232,238,248,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="#93a4bd" tick={{ fill: "#93a4bd", fontSize: 12 }} />
                  <YAxis stroke="#93a4bd" tick={{ fill: "#93a4bd", fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "#07111f", border: "1px solid rgba(232,238,248,0.12)" }} />
                  <Legend />
                  <Bar dataKey="PPI" fill="#ff4d9a" radius={4} />
                  <Bar dataKey="Reliability" fill="#e4c27a" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="py-2">Metric</th>
                  {comparable.map((player) => (
                    <th key={player.key} className="py-2">
                      {player.name}
                      <button type="button" className="ml-2 text-pink" onClick={() => setPicked(picked.filter((key) => key !== player.key))}>
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows(role).map((row) => (
                  <tr key={row.label} className="border-t border-line">
                    <th className="py-2 pr-3 font-normal text-muted" scope="row">
                      {row.label}
                    </th>
                    {comparable.map((player) => (
                      <td key={player.key} className="py-2">
                        {row.value(player)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

function rows(role: Role): { label: string; value: (player: Player) => string }[] {
  const common: { label: string; value: (player: Player) => string }[] = [
    { label: "Rank", value: (player) => (player.rank == null ? "Unranked" : String(player.rank)) },
    { label: "Segment", value: (player) => segmentLabel(player.segment) },
    { label: "Pressure index", value: (player) => num(player.ppi, 1) },
    { label: "Reliability", value: (player) => num(player.reliability, 1) },
    { label: "Consistency component", value: (player) => num(player.consistency, 2) },
    { label: "Uncertainty component", value: (player) => num(player.uncertainty, 2) },
    { label: "Shrunk gap", value: (player) => num(player.shrunkGap, 2) },
    { label: "Raw gap, 5th to 95th", value: (player) => `${num(player.gapP05, 1)} to ${num(player.gapP95, 1)}` },
    { label: `Pressure ${rateName({ role } as Player).toLowerCase()}`, value: (player) => num(player.pressureRate, role === "batter" ? 0 : 2) },
    { label: `Baseline ${rateName({ role } as Player).toLowerCase()}`, value: (player) => num(player.baselineRate, role === "batter" ? 0 : 2) },
    { label: "Pressure balls", value: (player) => int(player.pressureBalls) },
    { label: "Baseline balls", value: (player) => int(player.baselineBalls) },
    { label: "Innings", value: (player) => int(player.innings) },
    { label: "Favourable seasons", value: (player) => `${player.seasonsFavorable ?? "—"} / ${player.seasonsQualified ?? "—"}` },
    { label: "Share of pressure balls in 2025–26", value: (player) => pct(player.recentShare) },
    { label: "Dot percentage under pressure", value: (player) => `${num(player.dotPct, 0)}%` },
    { label: "Boundary percentage under pressure", value: (player) => `${num(player.boundaryPct, 0)}%` },
  ];
  if (role === "batter") {
    common.push(
      { label: "Death strike rate", value: (player) => num(player.deathRate, 0) },
      { label: "Mean wickets down at entry", value: (player) => num(player.entryWickets, 2) },
      { label: "Dismissal gap per 100 balls", value: (player) => num(player.dismissalGap, 2) },
      { label: "Collapse-only share", value: (player) => pct(player.collapseShare) },
    );
  } else {
    common.push(
      { label: "Death economy", value: (player) => num(player.deathRate, 2) },
      { label: "Death balls", value: (player) => int(player.deathBalls) },
      { label: "Pressure wickets per 100", value: (player) => num(player.wicketRate, 2) },
      { label: "Baseline wickets per 100", value: (player) => num(player.baselineWicketRate, 2) },
      { label: "Low-total economy", value: (player) => num(player.lowTotalRate, 2) },
    );
  }
  return common;
}
