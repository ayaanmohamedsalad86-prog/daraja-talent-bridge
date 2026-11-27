import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, X, Github, MapPin, Globe2, Award, Send } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Avatar, ScoreRing, StatusBadge } from "@/components/bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { COUNTIES, PIPELINE, READINESS, SECTORS, type Candidate, type Role } from "@/lib/data";
import { matchScore } from "@/lib/match";
import { today, uid, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Talent profile — Daraja Talent" },
      { name: "description", content: "Build a skills-first profile and get matched to paid trials across Kenya and remote." },
      { property: "og:title", content: "Talent profile — Daraja Talent" },
      { property: "og:description", content: "Skills-first profiles and paid trials for skilled refugees in Kenya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TalentPage,
});

function TagEditor({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={draft} placeholder={placeholder} aria-label={`Add ${label}`} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" variant="secondary" onClick={add} aria-label={`Add to ${label}`}><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function TalentPage() {
  const { state, update } = useStore();
  const [meId, setMeId] = useState("c1");
  const me = state.candidates.find((c) => c.id === meId) ?? state.candidates[0];
  const [form, setForm] = useState<Candidate | undefined>(me);
  const [applyTo, setApplyTo] = useState<Role | null>(null);
  const [note, setNote] = useState("");
  const [roleQuery, setRoleQuery] = useState("");
  useEffect(() => { setForm(me); }, [me]);

  const ranked = useMemo(() => {
    if (!me) return [];
    return state.roles
      .filter((r) => `${r.title} ${r.company} ${r.skills.join(" ")}`.toLowerCase().includes(roleQuery.toLowerCase()))
      .map((r) => ({ r, m: matchScore(me, r) }))
      .sort((a, b) => b.m.score - a.m.score);
  }, [state.roles, me, roleQuery]);

  if (!me || !form) return null;
  const myApps = state.applications.filter((a) => a.candidateId === me.id);
  const fellowship = state.fellowships.find((f) => f.candidateId === me.id);
  const mentor = fellowship && state.mentors.find((m) => m.id === fellowship.mentorId);
  const set = <K extends keyof Candidate>(k: K, v: Candidate[K]) => setForm({ ...form, [k]: v });

  const save = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    update((s) => ({ ...s, candidates: s.candidates.map((c) => (c.id === form.id ? form : c)) }));
    toast.success("Profile saved — match scores updated");
  };
  const newProfile = () => {
    const c: Candidate = { id: uid("c"), name: "New Candidate", origin: "", county: "Turkana", remote: true, languages: ["English"], skills: [], links: [], sector: "Software", readiness: "Building skills", bio: "", endorsements: [] };
    update((s) => ({ ...s, candidates: [...s.candidates, c] }));
    setMeId(c.id);
    toast.success("New profile created — add your skills");
  };
  const submitApply = () => {
    if (!applyTo) return;
    update((s) => ({ ...s, applications: [...s.applications, { id: uid("a"), candidateId: me.id, roleId: applyTo.id, status: "Applied", note, date: today() }] }));
    toast.success(`Applied to ${applyTo.title}`);
    setApplyTo(null); setNote("");
  };

  return (
    <>
      <PageHeader eyebrow="Talent view · Skills-first" title={`Karibu, ${me.name.split(" ")[0]}`} desc="Show what you can do — skills, projects and languages. No physical certificates required.">
        <div className="flex gap-2">
          <Select value={me.id} onValueChange={setMeId}>
            <SelectTrigger className="w-56" aria-label="Viewing as candidate"><SelectValue /></SelectTrigger>
            <SelectContent>{state.candidates.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" onClick={newProfile}><Plus className="mr-1 h-4 w-4" />New</Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Avatar name={me.name} className="h-12 w-12" />
            <div className="min-w-0">
              <CardTitle className="truncate">My skills-first profile</CardTitle>
              <div className="mt-1 flex flex-wrap gap-1.5"><StatusBadge status={me.readiness} />
                {me.endorsements.length > 0 && <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-strong"><Award className="h-3.5 w-3.5" />{me.endorsements.length} mentor endorsement{me.endorsements.length > 1 ? "s" : ""}</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="origin">Country of origin</Label><Input id="origin" value={form.origin} onChange={(e) => set("origin", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>County</Label>
                <Select value={form.county} onValueChange={(v) => set("county", v)}><SelectTrigger aria-label="County"><SelectValue /></SelectTrigger>
                  <SelectContent>{COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label>Sector</Label>
                <Select value={form.sector} onValueChange={(v) => set("sector", v as Candidate["sector"])}><SelectTrigger aria-label="Sector"><SelectValue /></SelectTrigger>
                  <SelectContent>{SECTORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label>Work-readiness</Label>
                <Select value={form.readiness} onValueChange={(v) => set("readiness", v as Candidate["readiness"])}><SelectTrigger aria-label="Work-readiness"><SelectValue /></SelectTrigger>
                  <SelectContent>{READINESS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="flex items-center justify-between rounded-lg border px-3"><Label htmlFor="remote">Open to remote</Label><Switch id="remote" checked={form.remote} onCheckedChange={(v) => set("remote", v)} /></div>
            </div>
            <TagEditor label="Skills" values={form.skills} onChange={(v) => set("skills", v)} placeholder="e.g. React, Triage, SEO" />
            <TagEditor label="Languages" values={form.languages} onChange={(v) => set("languages", v)} placeholder="e.g. Kiswahili" />
            <TagEditor label="Project / GitHub links" values={form.links} onChange={(v) => set("links", v)} placeholder="github.com/you" />
            <div className="space-y-1.5"><Label htmlFor="bio">Experience summary</Label><Textarea id="bio" value={form.bio} onChange={(e) => set("bio", e.target.value)} /></div>
            <Button className="w-full" onClick={save}>Save profile</Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {fellowship && mentor && (
            <Card>
              <CardHeader><CardTitle className="text-base">My fellowship with {mentor.name} · {mentor.company}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(() => { const d = fellowship.milestones.filter((m) => m.done).length; return (<>
                  <div className="flex justify-between text-sm"><span>{d}/{fellowship.weeks} weeks complete</span>{fellowship.endorsed && <span className="inline-flex items-center gap-1 font-medium text-accent-strong"><Award className="h-4 w-4" />Endorsed</span>}</div>
                  <Progress value={(d / fellowship.weeks) * 100} />
                  <ol className="grid gap-1 text-sm sm:grid-cols-2">{fellowship.milestones.map((m, i) => <li key={m.title} className={m.done ? "text-foreground" : "text-muted-foreground"}>{m.done ? "✓" : "○"} Week {i + 1}: {m.title}</li>)}</ol>
                </>); })()}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">My applications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {myApps.length === 0 && <p className="text-sm text-muted-foreground">No applications yet — apply to a matched trial below.</p>}
              {myApps.map((a) => {
                const r = state.roles.find((x) => x.id === a.roleId);
                const step = PIPELINE.indexOf(a.status as (typeof PIPELINE)[number]);
                return (
                  <div key={a.id} className="rounded-lg border p-3">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"><p className="truncate font-medium">{r?.title} · {r?.company}</p><StatusBadge status={a.status} /></div>
                    <div className="mt-2 flex gap-1">{PIPELINE.map((p, i) => <div key={p} title={p} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />)}</div>
                    {a.feedback && <p className="mt-2 text-xs text-muted-foreground">Employer: “{a.feedback.text}” — {a.feedback.decision}</p>}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-2"><CardTitle className="text-base">Matched returnships & roles</CardTitle>
              <Input placeholder="Search roles, companies, skills…" value={roleQuery} onChange={(e) => setRoleQuery(e.target.value)} aria-label="Search roles" /></CardHeader>
            <CardContent className="space-y-3">
              {ranked.map(({ r, m }) => {
                const applied = myApps.some((a) => a.roleId === r.id);
                return (
                  <div key={r.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                    <ScoreRing score={m.score} />
                    <div className="min-w-0">
                      <p className="font-medium">{r.title}</p>
                      <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground"><span>{r.company}</span><span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{r.county}{r.remote && " · Remote"}</span><span>{r.kind}{r.weeks ? ` · ${r.weeks} wks` : ""} · {r.stipend}</span></p>
                      <ul className="mt-1.5 space-y-0.5 text-xs">{m.reasons.map((x) => <li key={x}>• {x}</li>)}</ul>
                      {m.missing.length > 0 && <p className="mt-1 text-xs text-muted-foreground">Gap: {m.missing.join(", ")}</p>}
                    </div>
                    <Button className="col-span-2 sm:col-span-1 sm:self-center" size="sm" disabled={applied} onClick={() => setApplyTo(r)}>{applied ? "Applied" : <><Send className="mr-1 h-3.5 w-3.5" />Apply</>}</Button>
                  </div>
                );
              })}
              {ranked.length === 0 && <p className="text-sm text-muted-foreground">No roles match your search.</p>}
            </CardContent>
          </Card>
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><Github className="h-3.5 w-3.5" />Verified links: {me.links.join(" · ") || "none yet"} <Globe2 className="ml-2 h-3.5 w-3.5" />{me.languages.join(", ")}</p>
        </div>
      </div>

      <Dialog open={!!applyTo} onOpenChange={(o) => !o && setApplyTo(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply: {applyTo?.title}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{applyTo?.description} Converts to: {applyTo?.converts}.</p>
          <div className="space-y-1.5"><Label htmlFor="note">Why you're a fit</Label><Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Point to a project or experience…" /></div>
          <DialogFooter><Button variant="outline" onClick={() => setApplyTo(null)}>Cancel</Button><Button onClick={submitApply}>Submit application</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
