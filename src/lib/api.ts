const API_BASE = "http://localhost:8000";
const CAMPAIGN_ENGINE_BASE = "http://localhost:8001";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

/* -------- Auth -------- */

export async function login(username: string, password: string): Promise<{ access: string; refresh: string }> {
  const res = await fetch(`${API_BASE}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

/* -------- Campaigns -------- */

export interface CreateCampaignPayload {
  name: string;
  sender_id: string;
  channels: string[];
  status: string;
}

export async function createCampaign(data: CreateCampaignPayload) {
  const res = await fetch(`${API_BASE}/api/campaigns/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<{ id: number; [key: string]: unknown }>(res);
}

export async function fetchCampaigns() {
  const res = await fetch(`${API_BASE}/api/campaigns/`, {
    headers: authHeaders(),
  });
  return handleResponse<unknown[]>(res);
}

/* -------- Schedule -------- */

export interface SchedulePayload {
  schedule_type: string;
  start_date: string;
  end_date?: string;
  run_days?: number[];
  time_windows: { start: string; end: string }[];
  timezone: string;
  auto_reset: boolean;
}

export async function createSchedule(campaignId: number, data: SchedulePayload) {
  const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/schedule/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/* -------- Message Content -------- */

export interface MessageContentPayload {
  content: Record<string, string>;
  default_language: string;
}

export async function updateMessageContent(campaignId: number, data: MessageContentPayload) {
  const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/message-content/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/* -------- Audience -------- */

export interface AudiencePayload {
  recipients: { msisdn: string; lang: string; variables?: Record<string, string> }[];
}

export async function createAudience(campaignId: number, data: AudiencePayload) {
  const res = await fetch(`${API_BASE}/api/campaigns/${campaignId}/audience/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/* -------- Start Campaign -------- */

export async function startCampaign(campaignId: number, reason?: string) {
  const res = await fetch(`${CAMPAIGN_ENGINE_BASE}/campaign/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaign_id: campaignId, reason: reason || "Started from UI" }),
  });
  return handleResponse(res);
}
