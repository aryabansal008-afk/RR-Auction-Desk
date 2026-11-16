export type Role = "batter" | "bowler";
export type Group = "IPL" | "T20I";

export interface AuctionNote {
  kind: "shortlist" | "watchlist";
  priority: number | null;
  stable: boolean;
  status: string | null;
  verifiedRole: string | null;
  roleNeed: string | null;
  fit: string | null;
  reason: string | null;
  observedTeam: string | null;
  nationality: string | null;
  price: string | null;
  domesticBalls: string | null;
  chaseRank: number | null;
  chaseBalls: number | null;
  t20iGap: number | null;
  t20iBalls: number | null;
  t20iSegment: string | null;
}

export interface Player {
  key: string;
  playerId: number;
  name: string;
  role: Role;
  group: Group;
  ppi: number | null;
  reliability: number | null;
  rank: number | null;
  eligible: boolean;
  segment: string | null;
  pressureBalls: number | null;
  baselineBalls: number | null;
  innings: number | null;
  pressureMatches: number | null;
  pressureRate: number | null;
  baselineRate: number | null;
  careerRate: number | null;
  powerplayRate: number | null;
  middleRate: number | null;
  deathRate: number | null;
  dotPct: number | null;
  boundaryPct: number | null;
  dismissalGap: number | null;
  wicketRate: number | null;
  baselineWicketRate: number | null;
  shrunkGap: number | null;
  rawGap: number | null;
  gapP05: number | null;
  gapP95: number | null;
  seasonsQualified: number | null;
  seasonsFavorable: number | null;
  recentShare: number | null;
  firstYear: number | null;
  collapseShare: number | null;
  knockoutShare: number | null;
  oppPressure: number | null;
  oppBaseline: number | null;
  leverage: number | null;
  consistency: number | null;
  uncertainty: number | null;
  entryWickets: number | null;
  deathBalls: number | null;
  lowTotalRate: number | null;
  lowTotalBalls: number | null;
  identity: string | null;
  onDirectory: boolean;
  country: string | null;
  squadRole: string | null;
  paceOrSpin: string | null;
  auction: AuctionNote | null;
}

export interface ShortPlayer {
  priority: number;
  playerId: number;
  name: string;
  role: Role;
  group: Group;
  verifiedRole: string | null;
  roleNeed: string | null;
  fit: string | null;
  reason: string | null;
  status: string | null;
  stable: boolean;
  ppi: number | null;
  reliability: number | null;
  pressureBalls: number | null;
  gapP05: number | null;
  gapP95: number | null;
  team: string | null;
  nationality: string | null;
  price: string | null;
}

export interface Bundle {
  meta: {
    analysisBalls: number;
    pressureBalls: number;
    primaryDeliveries: number;
    clauseA: number;
    clauseB: number;
    clauseC: number;
    deathSlice: number;
    batterEligible: { IPL: number; T20I: number };
    bowlerEligible: { IPL: number; T20I: number };
    allRounders: number;
    holdout: {
      batter: { players: number; spearman: number; sign_agreement: number };
      bowler: { players: number; spearman: number; sign_agreement: number };
    };
    chaseOnly: {
      batter: { spearman: number; shared_top10: number };
      bowler: { spearman: number; shared_top10: number };
    };
    constants: {
      bat_scale: number;
      bowl_scale: number;
      pressure_floor: number;
      baseline_floor: number;
      boot_draws: number;
      low_total_rpo: number;
    };
    playerRows: number;
    directorySize: number;
    directoryIs2027Retention: boolean;
  };
  discoveries: { title: string; body: string }[];
  requirements: { id: string; title: string; status: string; detail: string }[];
  sensitivity: Record<string, string | number | null>[];
  prioritySensitivity: { order_rule: string; batting_order: string }[];
  shortlist: ShortPlayer[];
  watchlist: { playerId: number; name: string; reason: string | null; note: string | null; team: string | null }[];
  scenarios: {
    scenario: string;
    condition: string;
    first_action: string;
    second_action: string;
    not_doing: string;
  }[];
  squad: {
    playerId: number;
    name: string;
    squadRole: string | null;
    country: string;
    retention2026: string;
    is2027Retention: boolean;
    medianOrder: number | null;
    rrMatches: number | null;
    batPpi: number | null;
    batSegment: string | null;
    batPressureBalls: number | null;
    bowlPpi: number | null;
    bowlSegment: string | null;
    bowlPressureBalls: number | null;
    paceOrSpin: string | null;
  }[];
  sources: {
    id: string | null;
    evidence: string | null;
    statement: string | null;
    url: string | null;
    publisher: string | null;
    published: string | null;
    accessed: string | null;
  }[];
  players: Player[];
}
