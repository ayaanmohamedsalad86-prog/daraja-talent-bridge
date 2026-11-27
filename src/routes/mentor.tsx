import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Award, Handshake, Plus } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Avatar, StatusBadge } from "@/components/bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { makeMilestones, type Fellowship } from "@/lib/data";
import { matchScore } from "@/lib/match";
import { today, uid, useStore } from "@/lib/store";

export const Route = createFileRoute("/mentor")({
  head: () => ({
    meta: [
      { title: "Mentor fellowships — Daraja Talent" },
      { name: "description", content: "Track 4–8 week mentor fellowships, log sessions, endorse fellows and send warm referrals." },
      { property: "og:title", content: "Mentor fellowships — Daraja Talent" },
      { property: "og:description", content: "Structured fellowships and warm referrals for skilled refugees." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MentorPage,
});

function FellowCard({ f }: { f: Fellowship }) {
  const { state, update } = useStore();
  const [note, setNote] = useState("");
  const c = state.candidates.find((x) => x.id === f.candidateId);
  if (!c) return null;
  const done = f.milestones.filter((m) => m.done).length;
  const patch = (p: Partial<Fellowship>) => update((s) => ({ ...s, fellowships: s.fellowships.map((x) => (x.id === f.id ? { ...x, ...p } : x)) }));
  const toggle = (i: number) => patch({ milestones: f.milestones.map((m, j) => (j === i ? { ...m, done: !m.done } : m)) });
  const endorse = () => {
    const on = !f.endorsed;
    update((s) => ({
      ...s,
      fellowships: s.fellowships.map((x) => (x.id === f.id ? { ...x, endorsed: on } : x)),
      candidates: s.candidates.map((x) => x.id !== c.id ? x : { ...x, endorsements: on ? [...new Set([...x.endorsements, f.mentorId])] : x.endorsements.filter((e) => e !== f.mentorId) }),
    }));
    toast.success(on ? `Endorsed ${c.name}` : "Endorsement removed");
  };
  return (
    <Card>
      <CardHeader className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 space-y-0">
        <Avatar name={c.name} />
        <div className="min-w-0"><CardTitle className="truncate text-base">{c.name}</CardTitle><p className="text-xs text-muted-foreground">{c.sector} · {c.county} · {f.weeks}-week fellowship</p></div>
        {f.endorsed && <Award className="h-6 w-6 text-accent-strong" aria-label="Endorsed" />}
      </CardHeader>
      <CardContent className="space-y-4">
        <div><div className="mb-1 flex justify-between text-sm"><span>Progress</span><span className="font-medium">{Math.round((done / f.weeks) * 100)}%</span></div><Progress value={(done / f.weeks) * 100} /></div>
        <div className="grid gap-2 sm:grid-cols-2">
          {f.milestones.map((m, i) => (
            <label key={m.title} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <Checkbox checked={m.done} onCheckedChange={() => toggle(i)} aria-label={`Week ${i + 1}: ${m.title}`} />
              <span className={m.done ? "line-through text-muted-foreground" : ""}>Week {i + 1}: {m.title}</span>
            </label>
          ))}
        </div>
        <div className="space-y-2">
          <Label>Session notes</Label>
          <ul className="max-h-32 space-y-1 overflow-y-auto text-sm">{f.notes.map((n, i) => <li key={i} className="rounded bg-muted px-2 py-1"><span className="text-xs text-muted-foreground">{n.date}</span> — {n.text}</li>)}
            {f.notes.length === 0 && <li className="text-xs text-muted-foreground">No sessions logged yet.</li>}</ul>
          <div className="flex gap-2">
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Log today's session…" aria-label={`Session note for ${c.name}`} />
            <Button variant="secondary" onClick={() => { if (!note.trim()) return; patch({ notes: [...f.notes, { date: today(), text: note.trim() }] }); setNote(""); toast.success("Session note added"); }}>Add</Button>
          </div>
        </div>
        <Button variant={f.endorsed ? "outline" : "default"} className="w-full" onClick={endorse}><Award className="mr-1 h-4 w-4" />{f.endorsed ? "Remove endorsement" : "Endorse fellow"}</Button>
      </CardContent>
    </Card>
  );
}

function MentorPage() {
  const { state, update } = useStore();
  const [mentorId, setMentorId] = useState("m1");
  const mentor = state.mentors.find((m) => m.id === mentorId);
  const [newCand, setNewCand] = useState("");
  const [weeks, setWeeks] = useState("4");
  const [refCand, setRefCand] = useState("");
  const [refRole, setRefRole] = useState("");
  const [refMsg, setRefMsg] = useState("");
  if (!mentor) return null;
  const mine = state.fellowships.filter((f) => f.mentorId === mentor.id);
  const paired = new Set(state.fellowships.map((f) => f.candidateId));
  const available = state.candidates.filter((c) => !paired.has(c.id));
  const myRefs = state.referrals.filter((r) => r.mentorId === mentor.id);
  const refCandidate = state.candidates.find((c) => c.id === refCand);

  const startFellowship = () => {
    if (!newCand) { toast.error("Pick a candidate"); return; }
    const w = Number(weeks);
    update((s) => ({ ...s, fellowships: [...s.fellowships, { id: uid("f"), candidateId: newCand, mentorId: mentor.id, weeks: w, milestones: makeMilestones(w), notes: [], endorsed: false }] }));
    setNewCand(""); toast.success("Fellowship started");
  };
  const sendReferral = () => {
    if (!refCand || !refRole) { toast.error("Choose a candidate and a role"); return; }
    if (state.referrals.some((r) => r.candidateId === refCand && r.roleId === refRole)) { toast.error("Already referred to this role"); return; }
    update((s) => ({
      ...s,
      referrals: [...s.referrals, { id: uid("ref"), candidateId: refCand, mentorId: mentor.id, roleId: refRole, message: refMsg, status: "Pending", date: today() }],
      candidates: s.candidates.map((c) => (c.id === refCand ? { ...c, endorsements: [...new Set([...c.endorsements, mentor.id])] } : c)),
    }));
    setRefCand(""); setRefRole(""); setRefMsg(""); toast.success("Warm intro sent to employer");
  };

  return (
    <>
      <PageHeader eyebrow="Mentor view · Fellowship tracker" title={`${mentor.name}`} desc={`${mentor.title}, ${mentor.company}. Guide fellows through structured weekly milestones and vouch for them with employers.`}>
        <Select value={mentorId} onValueChange={setMentorId}>
          <SelectTrigger className="w-60" aria-label="Viewing as mentor"><SelectValue /></SelectTrigger>
          <SelectContent>{state.mentors.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} · {m.company}</SelectItem>)}</SelectContent>
        </Select>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {mine.map((f) => <FellowCard key={f.id} f={f} />)}
          {mine.length === 0 && <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No fellows yet — start a fellowship on the right.</CardContent></Card>}
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Plus className="h-4 w-4" />Start a fellowship</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={newCand} onValueChange={setNewCand}><SelectTrigger aria-label="Fellow"><SelectValue placeholder={available.length ? "Choose unpaired talent" : "Everyone is paired"} /></SelectTrigger>
                <SelectContent>{available.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {c.sector}</SelectItem>)}</SelectContent></Select>
              <Select value={weeks} onValueChange={setWeeks}><SelectTrigger aria-label="Duration"><SelectValue /></SelectTrigger>
                <SelectContent>{["4", "5", "6", "7", "8"].map((w) => <SelectItem key={w} value={w}>{w} weeks</SelectItem>)}</SelectContent></Select>
              <Button className="w-full" onClick={startFellowship}>Pair & start</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Handshake className="h-4 w-4" />Request warm intro / referral</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={refCand} onValueChange={setRefCand}><SelectTrigger aria-label="Candidate to refer"><SelectValue placeholder="Candidate" /></SelectTrigger>
                <SelectContent>{state.candidates.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
              <Select value={refRole} onValueChange={setRefRole}><SelectTrigger aria-label="Role to refer to"><SelectValue placeholder="Employer role" /></SelectTrigger>
                <SelectContent>{state.roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.title} · {r.company}{refCandidate ? ` (${matchScore(refCandidate, r).score}%)` : ""}</SelectItem>)}</SelectContent></Select>
              <Textarea value={refMsg} onChange={(e) => setRefMsg(e.target.value)} placeholder="Why you vouch for them…" aria-label="Referral message" />
              <Button className="w-full" onClick={sendReferral}>Send endorsement to employer</Button>
              <div className="space-y-2 pt-2">
                {myRefs.map((r) => { const c = state.candidates.find((x) => x.id === r.candidateId); const ro = state.roles.find((x) => x.id === r.roleId); return (
                  <div key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border px-3 py-2 text-sm"><span className="truncate">{c?.name} → {ro?.company}</span><StatusBadge status={r.status} /></div>); })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
