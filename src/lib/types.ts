export type Lang = "hi" | "en" | "ta";
export type Role = "worker" | "recruiter";

export type Gender = "male" | "female" | "any";
export type SalaryType = "monthly" | "daily" | "hourly";
export type ShiftType = "day" | "night" | "rotational" | "part" | "full";

export type Category =
  | "security"
  | "driver"
  | "electrician"
  | "plumber"
  | "maid"
  | "cook"
  | "carpenter"
  | "delivery"
  | "nanny"
  | "housekeeping";

export interface LocalizedText {
  hi: string;
  en: string;
  ta: string;
}

export interface SmartSummary {
  highlights: string[];
  bestFor: string[];
  thingsToKnow: string[];
  benefits: string[];
}

export interface Job {
  id: string;
  category: Category;
  title: string; // English title (original)
  recruiterId: string;
  salaryType: SalaryType;
  salaryMin: number;
  salaryMax: number;
  area: string;
  pincode: string;
  distanceKm: number;
  shift: ShiftType;
  workingDays: string;
  gender: Gender;
  ageMin: number;
  ageMax: number;
  experience: string;
  verificationRequired: boolean;
  requirements: string; // recruiter free-text (HR English)
  postedAt: string;
  verified: boolean;
  // AI-generated, multilingual; may be pre-baked or filled in by ai.functions
  simplified?: LocalizedText;
  summary?: SmartSummary;
  explainCache?: Partial<Record<Lang, string>>;
}

export interface Recruiter {
  id: string;
  name: string;
  org: string;
  emoji: string;
  verified: boolean;
  rating: number;
  phone: string;
}

export interface Worker {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  area: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  experience: string;
  verified: boolean;
  available: boolean;
  langs: Lang[];
  phone: string;
}

export interface Application {
  id: string;
  jobId: string;
  workerName: string;
  workerPhone: string;
  experience: string;
  available: boolean;
  status: "applied" | "shortlisted" | "hired" | "rejected";
  appliedAt: string;
}

export interface ChatMessage {
  id: string;
  from: "me" | "them";
  text: string;
  at: string;
}

export interface ChatThread {
  id: string;
  name: string;
  emoji: string;
  role: string;
  messages: ChatMessage[];
}
