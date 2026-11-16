import { Link } from "react-router-dom";
import { Card, PageHeader, Stat, Status } from "../components/ui";
import { useData } from "../lib/data";
import { int, num } from "../lib/format";

export function Overview() {
  const data = useData();
  if (data.status !== "ready") return null;
  const { meta, discoveries, requirements, shortlist } = data.bundle;
  return (
    <>
      <PageHeader
        eyebrow="Executive overview"
        title="Pressure, then reliability."
        lede="This desk reads the validated IPL and T20I indexes. It does not rank players by runs, average, wickets, or economy, and it does not treat the 2026 squad page as a 2027 retention list."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Analysis balls" value={int(meta.analysisBalls)} hint="Primary innings with a trusted schedule." />
        <Stat label="Pressure balls" value={int(meta.pressureBalls)} hint="Clauses A, B, or C. Death overs are not the definition." />
        <Stat
          label="Eligible IPL"
          value={`${meta.batterEligible.IPL} / ${meta.bowlerEligible.IPL}`}
          hint="Batters / bowlers clearing the sample floor."
        />
        <Stat
          label="2027 retentions"
          value={meta.directoryIs2027Retention ? "Published" : "None"}
          hint={`${meta.directorySize} players on the 2026 directory.`}
        />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="display text-2xl">Top five</h2>
          <Link className="text-sm text-gold hover:text-pink" to="/war-room">
            Open the war room
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {shortlist.map((player) => (
            <Card key={player.priority}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.16em] text-gold">Priority {player.priority}</p>
                <Status tone="warn">{player.status?.replaceAll("_", " ")}</Status>
              </div>
              <h3 className="display mt-2 text-3xl">
                <Link className="hover:text-pink" to={`/reports/IPL/${player.role}/${player.playerId}`}>
                  {player.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-muted">{player.verifiedRole}</p>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-muted">PPI</dt>
                  <dd className="text-lg">{num(player.ppi, 1)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Reliability</dt>
                  <dd className="text-lg">{num(player.reliability, 1)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Pressure balls</dt>
                  <dd className="text-lg">{int(player.pressureBalls)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm leading-relaxed text-muted">{player.reason}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="display mb-3 text-2xl">Discoveries</h2>
          <div className="grid gap-3">
            {discoveries.map((item) => (
              <Card key={item.title}>
                <h3 className="text-lg">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h2 className="display mb-3 text-2xl">Squad requirements</h2>
          <div className="grid gap-3">
            {requirements.map((item) => (
              <Card key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg">{item.title}</h3>
                  <Status tone={item.status === "gap" ? "gap" : item.status === "covered" ? "good" : "warn"}>
                    {item.status}
                  </Status>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Card className="mt-8">
        <h2 className="display text-2xl">Coverage</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Clause A, a hard chase with three wickets down, covers {int(meta.clauseA)} balls. Clause B, a late chase,
          covers {int(meta.clauseB)}. Clause C, seven wickets down in the last five overs, covers {int(meta.clauseC)}.
          The death-over slice is {int(meta.deathSlice)} balls and is not the pressure flag. Eligible T20I rows are{" "}
          {meta.batterEligible.T20I} batters and {meta.bowlerEligible.T20I} bowlers. {meta.allRounders} players clear
          both floors in one format.
        </p>
      </Card>
    </>
  );
}
