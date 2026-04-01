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

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiCampaign {
  id: number;
  name: string;
  status: string;
  execution_status: string;
  execution_status_display: string;
  sender_id: string;
  channels: Record<string, string> | string[];
  created_by: number;
  created_at: string;
  updated_at: string;
  schedule: {
    id: number;
    campaign_name: string;
    schedule_type: string;
    schedule_type_display: string;
    campaign_status: string;
    campaign_status_display: string;
    current_window_status: string;
    current_window_status_display: string;
    upcoming_windows: string;
    schedule_summary: string;
    start_date: string;
    end_date: string | null;
    run_days: Record<string, string> | number[];
    time_windows: Record<string, string> | { start: string; end: string }[];
    timezone: string;
    current_round: number;
    current_window_date: string | null;
    current_window_index: number;
    current_window_status: string;
    next_run_date: string | null;
    next_run_window: number;
    completed_windows: Record<string, string>;
    total_windows_completed: number;
    is_active: boolean;
    auto_reset: boolean;
    created_at: string;
    updated_at: string;
    last_processed_at: string | null;
  } | null;
  message_content: {
    id: number;
    languages_available: string;
    preview: string;
    content: Record<string, string>;
    default_language: string;
    created_at: string;
    updated_at: string;
  } | null;
  audience: {
    id: number;
    summary: string;
    database_info: string;
    valid_percentage: string;
    total_count: number;
    valid_count: number;
    invalid_count: number;
    database_table: string;
    id_field: string;
    filter_condition: string;
    created_at: string;
    updated_at: string;
  } | null;
  progress: string;
  checkpoint_info: string;
  provider_stats: string;
  last_processed_id: number;
  total_processed: number;
  can_start: boolean;
  can_pause: boolean;
  can_resume: boolean;
  can_stop: boolean;
  can_complete: boolean;
  is_deleted: boolean;
}

export async function fetchCampaigns(page = 1) {
  const res = await fetch(`${API_BASE}/api/campaigns/?page=${page}`, {
    headers: authHeaders(),
  });
  return handleResponse<PaginatedResponse<ApiCampaign>>(res);
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
