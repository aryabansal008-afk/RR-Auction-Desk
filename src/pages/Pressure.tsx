import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Card, PageHeader } from "../components/ui";
import { useData } from "../lib/data";
import { num } from "../lib/format";
import type { Group, Player, Role } from "../types";

export function Pressure() {
  const data = useData();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group>("IPL");
  const [role, setRole] = useState<Role>("batter");
  const [playerKey, setPlayerKey] = useState("IPL|batter|4708");

  const pool = useMemo(() => {
    if (data.status !== "ready") return [];
    return data.bundle.players.filter(
      (player) => player.group === group && player.role === role && player.eligible && player.ppi != null && player.reliability != null,
    );
  }, [data, group, role]);

  const selected = pool.find((player) => player.key === playerKey) ?? pool[0];
  const intervals = [...pool].sort((a, b) => (b.ppi ?? 0) - (a.ppi ?? 0)).slice(0, 12);

  if (data.status !== "ready") return null;

  return (
    <>
      <PageHeader
        eyebrow="Pressure analytics"
        title="Where the index sits."
        lede="The scatter is eligible players only. Bubble size is pressure balls. The interval is the raw-gap bootstrap, which can sit far from the shrunk point. Fifty on the index is no difference from a player's own other balls."
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Toggle
          value={group}
          options={["IPL", "T20I"]}
          onChange={(value) => {
            setGroup(value as Group);
            setPlayerKey("");
          }}
        />
        <Toggle
          value={role}
          options={["batter", "bowler"]}
          onChange={(value) => {
            setRole(value as Role);
            setPlayerKey("");
          }}
        />
      </div>
      <Card>
        <h2 className="text-lg">Pressure index against reliability</h2>
        <div className="mt-3 h-[28rem] min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid stroke="rgba(232,238,248,0.08)" />
              <XAxis dataKey="reliability" name="Reliability" type="number" domain={[30, 80]} stroke="#93a4bd" tick={{ fill: "#93a4bd", fontSize: 12 }} />
              <YAxis dataKey="ppi" name="PPI" type="number" domain={[0, 100]} stroke="#93a4bd" tick={{ fill: "#93a4bd", fontSize: 12 }} />
              <ZAxis dataKey="pressureBalls" range={[50, 280]} />
              <ReferenceLine y={50} stroke="#e4c27a" strokeDasharray="4 4" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ payload }) => {
                  const point = payload?.[0]?.payload as Player | undefined;
                  if (!point) return null;
                  return (
                    <div className="rounded-xl border border-line bg-navy px-3 py-2 text-sm">
                      <p>{point.name}</p>
                      <p className="text-muted">PPI {num(point.ppi, 1)} · Reliability {num(point.reliability, 1)}</p>
                      <p className="text-muted">{point.pressureBalls} pressure balls</p>
                    </div>
                  );
                }}
              />
              <Scatter
                data={pool}
                fill={role === "batter" ? "#ff4d9a" : "#e4c27a"}
                onClick={(point) => {
                  const row = point as unknown as Player;
                  if (row?.key) navigate(`/reports/${row.group}/${row.role}/${row.playerId}`);
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-muted">Click a point to open the scouting report. Gold line is PPI 50.</p>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg">Raw-gap interval, highest indexes</h2>
          <p className="mt-1 text-sm text-muted">5th to 95th percentile of the match bootstrap. Units are strike-rate points or economy runs.</p>
          <ul className="mt-4 space-y-3">
            {intervals.map((player) => (
              <IntervalRow key={player.key} player={player} />
            ))}
          </ul>
        </Card>
        <Card>
          <label className="text-sm text-muted" htmlFor="phase-player">
            Phase, opponent, and chase context
            <select
              id="phase-player"
              className="mt-1 w-full rounded-xl border border-line bg-navy/60 px-3 py-2 text-ink"
              value={selected?.key ?? ""}
              onChange={(event) => setPlayerKey(event.target.value)}
            >
              {pool.map((player) => (
                <option key={player.key} value={player.key}>
                  {player.name}
                </option>
              ))}
            </select>
          </label>
          {selected ? <ContextDetail player={selected} /> : null}
        </Card>
      </div>
    </>
  );
}

function IntervalRow({ player }: { player: Player }) {
  const low = player.gapP05;
  const high = player.gapP95;
  if (low == null || high == null || high <= low) {
    return (
      <li className="text-sm text-muted">
        {player.name}: interval not stored
      </li>
    );
  }
  const span = Math.max(Math.abs(low), Math.abs(high), 1);
  const start = ((low + span) / (span * 2)) * 100;
  const width = ((high - low) / (span * 2)) * 100;
  return (
    <li>
      <div className="flex justify-between text-sm">
        <span>{player.name}</span>
        <span className="text-muted">
          {num(low, 1)} to {num(high, 1)}
        </span>
      </div>
      <div className="relative mt-1 h-2 rounded-full bg-white/10">
        <div className="absolute top-0 h-2 rounded-full bg-pink" style={{ left: `${start}%`, width: `${Math.max(width, 1)}%` }} />
        <div className="absolute top-0 h-2 w-px bg-gold" style={{ left: "50%" }} />
      </div>
    </li>
  );
}

function ContextDetail({ player }: { player: Player }) {
  const phases =
    player.role === "batter"
      ? [
          ["Powerplay", player.powerplayRate],
          ["Middle", player.middleRate],
          ["Death", player.deathRate],
        ]
      : [
          ["Pressure economy", player.pressureRate],
          ["Baseline economy", player.baselineRate],
          ["Death economy", player.deathRate],
          ["Low-total defence", player.lowTotalRate],
        ];
  return (
    <div className="mt-4 space-y-4 text-sm">
      <div>
        <p className="text-muted">{player.role === "batter" ? "Phase strike rate, all balls in that phase" : "Economy slices stored on the bowler table"}</p>
        <ul className="mt-2 space-y-2">
          {phases.map(([label, value]) => (
            <li key={String(label)} className="flex justify-between border-b border-line py-1">
              <span>{label}</span>
              <span>{value == null ? "Not on this extract" : num(Number(value), player.role === "batter" ? 0 : 2)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-muted">Opponent win rate faced</p>
        <p className="mt-1">
          Pressure {num((player.oppPressure ?? 0) * 100, 0)}% · Other balls {num((player.oppBaseline ?? 0) * 100, 0)}%
        </p>
        <p className="mt-2 text-muted">
          Collapse-only share of pressure balls {player.collapseShare == null ? "—" : `${Math.round(player.collapseShare * 100)}%`}.
          Knockout share {player.knockoutShare == null ? "—" : `${Math.round(player.knockoutShare * 100)}%`}. Mean leverage{" "}
          {num(player.leverage, 2)}. Leverage is the coarse win-probability proxy and is not a weight in the index.
        </p>
      </div>
    </div>
  );
}

function Toggle({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div className="flex rounded-full border border-line p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`rounded-full px-4 py-1.5 text-sm capitalize ${value === option ? "bg-pink text-navy" : "text-muted"}`}
          onClick={() => onChange(option)}
          aria-pressed={value === option}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
