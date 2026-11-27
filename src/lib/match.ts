import type { Candidate, Readiness, Role } from "./data";

export interface MatchResult { score: number; overlap: string[]; missing: string[]; reasons: string[] }

const READINESS_POINTS: Record<Readiness, number> = { "Job-ready": 20, "Nearly ready": 12, "Building skills": 5 };
const norm = (s: string) => s.trim().toLowerCase();

/** Skills 60 pts (share of required skills held), readiness up to 20, availability 20/10/0. */
export function matchScore(c: Candidate, r: Role): MatchResult {
  const have = new Set(c.skills.map(norm));
  const overlap = r.skills.filter((s) => have.has(norm(s)));
  const missing = r.skills.filter((s) => !have.has(norm(s)));
  const skillPts = r.skills.length ? Math.round((overlap.length / r.skills.length) * 60) : 60;
  const readyPts = READINESS_POINTS[c.readiness];
  let availPts = 0;
  let availReason = "Location mismatch and role is on-site";
  if (c.county === r.county) { availPts = 20; availReason = `Based in ${r.county}`; }
  else if (r.remote && c.remote) { availPts = 20; availReason = "Remote-ready for a remote role"; }
  else if (r.remote) { availPts = 10; availReason = "Role is remote; candidate prefers local"; }
  const reasons = [
    `${overlap.length}/${r.skills.length} required skills${overlap.length ? `: ${overlap.join(", ")}` : ""}`,
    `${c.readiness} (+${readyPts})`,
    availReason,
  ];
  if (c.endorsements.length) reasons.push(`Mentor-endorsed ×${c.endorsements.length}`);
  return { score: Math.min(100, skillPts + readyPts + availPts), overlap, missing, reasons };
}
