import { Link } from "react-router-dom";
import { Card, PageHeader, Status } from "../components/ui";
import { useData } from "../lib/data";
import { int, num, segmentLabel } from "../lib/format";

export function WarRoom() {
  const data = useData();
  if (data.status !== "ready") return null;
  const { requirements, shortlist, watchlist, scenarios, squad, prioritySensitivity } = data.bundle;
  return (
    <>
      <PageHeader
        eyebrow="Auction war room"
        title="Buy the hole, not the rank."
        lede="Targets stay conditional. No 2027 purse, price, or auction register is in the sources. Priority 3 to 5 move when the sort key changes. Priority 1 and 2 do not."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {requirements.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg">{item.title}</h2>
              <Status tone={item.status === "gap" ? "gap" : item.status === "covered" ? "good" : "warn"}>{item.status}</Status>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
          </Card>
        ))}
      </div>

      <h2 className="display mt-8 mb-3 text-2xl">Priority tiers</h2>
      <div className="grid gap-4">
        {shortlist.map((player) => (
          <Card key={player.priority}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gold">
                  Tier {player.priority} · {player.stable ? "Order holds under the sensitivity sorts" : "Order inside this tier is unstable"}
                </p>
                <h3 className="display mt-1 text-3xl">
                  <Link to={`/reports/IPL/${player.role}/${player.playerId}`}>{player.name}</Link>
                </h3>
              </div>
              <Status tone="warn">Conditional target</Status>
            </div>
            <p className="mt-3 text-sm text-muted">{player.fit}</p>
            <p className="mt-2 text-sm leading-relaxed">{player.reason}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div>
                <dt className="text-muted">PPI</dt>
                <dd>{num(player.ppi, 1)}</dd>
              </div>
              <div>
                <dt className="text-muted">Reliability</dt>
                <dd>{num(player.reliability, 1)}</dd>
              </div>
              <div>
                <dt className="text-muted">Pressure balls</dt>
                <dd>{int(player.pressureBalls)}</dd>
              </div>
              <div>
                <dt className="text-muted">2026 appearance</dt>
                <dd>{player.team ?? "Not in the 2026 IPL rows"}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted">
              Nationality: {player.nationality?.replaceAll("_", " ")}. Price: {player.price?.replaceAll("_", " ")}.
            </p>
          </Card>
        ))}
      </div>

      <h2 className="display mt-8 mb-3 text-2xl">Scenarios</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {scenarios.map((scenario) => (
          <Card key={scenario.scenario}>
            <h3 className="text-lg capitalize">{scenario.scenario.replaceAll("_", " ")}</h3>
            <p className="mt-2 text-sm text-muted">{scenario.condition}</p>
            <p className="mt-3 text-sm">{scenario.first_action}</p>
            <p className="mt-2 text-sm">{scenario.second_action}</p>
            <p className="mt-3 text-sm text-gold">{scenario.not_doing}</p>
          </Card>
        ))}
      </div>

      <h2 className="display mt-8 mb-3 text-2xl">How the batting order moves</h2>
      <Card>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="py-2">Sort</th>
              <th>Batting order among the shortlist</th>
            </tr>
          </thead>
          <tbody>
            {prioritySensitivity.map((row) => (
              <tr key={row.order_rule} className="border-t border-line">
                <td className="py-2 pr-3">{row.order_rule.replaceAll("_", " ")}</td>
                <td>{row.batting_order}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <h2 className="display mt-8 mb-3 text-2xl">Watchlist, not bids</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {watchlist.map((player) => (
          <Card key={player.playerId}>
            <h3 className="text-lg">{player.name}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-pink">{player.reason?.replaceAll("_", " ")}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{player.note}</p>
            <p className="mt-2 text-xs text-muted">{player.team ?? "No 2026 IPL appearance in this pack"}</p>
          </Card>
        ))}
      </div>

      <h2 className="display mt-8 mb-3 text-2xl">2026 directory</h2>
      <p className="mb-3 text-sm text-muted">Confirmed squad page. Every is-2027-retention flag in the file is false.</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="py-2">Player</th>
              <th>Page role</th>
              <th>Label</th>
              <th>Order</th>
              <th>Batting</th>
              <th>Bowling</th>
            </tr>
          </thead>
          <tbody>
            {squad.map((player) => (
              <tr key={player.playerId} className="border-t border-line">
                <td className="py-2">{player.name}</td>
                <td>{player.squadRole}</td>
                <td>{player.country || player.retention2026 || "Unlabelled"}</td>
                <td>{player.medianOrder ?? "—"}</td>
                <td>
                  {num(player.batPpi, 1)} <span className="text-muted">{segmentLabel(player.batSegment)}</span>
                </td>
                <td>
                  {num(player.bowlPpi, 1)} <span className="text-muted">{segmentLabel(player.bowlSegment)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
