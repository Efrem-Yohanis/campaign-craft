import { useCampaigns } from "@/context/CampaignContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SCHEDULE_TYPE_LABELS, DAY_LABELS } from "@/types/campaign";
import { Plus, CalendarClock, Eye } from "lucide-react";

export default function ScheduleList() {
  const { campaigns } = useCampaigns();

  const schedules = campaigns
    .filter((c) => c.schedule)
    .map((c) => ({
      campaignId: c.id,
      campaignName: c.name,
      status: c.status,
      schedule: c.schedule,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schedules</h1>
          <p className="text-sm text-muted-foreground mt-1">Campaign scheduling and timing configuration</p>
        </div>
        <Link to="/campaigns/new">
          <Button className="gap-2 shadow-soft">
            <Plus className="h-4 w-4" />
            Create with Schedule
          </Button>
        </Link>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Campaign</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Run Days</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Start</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">End</th>
                <th className="text-left px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Active</th>
                <th className="text-right px-5 py-3.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                        <CalendarClock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No schedules found.</p>
                    </div>
                  </td>
                </tr>
              )}
              {schedules.map((s) => (
                <tr key={s.campaignId} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{s.campaignName}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="secondary" className="text-xs capitalize">{s.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="outline" className="text-xs capitalize">{SCHEDULE_TYPE_LABELS[s.schedule.schedule_type]}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">
                    {s.schedule.run_days?.map((d) => DAY_LABELS[d]?.slice(0, 3)).join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{s.schedule.start_date || "—"}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{s.schedule.end_date || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.schedule.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.schedule.is_active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                      {s.schedule.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/schedules/${s.campaignId}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
