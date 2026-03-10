export type Channel = "SMS" | "USSD" | "App" | "Flash" | "IVR";
export type CampaignStatus = "Active" | "Paused" | "Completed";
export type ScheduleType = "Immediate" | "Scheduled";
export type AudienceSourceType = "file" | "segment" | "sql";

export type Language = "en" | "am" | "ti" | "om" | "so";

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  am: "Amharic",
  ti: "Tigrinya",
  om: "Afaan Oromoo",
  so: "Somali",
};

export interface LanguageMessage {
  language: Language;
  text: string;
}

export interface AudienceSource {
  type: AudienceSourceType;
  label: string;
  recipientCount: number;
}

export interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  sender?: string;
  status: CampaignStatus;
  scheduleType: ScheduleType;
  startDate?: string;
  endDate?: string;
  messages: LanguageMessage[];
  audience: AudienceSource;
  createdAt: string;
}

export interface WizardData {
  name: string;
  channel: Channel | "";
  sender: string;
  scheduleType: ScheduleType | "";
  startDate: string;
  endDate: string;
  messages: LanguageMessage[];
  audienceType: AudienceSourceType | "";
  audienceFile?: File;
  audienceFileName?: string;
  audienceSegments: string[];
  audienceSql: string;
  audienceRecipientCount: number;
}

export const EMPTY_WIZARD: WizardData = {
  name: "",
  channel: "",
  sender: "",
  scheduleType: "",
  startDate: "",
  endDate: "",
  messages: [{ language: "en", text: "" }],
  audienceType: "",
  audienceSegments: [],
  audienceSql: "",
  audienceRecipientCount: 0,
};

export const MOCK_SEGMENTS = [
  "New Subscribers",
  "High-Value Customers",
  "Inactive 30 Days",
  "Loyalty Members",
  "Trial Users",
];
