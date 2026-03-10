import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Campaign } from "@/types/campaign";

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale Kickoff",
    channel: "SMS",
    sender: "SHOPNOW",
    status: "Active",
    scheduleType: "Scheduled",
    startDate: "2024-08-01T09:00",
    endDate: "2024-08-05T17:00",
    messages: [
      { language: "en", text: "Don't miss our Summer Sale! Up to 50% off." },
      { language: "am", text: "የበጋ ሽያጫችንን አይዝሩ! እስከ 50% ቅናሽ።" },
    ],
    audience: { type: "file", label: "new_subscribers_july.xlsx", recipientCount: 1428 },
    createdAt: "2024-07-20T10:00:00Z",
  },
  {
    id: "2",
    name: "Account Verification",
    channel: "USSD",
    status: "Completed",
    scheduleType: "Immediate",
    messages: [{ language: "en", text: "Verify your account by dialing *123#" }],
    audience: { type: "segment", label: "Trial Users", recipientCount: 342 },
    createdAt: "2024-06-15T08:30:00Z",
  },
  {
    id: "3",
    name: "Loyalty Rewards Update",
    channel: "App",
    status: "Paused",
    scheduleType: "Scheduled",
    startDate: "2024-09-01T06:00",
    endDate: "2024-09-30T23:59",
    messages: [
      { language: "en", text: "Your loyalty points are about to expire. Redeem them now!" },
    ],
    audience: { type: "segment", label: "Loyalty Members", recipientCount: 5891 },
    createdAt: "2024-08-25T14:00:00Z",
  },
  {
    id: "4",
    name: "Flash Promo Alert",
    channel: "Flash",
    status: "Active",
    scheduleType: "Immediate",
    messages: [{ language: "en", text: "Flash deal: 30% off for the next 2 hours!" }],
    audience: { type: "sql", label: "SELECT * FROM users WHERE last_purchase > NOW() - INTERVAL '30 days'", recipientCount: 2104 },
    createdAt: "2024-07-30T12:00:00Z",
  },
];

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, "id" | "createdAt">) => void;
  deleteCampaign: (id: string) => void;
}

const CampaignContext = createContext<CampaignContextType | null>(null);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);

  const addCampaign = useCallback((data: Omit<Campaign, "id" | "createdAt">) => {
    setCampaigns((prev) => [
      {
        ...data,
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
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
