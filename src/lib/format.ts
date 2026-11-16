import type { Player } from "../types";

export function num(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function int(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return Math.round(value).toLocaleString("en-US");
}

export function pct(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value * 100)}%`;
}

export function segmentLabel(value: string | null): string {
  if (!value) return "Unclassified";
  return value.replaceAll("_", " ");
}

export function rateName(player: Player): string {
  return player.role === "batter" ? "Strike rate" : "Economy";
}

export function identityLabel(value: string | null): string {
  if (!value || value === "nationality_not_in_sources") return "Nationality not in the project sources";
  return value.replaceAll("_", " ");
}
