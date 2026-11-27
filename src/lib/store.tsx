import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  seedApplications, seedCandidates, seedFellowships, seedMentors, seedReferrals, seedRoles,
  type Application, type Candidate, type Fellowship, type Mentor, type Referral, type Role,
} from "./data";

export interface AppState {
  candidates: Candidate[]; mentors: Mentor[]; roles: Role[];
  fellowships: Fellowship[]; referrals: Referral[]; applications: Application[];
}
const seed = (): AppState => ({
  candidates: seedCandidates, mentors: seedMentors, roles: seedRoles,
  fellowships: seedFellowships, referrals: seedReferrals, applications: seedApplications,
});
const KEY = "daraja-state-v1";

interface Ctx { state: AppState; update: (fn: (s: AppState) => AppState) => void; reset: () => void }
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(seed);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw) as AppState);
    } catch { /* ignore */ }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (loaded.current) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);
  return (
    <StoreCtx.Provider value={{ state, update: (fn) => setState((s) => fn(s)), reset: () => setState(seed()) }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

export const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
export const today = () => new Date().toISOString().slice(0, 10);
