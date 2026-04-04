import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampaignStatus, Channel } from "@/types/campaign";
import { CHANNEL_LABELS, SCHEDULE_TYPE_LABELS } from "@/types/campaign";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: "hsl(var(--muted-foreground))",
  active: "hsl(142 71% 45%)",
  paused: "hsl(48 96% 53%)",
  completed: "hsl(217 91% 60%)",
  archived: "hsl(var(--secondary-foreground))",
};

const CHANNEL_COLORS: Record<Channel, string> = {
  sms: "hsl(217 91% 60%)",
  app_notification: "hsl(142 71% 45%)",
  flash_sms: "hsl(280 67% 55%)",
};

export default function Dashboard() {
  const { campaigns, loading } = useCampaigns();

  const statusData = useMemo(() => {
    const counts: Record<CampaignStatus, number> = { draft: 0, active: 0, paused: 0, completed: 0, archived: 0 };
    campaigns.forEach((c) => counts[c.status]++);
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([status, count]) => ({ name: status.charAt(0).toUpperCase() + status.slice(1), value: count, fill: STATUS_COLORS[status as CampaignStatus] }));
  }, [campaigns]);

  const channelData = useMemo(() => {
    const counts: Record<string, number> = {};
    campaigns.forEach((c) => c.channels?.forEach((ch) => { counts[ch] = (counts[ch] || 0) + 1; }));
    return Object.entries(counts).map(([ch, count]) => ({
      name: CHANNEL_LABELS[ch as Channel] ?? ch,
      count,
      fill: CHANNEL_COLORS[ch as Channel] ?? "hsl(var(--primary))",
    }));
  }, [campaigns]);

  const scheduleData = useMemo(() => {
    const counts: Record<string, number> = {};
    campaigns.forEach((c) => {
      const t = c.schedule?.schedule_type;
      if (t) counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      name: SCHEDULE_TYPE_LABELS[type as keyof typeof SCHEDULE_TYPE_LABELS] ?? type,
      count,
    }));
  }, [campaigns]);

  const recentCampaigns = useMemo(
    () => [...campaigns].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5),
    [campaigns]
  );

  const active = campaigns.filter((c) => c.status === "active").length;
  const total = campaigns.length;
  const totalRecipients = campaigns.reduce((s, c) => s + (c.audience?.total_count ?? 0), 0);
  const completedCount = campaigns.filter((c) => c.status === "completed").length;

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-medium mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-7 w-12" /></CardContent></Card>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Dashboard</h1>
        <Link to="/campaigns/new">
          <Button>Create campaign</Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <KPICard label="Total Campaigns" value={total} />
        <KPICard label="Active" value={active} accent />
        <KPICard label="Completed" value={completedCount} />
        <KPICard label="Total Recipients" value={totalRecipients.toLocaleString()} />
      </div>

      {total === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <p className="mb-3">No campaigns yet. Create your first campaign to see analytics here.</p>
            <Link to="/campaigns/new"><Button>Create campaign</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts row */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Status distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2} label={({ name, value }) => `${name}: ${value}`}>
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Channel Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {channelData.length === 0 ? (
                  <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">No channel data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={channelData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <Tooltip />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {channelData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Schedule types + Recent campaigns */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Schedule types */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Schedule Types</CardTitle>
              </CardHeader>
              <CardContent>
                {scheduleData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No schedule data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={scheduleData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} className="fill-muted-foreground" />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Recent campaigns */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Recent Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentCampaigns.map((c) => (
                    <Link key={c.id} to={`/campaigns/${c.id}`} className="flex items-center justify-between py-1.5 hover:bg-secondary/30 rounded px-2 -mx-2 transition-colors">
                      <span className="text-sm font-medium truncate mr-3">{c.name}</span>
                      <Badge variant="secondary" className="text-xs capitalize shrink-0">{c.status}</Badge>
                    </Link>
                  ))}
                  {recentCampaigns.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No campaigns</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function KPICard({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`text-2xl font-semibold ${accent ? "text-primary" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
