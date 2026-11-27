export type Readiness = "Job-ready" | "Nearly ready" | "Building skills";
export type Sector = "Software" | "Data" | "Health Ops" | "Digital Marketing";
export interface Candidate {
  id: string; name: string; origin: string; county: string; remote: boolean;
  languages: string[]; skills: string[]; links: string[]; sector: Sector;
  readiness: Readiness; bio: string; endorsements: string[];
}
export interface Mentor { id: string; name: string; title: string; company: string; expertise: string[]; county: string }
export interface Role {
  id: string; title: string; company: string; county: string; remote: boolean;
  skills: string[]; kind: "Paid trial" | "Full-time" | "Contract"; weeks: number;
  stipend: string; description: string; converts: string;
}
export interface Milestone { title: string; done: boolean }
export interface Fellowship {
  id: string; candidateId: string; mentorId: string; weeks: number;
  milestones: Milestone[]; notes: { date: string; text: string }[]; endorsed: boolean;
}
export type ReferralStatus = "Pending" | "Accepted" | "Declined";
export interface Referral { id: string; candidateId: string; mentorId: string; roleId: string; message: string; status: ReferralStatus; date: string }
export const PIPELINE = ["Applied", "Trial Active", "Endorsed", "Hired"] as const;
export type AppStatus = (typeof PIPELINE)[number] | "Not selected";
export interface Feedback { rating: number; text: string; decision: "Offer full-time" | "Offer contract" | "Extend trial" | "Not selected" }
export interface Application { id: string; candidateId: string; roleId: string; status: AppStatus; note: string; date: string; feedback?: Feedback }

export const COUNTIES = ["Turkana", "Garissa", "Nairobi", "Mombasa", "Kisumu", "Nakuru"];
export const SECTORS: Sector[] = ["Software", "Data", "Health Ops", "Digital Marketing"];
export const READINESS: Readiness[] = ["Job-ready", "Nearly ready", "Building skills"];

export const DEFAULT_MILESTONES = [
  "Portfolio Review", "Mock Interview", "Local Industry Project", "Employer Referral",
  "Networking Sprint", "Capstone Showcase", "Salary & Contract Coaching", "Placement Check-in",
];
export const makeMilestones = (weeks: number, doneCount = 0): Milestone[] =>
  DEFAULT_MILESTONES.slice(0, weeks).map((title, i) => ({ title, done: i < doneCount }));

export const seedCandidates: Candidate[] = [
  { id: "c1", name: "Amani Nkurunziza", origin: "Burundi", county: "Turkana", remote: true, languages: ["English", "Kiswahili", "French", "Kirundi"], skills: ["React", "TypeScript", "Node.js", "REST APIs", "Git"], links: ["github.com/amani-dev", "kakuma-market.app"], sector: "Software", readiness: "Job-ready", bio: "Full-stack developer, 4 yrs freelance. Built a marketplace used by 300 traders in Kakuma.", endorsements: ["m1"] },
  { id: "c2", name: "Hodan Abdi Farah", origin: "Somalia", county: "Garissa", remote: true, languages: ["Somali", "English", "Arabic"], skills: ["Python", "SQL", "Power BI", "Excel", "Data Cleaning"], links: ["github.com/hodan-data"], sector: "Data", readiness: "Job-ready", bio: "Data analyst; previously M&E officer for an NGO in Dadaab tracking 12k households.", endorsements: [] },
  { id: "c3", name: "Deng Majok", origin: "South Sudan", county: "Turkana", remote: false, languages: ["English", "Dinka", "Arabic"], skills: ["Patient Care", "Triage", "Health Records", "Community Health", "First Aid"], links: ["portfolio: kakuma-clinic-case-study"], sector: "Health Ops", readiness: "Nearly ready", bio: "Registered nurse (Juba). 6 years ward experience; now volunteers at Kakuma health post.", endorsements: ["m3"] },
  { id: "c4", name: "Grace Uwimana", origin: "DR Congo", county: "Nairobi", remote: true, languages: ["French", "English", "Lingala", "Kiswahili"], skills: ["SEO", "Content Strategy", "Meta Ads", "Copywriting", "Canva"], links: ["behance.net/grace-uw"], sector: "Digital Marketing", readiness: "Job-ready", bio: "Bilingual digital marketer; grew a Kinshasa fashion brand to 40k followers.", endorsements: [] },
  { id: "c5", name: "Yonas Tesfaye", origin: "Ethiopia", county: "Nairobi", remote: true, languages: ["Amharic", "English"], skills: ["Python", "Django", "PostgreSQL", "Docker", "REST APIs"], links: ["github.com/yonas-t"], sector: "Software", readiness: "Nearly ready", bio: "Backend engineer, former fintech developer in Addis Ababa.", endorsements: [] },
  { id: "c6", name: "Fartun Mohamed", origin: "Somalia", county: "Garissa", remote: false, languages: ["Somali", "English", "Kiswahili"], skills: ["Health Records", "Pharmacy Stock", "Excel", "Community Health"], links: [], sector: "Health Ops", readiness: "Building skills", bio: "Pharmacy assistant with 3 years in Hagadera camp clinic supply chain.", endorsements: [] },
  { id: "c7", name: "Jean-Paul Habimana", origin: "Rwanda", county: "Kisumu", remote: true, languages: ["Kinyarwanda", "French", "English"], skills: ["SQL", "Tableau", "Excel", "Python", "Statistics"], links: ["github.com/jp-analytics"], sector: "Data", readiness: "Nearly ready", bio: "Statistician turned data analyst, Coursera Google Data Analytics certified.", endorsements: [] },
  { id: "c8", name: "Nyaruach Gatluak", origin: "South Sudan", county: "Turkana", remote: true, languages: ["Nuer", "English", "Arabic"], skills: ["Social Media", "Copywriting", "Canva", "Community Management"], links: ["instagram.com/kakuma.voices"], sector: "Digital Marketing", readiness: "Building skills", bio: "Runs Kakuma Voices, a 12k-follower community storytelling page.", endorsements: [] },
];

