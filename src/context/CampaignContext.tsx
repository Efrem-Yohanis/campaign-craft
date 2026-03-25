import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Campaign, ExecutionRound } from "@/types/campaign";

const MOCK_ROUNDS_CAMPAIGN1: ExecutionRound[] = [
  { round: 1, date: "2024-08-01", window: "09:00 – 17:00", status: "completed", queued: 1428, sent: 1400, delivered: 1356, failed_send: 28, failed_delivery: 44, started_at: "2024-08-01T09:00:23Z", completed_at: "2024-08-01T16:58:12Z" },
  { round: 2, date: "2024-08-02", window: "09:00 – 17:00", status: "completed", queued: 1428, sent: 1410, delivered: 1380, failed_send: 18, failed_delivery: 30, started_at: "2024-08-02T09:01:05Z", completed_at: "2024-08-02T16:55:47Z" },
  { round: 3, date: "2024-08-03", window: "09:00 – 17:00", status: "completed", queued: 1428, sent: 1420, delivered: 1398, failed_send: 8, failed_delivery: 22, started_at: "2024-08-03T09:00:18Z", completed_at: "2024-08-03T16:59:03Z" },
  { round: 4, date: "2024-08-04", window: "09:00 – 17:00", status: "partial", queued: 1428, sent: 1100, delivered: 1050, failed_send: 15, failed_delivery: 50, started_at: "2024-08-04T09:02:10Z", completed_at: "2024-08-04T15:30:45Z" },
  { round: 5, date: "2024-08-05", window: "09:00 – 17:00", status: "active", queued: 1428, sent: 856, delivered: 812, failed_send: 12, failed_delivery: 44, started_at: "2024-08-05T09:00:00Z", completed_at: null },
];

