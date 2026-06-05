import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Application, ChatThread, Job, Role } from "./types";
import { seedJobs, seedChats } from "./mock";

interface AppState {
  role: Role | null;
  setRole: (r: Role) => void;
  name: string;
  setName: (n: string) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  city: string;
  setCity: (c: string) => void;

  jobs: Job[];
  addJob: (j: Job) => void;
  updateJob: (id: string, patch: Partial<Job>) => void;

  applications: Application[];
  addApplication: (a: Application) => void;
  setApplicationStatus: (id: string, s: Application["status"]) => void;

  chats: ChatThread[];
  appendMessage: (chatId: string, text: string, from?: "me" | "them") => void;

  reset: () => void;
}

const Ctx = createContext<AppState | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [name, setNameState] = useState("");
  const [onboarded, setOnboardedState] = useState(false);
  const [city, setCityState] = useState("Delhi");
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [applications, setApplications] = useState<Application[]>([]);
  const [chats, setChats] = useState<ChatThread[]>(seedChats);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRoleState(load("ks.role", null));
    setNameState(load("ks.name", ""));
    setOnboardedState(load("ks.onboarded", false));
    setCityState(load("ks.city", "Delhi"));
    const j = load<Job[] | null>("ks.jobs", null);
    if (j && j.length) setJobs(j);
    setApplications(load("ks.apps", []));
    const c = load<ChatThread[] | null>("ks.chats", null);
    if (c && c.length) setChats(c);
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) save("ks.role", role); }, [role, hydrated]);
  useEffect(() => { if (hydrated) save("ks.name", name); }, [name, hydrated]);
  useEffect(() => { if (hydrated) save("ks.onboarded", onboarded); }, [onboarded, hydrated]);
  useEffect(() => { if (hydrated) save("ks.city", city); }, [city, hydrated]);
  useEffect(() => { if (hydrated) save("ks.jobs", jobs); }, [jobs, hydrated]);
  useEffect(() => { if (hydrated) save("ks.apps", applications); }, [applications, hydrated]);
  useEffect(() => { if (hydrated) save("ks.chats", chats); }, [chats, hydrated]);

  const value = useMemo<AppState>(() => ({
    role,
    setRole: (r) => setRoleState(r),
    name,
    setName: setNameState,
    onboarded,
    setOnboarded: setOnboardedState,
    city,
    setCity: setCityState,
    jobs,
    addJob: (j) => setJobs((xs) => [j, ...xs]),
    updateJob: (id, patch) => setJobs((xs) => xs.map((j) => (j.id === id ? { ...j, ...patch } : j))),
    applications,
    addApplication: (a) => setApplications((xs) => [a, ...xs]),
    setApplicationStatus: (id, s) =>
      setApplications((xs) => xs.map((a) => (a.id === id ? { ...a, status: s } : a))),
    chats,
    appendMessage: (chatId, text, from = "me") =>
      setChats((xs) =>
        xs.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { id: String(Date.now()), from, text, at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
                ],
              }
            : c,
        ),
      ),
    reset: () => {
      try { localStorage.clear(); } catch {}
      location.href = "/";
    },
  }), [role, name, onboarded, city, jobs, applications, chats]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp outside provider");
  return c;
}
