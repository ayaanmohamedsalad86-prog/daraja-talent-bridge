import { createFileRoute } from "@tanstack/react-router";
import { Handshake, Users, Briefcase, TrendingUp, MapPin, Award } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PIPELINE, SECTORS } from "@/lib/data";
import { matchScore } from "@/lib/match";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact dashboard — Daraja Talent" },
      { name: "description", content: "Live SDG 8, 10 and 17 metrics: mentor pairs, warm referrals, paid trials and trial-to-hire conversion." },
      { property: "og:title", content: "Impact dashboard — Daraja Talent" },
      { property: "og:description", content: "Live impact metrics for refugee talent inclusion in Kenya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImpactPage,
});

function Bar({ label, value, max, suffix = "" }: { label: string; value: number; max: number; suffix?: string }) {
  return (
    <div><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="font-medium">{value}{suffix}</span></div>
      <div className="h-2.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${max ? (value / max) * 100 : 0}%` }} /></div></div>
  );
}

function ImpactPage() {
  const { state } = useStore();
  const { candidates, fellowships, referrals, applications, roles, mentors } = state;
  const activePairs = fellowships.filter((f) => f.milestones.some((m) => !m.done)).length;
  const trialRoleIds = new Set(roles.filter((r) => r.kind === "Paid trial").map((r) => r.id));
  const reached = (s: string) => { const i = PIPELINE.indexOf(s as (typeof PIPELINE)[number]); return i >= 1; };
  const trialsStarted = applications.filter((a) => trialRoleIds.has(a.roleId) && reached(a.status)).length;
  const trialHires = applications.filter((a) => trialRoleIds.has(a.roleId) && a.status === "Hired").length;
  const hires = applications.filter((a) => a.status === "Hired").length;
  const conversion = trialsStarted ? Math.round((trialHires / trialsStarted) * 100) : 0;
  const endorsedFellows = fellowships.filter((f) => f.endorsed).length;
  const counties = new Set(candidates.map((c) => c.county));
  const languages = new Set(candidates.flatMap((c) => c.languages));
  const avgCompletion = fellowships.length ? Math.round((fellowships.reduce((s, f) => s + f.milestones.filter((m) => m.done).length / f.weeks, 0) / fellowships.length) * 100) : 0;
  const bestMatches = candidates.map((c) => Math.max(0, ...roles.map((r) => matchScore(c, r).score)));
  const avgBest = bestMatches.length ? Math.round(bestMatches.reduce((a, b) => a + b, 0) / bestMatches.length) : 0;
  const ratio = mentors.length ? (fellowships.length / mentors.length).toFixed(1) : "0";
  const funnel = PIPELINE.map((p, i) => ({ p, n: applications.filter((a) => { const j = PIPELINE.indexOf(a.status as (typeof PIPELINE)[number]); return j >= i; }).length }));

  const kpis = [
    { icon: Users, label: "Active mentor–fellow pairs", value: activePairs, sdg: "SDG 17" },
    { icon: Handshake, label: "Warm referrals made", value: referrals.length, sdg: "SDG 17" },
    { icon: Briefcase, label: "Paid trials started", value: trialsStarted, sdg: "SDG 8" },
    { icon: TrendingUp, label: "Trial-to-hire conversion", value: `${conversion}%`, sdg: "SDG 8" },
    { icon: Award, label: "Mentor-endorsed fellows", value: endorsedFellows, sdg: "SDG 10" },
    { icon: MapPin, label: "Counties reached", value: counties.size, sdg: "SDG 10" },
  ];

  return (
    <>
      <PageHeader eyebrow="Evaluator view · Live metrics" title="Impact & scalability" desc="Every number is computed live from the actions taken in the Talent, Mentor and Employer views." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.label}><CardContent className="p-4">
            <div className="flex items-center justify-between"><k.icon className="h-5 w-5 text-primary" /><span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">{k.sdg}</span></div>
            <p className="mt-3 font-display text-3xl font-bold">{k.value}</p><p className="text-xs text-muted-foreground">{k.label}</p>
          </CardContent></Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-base">Returnship funnel</CardTitle></CardHeader>
          <CardContent className="space-y-3">{funnel.map((f) => <Bar key={f.p} label={f.p} value={f.n} max={funnel[0]?.n ?? 0} />)}<p className="text-xs text-muted-foreground">{hires} total hires across all roles</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Talent by sector</CardTitle></CardHeader>
          <CardContent className="space-y-3">{SECTORS.map((s) => <Bar key={s} label={s} value={candidates.filter((c) => c.sector === s).length} max={candidates.length} />)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Cohort scalability</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Bar label="Avg fellowship completion" value={avgCompletion} max={100} suffix="%" />
            <Bar label="Avg best-match score" value={avgBest} max={100} suffix="%" />
            <dl className="grid grid-cols-2 gap-3 pt-2 text-sm">
              <div><dt className="text-xs text-muted-foreground">Talent profiles</dt><dd className="text-lg font-semibold">{candidates.length}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Fellows per mentor</dt><dd className="text-lg font-semibold">{ratio}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Languages spoken</dt><dd className="text-lg font-semibold">{languages.size}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Open roles & trials</dt><dd className="text-lg font-semibold">{roles.length}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Turkana talent</dt><dd className="text-lg font-semibold">{candidates.filter((c) => c.county === "Turkana").length}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Garissa talent</dt><dd className="text-lg font-semibold">{candidates.filter((c) => c.county === "Garissa").length}</dd></div>
            </dl>
          </CardContent></Card>
      </div>
    </>
  );
}
