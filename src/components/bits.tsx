import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppStatus, Readiness } from "@/lib/data";

const statusCls: Record<string, string> = {
  Applied: "bg-info/15 text-info border-info/30",
  "Trial Active": "bg-warning/15 text-warning border-warning/30",
  Endorsed: "bg-accent-strong/15 text-accent-strong border-accent-strong/30",
  Hired: "bg-success/15 text-success border-success/30",
  "Not selected": "bg-muted text-muted-foreground",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Accepted: "bg-success/15 text-success border-success/30",
  Declined: "bg-muted text-muted-foreground",
  "Job-ready": "bg-success/15 text-success border-success/30",
  "Nearly ready": "bg-warning/15 text-warning border-warning/30",
  "Building skills": "bg-info/15 text-info border-info/30",
};
export function StatusBadge({ status }: { status: AppStatus | Readiness | string }) {
  return <Badge variant="outline" className={cn("font-medium", statusCls[status])}>{status}</Badge>;
}
export function ScoreRing({ score }: { score: number }) {
  const tone = score >= 75 ? "text-success" : score >= 50 ? "text-warning" : "text-muted-foreground";
  return (
    <div className={cn("relative grid h-14 w-14 shrink-0 place-items-center", tone)} aria-label={`Match score ${score}%`}>
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" className="stroke-muted" />
        <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" stroke="currentColor" strokeLinecap="round" strokeDasharray={`${score * 0.974} 100`} />
      </svg>
      <span className="text-sm font-bold">{score}%</span>
    </div>
  );
}
export const initials = (n: string) => n.split(" ").map((p) => p[0] ?? "").slice(0, 2).join("");
export function Avatar({ name, className }: { name: string; className?: string }) {
  return <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground", className)}>{initials(name)}</span>;
}
