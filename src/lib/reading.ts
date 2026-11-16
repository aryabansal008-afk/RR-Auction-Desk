import type { Player } from "../types";
import { num } from "./format";

export function readings(player: Player): { strengths: string[]; limits: string[] } {
  const strengths: string[] = [];
  const limits: string[] = [];
  const floor = 60;

  if (player.eligible && player.gapP05 != null && player.gapP05 > 0) {
    strengths.push("The match-bootstrap 5th percentile of the raw gap is above zero.");
  }
  if ((player.seasonsFavorable ?? 0) >= 2 && (player.seasonsQualified ?? 0) >= 2) {
    strengths.push(
      `${player.seasonsFavorable} of ${player.seasonsQualified} seasons with at least 12 pressure balls have a positive gap.`,
    );
  }
  if (player.role === "batter" && (player.dismissalGap ?? 0) > 0) {
    strengths.push("Dismissal rate is lower under pressure than in the other balls.");
  }
  if (player.role === "bowler" && player.wicketRate != null && player.baselineWicketRate != null && player.wicketRate > player.baselineWicketRate) {
    strengths.push("Wickets per 100 balls are higher under pressure than in the other balls.");
  }

  if (!player.eligible) {
    limits.push(
      `Below the decision floor of ${floor} pressure balls, ${floor} baseline balls, and the innings minimum.`,
    );
  }
  if (player.gapP05 != null && player.gapP05 <= 0) {
    limits.push("The bootstrap interval reaches zero or below. The sign is not stable inside this sample.");
  }
  if (player.gapP05 == null && (player.pressureBalls ?? 0) > 0) {
    limits.push("No bootstrap interval was stored for this row.");
  }
  if ((player.pressureBalls ?? 0) > 0 && (player.pressureBalls ?? 0) < floor) {
    limits.push(`${player.pressureBalls} pressure balls. The point estimate is thin.`);
  }
  if (player.role === "batter" && player.dismissalGap != null && player.dismissalGap < -2) {
    limits.push("Dismissal rate rises by more than 2 per 100 balls under pressure.");
  }
  if (player.role === "batter" && (player.collapseShare ?? 0) >= 0.2) {
    limits.push(`${Math.round((player.collapseShare ?? 0) * 100)}% of pressure balls are the collapse clause only.`);
  }
  if ((player.seasonsQualified ?? 0) < 2 && player.eligible) {
    limits.push("Fewer than two seasons clear the 12-ball season bar.");
  }
  if ((player.recentShare ?? 0) < 0.15 && (player.pressureBalls ?? 0) >= floor) {
    limits.push("Little of the pressure sample is from 2025 or 2026.");
  }
  if (strengths.length === 0) {
    strengths.push("No strict-rule strength is attached to this row.");
  }
  if (limits.length === 0) {
    limits.push(`Interval width runs from ${num(player.gapP05, 1)} to ${num(player.gapP95, 1)}. The size of the gap is still uncertain.`);
  }
  return { strengths, limits };
}
