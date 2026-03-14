import { useParams, Link } from "react-router-dom";
import { useCampaigns } from "@/context/CampaignContext";
import { Button } from "@/components/ui/button";
import { FREQUENCY_LABELS, DAY_LABELS } from "@/types/campaign";

export default function ScheduleDetail() {
  const { id } = useParams<{ id: string }>();
  const { campaigns } = useCampaigns();
  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign || !campaign.schedule) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-4">Schedule not found</p>
        <Link to="/schedules"><Button variant="outline">Back to Schedules</Button></Link>
      </div>
    );
  }

  const s = campaign.schedule;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/schedules" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Schedules
          </Link>
          <h1 className="text-xl font-medium mt-1">Schedule — {campaign.name}</h1>
        </div>
        <Link to={`/campaigns/${id}/edit`}>
          <Button variant="outline">Edit Campaign</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border rounded-sm p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Frequency</p>
          <p className="text-lg font-medium">{FREQUENCY_LABELS[s.frequency] ?? s.frequency}</p>
        </div>
        <div className="bg-card border rounded-sm p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active</p>
          <p className={`text-lg font-medium ${s.is_active ? "text-green-600" : "text-destructive"}`}>
            {s.is_active ? "Yes" : "No"}
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-sm p-6 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date Range</p>
          <p className="text-sm">
            {s.start_date ? new Date(s.start_date).toLocaleString() : "—"}
            {" → "}
            {s.end_date ? new Date(s.end_date).toLocaleString() : "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Run Days</p>
          <p className="text-sm">
            {s.run_days.length > 0
              ? s.run_days.map((d) => DAY_LABELS[d] ?? d).join(", ")
              : "—"}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Time Windows</p>
          {s.send_times.length > 0 ? (
            <div className="space-y-1">
              {s.send_times.map((st, i) => (
                <p key={i} className="text-sm font-mono">
                  {st || "—"} → {s.end_times[i] || "—"}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>
      </div>
    </div>
  );
}