export const seedMentors: Mentor[] = [
  { id: "m1", name: "Wanjiru Kamau", title: "Senior Engineer", company: "Safaricom", expertise: ["Software", "Data"], county: "Nairobi" },
  { id: "m2", name: "Ibrahim Hassan", title: "Data Lead", company: "Twiga Foods", expertise: ["Data"], county: "Nairobi" },
  { id: "m3", name: "Dr. Achieng Otieno", title: "Nursing Director", company: "Lodwar County Referral Hospital", expertise: ["Health Ops"], county: "Turkana" },
  { id: "m4", name: "Kevin Mutua", title: "Growth Manager", company: "Jumia Kenya", expertise: ["Digital Marketing"], county: "Nairobi" },
];

export const seedRoles: Role[] = [
  { id: "r1", title: "Junior Frontend Developer", company: "Andela Kenya", county: "Nairobi", remote: true, skills: ["React", "TypeScript", "Git", "CSS"], kind: "Paid trial", weeks: 3, stipend: "KES 45,000", description: "Ship features on a client dashboard alongside a senior pair.", converts: "Full-time" },
  { id: "r2", title: "M&E Data Analyst", company: "Kakuma Kalobeyei Challenge Fund", county: "Turkana", remote: false, skills: ["Python", "SQL", "Power BI", "Data Cleaning"], kind: "Paid trial", weeks: 4, stipend: "KES 38,000", description: "Build dashboards tracking enterprise grants across Kalobeyei.", converts: "Contract" },
  { id: "r3", title: "Ward Nurse (Returnship)", company: "Garissa County Referral Hospital", county: "Garissa", remote: false, skills: ["Patient Care", "Triage", "Health Records", "First Aid"], kind: "Paid trial", weeks: 4, stipend: "KES 40,000", description: "Supervised clinical returnship with licensing support.", converts: "Full-time" },
  { id: "r4", title: "Digital Marketing Associate", company: "Sendy (Remote)", county: "Nairobi", remote: true, skills: ["SEO", "Meta Ads", "Copywriting", "Content Strategy"], kind: "Paid trial", weeks: 2, stipend: "KES 30,000", description: "Run a 2-week acquisition campaign sprint.", converts: "Contract" },
  { id: "r5", title: "Backend Engineer", company: "M-KOPA", county: "Nairobi", remote: true, skills: ["Python", "PostgreSQL", "Docker", "REST APIs"], kind: "Full-time", weeks: 0, stipend: "KES 150,000/mo", description: "Payments platform team. Skills-first hiring, no degree required.", converts: "—" },
];

export const seedFellowships: Fellowship[] = [
  { id: "f1", candidateId: "c1", mentorId: "m1", weeks: 4, milestones: makeMilestones(4, 3), notes: [{ date: "2026-11-02", text: "Strong portfolio — tightened README and added tests." }, { date: "2026-11-12", text: "Mock interview: great system design; practice salary talk." }], endorsed: true },
  { id: "f2", candidateId: "c2", mentorId: "m2", weeks: 6, milestones: makeMilestones(6, 2), notes: [{ date: "2026-11-10", text: "Reviewed Dadaab M&E dashboard. Recommend adding SQL case study." }], endorsed: false },
  { id: "f3", candidateId: "c3", mentorId: "m3", weeks: 8, milestones: makeMilestones(8, 1), notes: [], endorsed: true },
  { id: "f4", candidateId: "c4", mentorId: "m4", weeks: 4, milestones: makeMilestones(4, 1), notes: [], endorsed: false },
];

export const seedReferrals: Referral[] = [
  { id: "ref1", candidateId: "c1", mentorId: "m1", roleId: "r1", message: "Amani is one of the strongest React devs I've mentored. Ready day one.", status: "Accepted", date: "2026-11-14" },
  { id: "ref2", candidateId: "c3", mentorId: "m3", roleId: "r3", message: "Deng has excellent triage instincts; needs only local licensing support.", status: "Pending", date: "2026-11-20" },
];

export const seedApplications: Application[] = [
  { id: "a1", candidateId: "c1", roleId: "r1", status: "Endorsed", note: "Excited to contribute to client dashboards.", date: "2026-11-15" },
  { id: "a2", candidateId: "c2", roleId: "r2", status: "Trial Active", note: "I built similar M&E dashboards in Dadaab.", date: "2026-11-16" },
  { id: "a3", candidateId: "c4", roleId: "r4", status: "Hired", note: "", date: "2026-11-01", feedback: { rating: 5, text: "Campaign beat CPA target by 30%.", decision: "Offer contract" } },
  { id: "a4", candidateId: "c3", roleId: "r3", status: "Applied", note: "Six years ward experience.", date: "2026-11-21" },
  { id: "a5", candidateId: "c5", roleId: "r5", status: "Applied", note: "", date: "2026-11-22" },
];
