export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type Frequency = "daily" | "weekly" | "monthly";
export type Language = "en" | "am" | "ti" | "om" | "so";

export const SUPPORTED_LANGUAGES: Language[] = ["en", "am", "ti", "om", "so"];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  am: "Amharic",
  ti: "Tigrinya",
  om: "Afaan Oromoo",
  so: "Somali",
};

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export const DAY_LABELS: Record<number, string> = {
  0: "Monday",
  1: "Tuesday",
  2: "Wednesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};

export interface Recipient {
  msisdn: string;
  lang: Language;
}

export interface Schedule {
  start_date: string;
  end_date: string;
  frequency: Frequency;
  run_days: number[];
  send_times: string[];
  end_times: string[];
  is_active: boolean;
}

export interface MessageContent {
  content: Record<Language, string>;
  default_language: Language;
}

export interface Audience {
  recipients: Recipient[];
  total_count: number;
  valid_count: number;
  invalid_count: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  sender_id: string;
  schedule: Schedule;
  message_content: MessageContent;
  audience: Audience;
  created_at: string;
  updated_at: string;
}

/* ---------- Wizard ---------- */

export interface WizardData {
  name: string;
  sender_id: string;
  // Schedule
  start_date: string;
  end_date: string;
  frequency: Frequency | "";
  run_days: number[];
  send_times: string[];
  end_times: string[];
  // Messages
  content: Record<Language, string>;
  default_language: Language;
  // Audience
  recipients: Recipient[];
}

export const EMPTY_WIZARD: WizardData = {
  name: "",
  sender_id: "",
  start_date: "",
  end_date: "",
  frequency: "",
  run_days: [],
  send_times: [""],
  end_times: [""],
  content: { en: "", am: "", ti: "", om: "", so: "" },
  default_language: "en",
  recipients: [],
};
