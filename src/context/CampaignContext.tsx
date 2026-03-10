import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Campaign } from "@/types/campaign";

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale Kickoff",
    status: "active",
    sender_id: "SHOPNOW",
    schedule: {
      start_date: "2024-08-01T09:00",
      end_date: "2024-08-05T17:00",
      frequency: "daily",
      run_days: [0, 1, 2, 3, 4],
      send_times: ["09:00"],
      end_times: ["17:00"],
      is_active: true,
    },
    message_content: {
      content: {
        en: "Don't miss our Summer Sale! Up to 50% off.",
        am: "የበጋ ሽያጫችንን አይዝሩ! እስከ 50% ቅናሽ።",
        ti: "",
        om: "",
        so: "",
      },
      default_language: "en",
    },
    audience: {
      recipients: [
        { msisdn: "+251912345678", lang: "en" },
        { msisdn: "+251911111111", lang: "am" },
      ],
      total_count: 1428,
      valid_count: 1428,
      invalid_count: 0,
    },
    created_at: "2024-07-20T10:00:00Z",
    updated_at: "2024-07-20T10:00:00Z",
  },
  {
    id: "2",
    name: "Account Verification",
    status: "completed",
    sender_id: "VERIFY",
    schedule: {
      start_date: "2024-06-15T08:00",
      end_date: "2024-06-15T18:00",
      frequency: "daily",
      run_days: [0, 1, 2, 3, 4, 5, 6],
      send_times: ["08:00"],
      end_times: ["18:00"],
      is_active: false,
    },
    message_content: {
      content: {
        en: "Verify your account by dialing *123#",
        am: "",
        ti: "",
        om: "",
        so: "",
      },
      default_language: "en",
    },
    audience: {
      recipients: [],
      total_count: 342,
      valid_count: 342,
      invalid_count: 0,
    },
    created_at: "2024-06-15T08:30:00Z",
    updated_at: "2024-06-15T08:30:00Z",
  },
  {
    id: "3",
    name: "Loyalty Rewards Update",
    status: "paused",
    sender_id: "LOYALTY",
    schedule: {
      start_date: "2024-09-01T06:00",
      end_date: "2024-09-30T23:59",
      frequency: "weekly",
      run_days: [0, 2, 4],
      send_times: ["06:00"],
      end_times: ["20:00"],
      is_active: false,
    },
    message_content: {
      content: {
        en: "Your loyalty points are about to expire. Redeem them now!",
        am: "",
        ti: "",
        om: "",
        so: "",
      },
      default_language: "en",
    },
    audience: {
      recipients: [],
      total_count: 5891,
      valid_count: 5891,
      invalid_count: 0,
    },
    created_at: "2024-08-25T14:00:00Z",
    updated_at: "2024-08-25T14:00:00Z",
  },
];

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, "id" | "created_at" | "updated_at">) => void;
  deleteCampaign: (id: string) => void;
}

const CampaignContext = createContext<CampaignContextType | null>(null);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);

  const addCampaign = useCallback((data: Omit<Campaign, "id" | "created_at" | "updated_at">) => {
    setCampaigns((prev) => [
      {
        ...data,
        id: String(Date.now()),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <CampaignContext.Provider value={{ campaigns, addCampaign, deleteCampaign }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error("useCampaigns must be used within CampaignProvider");
  return ctx;
}
