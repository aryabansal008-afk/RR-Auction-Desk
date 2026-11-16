import { Link, useParams } from "react-router-dom";
import { Card, Empty, PageHeader, Status } from "../components/ui";
import { useData } from "../lib/data";
import { identityLabel, int, num, pct, rateName, segmentLabel } from "../lib/format";
import { readings } from "../lib/reading";
import type { Player } from "../types";

export function ReportIndex() {
  const data = useData();
  if (data.status !== "ready") return null;
  const featured = data.bundle.players.filter((player) => player.auction);
  return (
    <>
      <PageHeader
        eyebrow="Scouting reports"
        title="A verdict only where Stage 4 wrote one."
        lede="Shortlist and watchlist notes are attached to the player row. Every other report is the statistical record, with an explicit line that no auction verdict was written."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {featured.map((player) => (
          <Card key={player.key}>
            <p className="text-xs uppercase tracking-[0.16em] text-gold">{player.auction?.kind}</p>
            <h2 className="display mt-1 text-2xl">
              <Link to={`/reports/${player.group}/${player.role}/${player.playerId}`}>{player.name}</Link>
            </h2>
            <p className="mt-2 text-sm text-muted">{player.auction?.reason}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

export function Report() {
  const data = useData();
  const params = useParams();
  if (data.status !== "ready") return null;
  const key = `${params.group}|${params.role}|${params.id}`;
  const player = data.byKey.get(key);
  if (!player) {
    return <Empty title="No report for that key" body="The id is not in the exported player tables. Go back to the explorer." />;
  }
  const notes = readings(player);
  const auction = player.auction;
  return (
    <>
      <PageHeader
        eyebrow={`${player.group} · ${player.role}`}
        title={player.name}
        lede={auction?.verifiedRole ?? `${segmentLabel(player.segment)}. ${rateName(player)} comparison is against this player's own other balls.`}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Status tone={player.eligible ? "good" : "warn"}>{player.eligible ? "Eligible" : "Below the floor"}</Status>
        <Status>{segmentLabel(player.segment)}</Status>
        {auction ? <Status tone="warn">{auction.status?.replaceAll("_", " ")}</Status> : <Status>No auction verdict</Status>}
        {player.onDirectory ? <Status tone="good">2026 directory</Status> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Pressure index" value={num(player.ppi, 1)} />
        <Metric label="Reliability" value={num(player.reliability, 1)} />
        <Metric label="Rank" value={player.rank == null ? "Unranked" : String(player.rank)} />
        <Metric label="Pressure balls" value={int(player.pressureBalls)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg">Verified record</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Identity" value={identityLabel(player.identity)} />
            <Row label="Country on the squad page" value={player.country ?? "Not stated"} />
            <Row label="Directory role" value={player.squadRole ?? "Not on the 2026 directory"} />
            <Row label="2026 side in this pack" value={auction?.observedTeam ?? "Not attached"} />
            <Row label="Nationality note" value={auction?.nationality?.replaceAll("_", " ") ?? "Not assessed in Stage 4"} />
            <Row label="Auction price" value={auction?.price?.replaceAll("_", " ") ?? "Not estimated"} />
            <Row label="Domestic balls" value={auction?.domesticBalls?.replaceAll("_", " ") ?? "Not in the pack"} />
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg">Pressure evidence</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label={`Pressure ${rateName(player).toLowerCase()}`} value={num(player.pressureRate, player.role === "batter" ? 0 : 2)} />
            <Row label={`Baseline ${rateName(player).toLowerCase()}`} value={num(player.baselineRate, player.role === "batter" ? 0 : 2)} />
            <Row label="Shrunk gap" value={num(player.shrunkGap, 2)} />
            <Row label="Raw gap interval" value={`${num(player.gapP05, 1)} to ${num(player.gapP95, 1)}`} />
            <Row label="Baseline balls" value={int(player.baselineBalls)} />
            <Row label="Innings / pressure matches" value={`${int(player.innings)} / ${int(player.pressureMatches)}`} />
            {player.role === "batter" ? <Row label="Mean entry, wickets down" value={num(player.entryWickets, 2)} /> : null}
            {player.role === "bowler" ? <Row label="Death economy / balls" value={`${num(player.deathRate, 2)} / ${int(player.deathBalls)}`} /> : null}
            {auction?.chaseRank != null ? <Row label="Chase-only rank" value={`${auction.chaseRank} on ${int(auction.chaseBalls)} balls`} /> : null}
            {auction?.t20iGap != null ? (
              <Row label="T20I shrunk gap" value={`${num(auction.t20iGap, 2)} on ${int(auction.t20iBalls)} balls`} />
            ) : null}
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg">Reliability</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Consistency component" value={num(player.consistency, 2)} />
            <Row label="Uncertainty component" value={num(player.uncertainty, 2)} />
            <Row label="Favourable seasons" value={`${player.seasonsFavorable ?? "—"} of ${player.seasonsQualified ?? "—"}`} />
            <Row label="Pressure balls in 2025–26" value={pct(player.recentShare)} />
            <Row label="First year in sample" value={player.firstYear == null ? "—" : String(player.firstYear)} />
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Reliability is not the standard deviation. It mixes sample size, the bootstrap error, season signs, match spread, and recency.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg">Strengths and limits</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            {notes.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
            {notes.limits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      </div>
      <Card className="mt-4">
        <h2 className="text-lg">Royals fit and verdict</h2>
        <p className="mt-3 text-sm leading-relaxed">{auction?.fit ?? directoryFit(player)}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {auction?.reason ?? "Stage 4 did not write an auction verdict for this row. The segment above is the statistical label only."}
        </p>
      </Card>
    </>
  );
}

function directoryFit(player: Player): string {
  if (player.onDirectory) {
    return "This player is on the fetched 2026 squad directory. That page is not a 2027 retention list.";
  }
  return "This player is not on the 2026 directory and was not given a Stage 4 role fit.";
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="display mt-2 text-3xl">{value}</p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-1">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
