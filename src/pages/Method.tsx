import { Card, PageHeader } from "../components/ui";
import { useData } from "../lib/data";
import { num, pct } from "../lib/format";

export function Method() {
  const data = useData();
  if (data.status !== "ready") return null;
  const { meta, sensitivity, sources } = data.bundle;
  return (
    <>
      <PageHeader
        eyebrow="Methodology and sources"
        title="What the number is allowed to mean."
        lede="Formulas below are the Stage 3 definitions. Every count on this page is read from the exported validation files. A full write-up lives in the project docs."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg">Dataset</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Ball-by-ball, matches, playing elevens, squad mappings, competitions and teams were delivered with the pack.
            Stage 2 cleaned them without editing the raw files. The analysis set is {meta.analysisBalls.toLocaleString("en-US")}{" "}
            trusted primary balls, of which {meta.pressureBalls.toLocaleString("en-US")} are pressure balls. Emerging-team
            matches stay off the headline boards.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg">Pressure</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
            <li>Clause A: innings 2, at least 12 balls left, required rate at least 10, at least 3 wickets down.</li>
            <li>Clause B: innings 2, fewer than 24 balls left, required rate at least 8, runs still needed.</li>
            <li>Clause C: last five scheduled overs and at least 7 wickets down.</li>
            <li>Death overs, a low total and the final margin are not the flag. State is taken at the start of the ball.</li>
          </ul>
        </Card>
        <Card>
          <h2 className="text-lg">Pressure Performance Index</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Expected runs come from format, phase, bowling or batting type and the opponent win-rate band. The raw gap is
            how far the player beat that expectation under pressure, minus the same residual in their other balls. Bowling
            gaps flip the sign, so fewer runs conceded is positive. The gap shrinks toward zero. PPI = 50 + 50 × tanh(shrunk
            gap / scale). Batting scale is {meta.constants.bat_scale} strike-rate points. Bowling scale is{" "}
            {meta.constants.bowl_scale} economy run. The floor is {meta.constants.pressure_floor} pressure balls and{" "}
            {meta.constants.baseline_floor} baseline balls.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg">Reliability</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            A separate 0–100 score: 30% sample size, 25% bootstrap uncertainty, 20% season signs, 15% match-to-match spread,
            10% share of pressure balls in 2025–26. The interval is {meta.constants.boot_draws} resamples of the player’s
            matches. It describes the raw gap, not the shrunk gap. Standard deviation alone is not the reliability measure.
          </p>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-lg">What the checks did</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Batting 2026 sign agreement {pct(meta.holdout.batter.sign_agreement)} with rank correlation{" "}
          {num(meta.holdout.batter.spearman, 2)} on {meta.holdout.batter.players} players. Bowling sign agreement{" "}
          {pct(meta.holdout.bowler.sign_agreement)} with rank correlation {num(meta.holdout.bowler.spearman, 2)} on{" "}
          {meta.holdout.bowler.players} bowlers. Chase-only batting kept {meta.chaseOnly.batter.shared_top10} of the top 10.
          These are stability checks, not a forecast accuracy.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="py-2">Board</th>
                <th>Eligible</th>
                <th>Vs career rate</th>
                <th>Strict segment</th>
              </tr>
            </thead>
            <tbody>
              {sensitivity.map((row) => (
                <tr key={`${row.role}-${row.competition_group}`} className="border-t border-line">
                  <td className="py-2">
                    {row.competition_group} {row.role}
                  </td>
                  <td>{row.eligible}</td>
                  <td>{num(Number(row.spearman_vs_headline_rate), 2)}</td>
                  <td>{row.high_reliability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="text-lg">Limits</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>Nationality is not on the ball file. The boards are not a domestic shortlist.</li>
          <li>No SMAT or other domestic deliveries were added.</li>
          <li>The win-probability bins are an in-sample proxy. They are not inside the index.</li>
          <li>There is no 2027 retention list, purse balance, or auction price in the sources used here.</li>
          <li>Powerplay and middle economy were not stored on the bowler index. Those phase rates are not invented on this screen.</li>
          <li>A player’s standard deviation is one reliability input, through the match-spread component and not the whole score.</li>
        </ul>
      </Card>

      <h2 className="display mt-8 mb-3 text-2xl">Sources</h2>
      <div className="grid gap-3">
        {sources.map((source) => (
          <Card key={source.id ?? source.url ?? source.statement}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.14em] text-gold">{source.evidence}</p>
              <p className="text-xs text-muted">
                {source.publisher} · published {source.published || "undated"} · accessed {source.accessed}
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{source.statement}</p>
            {source.url ? (
              <a className="mt-2 inline-block text-sm text-pink underline-offset-4 hover:underline" href={source.url}>
                {source.url}
              </a>
            ) : null}
          </Card>
        ))}
      </div>
    </>
  );
}
