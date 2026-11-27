import { describe, expect, it } from "vitest";
import { matchScore } from "@/lib/match";
import type { Candidate, Role } from "@/lib/data";

const cand = (o: Partial<Candidate>): Candidate => ({ id: "x", name: "X", origin: "", county: "Turkana", remote: false, languages: [], skills: [], links: [], sector: "Software", readiness: "Job-ready", bio: "", endorsements: [], ...o });
const role = (o: Partial<Role>): Role => ({ id: "r", title: "", company: "", county: "Turkana", remote: false, skills: ["A", "B"], kind: "Paid trial", weeks: 2, stipend: "", description: "", converts: "", ...o });

describe("matchScore", () => {
  it("full skills, job-ready, same county = 100", () => {
    expect(matchScore(cand({ skills: ["a", "B"] }), role({})).score).toBe(100);
  });
  it("half skills, building skills, on-site elsewhere = 35", () => {
    expect(matchScore(cand({ skills: ["A"], readiness: "Building skills", county: "Garissa" }), role({})).score).toBe(35);
  });
  it("remote role, local-only candidate gets half availability", () => {
    expect(matchScore(cand({ skills: ["A", "B"], county: "Garissa", readiness: "Nearly ready" }), role({ remote: true })).score).toBe(82);
  });
});
