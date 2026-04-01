import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Campaign, CampaignStatus, Schedule, MessageContent, Audience, Language, TimeWindow } from "@/types/campaign";
import { fetchCampaigns as apiFetchCampaigns, type ApiCampaign } from "@/lib/api";

function mapApiCampaign(api: ApiCampaign): Campaign {
  // Map channels: API may return object or array
  let channels: Campaign["channels"] = [];
  if (Array.isArray(api.channels)) {
    channels = api.channels as Campaign["channels"];
  } else if (api.channels && typeof api.channels === "object") {
    channels = Object.values(api.channels) as Campaign["channels"];
  }

  // Map schedule
  let schedule: Schedule | undefined;
  if (api.schedule) {
    const s = api.schedule;
    let timeWindows: TimeWindow[] = [];
    if (Array.isArray(s.time_windows)) {
      timeWindows = s.time_windows as TimeWindow[];
    } else if (s.time_windows && typeof s.time_windows === "object") {
      timeWindows = Object.values(s.time_windows).map((v: any) =>
        typeof v === "string" ? { start: v, end: v } : v
      );
    }

    let runDays: number[] = [];
    if (Array.isArray(s.run_days)) {
      runDays = s.run_days as number[];
    } else if (s.run_days && typeof s.run_days === "object") {
      runDays = Object.values(s.run_days).map(Number);
    }

    schedule = {
      schedule_type: s.schedule_type as Schedule["schedule_type"],
      start_date: s.start_date,
      end_date: s.end_date || undefined,
      run_days: runDays,
      time_windows: timeWindows,
      timezone: s.timezone || "UTC",
      auto_reset: s.auto_reset,
      is_active: s.is_active,
      status: (s.campaign_status || "pending") as Schedule["status"],
    };
  }

  // Map message content
  let messageContent: MessageContent | undefined;
  if (api.message_content) {
    messageContent = {
      content: api.message_content.content as Record<Language, string>,
      default_language: (api.message_content.default_language || "en") as Language,
    };
  }

  // Map audience
  let audience: Audience | undefined;
  if (api.audience) {
    audience = {
      recipients: [],
      total_count: api.audience.total_count || 0,
      valid_count: api.audience.valid_count || 0,
      invalid_count: api.audience.invalid_count || 0,
    };
  }

  return {
    id: String(api.id),
    name: api.name,
    status: api.status as CampaignStatus,
    execution_status: api.execution_status,
    execution_status_display: api.execution_status_display,
    sender_id: api.sender_id,
    channels,
    schedule: schedule!,
    message_content: messageContent!,
    audience: audience!,
    can_start: api.can_start,
    can_pause: api.can_pause,
    can_resume: api.can_resume,
    can_stop: api.can_stop,
    can_complete: api.can_complete,
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

interface CampaignContextType {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  setPage: (page: number) => void;
  refetch: () => void;
  addCampaign: (campaign: Omit<Campaign, "id" | "created_at" | "updated_at">) => void;
  updateCampaign: (id: string, partial: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
}

const CampaignContext = createContext<CampaignContextType | null>(null);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setCampaigns([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchCampaigns(page);
      setCampaigns(data.results.map(mapApiCampaign));
      setTotalCount(data.count);
    } catch (e: any) {
      setError(e.message || "Failed to fetch campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCampaign = useCallback((data: Omit<Campaign, "id" | "created_at" | "updated_at">) => {
    // After API creation, refetch
    fetchData();
  }, [fetchData]);

  const updateCampaign = useCallback((id: string, partial: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...partial, updated_at: new Date().toISOString() } : c))
    );
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <CampaignContext.Provider value={{ campaigns, loading, error, totalCount, page, setPage, refetch: fetchData, addCampaign, updateCampaign, deleteCampaign }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error("useCampaigns must be used within CampaignProvider");
  return ctx;
}