const MOCK_ROUNDS_CAMPAIGN3: ExecutionRound[] = [
  { round: 1, date: "2024-09-02", window: "06:00 – 20:00", status: "completed", queued: 5891, sent: 5850, delivered: 5700, failed_send: 41, failed_delivery: 150, started_at: "2024-09-02T06:00:23Z", completed_at: "2024-09-02T19:58:12Z" },
  { round: 2, date: "2024-09-04", window: "06:00 – 20:00", status: "completed", queued: 5891, sent: 5800, delivered: 5650, failed_send: 91, failed_delivery: 150, started_at: "2024-09-04T06:01:05Z", completed_at: "2024-09-04T19:55:47Z" },
  { round: 3, date: "2024-09-06", window: "06:00 – 20:00", status: "partial", queued: 5891, sent: 2100, delivered: 1980, failed_send: 45, failed_delivery: 120, started_at: "2024-09-06T06:00:18Z", completed_at: "2024-09-06T14:30:00Z" },
  { round: 4, date: "2024-09-09", window: "06:00 – 20:00", status: "pending", queued: 5891, sent: 0, delivered: 0, failed_send: 0, failed_delivery: 0, started_at: null, completed_at: null },
];

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale Kickoff",
    status: "active",
    sender_id: "SHOPNOW",
    channels: ["sms"],
    schedule: {
      schedule_type: "daily",
      start_date: "2024-08-01",
      end_date: "2024-08-05",
      run_days: [0, 1, 2, 3, 4],
      time_windows: [{ start: "09:00", end: "17:00" }],
      timezone: "UTC",
      auto_reset: true,
      is_active: true,
      status: "running",
    },
    message_content: {
      content: {
        en: "Don't miss our Summer Sale! Up to 50% off.",
        am: "የበጋ ሽያጫችንን አይዝሩ! እስከ 50% ቅናሽ።",
        ti: "", om: "", so: "",
      },
      default_language: "en",
    },
    audience: {
      recipients: [
        { msisdn: "+251912345678", lang: "en" },
        { msisdn: "+251911111111", lang: "am" },
        { msisdn: "+251913333333", lang: "en" },
        { msisdn: "+251914444444", lang: "ti" },
        { msisdn: "+251915555555", lang: "om" },
      ],
      total_count: 1428, valid_count: 1428, invalid_count: 0,
    },
    progress: {
      total_messages: 1428,
      sent_count: 856,
      delivered_count: 812,
      failed_count: 12,
      failed_delivery_count: 44,
      pending_count: 560,
      progress_percent: 60.78,
      status: "ACTIVE",
      started_at: "2024-08-01T09:00:00Z",
      completed_at: null,
    },
    execution_rounds: MOCK_ROUNDS_CAMPAIGN1,
    created_at: "2024-07-20T10:00:00Z",
    updated_at: "2024-07-20T10:00:00Z",
  },
  {
    id: "2",
    name: "Account Verification",
    status: "completed",
    sender_id: "VERIFY",
    channels: ["sms", "flash_sms"],
    schedule: {
      schedule_type: "once",
      start_date: "2024-06-15",
      time_windows: [{ start: "08:00", end: "18:00" }],
      timezone: "UTC",
      auto_reset: true,
      is_active: false,
      status: "completed",
    },
    message_content: {
      content: {
        en: "Verify your account by dialing *123#",
        am: "", ti: "", om: "", so: "",
      },
      default_language: "en",
    },
    audience: {
      recipients: [
        { msisdn: "+251922222222", lang: "en" },
        { msisdn: "+251923333333", lang: "am" },
      ],
      total_count: 342, valid_count: 342, invalid_count: 0,
    },
    progress: {
      total_messages: 342,
      sent_count: 340,
      delivered_count: 325,
      failed_count: 2,
      failed_delivery_count: 15,
      pending_count: 0,
      progress_percent: 100,
      status: "COMPLETED",
      started_at: "2024-06-15T08:00:00Z",
      completed_at: "2024-06-15T17:45:23Z",
    },
    execution_rounds: [
      { round: 1, date: "2024-06-15", window: "08:00 – 18:00", status: "completed", queued: 342, sent: 340, delivered: 325, failed_send: 2, failed_delivery: 15, started_at: "2024-06-15T08:00:23Z", completed_at: "2024-06-15T17:45:23Z" },
    ],
    created_at: "2024-06-15T08:30:00Z",
    updated_at: "2024-06-15T08:30:00Z",
  },
  {
    id: "3",
    name: "Loyalty Rewards Update",
    status: "paused",
    sender_id: "LOYALTY",
    channels: ["sms", "app_notification"],
    schedule: {
      schedule_type: "weekly",
      start_date: "2024-09-01",
      end_date: "2024-09-30",
      run_days: [0, 2, 4],
      time_windows: [{ start: "06:00", end: "20:00" }],
      timezone: "Africa/Addis_Ababa",
      auto_reset: true,
      is_active: false,
      status: "stop",
    },
    message_content: {
      content: {
        en: "Your loyalty points are about to expire. Redeem them now!",
        am: "", ti: "", om: "", so: "",
      },
      default_language: "en",
    },
    audience: {
      recipients: [
        { msisdn: "+251931111111", lang: "en" },
        { msisdn: "+251932222222", lang: "so" },
      ],
      total_count: 5891, valid_count: 5891, invalid_count: 0,
    },
    progress: {
      total_messages: 5891,
      sent_count: 2100,
      delivered_count: 1980,
      failed_count: 45,
      failed_delivery_count: 120,
      pending_count: 3746,
      progress_percent: 36.41,
      status: "STOPPED",
      started_at: "2024-09-01T06:00:00Z",
      completed_at: null,
    },
    execution_rounds: MOCK_ROUNDS_CAMPAIGN3,
    created_at: "2024-08-25T14:00:00Z",
    updated_at: "2024-08-25T14:00:00Z",
  },
];

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, "id" | "created_at" | "updated_at">) => void;
  updateCampaign: (id: string, partial: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
}

const CampaignContext = createContext<CampaignContextType | null>(null);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);

  const addCampaign = useCallback((data: Omit<Campaign, "id" | "created_at" | "updated_at">) => {
    setCampaigns((prev) => [
      { ...data, id: String(Date.now()), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const updateCampaign = useCallback((id: string, partial: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...partial, updated_at: new Date().toISOString() } : c))
    );
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <CampaignContext.Provider value={{ campaigns, addCampaign, updateCampaign, deleteCampaign }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error("useCampaigns must be used within CampaignProvider");
  return ctx;
}
