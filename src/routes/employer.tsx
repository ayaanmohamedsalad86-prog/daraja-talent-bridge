import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Award, Briefcase, ChevronRight, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Avatar, ScoreRing, StatusBadge } from "@/components/bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { COUNTIES, PIPELINE, SECTORS, type Application, type Feedback, type Role } from "@/lib/data";
import { matchScore } from "@/lib/match";
import { today, uid, useStore } from "@/lib/store";

export const Route = createFileRoute("/employer")({
  head: () => ({
    meta: [
      { title: "Hiring partner — Daraja Talent" },
      { name: "description", content: "Post paid trials, see skills-first match scores and convert returnships into offers." },
      { property: "og:title", content: "Hiring partner — Daraja Talent" },
      { property: "og:description", content: "Skills-first hiring and paid returnships with skilled refugees." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmployerPage,
});

const blankRole = { title: "", county: "Nairobi", remote: true, skills: "", kind: "Paid trial" as Role["kind"], weeks: "3", stipend: "", description: "", converts: "Full-time" };

function EmployerPage() {
  const { state, update } = useStore();
  const companies = [...new Set(state.roles.map((r) => r.company))];
  const [company, setCompany] = useState(companies[0] ?? "");
  const myRoles = state.roles.filter((r) => r.company === company);
  const [roleId, setRoleId] = useState(myRoles[0]?.id ?? "");
  const role = myRoles.find((r) => r.id === roleId) ?? myRoles[0];
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("all");
  const [county, setCounty] = useState("all");
  const [minScore, setMinScore] = useState("0");
  const [draft, setDraft] = useState(blankRole);
  const [fbApp, setFbApp] = useState<Application | null>(null);
  const [fb, setFb] = useState<Feedback>({ rating: 4, text: "", decision: "Offer full-time" });

  const ranked = useMemo(() => {
    if (!role) return [];
    return state.candidates
      .filter((c) => (sector === "all" || c.sector === sector) && (county === "all" || c.county === county))
      .filter((c) => `${c.name} ${c.skills.join(" ")} ${c.languages.join(" ")}`.toLowerCase().includes(q.toLowerCase()))
      .map((c) => ({ c, m: matchScore(c, role) }))
      .filter((x) => x.m.score >= Number(minScore))
      .sort((a, b) => b.m.score - a.m.score);
  }, [state.candidates, role, q, sector, county, minScore]);

  const apps = state.applications.filter((a) => myRoles.some((r) => r.id === a.roleId));
  const refs = state.referrals.filter((r) => myRoles.some((x) => x.id === r.roleId));

  const setStatus = (id: string, status: Application["status"]) => update((s) => ({ ...s, applications: s.applications.map((a) => (a.id === id ? { ...a, status } : a)) }));
  const advance = (a: Application) => {
    const i = PIPELINE.indexOf(a.status as (typeof PIPELINE)[number]);
    const next = PIPELINE[i + 1];
    if (next === "Hired") { setFbApp(a); return; }
    if (next) { setStatus(a.id, next); toast.success(`Moved to ${next}`); }
  };
  const invite = (candidateId: string) => {
    if (!role) return;
    if (state.applications.some((a) => a.candidateId === candidateId && a.roleId === role.id)) { toast.info("Already in your pipeline"); return; }
    update((s) => ({ ...s, applications: [...s.applications, { id: uid("a"), candidateId, roleId: role.id, status: "Applied", note: "Invited by employer", date: today() }] }));
    toast.success("Added to pipeline");
  };
  const respondRef = (id: string, accept: boolean) => {
    update((s) => {
      const r = s.referrals.find((x) => x.id === id);
      let applications = s.applications;
      if (accept && r) {
        const existing = applications.find((a) => a.candidateId === r.candidateId && a.roleId === r.roleId);
        applications = existing
          ? applications.map((a) => (a === existing && a.status === "Applied" ? { ...a, status: "Endorsed" } : a))
          : [...applications, { id: uid("a"), candidateId: r.candidateId, roleId: r.roleId, status: "Endorsed", note: "Warm referral", date: today() }];
      }
      return { ...s, applications, referrals: s.referrals.map((x) => (x.id === id ? { ...x, status: accept ? "Accepted" : "Declined" } : x)) };
    });
    toast.success(accept ? "Referral accepted — candidate added as Endorsed" : "Referral declined");
  };
  const submitFeedback = () => {
    if (!fbApp) return;
    const hired = fb.decision === "Offer full-time" || fb.decision === "Offer contract";
    const status: Application["status"] = hired ? "Hired" : fb.decision === "Not selected" ? "Not selected" : fbApp.status;
    update((s) => ({ ...s, applications: s.applications.map((a) => (a.id === fbApp.id ? { ...a, status, feedback: fb } : a)) }));
    toast.success(hired ? "Offer sent — trial converted!" : "Feedback saved");
    setFbApp(null); setFb({ rating: 4, text: "", decision: "Offer full-time" });
  };
  const postRole = () => {
    const skills = draft.skills.split(",").map((s) => s.trim()).filter(Boolean);
    if (!draft.title.trim() || skills.length === 0) { toast.error("Add a title and at least one skill"); return; }
    const r: Role = { id: uid("r"), title: draft.title.trim(), company, county: draft.county, remote: draft.remote, skills, kind: draft.kind, weeks: draft.kind === "Paid trial" ? Number(draft.weeks) : 0, stipend: draft.stipend || "Paid", description: draft.description, converts: draft.kind === "Paid trial" ? draft.converts : "—" };
    update((s) => ({ ...s, roles: [...s.roles, r] }));
    setRoleId(r.id); setDraft(blankRole); toast.success("Role posted — see your matches");
  };

  return (
    <>
      <PageHeader eyebrow="Employer view · Returnship marketplace" title={company} desc="Post short paid trials, rank talent by skills, and convert great trials into offers.">
        <Select value={company} onValueChange={(v) => { setCompany(v); setRoleId(state.roles.find((r) => r.company === v)?.id ?? ""); }}>
          <SelectTrigger className="w-64" aria-label="Viewing as employer"><SelectValue /></SelectTrigger>
          <SelectContent>{companies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </PageHeader>

      <Tabs defaultValue="match">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="match">Match talent</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline ({apps.length})</TabsTrigger>
          <TabsTrigger value="referrals">Warm referrals ({refs.filter((r) => r.status === "Pending").length})</TabsTrigger>
          <TabsTrigger value="post">Post a role</TabsTrigger>
        </TabsList>

        <TabsContent value="match" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {myRoles.map((r) => (
              <Button key={r.id} size="sm" variant={role?.id === r.id ? "default" : "outline"} onClick={() => setRoleId(r.id)}><Briefcase className="mr-1 h-3.5 w-3.5" />{r.title}</Button>
            ))}
          </div>
          {role && <p className="text-sm text-muted-foreground">{role.kind}{role.weeks ? ` · ${role.weeks} weeks` : ""} · {role.stipend} · Needs: {role.skills.join(", ")}</p>}
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="relative sm:col-span-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-8" placeholder="Search name, skill, language" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search talent" /></div>
            <Select value={sector} onValueChange={setSector}><SelectTrigger aria-label="Filter sector"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All sectors</SelectItem>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            <Select value={county} onValueChange={setCounty}><SelectTrigger aria-label="Filter county"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All counties</SelectItem>{COUNTIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            <Select value={minScore} onValueChange={setMinScore}><SelectTrigger aria-label="Minimum score"><SelectValue /></SelectTrigger><SelectContent>{["0", "50", "75"].map((s) => <SelectItem key={s} value={s}>Min match {s}%</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {ranked.map(({ c, m }) => (
              <Card key={c.id}><CardContent className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-4">
                <ScoreRing score={m.score} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{c.name}</p><StatusBadge status={c.readiness} />{c.endorsements.length > 0 && <Award className="h-4 w-4 text-accent-strong" aria-label="Mentor endorsed" />}</div>
                  <p className="text-xs text-muted-foreground">{c.sector} · {c.county}{c.remote ? " · Remote OK" : ""} · {c.languages.join(", ")}</p>
                  <ul className="mt-1.5 space-y-0.5 text-xs">{m.reasons.map((r) => <li key={r}>• {r}</li>)}</ul>
                  <Button size="sm" variant="secondary" className="mt-2" onClick={() => invite(c.id)}>Invite to trial</Button>
                </div>
              </CardContent></Card>
            ))}
            {ranked.length === 0 && <p className="text-sm text-muted-foreground">No candidates match these filters.</p>}
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[...PIPELINE, "Not selected" as const].map((stage) => (
              <div key={stage} className="rounded-xl bg-muted/60 p-3">
                <div className="mb-2 flex items-center justify-between"><StatusBadge status={stage} /><span className="text-xs text-muted-foreground">{apps.filter((a) => a.status === stage).length}</span></div>
                <div className="space-y-2">
                  {apps.filter((a) => a.status === stage).map((a) => {
                    const c = state.candidates.find((x) => x.id === a.candidateId); const r = state.roles.find((x) => x.id === a.roleId);
                    return (
                      <Card key={a.id}><CardContent className="space-y-2 p-3">
                        <div className="flex items-center gap-2"><Avatar name={c?.name ?? "?"} className="h-8 w-8 text-xs" /><div className="min-w-0"><p className="truncate text-sm font-medium">{c?.name}</p><p className="truncate text-xs text-muted-foreground">{r?.title}</p></div></div>
                        {a.feedback && <p className="text-xs text-muted-foreground">★{a.feedback.rating} · {a.feedback.decision}</p>}
                        {stage !== "Hired" && stage !== "Not selected" && (
                          <div className="flex gap-1">
                            <Button size="sm" className="h-7 flex-1 text-xs" onClick={() => advance(a)}>{stage === "Endorsed" ? "Feedback & offer" : "Advance"}<ChevronRight className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setStatus(a.id, "Not selected"); toast("Marked not selected"); }}>Pass</Button>
                          </div>
                        )}
                      </CardContent></Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-3">
          {refs.length === 0 && <p className="text-sm text-muted-foreground">No referrals yet for your roles.</p>}
          {refs.map((r) => {
            const c = state.candidates.find((x) => x.id === r.candidateId); const m = state.mentors.find((x) => x.id === r.mentorId); const ro = state.roles.find((x) => x.id === r.roleId);
            return (
              <Card key={r.id}><CardContent className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0"><p className="font-medium">{c?.name} → {ro?.title}</p><p className="text-xs text-muted-foreground">Vouched by {m?.name} ({m?.company}) · {r.date}</p>{r.message && <p className="mt-1 text-sm italic">“{r.message}”</p>}</div>
                {r.status === "Pending" ? <div className="flex gap-2"><Button size="sm" onClick={() => respondRef(r.id, true)}>Accept intro</Button><Button size="sm" variant="outline" onClick={() => respondRef(r.id, false)}>Decline</Button></div> : <StatusBadge status={r.status} />}
              </CardContent></Card>
            );
          })}
        </TabsContent>

        <TabsContent value="post">
          <Card className="max-w-2xl"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="h-4 w-4" />Post a role or paid trial</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="rt">Title</Label><Input id="rt" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="rs">Required skills (comma separated)</Label><Input id="rs" value={draft.skills} onChange={(e) => setDraft({ ...draft, skills: e.target.value })} placeholder="React, TypeScript, Git" /></div>
              <div className="space-y-1.5"><Label>Type</Label><Select value={draft.kind} onValueChange={(v) => setDraft({ ...draft, kind: v as Role["kind"] })}><SelectTrigger aria-label="Type"><SelectValue /></SelectTrigger><SelectContent>{["Paid trial", "Full-time", "Contract"].map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select></div>
              {draft.kind === "Paid trial" && <div className="space-y-1.5"><Label>Trial length</Label><Select value={draft.weeks} onValueChange={(v) => setDraft({ ...draft, weeks: v })}><SelectTrigger aria-label="Trial length"><SelectValue /></SelectTrigger><SelectContent>{["2", "3", "4"].map((k) => <SelectItem key={k} value={k}>{k} weeks</SelectItem>)}</SelectContent></Select></div>}
              <div className="space-y-1.5"><Label>County</Label><Select value={draft.county} onValueChange={(v) => setDraft({ ...draft, county: v })}><SelectTrigger aria-label="Role county"><SelectValue /></SelectTrigger><SelectContent>{COUNTIES.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label htmlFor="st">Stipend / pay</Label><Input id="st" value={draft.stipend} onChange={(e) => setDraft({ ...draft, stipend: e.target.value })} placeholder="KES 35,000" /></div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2"><Label htmlFor="rr">Remote</Label><Switch id="rr" checked={draft.remote} onCheckedChange={(v) => setDraft({ ...draft, remote: v })} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="rd">Description</Label><Textarea id="rd" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
              <Button className="sm:col-span-2" onClick={postRole}>Post role</Button>
            </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!fbApp} onOpenChange={(o) => !o && setFbApp(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Trial feedback — {state.candidates.find((c) => c.id === fbApp?.candidateId)?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Rating</Label><div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <Button key={n} size="sm" variant={fb.rating >= n ? "default" : "outline"} onClick={() => setFb({ ...fb, rating: n })} aria-label={`${n} stars`}>★</Button>)}</div></div>
            <div className="space-y-1.5"><Label htmlFor="fbt">What went well / to improve</Label><Textarea id="fbt" value={fb.text} onChange={(e) => setFb({ ...fb, text: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Decision</Label><Select value={fb.decision} onValueChange={(v) => setFb({ ...fb, decision: v as Feedback["decision"] })}><SelectTrigger aria-label="Decision"><SelectValue /></SelectTrigger><SelectContent>{["Offer full-time", "Offer contract", "Extend trial", "Not selected"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setFbApp(null)}>Cancel</Button><Button onClick={submitFeedback}>Submit decision</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
